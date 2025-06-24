import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFieldVisits, deleteFieldVisit, createFieldVisit, updateFieldVisit } from '@/lib/fieldVisitApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown, PlusCircle, Trash2, Edit, Eye, MapPin, Calendar, User, Crop } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KpiCard from '@/components/metrics/KpiCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from '@/lib/types';
import { format } from 'date-fns';
import { CONSULTANTS, CROP_OPTIONS } from '@/lib/constants';
import FieldVisitFormDialog from '@/components/fieldVisits/FieldVisitFormDialog';

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortableFieldVisitKey = keyof FieldVisit;
interface SortConfig {
  key: SortableFieldVisitKey;
  direction: SortDirection;
}

const getStatusBadgeVariant = (status: FieldVisit['status']): 'success' | 'warning' | 'destructive' | 'default' => {
    switch (status) {
        case 'completed': return 'success';
        case 'in-progress': return 'warning';
        case 'cancelled': return 'destructive';
        case 'scheduled': return 'default';
        default: return 'default';
    }
};

const getVisitTypeBadgeVariant = (visitType: FieldVisit['visit_type']): 'success' | 'warning' | 'destructive' | 'default' => {
    switch (visitType) {
        case 'routine': return 'default';
        case 'emergency': return 'destructive';
        case 'follow-up': return 'warning';
        case 'initial': return 'success';
        default: return 'default';
    }
};

const FieldVisitsPage: React.FC = () => {
    const [viewingVisit, setViewingVisit] = useState<FieldVisit | null>(null);
    const [editVisit, setEditVisit] = useState<FieldVisit | null>(null);
    const [addVisitDialogOpen, setAddVisitDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedAgronomist, setSelectedAgronomist] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | FieldVisit['status']>('all');
    const [selectedVisitType, setSelectedVisitType] = useState<'all' | FieldVisit['visit_type']>('all');
    const [selectedCrop, setSelectedCrop] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');

    const queryClient = useQueryClient();

    const { data: fieldVisits = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['fieldVisits'],
        queryFn: getFieldVisits,
    });

    // Create field visit mutation
    const createFieldVisitMutation = useMutation({
        mutationFn: createFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
            setAddVisitDialogOpen(false);
        },
    });

    // Update field visit mutation
    const updateFieldVisitMutation = useMutation({
        mutationFn: updateFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
            setEditVisit(null);
        },
    });

    // Delete field visit mutation
    const deleteFieldVisitMutation = useMutation({
        mutationFn: deleteFieldVisit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fieldVisits'] });
        },
    });

    const agronomists = useMemo(() => [...new Set(fieldVisits.map(visit => visit.agronomist))].filter(Boolean), [fieldVisits]);
    const crops = useMemo(() => [...new Set(fieldVisits.map(visit => visit.crop_type))].filter(Boolean), [fieldVisits]);

    const stats = useMemo(() => {
        const filtered = fieldVisits
            .filter(v => selectedAgronomist === 'all' || v.agronomist === selectedAgronomist)
            .filter(v => selectedStatus === 'all' || v.status === selectedStatus)
            .filter(v => selectedVisitType === 'all' || v.visit_type === selectedVisitType)
            .filter(v => selectedCrop === 'all' || v.crop_type === selectedCrop);

        return {
          total: filtered.length,
          completed: filtered.filter(v => v.status === 'completed').length,
          scheduled: filtered.filter(v => v.status === 'scheduled').length,
          inProgress: filtered.filter(v => v.status === 'in-progress').length,
          cancelled: filtered.filter(v => v.status === 'cancelled').length,
        };
    }, [fieldVisits, selectedAgronomist, selectedStatus, selectedVisitType, selectedCrop]);

    const displayedVisits = useMemo(() => {
        let filteredVisits = fieldVisits;

        if (selectedAgronomist !== 'all') {
            filteredVisits = filteredVisits.filter(visit => visit.agronomist === selectedAgronomist);
        }
        
        if (selectedStatus !== 'all') {
            filteredVisits = filteredVisits.filter(visit => visit.status === selectedStatus);
        }

        if (selectedVisitType !== 'all') {
            filteredVisits = filteredVisits.filter(visit => visit.visit_type === selectedVisitType);
        }

        if (selectedCrop !== 'all') {
            filteredVisits = filteredVisits.filter(visit => visit.crop_type === selectedCrop);
        }

        // Filter by month
        if (selectedMonth !== 'all') {
            filteredVisits = filteredVisits.filter(visit => {
                const visitMonth = new Date(visit.visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                return visitMonth === selectedMonth;
            });
        }

        if (sortConfig !== null) {
            filteredVisits.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredVisits;
    }, [fieldVisits, selectedAgronomist, selectedStatus, selectedVisitType, selectedCrop, selectedMonth, sortConfig]);

    const handleViewVisit = (visit: FieldVisit) => {
        setViewingVisit(visit);
    };

    const handleEditVisit = (visit: FieldVisit) => {
        setEditVisit(visit);
    };

    const handleDeleteVisit = (visit: FieldVisit) => {
        if (window.confirm(`Are you sure you want to delete the field visit for ${visit.farm_name}?`)) {
            deleteFieldVisitMutation.mutate(visit.id);
        }
    };

    const handleSort = (key: keyof FieldVisit) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading field visits...</p></div>;
    if (isError) return <div className="text-red-500"><p>Error loading field visits: {error.message}</p></div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Field Visits Management</h1>
                        <p className="text-muted-foreground mt-1">Track and manage all agronomist field visits with comprehensive details and analytics.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setAddVisitDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Visit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Total Visits" value={stats.total} icon={<MapPin className="h-6 w-6 text-muted-foreground" />} />
                <KpiCard title="Completed" value={stats.completed} icon={<Calendar className="h-6 w-6 text-green-500" />} />
                <KpiCard title="Scheduled" value={stats.scheduled} icon={<Calendar className="h-6 w-6 text-blue-500" />} />
                <KpiCard title="In Progress" value={stats.inProgress} icon={<AlertCircle className="h-6 w-6 text-orange-500" />} />
                <KpiCard title="Cancelled" value={stats.cancelled} icon={<AlertCircle className="h-6 w-6 text-red-500" />} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Refine field visits by various criteria.</p>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Agronomist:</span>
                        <Select value={selectedAgronomist} onValueChange={setSelectedAgronomist}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Agronomists" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Agronomists</SelectItem>
                                {agronomists.map(agronomist => (
                                    <SelectItem key={agronomist} value={agronomist}>{agronomist}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                        <Select value={selectedStatus} onValueChange={(value: 'all' | FieldVisit['status']) => setSelectedStatus(value)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Visit Type:</span>
                        <Select value={selectedVisitType} onValueChange={(value: 'all' | FieldVisit['visit_type']) => setSelectedVisitType(value)}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="routine">Routine</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                                <SelectItem value="follow-up">Follow-up</SelectItem>
                                <SelectItem value="initial">Initial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Crop:</span>
                        <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Crops" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Crops</SelectItem>
                                {crops.map(crop => (
                                    <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Month:</span>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Months" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {[...new Set(fieldVisits.map(visit => 
                                    new Date(visit.visit_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                ))].sort().map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            
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
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('farm_name')}>Farm Name</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('farmer_name')}>Farmer</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('agronomist')}>Agronomist</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('visit_date')}>Visit Date</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('visit_type')}>Visit Type</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('crop_type')}>Crop</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedVisits.map((visit) => (
                                    <tr key={visit.id} className="border-b hover:bg-muted/50">
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.farm_name}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.farmer_name}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.agronomist}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{format(new Date(visit.visit_date), "PPP")}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>
                                            <Badge variant={getVisitTypeBadgeVariant(visit.visit_type)} className="capitalize">
                                                {visit.visit_type.replace('-', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>{visit.crop_type}</td>
                                        <td className="cursor-pointer" onClick={() => handleViewVisit(visit)}>
                                            <Badge variant={getStatusBadgeVariant(visit.status)} className="capitalize">
                                                {visit.status.replace('-', ' ')}
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Field Visit Details</DialogTitle>
                    </DialogHeader>
                    {viewingVisit && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Farm Name</label>
                                    <p className="text-sm">{viewingVisit.farm_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Farmer Name</label>
                                    <p className="text-sm">{viewingVisit.farmer_name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Agronomist</label>
                                    <p className="text-sm">{viewingVisit.agronomist}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Visit Date</label>
                                    <p className="text-sm">{format(new Date(viewingVisit.visit_date), "PPP")}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Visit Type</label>
                                    <Badge variant={getVisitTypeBadgeVariant(viewingVisit.visit_type)} className="capitalize">
                                        {viewingVisit.visit_type.replace('-', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <Badge variant={getStatusBadgeVariant(viewingVisit.status)} className="capitalize">
                                        {viewingVisit.status.replace('-', ' ')}
                                    </Badge>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Crop Type</label>
                                    <p className="text-sm">{viewingVisit.crop_type}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Field Size</label>
                                    <p className="text-sm">{viewingVisit.field_size} {viewingVisit.field_size_unit}</p>
                                </div>
                            </div>
                            
                            {viewingVisit.soil_type && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Soil Type</label>
                                    <p className="text-sm">{viewingVisit.soil_type}</p>
                                </div>
                            )}
                            
                            {viewingVisit.weather_conditions && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Weather Conditions</label>
                                    <p className="text-sm">{viewingVisit.weather_conditions}</p>
                                </div>
                            )}
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Observations</label>
                                <p className="text-sm whitespace-pre-wrap">{viewingVisit.observations}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Recommendations</label>
                                <p className="text-sm whitespace-pre-wrap">{viewingVisit.recommendations}</p>
                            </div>
                            
                            {viewingVisit.next_visit_date && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Next Visit Date</label>
                                    <p className="text-sm">{format(new Date(viewingVisit.next_visit_date), "PPP")}</p>
                                </div>
                            )}
                            
                            {viewingVisit.location?.address && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                                    <p className="text-sm">{viewingVisit.location.address}</p>
                                </div>
                            )}
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