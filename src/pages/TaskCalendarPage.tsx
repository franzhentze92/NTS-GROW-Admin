import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Calendar, Filter, PlusCircle, Trash2, Edit, RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Define the structure for a task coming from Supabase
// Note: Supabase returns ISO strings for dates ('YYYY-MM-DD')
interface DbTask {
  id: string;
  project: string;
  category: string;
  task: string; // This is 'title' in the app
  action: 'Pending' | 'In Progress' | 'Completed'; // This is 'status' in the app
  description: string;
  startDate: string; 
  endDate: string;
  created_at: string;
}

// Define the structure for a task used in the UI (with Date objects)
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

// Form values sent from the TaskForm
export type TaskFormValues = Omit<Task, 'id'>;

// --- API Functions ---
const fetchTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*').order('startDate', { ascending: true });
    if (error) throw new Error(error.message);
    
    // Map DB schema (task, action) to UI schema (title, status)
    return data.map((dbTask: DbTask) => ({
        id: dbTask.id,
        project: dbTask.project,
        category: dbTask.category,
        title: dbTask.task, // map task -> title
        status: dbTask.action, // map action -> status
        description: dbTask.description,
        startDate: new Date(dbTask.startDate + 'T00:00:00'),
        endDate: new Date(dbTask.endDate + 'T00:00:00'),
    }));
};

const saveTask = async (task: TaskFormValues & { id?: string }) => {
    const { id, title, status, ...rest } = task;
    
    // Map UI schema (title, status) back to DB schema (task, action)
    const dbData = {
        ...rest,
        task: title, // map title -> task
        action: status, // map status -> action
        startDate: task.startDate.toISOString().split('T')[0],
        endDate: task.endDate.toISOString().split('T')[0],
    };

    let error;
    if (id) {
        ({ error } = await supabase.from('tasks').update(dbData).eq('id', id));
    } else {
        ({ error } = await supabase.from('tasks').insert(dbData));
    }
    if (error) throw new Error(error.message);
};

const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw new Error(error.message);
};

// Custom components for Gantt Chart list view
const CustomTaskListHeader: React.FC<{
  headerHeight: number;
  fontFamily: string;
  fontSize: string;
  rowWidth: string;
}> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
  return (
    <div
      className="gantt-task-list-header flex items-center bg-muted/50 border-b"
      style={{
        height: headerHeight,
        fontFamily: fontFamily,
        fontSize: fontSize,
        width: rowWidth,
      }}
    >
      <div
        className="gantt-task-list-header-cell pl-2 font-semibold"
        style={{
          minWidth: '300px',
          maxWidth: '300px',
        }}
      >
        Task
      </div>
    </div>
  );
};

const CustomTaskListTable: React.FC<{
  tasks: GanttTask[];
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  onExpanderClick: (task: GanttTask) => void;
}> = ({ tasks, rowHeight, rowWidth, fontFamily, fontSize }) => {
  return (
    <div style={{ width: rowWidth }}>
      {tasks.map(t => (
        <div className="gantt-task-list-table-row flex items-center border-b" style={{ height: rowHeight, fontFamily: fontFamily, fontSize: fontSize }} key={t.id}>
          <div className="truncate pl-2" title={t.name} style={{ minWidth: '300px', maxWidth: '300px' }}>
            {t.name}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Component ---
const TaskCalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'status', direction: 'asc' });
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<Task | null>(null);

  // Handles changing the sort column and direction
  const requestSort = (key: SortableTaskKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- TanStack Query Hooks ---
  const { data: tasks = [], isLoading, isError, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  // --- Memoized Derived Data ---
  const projects = useMemo(() => [...new Set(tasks.map(task => task.project))].filter(Boolean), [tasks]);

  const filteredTasks = useMemo(() => {
    return selectedProject === 'all' ? tasks : tasks.filter(task => task.project === selectedProject);
  }, [tasks, selectedProject]);
  
  const sortedTasks = useMemo(() => {
    const sortableItems = [...filteredTasks];
    if (sortConfig) {
        const statusOrder: Record<Task['status'], number> = { 'Pending': 1, 'In Progress': 2, 'Completed': 3 };
        sortableItems.sort((a, b) => {
            let aValue: any;
            let bValue: any;
            if (sortConfig.key === 'status') {
                aValue = statusOrder[a.status];
                bValue = statusOrder[b.status];
            } else {
                aValue = a[sortConfig.key as keyof Task];
                bValue = b[sortConfig.key as keyof Task];
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return sortableItems;
  }, [filteredTasks, sortConfig]);

  const ganttTasks = useMemo(() => {
    const mapTasksForGantt = (tasksToMap: Task[]): GanttTask[] => {
        return tasksToMap
          .filter(task => task.status !== 'Completed')
          .map(task => {
            const progress = task.status === 'Completed' ? 100 : task.status === 'In Progress' ? 50 : 0;
            const styles: Partial<GanttTask['styles']> = {};
            if (task.status === 'Pending') {
                styles.backgroundColor = '#f87171'; // red-400
                styles.backgroundSelectedColor = '#ef4444'; // red-500
                styles.progressColor = '#dc2626'; // red-600
                styles.progressSelectedColor = '#b91c1c'; // red-700
            } else if (task.status === 'In Progress') {
                styles.backgroundColor = '#fcd34d'; // amber-300
                styles.backgroundSelectedColor = '#fbbf24'; // amber-400
                styles.progressColor = '#f59e0b'; // amber-500
                styles.progressSelectedColor = '#d97706'; // amber-600
            }
            return {
                id: task.id,
                name: task.title,
                start: task.startDate,
                end: task.endDate,
                progress,
                type: 'task',
                project: task.project,
                styles,
                isDisabled: true,
            };
        });
    };
    return mapTasksForGantt(sortedTasks);
  }, [sortedTasks]);

  const completedTasks = useMemo(() => tasks.filter(task => task.status === 'Completed').length, [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(task => task.status === 'In Progress').length, [tasks]);

  const handleTaskClick = (task: Task | GanttTask) => {
    // Find the full task details from the main tasks array
    const fullTask = tasks.find(t => t.id === task.id);
    if (fullTask) {
        setSelectedTaskDetails(fullTask);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-4 text-muted-foreground">Loading Tasks from Database...</p>
    </div>;
  }

  if (isError) {
    return <div className="container mx-auto mt-10">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Database Error</AlertTitle>
            <AlertDescription>
                Failed to load tasks from the database. Please check your connection and try again.
                <pre className="mt-2 p-2 bg-red-100 text-red-800 rounded text-xs">{error instanceof Error ? error.message : 'An unknown error occurred'}</pre>
            </AlertDescription>
        </Alert>
    </div>;
  }
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task Calendar</h1>
          <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
              </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                        <p className="text-2xl font-bold">{tasks.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                    </div>
                    <div className="h-8 w-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold text-amber-600">{inProgressTasks}</p>
                    </div>
                    <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-amber-600 dark:bg-amber-400 rounded-full"></div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Filters */}
        <Card>
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                {projects.length > 1 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Filter by Project:</span>
                    <Button
                    variant={selectedProject === 'all' ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProject('all')}
                    >
                    All Projects
                    </Button>
                    {projects.map(project => (
                    <Button
                        key={project}
                        variant={selectedProject === project ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedProject(project)}
                    >
                        {project}
                    </Button>
                    ))}
                </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm font-medium">View:</span>
                <Button variant={viewMode === ViewMode.Day ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Day)}>Day</Button>
                <Button variant={viewMode === ViewMode.Week ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Week)}>Week</Button>
                <Button variant={viewMode === ViewMode.Month ? 'secondary' : 'outline'} size="sm" onClick={() => setViewMode(ViewMode.Month)}>Month</Button>
                </div>
            </CardContent>
        </Card>

        {/* Gantt Chart View */}
        <Card>
            <CardHeader>
                <CardTitle>Gantt Chart</CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-[12px]">
              <div className="overflow-x-auto">
                {ganttTasks.length > 0 ? (
                  <Gantt 
                    tasks={ganttTasks} 
                    viewMode={viewMode}
                    TaskListHeader={CustomTaskListHeader}
                    TaskListTable={CustomTaskListTable}
                    bar={(task, { onEventStart, isSelected }) => {
                        const barColor = isSelected ? task.styles.backgroundSelectedColor : task.styles.backgroundColor;
                        return (
                            <g 
                                onMouseEnter={e => onEventStart('mouseenter', task, e)}
                                onMouseLeave={e => onEventStart('mouseleave', task, e)}
                            >
                                <rect
                                    fill={barColor}
                                    x={0}
                                    y={0}
                                    width={task.x2 - task.x1}
                                    height={task.height}
                                    ry={task.barCornerRadius}
                                    rx={task.barCornerRadius}
                                />
                                <rect
                                    x={0}
                                    y={0}
                                    width={(task.x2 - task.x1) * (task.progress * 0.01)}
                                    height={task.height}
                                    ry={task.barCornerRadius}
                                    rx={task.barCornerRadius}
                                    fill={isSelected ? task.styles.progressSelectedColor : task.styles.progressColor}
                                />
                            </g>
                        );
                    }}
                    listCellWidth="300px"
                    columnWidth={viewMode === 'Month' ? 300 : viewMode === 'Week' ? 150 : 50}
                    onClick={handleTaskClick}
                    todayColor="rgba(252, 165, 165, 0.5)"
                  />
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No pending or in-progress tasks found for the selected project.</p>
                  </div>
                )}
              </div>
            </CardContent>
        </Card>

        {/* Task Table */}
        <Card>
          <CardHeader>
            <CardTitle>Task List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th 
                        className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort('title')}
                    >
                        <div className="flex items-center gap-2">
                            Task
                            {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                   </th>
                   <th 
                        className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort('project')}
                    >
                        <div className="flex items-center gap-2">
                            Project
                            {sortConfig.key === 'project' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                   </th>
                   <th 
                        className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort('startDate')}
                    >
                        <div className="flex items-center gap-2">
                            Dates
                            {sortConfig.key === 'startDate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                   </th>
                   <th 
                        className="text-left py-3 px-4 font-semibold cursor-pointer hover:bg-muted/50"
                        onClick={() => requestSort('status')}
                    >
                        <div className="flex items-center gap-2">
                            Status
                            {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />) : <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
                        </div>
                   </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map((task) => (
                    <tr 
                     key={task.id} 
                     className="border-b hover:bg-muted/50 cursor-pointer"
                     onClick={() => handleTaskClick(task)}
                     >
                      <td className="py-3 px-4">
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-xs">{task.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{task.project}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">
                          <div>Start: {task.startDate.toLocaleDateString()}</div>
                          <div>End: {task.endDate.toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline"
                          className={
                            task.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700' :
                            task.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800/30 dark:text-amber-300 dark:border-amber-700' :
                            task.status === 'Completed' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700' :
                            ''
                          }
                        >
                          {task.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedTaskDetails} onOpenChange={(isOpen) => !isOpen && setSelectedTaskDetails(null)}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>{selectedTaskDetails?.title}</DialogTitle>
                  <DialogDescription>
                      Project: {selectedTaskDetails?.project}
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-6">
                  <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Description</h4>
                      <p className="text-sm">{selectedTaskDetails?.description || 'No description provided.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                       <div>
                          <p className="font-semibold text-muted-foreground">Status</p>
                           <Badge 
                              variant="outline"
                              className={
                                 selectedTaskDetails?.status === 'Pending' ? 'bg-red-100 text-red-800 border-red-200' :
                                 selectedTaskDetails?.status === 'In Progress' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                 'bg-green-100 text-green-800 border-green-200'
                              }
                          >
                              {selectedTaskDetails?.status}
                          </Badge>
                      </div>
                       <div>
                          <p className="font-semibold text-muted-foreground">Start Date</p>
                          <p>{selectedTaskDetails?.startDate.toLocaleDateString()}</p>
                      </div>
                       <div>
                          <p className="font-semibold text-muted-foreground">End Date</p>
                          <p>{selectedTaskDetails?.endDate.toLocaleDateString()}</p>
                      </div>
                  </div>
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCalendarPage;
