import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import PieChart from '@/components/charts/PieChart';
import AreaChart from '@/components/charts/AreaChart';
import DonutChart from '@/components/charts/DonutChart';
import KpiCard from '@/components/metrics/KpiCard';
import FilterBar from '@/components/filters/FilterBar';

// Mock data for charts
const revenueData = [
  { name: 'Jan', total: 18000, basic: 5000, pro: 8000, elite: 5000 },
  { name: 'Feb', total: 20000, basic: 6000, pro: 9000, elite: 5000 },
  { name: 'Mar', total: 25000, basic: 7000, pro: 10000, elite: 8000 },
  { name: 'Apr', total: 22000, basic: 6500, pro: 9500, elite: 6000 },
  { name: 'May', total: 28000, basic: 7500, pro: 12000, elite: 8500 },
  { name: 'Jun', total: 32000, basic: 8000, pro: 14000, elite: 10000 },
];

const expenseData = [
  { name: 'Jan', total: 12000 },
  { name: 'Feb', total: 14000 },
  { name: 'Mar', total: 15000 },
  { name: 'Apr', total: 13500 },
  { name: 'May', total: 16000 },
  { name: 'Jun', total: 17000 },
];

const expenseCategoryData = [
  { name: 'Development', value: 35000, color: '#0088FE' },
  { name: 'Marketing', value: 25000, color: '#00C49F' },
  { name: 'Support', value: 18000, color: '#FFBB28' },
  { name: 'Infrastructure', value: 22000, color: '#FF8042' },
];

const cashFlowData = [
  { name: 'Jan', inflow: 18000, outflow: 12000 },
  { name: 'Feb', inflow: 20000, outflow: 14000 },
  { name: 'Mar', inflow: 25000, outflow: 15000 },
  { name: 'Apr', inflow: 22000, outflow: 13500 },
  { name: 'May', inflow: 28000, outflow: 16000 },
  { name: 'Jun', inflow: 32000, outflow: 17000 },
];

const subscriptionData = [
  { name: 'Jan', basic: 120, pro: 80, elite: 30 },
  { name: 'Feb', basic: 130, pro: 90, elite: 35 },
  { name: 'Mar', basic: 140, pro: 100, elite: 40 },
  { name: 'Apr', basic: 150, pro: 110, elite: 45 },
  { name: 'May', basic: 160, pro: 120, elite: 50 },
  { name: 'Jun', basic: 170, pro: 130, elite: 55 },
];

const cltvData = [
  { name: 'Basic', value: 500, color: '#0088FE' },
  { name: 'Pro', value: 1200, color: '#00C49F' },
  { name: 'Elite', value: 2500, color: '#FFBB28' },
];

const FinancialAnalysisPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    console.log('Date range changed:', range);
    // In a real app, you would fetch data for this date range
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
    // Implement export functionality
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Analysis</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      <FilterBar 
        onDateRangeChange={handleDateRangeChange}
        categories={[
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Yearly', value: 'yearly' },
        ]}
        onCategoryChange={setTimeframe}
        showSearch={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Gross Profit"
          value="AUD $105,000"
          change={12}
          description="vs previous period"
        />
        <KpiCard
          title="Net Profit"
          value="AUD $78,000"
          change={8}
          description="vs previous period"
        />
        <KpiCard
          title="Profit Margin"
          value="32%"
          change={5}
          description="vs previous period"
        />
        <KpiCard
          title="Operating Expenses"
          value="AUD $27,000"
          change={-3}
          description="vs previous period"
        />
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={revenueData}
              lines={[
                { dataKey: 'total', stroke: '#8884d8', name: 'Total Revenue' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Subscription Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={revenueData}
              bars={[
                { dataKey: 'basic', fill: '#0088FE', name: 'Basic' },
                { dataKey: 'pro', fill: '#00C49F', name: 'Pro' },
                { dataKey: 'elite', fill: '#FFBB28', name: 'Elite' },
              ]}
              stacked={true}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Expense Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={expenseCategoryData}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={expenseData}
              bars={[
                { dataKey: 'total', fill: '#FF8042', name: 'Total Expenses' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Analysis */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cash Flow Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <AreaChart
            data={cashFlowData}
            areas={[
              { dataKey: 'inflow', fill: 'rgba(0, 136, 254, 0.5)', stroke: '#0088FE', name: 'Cash Inflow' },
              { dataKey: 'outflow', fill: 'rgba(255, 128, 66, 0.5)', stroke: '#FF8042', name: 'Cash Outflow' },
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      {/* Subscription Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions by Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={subscriptionData}
              bars={[
                { dataKey: 'basic', fill: '#0088FE', name: 'Basic' },
                { dataKey: 'pro', fill: '#00C49F', name: 'Pro' },
                { dataKey: 'elite', fill: '#FFBB28', name: 'Elite' },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Lifetime Value</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={cltvData}
              height={300}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialAnalysisPage;