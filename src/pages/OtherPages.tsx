import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Web Traffic Page
export const WebTrafficPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Web Traffic</h1>
      <Card>
        <CardHeader>
          <CardTitle>Traffic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Showing data for last 30 days</p>
          <div className="h-64 bg-muted/40 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Traffic chart visualization would appear here</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Total Visits', value: '45,231' },
              { label: 'Unique Visitors', value: '32,456' },
              { label: 'Bounce Rate', value: '42%' },
              { label: 'Avg. Session', value: '3m 12s' },
            ].map((stat, i) => (
              <div key={i} className="bg-background p-4 rounded-md border border-border/40">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Financial Analysis Page
export const FinancialAnalysisPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Financial Analysis</h1>
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Current month breakdown</p>
          <div className="h-64 bg-muted/40 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Revenue chart visualization would appear here</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {[
              { plan: 'Basic Plan', revenue: 'AUD $5,240', users: '124' },
              { plan: 'Pro Plan', revenue: 'AUD $12,350', users: '86' },
              { plan: 'Elite Plan', revenue: 'AUD $6,760', users: '23' },
            ].map((plan, i) => (
              <div key={i} className="bg-background p-4 rounded-md border border-border/40">
                <p className="font-medium">{plan.plan}</p>
                <p className="text-xl font-bold text-primary">{plan.revenue}</p>
                <p className="text-sm text-muted-foreground">{plan.users} active users</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Task Calendar Page
export const TaskCalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Task Calendar</h1>
      <Card>
        <CardHeader>
          <CardTitle>Development Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-muted/40 rounded-md flex items-center justify-center">
            <p className="text-muted-foreground">Calendar view would appear here</p>
          </div>
          <div className="mt-6 space-y-2">
            {[
              { title: 'Implement new analytics overview', status: 'In Progress', assignee: 'John Doe', dueDate: '2023-11-20' },
              { title: 'Fix subscription payment bug', status: 'Pending', assignee: 'Jane Smith', dueDate: '2023-11-18' },
              { title: 'Update user documentation', status: 'Completed', assignee: 'Admin User', dueDate: '2023-11-15' },
            ].map((task, i) => (
              <div key={i} className="p-4 rounded-md border border-border/40 flex justify-between items-center">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-muted-foreground">Assigned to: {task.assignee}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                    {task.status}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">Due: {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
