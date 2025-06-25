import React, { useState, useMemo } from 'react';
import { useCostContext } from '@/contexts/CostContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, Filter, Target, AlertTriangle, Receipt, TrendingUpIcon, TrendingDownIcon, Repeat, Zap } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, Cell, Line, LineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';

const FinancialAnalyticsPage: React.FC = () => {
  const { costs } = useCostContext();
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate expense metrics from real data
  const expenseMetrics = useMemo(() => {
    const totalExpenses = costs.reduce((sum, cost) => sum + cost.amount, 0);
    const monthlyExpenses = costs.filter(cost => cost.expense_type === 'monthly').reduce((sum, cost) => sum + cost.amount, 0);
    const oneTimeExpenses = costs.filter(cost => cost.expense_type === 'one_time').reduce((sum, cost) => sum + cost.amount, 0);
    
    // Group costs by category
    const costsByCategory = costs.reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(costsByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    }));

    // Monthly expense data (group by month from actual cost dates)
    const monthlyExpenseData = costs.reduce((acc, cost) => {
      const month = new Date(cost.date).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = Object.entries(monthlyExpenseData).map(([month, amount]) => ({
      month,
      expenses: amount,
    }));

    // Category performance analysis
    const categoryPerformance = Object.entries(costsByCategory).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100,
      count: costs.filter(cost => cost.category === category).length,
    }));

    // Recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = costs.filter(cost => new Date(cost.date) >= thirtyDaysAgo);
    const recentTotal = recentExpenses.reduce((sum, cost) => sum + cost.amount, 0);

    // Top expense categories
    const topCategories = categoryPerformance
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Expense type breakdown
    const expenseTypeBreakdown = costs.reduce((acc, cost) => {
      acc[cost.expense_type] = (acc[cost.expense_type] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    const expenseTypeData = Object.entries(expenseTypeBreakdown).map(([type, amount]) => ({
      name: type === 'monthly' ? 'Monthly Recurring' : 'One Time',
      value: amount,
      type: type,
    }));

    return {
      totalExpenses,
      monthlyExpenses,
      oneTimeExpenses,
      categoryData,
      monthlyData,
      categoryPerformance,
      recentExpenses,
      recentTotal,
      topCategories,
      expenseTypeData,
      totalTransactions: costs.length,
    };
  }, [costs]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  // Filter data based on selected category
  const filteredCategoryData = selectedCategory === 'all' 
    ? expenseMetrics.categoryData 
    : expenseMetrics.categoryData.filter(item => item.name === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Technology Financial Analytics</h1>
          <p className="text-muted-foreground">Comprehensive technology development financial overview and insights</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="lastmonth">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Analytics Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Category Focus</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {expenseMetrics.categoryData.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="lastmonth">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="12months">Last 12 Months</SelectItem>
                    <SelectItem value="ytd">Year to Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={() => {
                  setSelectedCategory('all');
                  setTimeRange('6months');
                }}>
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4" />
            Income
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Revenue
          </TabsTrigger>
        </TabsList>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground">Income Analytics</h3>
            <p className="text-muted-foreground mt-2">Income tracking and analytics coming soon...</p>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  AUD ${expenseMetrics.totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingDown className="inline h-3 w-3 text-red-600" /> Total tracked expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                <Repeat className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  AUD ${expenseMetrics.monthlyExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {expenseMetrics.totalExpenses > 0 ? `${((expenseMetrics.monthlyExpenses / expenseMetrics.totalExpenses) * 100).toFixed(1)}%` : '0%'} of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Expenses</CardTitle>
                <Calendar className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  AUD ${expenseMetrics.recentTotal.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <Receipt className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {expenseMetrics.totalTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Expense entries tracked
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Expenses Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses Trend</CardTitle>
                <CardDescription>Expense tracking over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={expenseMetrics.monthlyData}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Expenses by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Type</CardTitle>
                <CardDescription>Monthly recurring vs one-time expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={expenseMetrics.expenseTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expenseMetrics.expenseTypeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.type === 'monthly' ? '#3B82F6' : '#F97316'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Expense Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Type Analysis</CardTitle>
              <CardDescription>Detailed breakdown of monthly recurring vs one-time expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-blue-600 flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    Monthly Recurring Expenses
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg bg-blue-50">
                      <div className="font-medium">Total Monthly</div>
                      <div className="font-bold text-blue-600">AUD ${expenseMetrics.monthlyExpenses.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      These are expenses that occur every month and should be budgeted for consistently.
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    One-Time Expenses
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 border rounded-lg bg-orange-50">
                      <div className="font-medium">Total One-Time</div>
                      <div className="font-bold text-orange-600">AUD ${expenseMetrics.oneTimeExpenses.toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      These are irregular expenses that don't occur monthly.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of expense categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 text-right">% of Total</th>
                      <th className="p-2 text-right">Transactions</th>
                      <th className="p-2 text-right">Avg per Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseMetrics.categoryPerformance.map((item) => (
                      <tr key={item.category} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{item.category}</td>
                        <td className="p-2 text-right text-red-600 font-semibold">
                          <div className="text-lg font-semibold">AUD ${item.amount.toLocaleString()}</div>
                        </td>
                        <td className="p-2 text-right">{item.percentage.toFixed(1)}%</td>
                        <td className="p-2 text-right">{item.count}</td>
                        <td className="p-2 text-right">
                          <div className="text-sm text-muted-foreground">AUD ${(item.amount / item.count).toLocaleString()} avg</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expense Transactions</CardTitle>
              <CardDescription>Latest expense entries from Cost Management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-gray-400 py-6">
                          No expense transactions found. Add expenses in the Cost Management page.
                        </td>
                      </tr>
                    ) : (
                      costs.slice(0, 10).map(cost => (
                        <tr key={cost.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{cost.date}</td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-blue-700 border-blue-300">
                              {cost.category}
                            </Badge>
                          </td>
                          <td className="p-2">{cost.description}</td>
                          <td className="p-2 text-right text-lg font-semibold text-red-600">
                            AUD ${cost.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {costs.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm">
                    View All Transactions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground">Revenue Analytics</h3>
            <p className="text-muted-foreground mt-2">Revenue tracking and analytics coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAnalyticsPage; 