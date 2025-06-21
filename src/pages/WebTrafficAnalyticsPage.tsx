import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import DonutChart from '@/components/charts/DonutChart';
import FilterBar from '@/components/filters/FilterBar';
import KpiCard from '@/components/metrics/KpiCard';
import { format, subDays } from 'date-fns';

// Mock data generators
const generateDailyData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = subDays(now, i);
    data.push({
      name: format(date, 'MMM dd'),
      totalUsers: Math.floor(Math.random() * 1000) + 500,
      newUsers: Math.floor(Math.random() * 500) + 100,
      returningUsers: Math.floor(Math.random() * 500) + 200,
      sessions: Math.floor(Math.random() * 1500) + 800,
      pageViews: Math.floor(Math.random() * 3000) + 1000,
      bounceRate: Math.floor(Math.random() * 30) + 30,
    });
  }
  return data;
};

const WebTrafficAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({from: subDays(new Date(), 30), to: new Date()});
  const [timeFrame, setTimeFrame] = useState('daily');
  
  // Generate sample data
  const trafficData = generateDailyData();
  
  const sourceData = [
    { name: 'Organic Search', value: 35 },
    { name: 'Direct', value: 25 },
    { name: 'Referral', value: 15 },
    { name: 'Social', value: 15 },
    { name: 'Email', value: 7 },
    { name: 'Paid Ads', value: 3 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 55 },
    { name: 'Mobile', value: 35 },
    { name: 'Tablet', value: 10 },
  ];

  const browserData = [
    { name: 'Chrome', value: 45 },
    { name: 'Safari', value: 25 },
    { name: 'Firefox', value: 15 },
    { name: 'Edge', value: 10 },
    { name: 'Other', value: 5 },
  ];

  const topPages = [
    { page: '/home', views: 12500, avgTime: '2:30', bounceRate: 32 },
    { page: '/products', views: 8700, avgTime: '3:45', bounceRate: 28 },
    { page: '/blog', views: 6400, avgTime: '4:12', bounceRate: 25 },
    { page: '/contact', views: 4200, avgTime: '1:45', bounceRate: 42 },
    { page: '/about', views: 3800, avgTime: '2:15', bounceRate: 35 },
  ];

  const handleExport = () => {
    alert('Data export functionality would go here');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Web Traffic Analytics</h1>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <FilterBar 
        onDateRangeChange={setDateRange}
        categories={[
          { label: 'All Pages', value: 'all' },
          { label: 'Homepage', value: 'home' },
          { label: 'Blog', value: 'blog' },
          { label: 'Products', value: 'products' },
        ]}
      />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Sessions" 
          value="45,678" 
          change={12.5} 
          description="vs. previous period" 
        />
        <KpiCard 
          title="Avg. Session Duration" 
          value="3:24" 
          change={-2.3} 
          description="vs. previous period" 
        />
        <KpiCard 
          title="Pages Per Session" 
          value="3.8" 
          change={5.1} 
          description="vs. previous period" 
        />
        <KpiCard 
          title="Bounce Rate" 
          value="32.4%" 
          change={-1.5} 
          description="vs. previous period" 
        />
      </div>
      
      {/* User Overview */}
      <Card>
        <CardHeader>
          <CardTitle>User Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="lineChart">
            <TabsList className="mb-4">
              <TabsTrigger value="lineChart">Total & New Users</TabsTrigger>
              <TabsTrigger value="barChart">Returning vs New</TabsTrigger>
            </TabsList>
            <TabsContent value="lineChart">
              <LineChart 
                data={trafficData} 
                lines={[
                  { dataKey: 'totalUsers', stroke: '#8884d8', name: 'Total Users' },
                  { dataKey: 'newUsers', stroke: '#82ca9d', name: 'New Users' }
                ]}
              />
            </TabsContent>
            <TabsContent value="barChart">
              <BarChart 
                data={trafficData} 
                bars={[
                  { dataKey: 'newUsers', fill: '#82ca9d', name: 'New Users' },
                  { dataKey: 'returningUsers', fill: '#8884d8', name: 'Returning Users' }
                ]}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Traffic Acquisition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart 
              data={sourceData} 
              innerRadius={0}
              outerRadius={90}
              colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed']}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart 
              data={deviceData} 
              innerRadius={60}
              outerRadius={90}
              colors={['#8884d8', '#82ca9d', '#ffc658']}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Browser Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Browser Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <DonutChart 
            data={browserData} 
            innerRadius={60}
            outerRadius={90}
            colors={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']}
          />
        </CardContent>
      </Card>
      
      {/* Top Landing Pages */}
      <Card>
        <CardHeader>
          <CardTitle>Top Landing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Page</th>
                  <th className="text-right py-3 px-4">Page Views</th>
                  <th className="text-right py-3 px-4">Avg. Time on Page</th>
                  <th className="text-right py-3 px-4">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">{page.page}</td>
                    <td className="text-right py-3 px-4">{page.views.toLocaleString()}</td>
                    <td className="text-right py-3 px-4">{page.avgTime}</td>
                    <td className="text-right py-3 px-4">{page.bounceRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebTrafficAnalyticsPage;