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

// --- Component ---
const TaskManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'title', direction: 'asc' });
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({ queryKey: ['tasks'], queryFn: fetchTasks });

    const projects = useMemo(() => [...new Set(tasks.map(task => task.project))].filter(Boolean), [tasks]);
    const statuses: Task['status'][] = ['Pending', 'In Progress', 'Completed'];

    const stats = useMemo(() => {
        const filtered = tasks
            .filter(t => selectedProject === 'all' || t.project === selectedProject)
            .filter(t => selectedStatus === 'all' || t.status === selectedStatus);

        return {
          total: filtered.length,
          completed: filtered.filter(t => t.status === 'Completed').length,
          inProgress: filtered.filter(t => t.status === 'In Progress').length,
          pending: filtered.filter(t => t.status === 'Pending').length,
        };
    }, [tasks, selectedProject, selectedStatus]);

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
    
    const requestSort = (key: SortableTaskKey) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const displayedTasks = useMemo(() => {
        let filteredTasks = tasks;

        if (selectedProject !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.project === selectedProject);
        }
        if (selectedStatus !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.status === selectedStatus);
        }
        
        const sortableItems = [...filteredTasks];
        const { key, direction } = sortConfig;
        sortableItems.sort((a, b) => {
            const aVal = a[key as keyof Task];
            const bVal = b[key as keyof Task];
            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [tasks, sortConfig, selectedProject, selectedStatus]);


  if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading tasks...</p></div>;
  if (isError) return <div className="text-red-500"><p>Error loading tasks: {error.message}</p></div>;

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Total Tasks" value={stats.total} icon={<Calendar className="h-6 w-6 text-muted-foreground" />} />
          <KpiCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} />
          <KpiCard title="In Progress" value={stats.inProgress} icon={<CircleDot className="h-6 w-6 text-orange-500" />} />
          <KpiCard title="Pending" value={stats.pending} icon={<AlertCircle className="h-6 w-6 text-red-500" />} />
        </div>
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Task Management</h1>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />Refresh</Button>
                <Button onClick={openNewTaskDialog}><PlusCircle className="h-4 w-4 mr-2" />New Task</Button>
            </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>All Tasks</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter by Project:</span>
                  <Button variant={selectedProject === 'all' ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedProject('all')}>All Projects</Button>
                  {projects.map(p => <Button key={p} variant={selectedProject === p ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedProject(p)}>{p}</Button>)}
              </div>
               <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Filter by Status:</span>
                  <Button variant={selectedStatus === 'all' ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedStatus('all')}>All</Button>
                  {statuses.map(s => <Button key={s} variant={selectedStatus === s ? 'secondary' : 'outline'} size="sm" onClick={() => setSelectedStatus(s)}>{s}</Button>)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {/* Simplified headers for brevity */}
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('title')}>Task</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('project')}>Project</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('category')}>Category</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('startDate')}>Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('endDate')}>End Date</th>
                    <th className="text-left py-3 px-4 font-semibold cursor-pointer" onClick={() => requestSort('status')}>Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-muted/50">
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
                      <td>
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
      </div>

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
    </>
  );
};

export default TaskManagementPage; 