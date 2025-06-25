import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown, PlusCircle, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KpiCard from '@/components/metrics/KpiCard';
import { Calendar, CheckCircle2, CircleDot, FileText, Leaf } from 'lucide-react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnalysisFormDialog } from '@/components/analysis/AnalysisFormDialog';
import { ViewAnalysisDialog } from '@/components/analysis/ViewAnalysisDialog';
import { Analysis } from '@/lib/types';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { PostgrestResponse } from '@supabase/supabase-js';

// UI Analysis interface for Gantt chart
export interface AnalysisTask {
  id: string;
  client_name: string;
  consultant: string;
  analysis_type: 'soil' | 'leaf';
  crop: string;
  status: 'Draft' | 'Ready to be Checked' | 'Checked Ready to be Emailed' | 'Emailed';
  startDate: Date;
  endDate: Date;
  created_at: string;
}

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortableAnalysisKey = keyof AnalysisTask;
interface SortConfig {
  key: SortableAnalysisKey;
  direction: SortDirection;
}

const getStatusBadgeVariant = (status: AnalysisTask['status']): 'success' | 'warning' | 'destructive' | 'default' => {
    switch (status) {
        case 'Emailed': return 'success';
        case 'Checked Ready to be Emailed': return 'warning';
        case 'Ready to be Checked': return 'default';
        case 'Draft': return 'destructive';
        default: return 'default';
    }
};

// Custom components for Gantt Chart list view
const CustomTaskListHeader: React.FC<{ headerHeight: number; fontFamily: string; fontSize: string; rowWidth: string; }> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => (
    <div className="gantt-task-list-header flex items-center bg-muted/50 border-b" style={{ height: headerHeight, fontFamily, fontSize, width: rowWidth }}>
        <div className="gantt-task-list-header-cell pl-2 font-semibold">Analysis</div>
    </div>
);

const CustomTaskListTable: React.FC<{ tasks: GanttTask[]; rowHeight: number; rowWidth: string; fontFamily: string; fontSize: string; }> = ({ tasks, rowHeight, rowWidth, fontFamily, fontSize }) => (
    <div style={{ width: rowWidth }}>
        {tasks.map(t => (
            <div className="gantt-task-list-table-row flex items-center border-b" style={{ height: rowHeight, fontFamily, fontSize }} key={t.id}>
                <div className="truncate pl-2" title={t.name}>{t.name}</div>
            </div>
        ))}
    </div>
);

const EnterAnalysisPage: React.FC = () => {
    const [viewingAnalysis, setViewingAnalysis] = useState<Analysis | null>(null);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedConsultant, setSelectedConsultant] = useState('all');
    const [selectedAnalysisType, setSelectedAnalysisType] = useState<'all' | 'soil' | 'leaf'>('all');
    const allStatuses: AnalysisTask['status'][] = useMemo(() => ['Draft', 'Ready to be Checked', 'Checked Ready to be Emailed', 'Emailed'], []);
    const [selectedStatuses, setSelectedStatuses] = useState<AnalysisTask['status'][]>([...allStatuses]);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
    const [selectedMonth, setSelectedMonth] = useState('all');

    const { data: analyses = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['analyses'],
        queryFn: getAnalyses,
    });

    const queryClient = useQueryClient();

    // Delete analysis mutation
    const deleteAnalysisMutation = useMutation({
        mutationFn: async (analysisId: string) => {
            console.log('Attempting to delete analysis with ID:', analysisId);
            const { data, error } = (await supabase
                .from('analysis_tracker')
                .delete()
                .eq('id', analysisId)) as PostgrestResponse<any>;
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: (data) => {
            console.log('Delete successful:', data);
            queryClient.invalidateQueries({ queryKey: ['analyses'] });
        },
        onError: (error) => {
            console.log('Delete error:', error);
            alert('Failed to delete analysis: ' + error.message);
        }
    });

    // Convert Analysis to AnalysisTask for Gantt chart
    const analysisTasks: AnalysisTask[] = useMemo(() => {
        return analyses.map((analysis: Analysis) => {
            const createdDate = new Date(analysis.created_at);
            // Estimate end date based on status (you can adjust these durations)
            let endDate = new Date(createdDate);
            switch (analysis.status) {
                case 'Draft':
                    endDate.setDate(createdDate.getDate() + 3); // 3 days for draft
                    break;
                case 'Ready to be Checked':
                    endDate.setDate(createdDate.getDate() + 5); // 5 days to ready check
                    break;
                case 'Checked Ready to be Emailed':
                    endDate.setDate(createdDate.getDate() + 7); // 7 days to checked
                    break;
                case 'Emailed':
                    endDate.setDate(createdDate.getDate() + 10); // 10 days to completion
                    break;
            }
            
            return {
                id: analysis.id,
                client_name: analysis.client_name,
                consultant: analysis.consultant,
                analysis_type: analysis.analysis_type,
                crop: analysis.crop,
                status: analysis.status,
                startDate: createdDate,
                endDate: endDate,
                created_at: analysis.created_at,
            };
        });
    }, [analyses]);

    const consultants = useMemo(() => [...new Set(analysisTasks.map(task => task.consultant))].filter(Boolean), [analysisTasks]);

    const stats = useMemo(() => {
        const filtered = analysisTasks
            .filter(t => selectedConsultant === 'all' || t.consultant === selectedConsultant)
            .filter(t => selectedAnalysisType === 'all' || t.analysis_type === selectedAnalysisType)
            .filter(t => selectedStatuses.includes(t.status));

        return {
          total: filtered.length,
          emailed: filtered.filter(t => t.status === 'Emailed').length,
          checked: filtered.filter(t => t.status === 'Checked Ready to be Emailed').length,
          ready: filtered.filter(t => t.status === 'Ready to be Checked').length,
          draft: filtered.filter(t => t.status === 'Draft').length,
        };
    }, [analysisTasks, selectedConsultant, selectedAnalysisType, selectedStatuses]);

    const displayedAnalyses = useMemo(() => {
        let filteredAnalyses = analysisTasks;

        if (selectedConsultant !== 'all') {
            filteredAnalyses = filteredAnalyses.filter(task => task.consultant === selectedConsultant);
        }
        
        if (selectedAnalysisType !== 'all') {
            filteredAnalyses = filteredAnalyses.filter(task => task.analysis_type === selectedAnalysisType);
        }
        
        // Filter by month
        if (selectedMonth !== 'all') {
            filteredAnalyses = filteredAnalyses.filter(task => {
                const taskMonth = task.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                return taskMonth === selectedMonth;
            });
        }
        
        filteredAnalyses = filteredAnalyses.filter(task => selectedStatuses.includes(task.status));

        if (sortConfig !== null) {
            filteredAnalyses.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredAnalyses;
    }, [analysisTasks, selectedConsultant, selectedAnalysisType, selectedStatuses, selectedMonth, sortConfig]);

    const ganttTasks: GanttTask[] = useMemo(() => {
        return displayedAnalyses
            .map(task => {
                const styles = {
                    backgroundColor: '#bbb',
                    backgroundSelectedColor: '#8e44ad',
                    progressColor: '#666',
                    progressSelectedColor: '#2c3e50',
                };
                if (task.status === 'Draft') {
                    styles.backgroundColor = '#fca5a5';
                    styles.backgroundSelectedColor = '#ef4444';
                    styles.progressColor = '#dc2626';
                    styles.progressSelectedColor = '#b91c1c';
                } else if (task.status === 'Ready to be Checked') {
                    styles.backgroundColor = '#fde047';
                    styles.backgroundSelectedColor = '#facc15';
                    styles.progressColor = '#eab308';
                    styles.progressSelectedColor = '#ca8a04';
                } else if (task.status === 'Checked Ready to be Emailed') {
                    styles.backgroundColor = '#93c5fd';
                    styles.backgroundSelectedColor = '#3b82f6';
                    styles.progressColor = '#2563eb';
                    styles.progressSelectedColor = '#1d4ed8';
                } else if (task.status === 'Emailed') {
                    styles.backgroundColor = '#86efac';
                    styles.backgroundSelectedColor = '#4ade80';
                    styles.progressColor = '#22c55e';
                    styles.progressSelectedColor = '#16a34a';
                }
                return {
                    id: task.id,
                    name: `${task.client_name} - ${task.crop}`,
                    start: task.startDate,
                    end: task.endDate,
                    progress: task.status === 'Emailed' ? 100 : 
                             task.status === 'Checked Ready to be Emailed' ? 75 : 
                             task.status === 'Ready to be Checked' ? 50 : 25,
                    type: 'task',
                    styles,
                    isDisabled: true,
                };
            });
    }, [displayedAnalyses]);

    const handleViewAnalysis = (analysis: Analysis) => {
        setViewingAnalysis(analysis);
        setViewDialogOpen(true);
    };

    const handleEditAnalysis = (analysis: Analysis) => {
        setViewingAnalysis(analysis);
        setEditDialogOpen(true);
    };

    const handleDeleteAnalysis = (analysis: Analysis) => {
        if (window.confirm(`Are you sure you want to delete the analysis for ${analysis.client_name}?`)) {
            deleteAnalysisMutation.mutate(analysis.id);
        }
    };

    const handleGanttClick = (ganttTask: GanttTask) => {
        const analysisToView = analyses.find(a => a.id === ganttTask.id);
        if (analysisToView) {
            setViewingAnalysis(analysisToView);
            setViewDialogOpen(true);
        }
    };

    const handleSort = (key: keyof AnalysisTask) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleStatusToggle = (status: AnalysisTask['status']) => {
        setSelectedStatuses(prev => {
            const newStatuses = prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status];
            return newStatuses.length === 0 ? allStatuses : newStatuses;
        });
    };

    const handleSelectAllStatuses = () => {
        setSelectedStatuses(allStatuses);
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading analyses...</p></div>;
    if (isError) {
        const errorMessage = error.message;
        const isConfigError = errorMessage.includes('Database connection not configured');
        
        return (
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Analysis Management</h1>
                    <p className="text-muted-foreground mt-1">Track and manage all soil and leaf therapy analysis records with visual timeline.</p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
                        <h3 className="text-lg font-semibold text-red-800">Database Connection Error</h3>
                    </div>
                    <div className="mt-3 text-red-700">
                        {isConfigError ? (
                            <div>
                                <p className="mb-3">The analysis tracking system requires a Supabase database connection to function properly.</p>
                                <div className="bg-white p-4 rounded border">
                                    <h4 className="font-semibold mb-2">To fix this issue:</h4>
                                    <ol className="list-decimal list-inside space-y-1 text-sm">
                                        <li>Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root</li>
                                        <li>Add your Supabase credentials:</li>
                                        <li className="ml-4">
                                            <code className="bg-gray-100 px-1 rounded block mt-1">
                                                VITE_SUPABASE_URL=your_supabase_project_url
                                            </code>
                                            <code className="bg-gray-100 px-1 rounded block mt-1">
                                                VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                                            </code>
                                        </li>
                                        <li>Run the SQL setup script in your Supabase dashboard</li>
                                        <li>Restart your development server</li>
                                    </ol>
                                </div>
                                <div className="mt-3 text-sm">
                                    <p><strong>Note:</strong> You can find your Supabase credentials in your project dashboard under Settings → API.</p>
                                </div>
                            </div>
                        ) : (
                            <p>Error loading analyses: {errorMessage}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Analysis Management</h1>
                        <p className="text-muted-foreground mt-1">Track and manage all soil and leaf therapy analysis records with visual timeline.</p>
                    </div>
                    <div className="flex gap-2">
                        <AnalysisFormDialog mode="create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Register New Analysis
                            </Button>
                        </AnalysisFormDialog>
                        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <KpiCard title="Total Analyses" value={stats.total} icon={<Calendar className="h-6 w-6 text-muted-foreground" />} />
                <KpiCard title="Emailed" value={stats.emailed} icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} />
                <KpiCard title="Checked Ready" value={stats.checked} icon={<CircleDot className="h-6 w-6 text-blue-500" />} />
                <KpiCard title="Ready to Check" value={stats.ready} icon={<AlertCircle className="h-6 w-6 text-orange-500" />} />
                <KpiCard title="Draft" value={stats.draft} icon={<FileText className="h-6 w-6 text-red-500" />} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Refine analyses by consultant, type, and status.</p>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Consultant:</span>
                        <Button variant={selectedConsultant === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedConsultant('all')}>All Consultants</Button>
                        {consultants.map(c => <Button key={c} variant={selectedConsultant === c ? 'default' : 'outline'} size="sm" onClick={() => setSelectedConsultant(c)}>{c}</Button>)}
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Type:</span>
                        <Button variant={selectedAnalysisType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedAnalysisType('all')}>All Types</Button>
                        <Button variant={selectedAnalysisType === 'soil' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedAnalysisType('soil')}>Soil</Button>
                        <Button variant={selectedAnalysisType === 'leaf' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedAnalysisType('leaf')}>Leaf</Button>
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                        <Button 
                            variant={selectedStatuses.length === allStatuses.length ? 'default' : 'outline'} 
                            size="sm" 
                            onClick={handleSelectAllStatuses} 
                        >
                            All Statuses
                        </Button>
                        {allStatuses.map(s => (
                            <Button 
                                key={s} 
                                variant={selectedStatuses.includes(s) ? 'default' : 'outline'} 
                                size="sm" 
                                onClick={() => handleStatusToggle(s)} 
                            >
                                {s}
                            </Button>
                        ))}
                    </div>
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Month:</span>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Months</SelectItem>
                                {[...new Set(analysisTasks.map(task => 
                                    task.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                ))].sort().map(month => (
                                    <SelectItem key={month} value={month}>{month}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <CardTitle>Analysis Gantt Chart</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Timeline of all ongoing and completed analyses.</p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">View:</span>
                            <Button variant={viewMode === ViewMode.Day ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Day)}>Day</Button>
                            <Button variant={viewMode === ViewMode.Week ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Week)}>Week</Button>
                            <Button variant={viewMode === ViewMode.Month ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Month)}>Month</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fca5a5' }} />
                                <span className="text-xs text-muted-foreground">Draft</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fde047' }} />
                                <span className="text-xs text-muted-foreground">Ready to Check</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93c5fd' }} />
                                <span className="text-xs text-muted-foreground">Checked Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86efac' }} />
                                <span className="text-xs text-muted-foreground">Emailed</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {ganttTasks.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <Gantt
                                tasks={ganttTasks}
                                viewMode={viewMode}
                                onClick={handleGanttClick}
                                listCellWidth="300px"
                                ganttHeight={450}
                                columnWidth={viewMode === ViewMode.Day ? 60 : viewMode === ViewMode.Week ? 150 : 250}
                                rowHeight={44}
                                headerHeight={50}
                                barCornerRadius={4}
                                barFill={70}
                                handleWidth={8}
                                fontFamily="Inter, system-ui, sans-serif"
                                fontSize="12px"
                                TaskListHeader={CustomTaskListHeader}
                                TaskListTable={CustomTaskListTable}
                            />
                        </div>
                    ) : (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>No Analyses to Display</AlertTitle>
                            <AlertDescription>
                                There are no analyses matching the current filters.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>All Analyses</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('client_name')}>Client</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('consultant')}>Consultant</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('analysis_type')}>Type</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('crop')}>Crop</th>
                                    <th className="text-left py-3 px-4 font-semibold">Sample No.</th>
                                    <th className="text-left py-3 px-4 font-semibold">EAL Lab No.</th>
                                    <th className="text-left py-3 px-4 font-semibold">No. of Tests</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('startDate')}>Created Date</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedAnalyses.map((analysis) => {
                                    const fullAnalysis = analyses.find(a => a.id === analysis.id);
                                    return (
                                        <tr key={analysis.id} className="border-b hover:bg-muted/50">
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>{analysis.client_name}</td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>{analysis.consultant}</td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>
                                                <Badge variant={analysis.analysis_type === 'soil' ? 'secondary' : 'default'} className="capitalize">
                                                    {analysis.analysis_type}
                                                </Badge>
                                            </td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>{analysis.crop}</td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>
                                                {fullAnalysis?.sample_no || '-'}
                                            </td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>
                                                {fullAnalysis?.eal_lab_no || '-'}
                                            </td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>
                                                {fullAnalysis?.test_count || '-'}
                                            </td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>{format(analysis.startDate, "PPP")}</td>
                                            <td className="cursor-pointer" onClick={() => fullAnalysis && handleViewAnalysis(fullAnalysis)}>
                                                <Badge variant={getStatusBadgeVariant(analysis.status)}>
                                                    {analysis.status}
                                                </Badge>
                                            </td>
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => fullAnalysis && handleEditAnalysis(fullAnalysis)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            console.log('Delete button clicked for analysis:', fullAnalysis?.id);
                                                            fullAnalysis && handleDeleteAnalysis(fullAnalysis);
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <ViewAnalysisDialog
                analysis={viewingAnalysis}
                open={viewDialogOpen}
                onOpenChange={setViewDialogOpen}
            />

            <AnalysisFormDialog 
                mode="edit" 
                analysis={viewingAnalysis}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            >
                <div style={{ display: 'none' }}></div>
            </AnalysisFormDialog>
        </div>
    );
};

export default EnterAnalysisPage; 