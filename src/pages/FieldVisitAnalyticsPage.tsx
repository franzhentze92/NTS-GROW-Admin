import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFieldVisitAnalytics } from '@/lib/fieldVisitApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, BarChart3, PieChart, Activity, MapPin, Users, Target } from 'lucide-react';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import DonutChart from '@/components/charts/DonutChart';
import AreaChart from '@/components/charts/AreaChart';

type ChartData = {
  name: string;
  value: number;
  [key: string]: string | number;
};

type TimeSeriesData = {
  name: string;
  value: number;
  [key: string]: string | number;
};

const FieldVisitAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedAgronomist, setSelectedAgronomist] = useState('all');

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['fieldVisitAnalytics'],
    queryFn: getFieldVisitAnalytics,
  });

  if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading analytics...</p></div>;
  if (error) return <div className="text-red-500"><p>Error loading analytics: {error.message}</p></div>;

  // Convert analytics data to chart formats
  const getVisitTypeData = (): ChartData[] => {
    if (!analytics?.visitTypeDistribution) return [];
    return Object.entries(analytics.visitTypeDistribution).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      value: count,
    }));
  };

  const getAgronomistPerformanceData = (): ChartData[] => {
    if (!analytics?.agronomistPerformance) return [];
    return Object.entries(analytics.agronomistPerformance).map(([agronomist, data]) => ({
      name: agronomist,
      value: data.total,
      completed: data.completed,
    }));
  };

  const getMonthlyTrendsData = (): TimeSeriesData[] => {
    if (!analytics?.monthlyTrends) return [];
    return Object.entries(analytics.monthlyTrends)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({
        name: month,
        value: count,
      }));
  };

  const getCropTypeData = (): ChartData[] => {
    if (!analytics?.cropTypeDistribution) return [];
    return Object.entries(analytics.cropTypeDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([crop, count]) => ({
        name: crop,
        value: count,
      }));
  };

  const getCompletionRateData = (): ChartData[] => {
    if (!analytics) return [];
    return [
      { name: 'Completed', value: analytics.completedVisits },
      { name: 'Scheduled', value: analytics.scheduledVisits },
      { name: 'In Progress', value: analytics.inProgressVisits },
      { name: 'Cancelled', value: analytics.totalVisits - analytics.completedVisits - analytics.scheduledVisits - analytics.inProgressVisits },
    ];
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Field Visit Analytics</h1>
            <p className="text-muted-foreground mt-1">Comprehensive analytics and insights for agronomist field visits.</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === '7d' ? 'Last 7 days' : 
               timeRange === '30d' ? 'Last 30 days' : 
               timeRange === '90d' ? 'Last 90 days' : 'Last year'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.completedVisits || 0} of {analytics?.totalVisits || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agronomists</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(analytics?.agronomistPerformance || {}).length}</div>
            <p className="text-xs text-muted-foreground">
              Conducting field visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Visits per Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.monthlyTrends ? 
                Math.round(Object.values(analytics.monthlyTrends).reduce((a, b) => a + b, 0) / Object.keys(analytics.monthlyTrends).length) : 
                0}
            </div>
            <p className="text-xs text-muted-foreground">
              Average monthly volume
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Status */}
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <span>Showing analytics for</span>
        <span>•</span>
        <span>
          {timeRange === '7d' ? 'Last 7 days' : 
           timeRange === '30d' ? 'Last 30 days' : 
           timeRange === '90d' ? 'Last 90 days' : 'Last year'}
        </span>
        {selectedAgronomist !== 'all' && (
          <>
            <span>•</span>
            <span>Agronomist: {selectedAgronomist}</span>
          </>
        )}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Status Distribution</CardTitle>
                <CardDescription>Breakdown of visit completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={getCompletionRateData()} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visit Type Distribution</CardTitle>
                <CardDescription>Types of field visits conducted</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={getVisitTypeData()} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Crops Visited</CardTitle>
                <CardDescription>Most frequently visited crop types</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={getCropTypeData()} bars={[{ dataKey: 'value', name: 'Visits', fill: '#4caf50' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Visit Volume</CardTitle>
                <CardDescription>Field visit trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={getMonthlyTrendsData()} areas={[{ dataKey: 'value', name: 'Visits', fill: '#4caf50', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agronomist Performance</CardTitle>
                <CardDescription>Visit volume by agronomist</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={getAgronomistPerformanceData()} bars={[{ dataKey: 'value', name: 'Total Visits', fill: '#2196f3' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agronomist Completion Rates</CardTitle>
                <CardDescription>Completion rates by agronomist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics?.agronomistPerformance || {}).map(([agronomist, data]) => {
                    const completionRate = data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : '0';
                    return (
                      <div key={agronomist} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{agronomist}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.completed} of {data.total} completed
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{completionRate}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-green-500 rounded-full" 
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Visit Trends Over Time</CardTitle>
                <CardDescription>Monthly field visit volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={getMonthlyTrendsData()} lines={[{ dataKey: 'value', name: 'Visits', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visit Type Trends</CardTitle>
                <CardDescription>Distribution of visit types over time</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={getMonthlyTrendsData()} areas={[{ dataKey: 'value', name: 'Visits', fill: '#4caf50', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive breakdown of field visit metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Visit Types</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics?.visitTypeDistribution || {}).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize">{type.replace('-', ' ')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Top Crops</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics?.cropTypeDistribution || {})
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([crop, count]) => (
                        <div key={crop} className="flex justify-between items-center">
                          <span>{crop}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
                  <div className="space-y-2">
                    {Object.entries(analytics?.monthlyTrends || {})
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([month, count]) => (
                        <div key={month} className="flex justify-between items-center">
                          <span>{month}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FieldVisitAnalyticsPage; 