import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Activity = {
  id: string;
  text: string;
  timestamp: string;
};

interface ActivityFeedProps {
  activities: Activity[];
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, className = '' }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const activityDate = new Date(activity.timestamp);
            const timeAgo = formatDistanceToNow(activityDate, { addSuffix: true });
            
            return (
              <div key={activity.id} className="flex justify-between items-start pb-3 border-b border-border/40">
                <span className="text-sm">{activity.text}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{timeAgo}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
