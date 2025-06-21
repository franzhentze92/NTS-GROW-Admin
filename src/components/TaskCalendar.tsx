import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Task = {
  id: string;
  title: string;
  date: Date;
  status: 'pending' | 'in-progress' | 'completed';
  assignee: string;
};

type TaskCalendarProps = {
  initialTasks?: Task[];
};

const TaskCalendar: React.FC<TaskCalendarProps> = ({ initialTasks = [] }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignee: '',
    status: 'pending' as const,
  });

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.date.getDate() === date.getDate() && 
      task.date.getMonth() === date.getMonth() && 
      task.date.getFullYear() === date.getFullYear()
    );
  };

  // Function to handle adding a new task
  const handleAddTask = () => {
    if (!selectedDate || !newTask.title || !newTask.assignee) return;
    
    const task: Task = {
      id: Math.random().toString(36).substring(2, 9),
      title: newTask.title,
      assignee: newTask.assignee,
      status: newTask.status,
      date: selectedDate,
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', assignee: '', status: 'pending' });
    setIsDialogOpen(false);
  };

  // Function to render tasks for the selected date
  const renderTasksForSelectedDate = () => {
    if (!selectedDate) return null;
    
    const tasksForDate = getTasksForDate(selectedDate);
    
    if (tasksForDate.length === 0) {
      return <p className="text-muted-foreground">No tasks for this date.</p>;
    }
    
    return (
      <div className="space-y-2">
        {tasksForDate.map(task => (
          <div key={task.id} className="p-3 border rounded-md flex justify-between items-center">
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">Assigned to: {task.assignee}</p>
            </div>
            <Badge 
              className={`${task.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
            >
              {task.status === 'in-progress' ? 'In Progress' : 
                task.status === 'completed' ? 'Completed' : 'Pending'}
            </Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          <div className="mt-4 flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Task</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title</Label>
                    <Input 
                      id="title" 
                      value={newTask.title} 
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input 
                      id="assignee" 
                      value={newTask.assignee} 
                      onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newTask.status} 
                      onValueChange={(value: any) => setNewTask({...newTask, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddTask} className="w-full">Add Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate ? `Tasks for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Tasks'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderTasksForSelectedDate()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskCalendar;