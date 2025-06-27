import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFieldVisits, deleteFieldVisit, createFieldVisit, updateFieldVisit } from '@/lib/fieldVisitApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown, PlusCircle, Trash2, Edit, Eye, MapPin, Calendar, User, Crop, Plus, Search, Filter, Leaf, FlaskConical, ClipboardList, Image as ImageIcon, Info, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from '@/lib/types';
import { format, isSameMonth } from 'date-fns';
import { CONSULTANTS, CROP_OPTIONS } from '@/lib/constants';
import FieldVisitFormDialog from '@/components/fieldVisits/FieldVisitFormDialog';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Tooltip as UITooltip } from '@/components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import KpiCard from '@/components/metrics/KpiCard';

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortableFieldVisitKey = keyof FieldVisit;
interface SortConfig {
  key: SortableFieldVisitKey;
  direction: SortDirection;
}

// Color mapping for status
const statusColorMap: Record<string, string> = {
  Completed: '#10b981', // green
  Scheduled: '#3b82f6', // blue
  'In Progress': '#f59e0b', // orange
  Cancelled: '#ef4444', // red
};

// Color mapping for visit reason
const reasonColorMap: Record<string, string> = {
  Emergency: '#ef4444', // red
  Routine: '#22c55e', // green
  'Follow-Up': '#a21caf', // purple
  Initial: '#2563eb', // blue
};

// Color mapping for crops (add more as needed)
const cropColorMap: Record<string, string> = {
  Avocado: '#65a30d', // green
  Grapes: '#7c3aed', // purple
  Citrus: '#f59e0b', // orange
  Apples: '#dc2626', // red
};

// Helper to get badge style
const getBadgeStyle = (color: string | undefined) => color ? { backgroundColor: color, color: '#fff', fontWeight: 500 } : {};

const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'destructive' | 'default' => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in-progress':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

const getVisitTypeBadgeVariant = (visitType: string): 'success' | 'warning' | 'destructive' | 'default' => {
  switch (visitType?.toLowerCase()) {
    case 'routine':
      return 'success';
    case 'emergency':
      return 'destructive';
    case 'follow-up':
      return 'warning';
    default:
      return 'default';
  }
};

type ClientField = { name: string } | string | null;

const getClientName = (client: ClientField) => {
  if (!client) return '—';
  if (typeof client === 'string') return client;
  if (typeof client === 'object' && 'name' in client) return client.name;
  return '—';
};

const FieldVisitsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [addVisitDialogOpen, setAddVisitDialogOpen] = useState(false);
    const [viewingVisit, setViewingVisit] = useState<FieldVisit | null>(null);
    const [editVisit, setEditVisit] = useState<FieldVisit | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'visit_date', direction: 'desc' });

    const queryClient = useQueryClient();

    // Fetch field visits
    const { data: fieldVisits = [], isLoading, error } = useQuery({
        queryKey: ['fieldVisits'],
        queryFn: getFieldVisits,
    });

    // Create field visit mutation
    const createFieldVisitMutation = useMutation({
        mutationFn: createFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
            setAddVisitDialogOpen(false);
            toast({
                title: 'Success',
                description: 'Field visit created successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update field visit mutation
    const updateFieldVisitMutation = useMutation({
        mutationFn: updateFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
            setEditVisit(null);
            toast({
                title: 'Success',
                description: 'Field visit updated successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Delete field visit mutation
    const deleteFieldVisitMutation = useMutation({
        mutationFn: deleteFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
            toast({
                title: 'Success',
                description: 'Field visit deleted successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleViewVisit = (visit: FieldVisit) => {
        setViewingVisit(visit);
    };

    const handleEditVisit = (visit: FieldVisit) => {
        setEditVisit(visit);
    };

    const handleDeleteVisit = (visit: FieldVisit) => {
        if (confirm('Are you sure you want to delete this field visit?')) {
            deleteFieldVisitMutation.mutate(visit.id);
        }
    };

    const handleSort = (key: keyof FieldVisit) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter and sort field visits
    const displayedVisits = useMemo(() => {
        let filtered = fieldVisits.filter(visit => {
            const matchesSearch = searchTerm === '' || 
                getClientName(visit.client).toLowerCase().includes(searchTerm.toLowerCase()) ||
                visit.consultant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visit.farm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                visit.crop?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesMonth = selectedMonth === 'all' || 
                format(new Date(visit.visit_date), 'MMMM yyyy') === selectedMonth;

            const matchesStatus = selectedStatus === 'all' || (visit.status && visit.status === selectedStatus);

            return matchesSearch && matchesMonth && matchesStatus;
        });

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
            } else if (aValue instanceof Date && bValue instanceof Date) {
                comparison = aValue.getTime() - bValue.getTime();
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [fieldVisits, searchTerm, selectedMonth, selectedStatus, sortConfig]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading field visits...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Error loading field visits: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Field Visits</h1>
                    <p className="text-muted-foreground">
                        Manage and track field visits for crop monitoring and analysis.
                    </p>
                </div>
                <Button onClick={() => setAddVisitDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field Visit
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by client, consultant, farm, or crop..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Months" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {[...new Set(fieldVisits.map(visit => 
                                    format(new Date(visit.visit_date), 'MMMM yyyy')
                                ))].sort().map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Completed">Completed</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Scheduled">Scheduled</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Analytics Dashboard */}
            <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard
                        title="Total Field Visits"
                        value={fieldVisits.length}
                        description="All time visits"
                        icon={<MapPin className="h-4 w-4" />}
                    />
                    <KpiCard
                        title="Completed Visits"
                        value={fieldVisits.filter(v => v.status === 'Completed').length}
                        description={`${fieldVisits.length > 0 ? ((fieldVisits.filter(v => v.status === 'Completed').length / fieldVisits.length) * 100).toFixed(1) : 0}% completion rate`}
                        icon={<Activity className="h-4 w-4" />}
                    />
                    <KpiCard
                        title="Active Consultants"
                        value={new Set(fieldVisits.filter(v => v.consultant).map(v => v.consultant)).size}
                        description="Unique consultants"
                        icon={<User className="h-4 w-4" />}
                    />
                    <KpiCard
                        title="Unique Clients"
                        value={new Set(fieldVisits.filter(v => v.client).map(v => v.client)).size}
                        description="Active clients"
                        icon={<Leaf className="h-4 w-4" />}
                    />
                </div>

                {/* Analytics Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Advanced Analytics
                        </CardTitle>
                        <CardDescription>
                            Detailed insights and trends from your field visit data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {fieldVisits.length > 0 ? (
                            <div className="space-y-6">
                                {/* Time Trends */}
                                <div>
                                    <h4 className="font-semibold mb-3">Time Trends</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Total Visits</p>
                                            <p className="text-2xl font-bold">{fieldVisits.length}</p>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm text-muted-foreground">This Month</p>
                                            <p className="text-2xl font-bold">
                                                {fieldVisits.filter(v => 
                                                    v.visit_date && 
                                                    isSameMonth(new Date(v.visit_date), new Date())
                                                ).length}
                                            </p>
                                        </div>
                                        <div className="bg-muted p-3 rounded-lg">
                                            <p className="text-sm text-muted-foreground">Completion Rate</p>
                                            <p className="text-2xl font-bold">
                                                {fieldVisits.length > 0 
                                                    ? Math.round((fieldVisits.filter(v => v.status === 'Completed').length / fieldVisits.length) * 100)
                                                    : 0}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Distributions */}
                                <div>
                                    <h4 className="font-semibold mb-3">Distributions</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Visit Reasons</h5>
                                            <div className="space-y-2">
                                                {Object.entries(
                                                    fieldVisits.reduce((acc, visit) => {
                                                        if (visit.visit_reason) {
                                                            acc[visit.visit_reason] = (acc[visit.visit_reason] || 0) + 1;
                                                        }
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 5)
                                                .map(([reason, count]) => (
                                                    <div key={reason} className="flex justify-between items-center">
                                                        <span className="text-sm">{reason}</span>
                                                        <Badge style={getBadgeStyle(reasonColorMap[reason])}>{count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Soil Textures</h5>
                                            <div className="space-y-2">
                                                {Object.entries(
                                                    fieldVisits.reduce((acc, visit) => {
                                                        if (visit.soil_texture) {
                                                            acc[visit.soil_texture] = (acc[visit.soil_texture] || 0) + 1;
                                                        }
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 5)
                                                .map(([texture, count]) => (
                                                    <div key={texture} className="flex justify-between items-center">
                                                        <span className="text-sm">{texture}</span>
                                                        <Badge style={getBadgeStyle(cropColorMap[texture])}>{count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Performers */}
                                <div>
                                    <h4 className="font-semibold mb-3">Top Performers</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Most Active Consultants</h5>
                                            <div className="space-y-2">
                                                {Object.entries(
                                                    fieldVisits.reduce((acc, visit) => {
                                                        if (visit.consultant) {
                                                            acc[visit.consultant] = (acc[visit.consultant] || 0) + 1;
                                                        }
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 3)
                                                .map(([consultant, count], index) => (
                                                    <div key={consultant} className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                            index === 0 ? 'bg-yellow-500' : 
                                                            index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <span className="flex-1 text-sm">{consultant}</span>
                                                        <Badge style={getBadgeStyle(cropColorMap[consultant])}>{count} visits</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">Most Visited Crops</h5>
                                            <div className="space-y-2">
                                                {Object.entries(
                                                    fieldVisits.reduce((acc, visit) => {
                                                        if (visit.crop) {
                                                            acc[visit.crop] = (acc[visit.crop] || 0) + 1;
                                                        }
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                )
                                                .sort(([,a], [,b]) => b - a)
                                                .slice(0, 3)
                                                .map(([crop, count], index) => (
                                                    <div key={crop} className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                            index === 0 ? 'bg-green-500' : 
                                                            index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                                                        }`}>
                                                            {index + 1}
                                                        </div>
                                                        <span className="flex-1 text-sm">{crop}</span>
                                                        <Badge style={getBadgeStyle(cropColorMap[crop])}>{count} visits</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div>
                                    <h4 className="font-semibold mb-3">Recent Activity</h4>
                                    <div className="space-y-2">
                                        {fieldVisits
                                            .filter(v => v.visit_date)
                                            .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
                                            .slice(0, 5)
                                            .map((visit) => (
                                                <div key={visit.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm flex-1">
                                                        {visit.consultant} visited {getClientName(visit.client) || '—'} - {visit.crop}
                                                    </span>
                                                    <Badge style={getBadgeStyle(statusColorMap[visit.status || 'Scheduled'])}>
                                                        {visit.status || 'Scheduled'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(visit.visit_date), 'MMM d')}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
                                <p className="text-muted-foreground mb-4">
                                    Create your first field visit to start generating analytics and insights.
                                </p>
                                <Button onClick={() => setAddVisitDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create First Visit
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>All Field Visits</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('visit_date')}>Visit Date</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('farm')}>Farm</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('client')}>Client</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('consultant')}>Consultant</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('crop')}>Crop</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('visit_reason')}>Visit Reason</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedVisits.map((visit) => (
                                    <tr key={visit.id} className="border-b hover:bg-muted/50">
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{format(new Date(visit.visit_date), "PPP")}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.farm || 'N/A'}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{getClientName(visit.client) || '—'}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.consultant || 'N/A'}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>
                                            <Badge style={getBadgeStyle(statusColorMap[visit.status || 'Scheduled'])}>
                                                {visit.status || 'Scheduled'}
                                            </Badge>
                                        </td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.crop || 'N/A'}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>
                                            <Badge variant="outline" className="capitalize">
                                                {visit.visit_reason || 'N/A'}
                                            </Badge>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <div className="flex space-x-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleViewVisit(visit)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleEditVisit(visit)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Select 
                                                    value={visit.status || 'Scheduled'} 
                                                    onValueChange={(newStatus) => {
                                                        const { created_by, ...rest } = visit;
                                                        updateFieldVisitMutation.mutate({
                                                            ...rest,
                                                            status: newStatus as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
                                                            updated_at: new Date().toISOString(),
                                                        });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-24 h-8">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => handleDeleteVisit(visit)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* View Visit Dialog */}
            <Dialog open={!!viewingVisit} onOpenChange={(isOpen) => !isOpen && setViewingVisit(null)}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Field Visit Details
                        </DialogTitle>
                    </DialogHeader>
                    {viewingVisit && (
                        <div className="space-y-6">
                            {/* Header with key info */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Visit Date</div>
                                        <div className="font-semibold text-lg">{format(new Date(viewingVisit.visit_date), 'PPP')}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Status</div>
                                        <Badge style={getBadgeStyle(statusColorMap[viewingVisit.status || 'Scheduled'])} className="text-sm">
                                            {viewingVisit.status || 'Scheduled'}
                                        </Badge>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Visit Type</div>
                                        <Badge style={getBadgeStyle(reasonColorMap[viewingVisit.visit_reason || ''])} className="text-sm">
                                            {viewingVisit.visit_reason || 'N/A'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* General Info */}
                            <div className="bg-white border rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
                                    <Info className="h-5 w-5" /> 
                                    General Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Consultant:</span>
                                        <Badge style={getBadgeStyle(cropColorMap[viewingVisit.consultant || ''])}>{viewingVisit.consultant || 'N/A'}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Client:</span>
                                        <Badge style={getBadgeStyle(cropColorMap[viewingVisit.client || ''])}>{getClientName(viewingVisit.client) || 'N/A'}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Farm:</span>
                                        <span>{viewingVisit.farm || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Paddock:</span>
                                        <span>{viewingVisit.paddock || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Leaf className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Crop:</span>
                                        <Badge style={getBadgeStyle(cropColorMap[viewingVisit.crop || ''])}>
                                            {viewingVisit.crop || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Address:</span>
                                        <span className="text-sm">{viewingVisit.address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Measurements */}
                            <div className="bg-white border rounded-lg p-4">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                                    <FlaskConical className="h-5 w-5" /> 
                                    Scientific Measurements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Soil pH</div>
                                        <div className={`font-semibold text-lg ${viewingVisit.soil_ph !== undefined && (viewingVisit.soil_ph < 5.5 || viewingVisit.soil_ph > 7.5) ? 'text-red-600' : 'text-green-600'}`}>
                                            {viewingVisit.soil_ph ?? 'N/A'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Optimal: 5.5-7.5</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Soil Texture</div>
                                        <div className="font-semibold text-lg">{viewingVisit.soil_texture || 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Plant Height</div>
                                        <div className="font-semibold text-lg">{viewingVisit.plant_height ?? 'N/A'} <span className="text-sm">cm</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap pH</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_ph ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap Nitrate</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_nitrate ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap Calcium</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_calcium ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap Magnesium</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_magnesium ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap Potassium</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_potassium ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap Sodium</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_sodium ?? 'N/A'}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Penetrometer</div>
                                        <div className="font-semibold text-lg">{viewingVisit.penetrometer ?? 'N/A'} <span className="text-sm">PSI</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Soil EC</div>
                                        <div className="font-semibold text-lg">{viewingVisit.soil_electroconductivity ?? 'N/A'} <span className="text-sm">mS/cm</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Sap EC</div>
                                        <div className="font-semibold text-lg">{viewingVisit.sap_electroconductivity ?? 'N/A'} <span className="text-sm">mS/cm</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Chlorophyll</div>
                                        <div className="font-semibold text-lg">{viewingVisit.chlorophyll_reading ?? 'N/A'} <span className="text-sm">SPAD</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Soil Paramagnetism</div>
                                        <div className="font-semibold text-lg">{viewingVisit.soil_paramagnetism ?? 'N/A'} <span className="text-sm">μT</span></div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded border">
                                        <div className="text-sm text-muted-foreground">Fruiting</div>
                                        <div className="font-semibold text-lg">{viewingVisit.fruiting || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Observations */}
                            {(viewingVisit.in_field_observations || viewingVisit.general_comments) && (
                                <div className="bg-white border rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-orange-700">
                                        <ClipboardList className="h-5 w-5" /> 
                                        Field Observations
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {viewingVisit.in_field_observations && (
                                            <div className="bg-orange-50 p-3 rounded border">
                                                <div className="font-medium text-orange-800 mb-2">In-Field Observations</div>
                                                <div className="text-sm whitespace-pre-wrap text-orange-700">{viewingVisit.in_field_observations}</div>
                                            </div>
                                        )}
                                        {viewingVisit.general_comments && (
                                            <div className="bg-blue-50 p-3 rounded border">
                                                <div className="font-medium text-blue-800 mb-2">General Comments</div>
                                                <div className="text-sm whitespace-pre-wrap text-blue-700">{viewingVisit.general_comments}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Images */}
                            {viewingVisit.image_urls && viewingVisit.image_urls.length > 0 && (
                                <div className="bg-white border rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-700">
                                        <ImageIcon className="h-5 w-5" /> 
                                        Field Visit Images ({viewingVisit.image_urls.length})
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {viewingVisit.image_urls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img 
                                                    src={url} 
                                                    alt={`Field visit image ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                                    <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                                                        Image {index + 1}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Meta Information */}
                            <div className="bg-gray-50 border rounded-lg p-4">
                                <h3 className="font-semibold text-sm mb-3 text-gray-600">Meta Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                                    <div>
                                        <span className="font-medium">Created:</span> {format(new Date(viewingVisit.created_at), 'PPP p')}
                                    </div>
                                    <div>
                                        <span className="font-medium">Last Updated:</span> {format(new Date(viewingVisit.updated_at), 'PPP p')}
                                    </div>
                                    <div>
                                        <span className="font-medium">Created By:</span> {viewingVisit.created_by?.name || 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Field Visit Dialog */}
            <FieldVisitFormDialog
                open={addVisitDialogOpen}
                onOpenChange={setAddVisitDialogOpen}
                onSubmit={(data) => createFieldVisitMutation.mutate(data as CreateFieldVisitData)}
                isLoading={createFieldVisitMutation.isPending}
            />

            {/* Edit Field Visit Dialog */}
            <FieldVisitFormDialog
                open={!!editVisit}
                onOpenChange={(isOpen) => !isOpen && setEditVisit(null)}
                onSubmit={(data) => updateFieldVisitMutation.mutate(data as UpdateFieldVisitData)}
                visit={editVisit || undefined}
                isLoading={updateFieldVisitMutation.isPending}
            />
        </div>
    );
};

export default FieldVisitsPage; 
