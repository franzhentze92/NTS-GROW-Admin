import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, Trash2, Edit, RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import KpiCard from '@/components/metrics/KpiCard';
import { Calendar, CheckCircle2, CircleDot } from 'lucide-react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// DB Task interface
interface DbTask {
  id: string;
  project: string;
  category: string;
  task: string;
  action: 'Pending' | 'In Progress' | 'Completed';
  description: string;
  startDate: string; 
  endDate: string;
  created_at: string;
}

// UI Task interface
export interface Task {
  id: string;
  project: string;
  category: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  description: string;
  startDate: Date;
  endDate: Date;
}

export type TaskFormValues = Omit<Task, 'id'>;

// --- API Functions ---
const fetchTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    
    return data.map((dbTask: DbTask) => ({
        id: dbTask.id,
        project: dbTask.project,
        category: dbTask.category,
        title: dbTask.task,
        status: dbTask.action,
        description: dbTask.description,
        startDate: new Date(dbTask.startDate + 'T00:00:00'),
        endDate: new Date(dbTask.endDate + 'T00:00:00'),
    }));
};

const saveTask = async (task: TaskFormValues & { id?: string }) => {
    const { id, title, status, ...rest } = task;
    const dbData = {
        ...rest,
        task: title,
        action: status,
        startDate: task.startDate.toISOString().split('T')[0],
        endDate: task.endDate.toISOString().split('T')[0],
    };
    const { error } = id ? await supabase.from('tasks').update(dbData).eq('id', id) : await supabase.from('tasks').insert(dbData);
    if (error) throw new Error(error.message);
};

const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw new Error(error.message);
};

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortableTaskKey = keyof Task | 'title';
interface SortConfig {
  key: SortableTaskKey;
  direction: SortDirection;
}

const getStatusBadgeVariant = (status: Task['status']): 'success' | 'warning' | 'destructive' | 'default' => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'warning';
        case 'Pending': return 'destructive';
        default: return 'default';
    }
};

// Custom components for Gantt Chart list view
const CustomTaskListHeader: React.FC<{ headerHeight: number; fontFamily: string; fontSize: string; rowWidth: string; }> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => (
    <div className="gantt-task-list-header flex items-center bg-muted/50 border-b" style={{ height: headerHeight, fontFamily, fontSize, width: rowWidth }}>
        <div className="gantt-task-list-header-cell pl-2 font-semibold">Task</div>
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

// --- Component ---
const TaskManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [selectedProject, setSelectedProject] = useState('all');
    const allStatuses: Task['status'][] = useMemo(() => ['Pending', 'In Progress', 'Completed'], []);
    const [selectedStatuses, setSelectedStatuses] = useState<Task['status'][]>(['Pending', 'In Progress']);
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
    const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);

    const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({ queryKey: ['tasks'], queryFn: fetchTasks });

    const projects = useMemo(() => [...new Set(tasks.map(task => task.project))].filter(Boolean), [tasks]);

    const stats = useMemo(() => {
        const filtered = tasks
            .filter(t => selectedProject === 'all' || t.project === selectedProject)
            .filter(t => selectedStatuses.includes(t.status));

        return {
          total: filtered.length,
          completed: filtered.filter(t => t.status === 'Completed').length,
          inProgress: filtered.filter(t => t.status === 'In Progress').length,
          pending: filtered.filter(t => t.status === 'Pending').length,
        };
    }, [tasks, selectedProject, selectedStatuses]);

    const displayedTasks = useMemo(() => {
        let filteredTasks = tasks;

        if (selectedProject !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.project === selectedProject);
        }
        
        filteredTasks = filteredTasks.filter(task => selectedStatuses.includes(task.status));

        if (sortConfig !== null) {
            filteredTasks.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredTasks;
    }, [tasks, selectedProject, selectedStatuses, sortConfig]);

    const ganttTasks: GanttTask[] = useMemo(() => {
        return displayedTasks
            .map(task => {
                const styles = {
                    backgroundColor: '#bbb',
                    backgroundSelectedColor: '#8e44ad',
                    progressColor: '#666',
                    progressSelectedColor: '#2c3e50',
                };
                if (task.status === 'Pending') {
                    styles.backgroundColor = '#fca5a5';
                    styles.backgroundSelectedColor = '#ef4444';
                    styles.progressColor = '#dc2626';
                    styles.progressSelectedColor = '#b91c1c';
                } else if (task.status === 'In Progress') {
                    styles.backgroundColor = '#fde047';
                    styles.backgroundSelectedColor = '#facc15';
                    styles.progressColor = '#eab308';
                    styles.progressSelectedColor = '#ca8a04';
                } else if (task.status === 'Completed') {
                    styles.backgroundColor = '#86efac';
                    styles.backgroundSelectedColor = '#4ade80';
                    styles.progressColor = '#22c55e';
                    styles.progressSelectedColor = '#16a34a';
                }
                return {
                    id: task.id,
                    name: task.title,
                    start: task.startDate,
                    end: task.endDate,
                    progress: task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 25 : 0,
                    type: 'task',
                    styles,
                    isDisabled: true,
                };
            });
    }, [displayedTasks]);

    const saveTaskMutation = useMutation({
        mutationFn: saveTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsDialogOpen(false);
            setEditingTask(null);
        },
    });

    const deleteTaskMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    });

    const handleSaveTask = (values: TaskFormValues) => {
        const taskToSave = editingTask ? { ...values, id: editingTask.id } : values;
        saveTaskMutation.mutate(taskToSave);
    };

    const handleDeleteTask = (taskId: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            deleteTaskMutation.mutate(taskId);
        }
    };

    const openNewTaskDialog = () => {
        setEditingTask(null);
        setIsDialogOpen(true);
    };

    const openEditTaskDialog = (task: Task) => {
        setEditingTask(task);
        setIsDialogOpen(true);
    };
    
    const handleViewTask = (task: Task) => {
        setViewingTask(task);
    };

    const handleGanttClick = (ganttTask: GanttTask) => {
        const taskToView = tasks.find(t => t.id === ganttTask.id);
        if (taskToView) {
            setViewingTask(taskToView);
        }
    };

    const handleSort = (key: keyof Task) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleStatusToggle = (status: Task['status']) => {
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

    if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading tasks...</p></div>;
    if (isError) return <div className="text-red-500"><p>Error loading tasks: {error.message}</p></div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div>
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
                        <p className="text-muted-foreground mt-1">Add, edit, and track all tasks from one central place.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
                        <Button onClick={openNewTaskDialog}><PlusCircle className="h-4 w-4 mr-2" />New Task</Button>
                    </div>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard title="Total Tasks" value={stats.total} icon={<Calendar className="h-6 w-6 text-muted-foreground" />} />
                <KpiCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} />
                <KpiCard title="In Progress" value={stats.inProgress} icon={<CircleDot className="h-6 w-6 text-orange-500" />} />
                <KpiCard title="Pending" value={stats.pending} icon={<AlertCircle className="h-6 w-6 text-red-500" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">Refine tasks by project and status.</p>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                     <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Filter by Project:</span>
                        <Button variant={selectedProject === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedProject('all')}>All Projects</Button>
                        {projects.map(p => <Button key={p} variant={selectedProject === p ? 'default' : 'outline'} size="sm" onClick={() => setSelectedProject(p)}>{p}</Button>)}
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                        <CardTitle>Task Gantt Chart</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Timeline of all ongoing and pending tasks.</p>
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
                                <span className="text-xs text-muted-foreground">Pending</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#fde047' }} />
                                <span className="text-xs text-muted-foreground">In Progress</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#86efac' }} />
                                <span className="text-xs text-muted-foreground">Completed</span>
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
                            <AlertTitle>No Tasks to Display</AlertTitle>
                            <AlertDescription>
                                There are no tasks matching the current filters.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>All Tasks</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('title')}>Task</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('project')}>Project</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('category')}>Category</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('startDate')}>Start Date</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('endDate')}>End Date</th>
                                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => handleSort('status')}>Status</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedTasks.map((task) => (
                                    <tr key={task.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleViewTask(task)}>
                                        <td>{task.title}</td>
                                        <td>{task.project}</td>
                                        <td>{task.category}</td>
                                        <td>{task.startDate.toLocaleDateString()}</td>
                                        <td>{task.endDate.toLocaleDateString()}</td>
                                        <td>
                                            <Badge variant={getStatusBadgeVariant(task.status)}>
                                                {task.status}
                                            </Badge>
                                        </td>
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" onClick={() => openEditTaskDialog(task)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle></DialogHeader>
                    <TaskForm 
                        onSubmit={handleSaveTask}
                        onCancel={() => setIsDialogOpen(false)}
                        task={editingTask ?? undefined}
                        isSaving={saveTaskMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewingTask} onOpenChange={(isOpen) => !isOpen && setViewingTask(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Task Details</DialogTitle>
                    </DialogHeader>
                    {viewingTask && (
                        <div className="grid gap-4 py-4 text-sm">
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">Project</Label>
                                <div className="col-span-2">{viewingTask.project}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">Category</Label>
                                <div className="col-span-2">{viewingTask.category}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">Task</Label>
                                <div className="col-span-2">{viewingTask.title}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">Status</Label>
                                <div className="col-span-2">
                                    <Badge variant={getStatusBadgeVariant(viewingTask.status)}>
                                        {viewingTask.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 items-start gap-4">
                                <Label className="text-right font-semibold mt-1">Description</Label>
                                <p className="col-span-2 text-muted-foreground">{viewingTask.description}</p>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">Start Date</Label>
                                <div className="col-span-2">{viewingTask.startDate.toLocaleDateString()}</div>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label className="text-right font-semibold">End Date</Label>
                                <div className="col-span-2">{viewingTask.endDate.toLocaleDateString()}</div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TaskManagementPage; 