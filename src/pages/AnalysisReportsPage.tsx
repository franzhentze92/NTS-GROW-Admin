import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAnalyses } from '@/lib/analysisApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Calendar, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { PieChart as PieChartComponent } from '@/components/charts/PieChart';
import DonutChart from '@/components/charts/DonutChart';
import AreaChart from '@/components/charts/AreaChart';
import { Analysis } from '@/lib/types';

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

const AnalysisReportsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedConsultant, setSelectedConsultant] = useState('all');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('all');

  const { data: analyses = [], isLoading, error } = useQuery({
    queryKey: ['analyses'],
    queryFn: getAnalyses,
  });

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return analyses.filter(analysis => {
      const analysisDate = new Date(analysis.created_at);
      return analysisDate >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();

  // Filter by consultant and analysis type
  const consultantFilteredData = filteredData.filter(analysis => {
    const consultantMatch = selectedConsultant === 'all' || analysis.consultant === selectedConsultant;
    const typeMatch = selectedAnalysisType === 'all' || analysis.analysis_type === selectedAnalysisType;
    return consultantMatch && typeMatch;
  });

  // Get unique consultants for filter (from filtered data, not all data)
  const consultants = [...new Set(filteredData.map(a => a.consultant))];

  // Calculate average days from creation to completion
  const getAverageDaysToCompletion = () => {
    const completedAnalyses = consultantFilteredData.filter(a => a.status === 'Emailed' && a.emailed_date);
    
    if (completedAnalyses.length === 0) return 0;
    
    const totalDays = completedAnalyses.reduce((sum, analysis) => {
      const createdDate = new Date(analysis.created_at);
      const emailedDate = new Date(analysis.emailed_date!);
      const daysDiff = (emailedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0);
    
    return (totalDays / completedAnalyses.length).toFixed(1);
  };

  // Calculate average days in each workflow stage
  const getAverageDaysInStage = (stage: 'draft' | 'ready_check' | 'checked' | 'emailed') => {
    const analysesWithStage = consultantFilteredData.filter(analysis => {
      switch (stage) {
        case 'draft':
          return analysis.draft_date;
        case 'ready_check':
          return analysis.ready_check_date;
        case 'checked':
          return analysis.checked_date;
        case 'emailed':
          return analysis.emailed_date;
        default:
          return false;
      }
    });

    if (analysesWithStage.length === 0) return 0;

    const totalDays = analysesWithStage.reduce((sum, analysis) => {
      const createdDate = new Date(analysis.created_at);
      let stageDate: Date;
      
      switch (stage) {
        case 'draft':
          stageDate = new Date(analysis.draft_date!);
          break;
        case 'ready_check':
          stageDate = new Date(analysis.ready_check_date!);
          break;
        case 'checked':
          stageDate = new Date(analysis.checked_date!);
          break;
        case 'emailed':
          stageDate = new Date(analysis.emailed_date!);
          break;
        default:
          return sum;
      }
      
      const daysDiff = (stageDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + daysDiff;
    }, 0);

    return (totalDays / analysesWithStage.length).toFixed(1);
  };

  // Calculate total tests performed
  const getTotalTests = () => {
    return consultantFilteredData.reduce((sum, analysis) => sum + (analysis.test_count || 0), 0);
  };

  // Calculate average tests per analysis
  const getAverageTestsPerAnalysis = () => {
    const analysesWithTests = consultantFilteredData.filter(a => a.test_count && a.test_count > 0);
    if (analysesWithTests.length === 0) return 0;
    
    const totalTests = analysesWithTests.reduce((sum, a) => sum + (a.test_count || 0), 0);
    return (totalTests / analysesWithTests.length).toFixed(1);
  };

  // Chart 1: Analysis Type Distribution
  const getAnalysisTypeData = (): ChartData[] => {
    const typeCount = consultantFilteredData.reduce((acc, analysis) => {
      acc[analysis.analysis_type] = (acc[analysis.analysis_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Soil Analysis', value: typeCount.soil || 0 },
      { name: 'Leaf Analysis', value: typeCount.leaf || 0 },
    ];
  };

  // Chart 2: Status Distribution
  const getStatusData = (): ChartData[] => {
    const statusCount = consultantFilteredData.reduce((acc, analysis) => {
      acc[analysis.status] = (acc[analysis.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Draft', value: statusCount['Draft'] || 0 },
      { name: 'Pending Check', value: statusCount['Ready to be Checked'] || 0 },
      { name: 'Pending Email', value: statusCount['Checked Ready to be Emailed'] || 0 },
      { name: 'Emailed', value: statusCount['Emailed'] || 0 },
    ];
  };

  // Chart 3: Top Crops
  const getTopCropsData = (): ChartData[] => {
    const cropCount = consultantFilteredData.reduce((acc, analysis) => {
      if (analysis.crop) {
        acc[analysis.crop] = (acc[analysis.crop] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cropCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([crop, count]) => ({ name: crop, value: count }));
  };

  // Chart 4: Top Categories
  const getTopCategoriesData = (): ChartData[] => {
    const categoryCount = consultantFilteredData.reduce((acc, analysis) => {
      if (analysis.category) {
        acc[analysis.category] = (acc[analysis.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .map(([category, count]) => ({ name: category, value: count }));
  };

  // Chart 5: Analysis Trends Over Time
  const getTrendsData = (): TimeSeriesData[] => {
    const dailyCount = consultantFilteredData.reduce((acc, analysis) => {
      const date = new Date(analysis.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyCount)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ name: date, value: count }));
  };

  // Chart 6: Consultant Performance
  const getConsultantData = (): ChartData[] => {
    const consultantCount = consultantFilteredData.reduce((acc, analysis) => {
      acc[analysis.consultant] = (acc[analysis.consultant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(consultantCount)
      .sort(([,a], [,b]) => b - a)
      .map(([consultant, count]) => ({ name: consultant, value: count }));
  };

  // Chart 7: Test Count Distribution
  const getTestCountData = (): ChartData[] => {
    const testCountRanges = consultantFilteredData.reduce((acc, analysis) => {
      const count = analysis.test_count || 0;
      let range = '';
      if (count === 0) range = 'No Tests';
      else if (count <= 5) range = '1-5 Tests';
      else if (count <= 10) range = '6-10 Tests';
      else if (count <= 20) range = '11-20 Tests';
      else range = '20+ Tests';
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(testCountRanges)
      .map(([range, count]) => ({ name: range, value: count }));
  };

  // Chart 8: Monthly Analysis Volume
  const getMonthlyData = (): TimeSeriesData[] => {
    const monthlyCount = consultantFilteredData.reduce((acc, analysis) => {
      const date = new Date(analysis.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ name: month, value: count }));
  };

  // Chart 9: Monthly Consultant Breakdown
  const getMonthlyConsultantData = (): { month: string; consultants: ChartData[] }[] => {
    const monthlyData = consultantFilteredData.reduce((acc, analysis) => {
      const date = new Date(analysis.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {};
      }
      
      acc[monthYear][analysis.consultant] = (acc[monthYear][analysis.consultant] || 0) + 1;
      return acc;
    }, {} as Record<string, Record<string, number>>);

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, consultantCounts]) => ({
        month,
        consultants: Object.entries(consultantCounts)
          .sort(([,a], [,b]) => b - a)
          .map(([consultant, count]) => ({ name: consultant, value: count }))
      }));
  };

  // Chart 10: Overall Consultant Distribution (Pie Chart)
  const getOverallConsultantData = (): ChartData[] => {
    const consultantCount = consultantFilteredData.reduce((acc, analysis) => {
      acc[analysis.consultant] = (acc[analysis.consultant] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(consultantCount)
      .sort(([,a], [,b]) => b - a)
      .map(([consultant, count]) => ({ name: consultant, value: count }));
  };

  // Get detailed monthly breakdown with analysis types
  const getDetailedMonthlyBreakdown = () => {
    const monthlyBreakdown = consultantFilteredData.reduce((acc, analysis) => {
      const date = new Date(analysis.created_at);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthName,
          monthKey: monthYear,
          consultants: {},
          total: 0,
          soil: 0,
          leaf: 0
        };
      }
      
      // Initialize consultant if not exists
      if (!acc[monthYear].consultants[analysis.consultant]) {
        acc[monthYear].consultants[analysis.consultant] = {
          name: analysis.consultant,
          total: 0,
          soil: 0,
          leaf: 0,
          completed: 0,
          inProgress: 0
        };
      }
      
      // Update totals
      acc[monthYear].total++;
      acc[monthYear][analysis.analysis_type]++;
      acc[monthYear].consultants[analysis.consultant].total++;
      acc[monthYear].consultants[analysis.consultant][analysis.analysis_type]++;
      
      // Update status counts
      if (analysis.status === 'Emailed') {
        acc[monthYear].consultants[analysis.consultant].completed++;
      } else {
        acc[monthYear].consultants[analysis.consultant].inProgress++;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(monthlyBreakdown).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  };

  // Calculate summary statistics
  const totalAnalyses = consultantFilteredData.length;
  const completedAnalyses = consultantFilteredData.filter(a => a.status === 'Emailed').length;
  const completionRate = totalAnalyses > 0 ? ((completedAnalyses / totalAnalyses) * 100).toFixed(1) : '0';

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading analysis data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Error loading analysis data</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analysis Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights from soil and leaf analysis data
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
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

        <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Consultants" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Consultants</SelectItem>
            {consultants.map(consultant => (
              <SelectItem key={consultant} value={consultant}>
                {consultant}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="soil">Soil Analysis</SelectItem>
            <SelectItem value="leaf">Leaf Analysis</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Status */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Showing {consultantFilteredData.length} analyses</span>
        <span>•</span>
        <span>
          {timeRange === '7d' ? 'Last 7 days' : 
           timeRange === '30d' ? 'Last 30 days' : 
           timeRange === '90d' ? 'Last 90 days' : 'Last year'}
        </span>
        {selectedConsultant !== 'all' && (
          <>
            <span>•</span>
            <span>Consultant: {selectedConsultant}</span>
          </>
        )}
        {selectedAnalysisType !== 'all' && (
          <>
            <span>•</span>
            <span>Type: {selectedAnalysisType === 'soil' ? 'Soil Analysis' : 'Leaf Analysis'}</span>
          </>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnalyses}</div>
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
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedAnalyses} of {totalAnalyses} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Complete</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageDaysToCompletion()}</div>
            <p className="text-xs text-muted-foreground">
              Average days from creation to email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTests()}</div>
            <p className="text-xs text-muted-foreground">
              Across all analyses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tests/Analysis</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageTestsPerAnalysis()}</div>
            <p className="text-xs text-muted-foreground">
              Average test count per analysis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days in Draft</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageDaysInStage('draft')}</div>
            <p className="text-xs text-muted-foreground">
              Average days in draft stage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Days to Check</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageDaysInStage('ready_check')}</div>
            <p className="text-xs text-muted-foreground">
              Average days to ready check
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Consultants</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultants.length}</div>
            <p className="text-xs text-muted-foreground">
              Consultants with analyses in selected period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Type Distribution</CardTitle>
                <CardDescription>Breakdown of soil vs leaf analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={getAnalysisTypeData()} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current status of all analyses</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={getStatusData()} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Crops Analyzed</CardTitle>
                <CardDescription>Most frequently analyzed crops</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={getTopCropsData()} bars={[{ dataKey: 'value', name: 'Analyses', fill: '#4caf50' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Analysis by category</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={getTopCategoriesData()} bars={[{ dataKey: 'value', name: 'Analyses', fill: '#795548' }]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Trends</CardTitle>
                <CardDescription>Daily analysis volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={getTrendsData()} lines={[{ dataKey: 'value', name: 'Analyses', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Volume</CardTitle>
                <CardDescription>Analysis volume by month</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={getMonthlyData()} areas={[{ dataKey: 'value', name: 'Analyses', fill: '#4caf50', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultant Performance</CardTitle>
                <CardDescription>Analysis volume by consultant</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={getConsultantData()} bars={[{ dataKey: 'value', name: 'Analyses', fill: '#2196f3' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consultant Distribution</CardTitle>
                <CardDescription>Overall consultant workload distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={getOverallConsultantData()} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Count Distribution</CardTitle>
                <CardDescription>Distribution of tests per analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={getTestCountData()} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Volume Trend</CardTitle>
                <CardDescription>Analysis volume by month</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={getMonthlyData()} areas={[{ dataKey: 'value', name: 'Analyses', fill: '#4caf50', stroke: '#2e7d32' }]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overall Consultant Distribution</CardTitle>
                <CardDescription>Total workload distribution across consultants</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={getOverallConsultantData()} />
              </CardContent>
            </Card>
          </div>

          {/* Monthly Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Consultant Breakdown</CardTitle>
              <CardDescription>Detailed monthly performance by consultant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getDetailedMonthlyBreakdown().map((monthData) => (
                  <div key={monthData.monthKey} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{monthData.month}</h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Soil: {monthData.soil}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Leaf: {monthData.leaf}</span>
                        </span>
                        <span className="font-medium">Total: {monthData.total}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.values(monthData.consultants).map((consultant: any) => (
                        <div key={consultant.name} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-sm">{consultant.name}</h4>
                            <Badge variant={consultant.completed > 0 ? "default" : "secondary"}>
                              {consultant.completed}/{consultant.total} completed
                            </Badge>
                          </div>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span>Soil Analysis:</span>
                              <span className="font-medium">{consultant.soil}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Leaf Analysis:</span>
                              <span className="font-medium">{consultant.leaf}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>In Progress:</span>
                              <span className="font-medium">{consultant.inProgress}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Completed:</span>
                              <span className="font-medium">{consultant.completed}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
              <CardDescription>Latest analysis entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {consultantFilteredData.slice(0, 10).map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{analysis.client_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {analysis.crop} • {analysis.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={analysis.status === 'Emailed' ? 'default' : 'secondary'}>
                        {analysis.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalysisReportsPage; 