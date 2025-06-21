import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import TaskCompletionFeed from '@/components/TaskCompletionFeed';

const DashboardPage: React.FC = () => {
  // Sample data for charts
  const trafficData = [
    { name: 'Jan', users: 4000, newUsers: 2400 },
    { name: 'Feb', users: 3000, newUsers: 1398 },
    { name: 'Mar', users: 2000, newUsers: 9800 },
    { name: 'Apr', users: 2780, newUsers: 3908 },
    { name: 'May', users: 1890, newUsers: 4800 },
    { name: 'Jun', users: 2390, newUsers: 3800 },
  ];

  const financialData = [
    { name: 'Jan', basic: 4000, pro: 2400, elite: 1800 },
    { name: 'Feb', basic: 3000, pro: 1398, elite: 2000 },
    { name: 'Mar', basic: 2000, pro: 9800, elite: 2200 },
    { name: 'Apr', basic: 2780, pro: 3908, elite: 2500 },
    { name: 'May', basic: 1890, pro: 4800, elite: 2300 },
    { name: 'Jun', basic: 2390, pro: 3800, elite: 2600 },
  ];

  const taskStatusData = [
    { name: 'To Do', value: 12 },
    { name: 'In Progress', value: 8 },
    { name: 'Completed', value: 15 },
  ];

  // Sample completed tasks data
  const completedTasks = [
    { id: '1', title: 'Update financial reports', completedAt: '2023-06-10T14:30:00', assignee: 'Maria Chen' },
    { id: '2', title: 'Review marketing campaign', completedAt: '2023-06-09T16:45:00', assignee: 'John Smith' },
    { id: '3', title: 'Finalize product roadmap', completedAt: '2023-06-08T11:20:00', assignee: 'Alex Johnson' },
    { id: '4', title: 'Client presentation preparation', completedAt: '2023-06-07T09:15:00', assignee: 'Sarah Williams' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">A quick overview of your key metrics and activities.</p>
      </div>
      
      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Users Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1,243</div>
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +12% from yesterday
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: '65%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">AUD $24,350</div>
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +8% from last month
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Tasks This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">18</div>
            <div className="mt-2 text-sm text-amber-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l1 1a1 1 0 01-1.414 1.414L10 5.414 8.707 6.707a1 1 0 01-1.414-1.414l1-1A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              5 due this week
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '45%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">7</div>
            <div className="mt-2 text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              +2 this month
            </div>
            <div className="mt-3 h-1.5 w-full bg-muted overflow-hidden rounded-full">
              <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Web Traffic Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Web Traffic Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={trafficData} 
              lines={[
                { dataKey: 'users', stroke: '#10b981', name: 'Total Users' },
                { dataKey: 'newUsers', stroke: '#6366f1', name: 'New Users' }
              ]}
            />
          </CardContent>
        </Card>

        {/* Financial Snapshot */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">AUD $ Values</div>
            <BarChart 
              data={financialData} 
              bars={[
                { dataKey: 'basic', fill: '#0088FE', name: 'Basic' },
                { dataKey: 'pro', fill: '#00C49F', name: 'Pro' },
                { dataKey: 'elite', fill: '#FFBB28', name: 'Elite' }
              ]}
              stacked={true}
            />
          </CardContent>
        </Card>

        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={taskStatusData} 
              colors={['#f59e0b', '#6366f1', '#10b981']}
              innerRadius={60}
              outerRadius={90}
            />
          </CardContent>
        </Card>

        {/* Latest Completed Tasks */}
        <TaskCompletionFeed tasks={completedTasks} />
      </div>
    </div>
  );
};

export default DashboardPage;
