import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Task = {
  id: string;
  title: string;
  completedAt: string;
  assignee: string;
};

interface TaskCompletionFeedProps {
  tasks: Task[];
  className?: string;
}

const TaskCompletionFeed: React.FC<TaskCompletionFeedProps> = ({ tasks, className = '' }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Latest Completed Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => {
            const completedDate = new Date(task.completedAt);
            const timeAgo = formatDistanceToNow(completedDate, { addSuffix: true });
            
            return (
              <div key={task.id} className="flex justify-between items-start pb-3 border-b border-border/40">
                <div>
                  <span className="text-sm font-medium">{task.title}</span>
                  <p className="text-xs text-muted-foreground">Completed by {task.assignee}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCompletionFeed;
