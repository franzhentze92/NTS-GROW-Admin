import React, { useState, useMemo } from 'react';
import { useCostContext } from '@/contexts/CostContext';
import { Cost } from '@/lib/costsApi';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trash2, Edit, Filter, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart, Loader2, AlertCircle, Repeat, Zap } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const categories = [
  'Hosting & Servers',
  'Domain Names & SSL',
  'Software Licenses',
  'Development Tools',
  'Cloud Services (AWS/Azure/GCP)',
  'Database Services',
  'API Services & Integrations',
  'Security & Monitoring',
  'Backup & Storage',
  'CDN & Performance',
  'Development Team',
  'Design & UX Tools',
  'Testing & QA Tools',
  'Project Management Tools',
  'Communication Tools',
  'Marketing & Analytics',
  'Legal & Compliance',
  'Training & Certifications',
  'Consulting Services',
  'Other',
];

const expenseTypes = [
  { value: 'monthly', label: 'Monthly Recurring', icon: Repeat },
  { value: 'one_time', label: 'One Time', icon: Zap },
];

const CostManagementPage: React.FC = () => {
  const { costs, loading, error, addCost, editCost, deleteCost } = useCostContext();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Cost, 'id'>>({
    date: '',
    category: '',
    description: '',
    amount: 0,
    expense_type: 'one_time',
  });

  // Filters
  const [filters, setFilters] = useState({
    category: 'all',
    expenseType: 'all',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    search: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = costs.reduce((sum, c) => sum + c.amount, 0);
    const monthlyTotal = costs.filter(c => c.expense_type === 'monthly').reduce((sum, c) => sum + c.amount, 0);
    const oneTimeTotal = costs.filter(c => c.expense_type === 'one_time').reduce((sum, c) => sum + c.amount, 0);
    
    // Category breakdown
    const categoryBreakdown = costs.reduce((acc, cost) => {
      acc[cost.category] = (acc[cost.category] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    // Monthly breakdown
    const monthlyBreakdown = costs.reduce((acc, cost) => {
      const month = cost.date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    // Top categories
    const topCategories = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Expense type breakdown
    const expenseTypeBreakdown = costs.reduce((acc, cost) => {
      acc[cost.expense_type] = (acc[cost.expense_type] || 0) + cost.amount;
      return acc;
    }, {} as Record<string, number>);

    return { 
      total, 
      monthlyTotal, 
      oneTimeTotal,
      categoryBreakdown, 
      monthlyBreakdown, 
      topCategories,
      expenseTypeBreakdown 
    };
  }, [costs]);

  // Filter costs
  const filteredCosts = useMemo(() => {
    return costs.filter(cost => {
      if (filters.category !== 'all' && cost.category !== filters.category) return false;
      if (filters.expenseType !== 'all' && cost.expense_type !== filters.expenseType) return false;
      if (filters.dateFrom && cost.date < filters.dateFrom) return false;
      if (filters.dateTo && cost.date > filters.dateTo) return false;
      if (filters.amountMin && cost.amount < Number(filters.amountMin)) return false;
      if (filters.amountMax && cost.amount > Number(filters.amountMax)) return false;
      if (filters.search && !cost.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [costs, filters]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ date: '', category: '', description: '', amount: 0, expense_type: 'one_time' });
    setShowDialog(true);
  };
  
  const openEdit = (cost: Cost) => {
    setEditingId(cost.id);
    setForm({ 
      date: cost.date, 
      category: cost.category, 
      description: cost.description, 
      amount: cost.amount,
      expense_type: cost.expense_type 
    });
    setShowDialog(true);
  };
  
  const handleSave = async () => {
    if (!form.date || !form.category || !form.description || !form.amount) return;
    
    setSaving(true);
    try {
      let success;
      if (editingId) {
        success = await editCost(editingId, form);
      } else {
        success = await addCost(form);
      }
      
      if (success) {
        setShowDialog(false);
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this cost?')) {
      setDeletingId(id);
      try {
        await deleteCost(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      expenseType: 'all',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      search: '',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading costs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Technology Cost Management</h1>
          <p className="text-muted-foreground">Track and manage technology development expenses</p>
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
          <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700">Add Cost</Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={filters.category} onValueChange={v => setFilters(f => ({ ...f, category: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expense Type</Label>
                <Select value={filters.expenseType} onValueChange={v => setFilters(f => ({ ...f, expenseType: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="monthly">Monthly Recurring</SelectItem>
                    <SelectItem value="one_time">One Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date From</Label>
                <Input 
                  type="date" 
                  value={filters.dateFrom} 
                  onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Date To</Label>
                <Input 
                  type="date" 
                  value={filters.dateTo} 
                  onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Min Amount</Label>
                <Input 
                  type="number" 
                  placeholder="0"
                  value={filters.amountMin} 
                  onChange={e => setFilters(f => ({ ...f, amountMin: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Max Amount</Label>
                <Input 
                  type="number" 
                  placeholder="Any"
                  value={filters.amountMax} 
                  onChange={e => setFilters(f => ({ ...f, amountMax: e.target.value }))} 
                />
              </div>
              <div>
                <Label>Search</Label>
                <Input 
                  placeholder="Search descriptions..."
                  value={filters.search} 
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} 
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              AUD ${metrics.total.toLocaleString()}
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
              AUD ${metrics.monthlyTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.total > 0 ? `${((metrics.monthlyTotal / metrics.total) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">One Time</CardTitle>
            <Zap className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              AUD ${metrics.oneTimeTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.total > 0 ? `${((metrics.oneTimeTotal / metrics.total) * 100).toFixed(1)}%` : '0%'} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {costs.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cost entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Type Breakdown</CardTitle>
          <CardDescription>Monthly recurring vs one-time expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-blue-600 flex items-center gap-2">
                <Repeat className="h-4 w-4" />
                Monthly Recurring Expenses
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.expenseTypeBreakdown)
                  .filter(([type]) => type === 'monthly')
                  .map(([type, amount]) => (
                    <div key={type} className="flex justify-between items-center p-3 border rounded-lg bg-blue-50">
                      <div className="font-medium">Monthly Total</div>
                      <div className="font-bold text-blue-600">AUD ${amount.toLocaleString()}</div>
                    </div>
                  ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-orange-600 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                One-Time Expenses
              </h3>
              <div className="space-y-2">
                {Object.entries(metrics.expenseTypeBreakdown)
                  .filter(([type]) => type === 'one_time')
                  .map(([type, amount]) => (
                    <div key={type} className="flex justify-between items-center p-3 border rounded-lg bg-orange-50">
                      <div className="font-medium">One-Time Total</div>
                      <div className="font-bold text-orange-600">AUD ${amount.toLocaleString()}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Cost distribution by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.topCategories.map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{category}</div>
                  <div className="text-sm text-muted-foreground">
                    {((amount / metrics.total) * 100).toFixed(1)}% of total
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-red-600">AUD ${amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Transactions</CardTitle>
          <CardDescription>All cost entries with filtering and search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-center">Type</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCosts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-6">
                      {costs.length === 0 ? 'No costs found. Add your first cost entry.' : 'No costs match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredCosts.map(cost => (
                    <tr key={cost.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{cost.date}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          {cost.category}
                        </Badge>
                      </td>
                      <td className="p-2">{cost.description}</td>
                      <td className="p-2 text-center">
                        <Badge 
                          variant={cost.expense_type === 'monthly' ? 'default' : 'secondary'}
                          className={cost.expense_type === 'monthly' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                          }
                        >
                          {cost.expense_type === 'monthly' ? 'Monthly' : 'One Time'}
                        </Badge>
                      </td>
                      <td className="p-2 text-right text-red-600 font-semibold">
                        AUD ${cost.amount.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(cost)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(cost.id)}
                            disabled={deletingId === cost.id}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            {deletingId === cost.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Cost' : 'Add New Cost'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the cost information below.' : 'Enter the details for the new cost entry.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Expense Type</Label>
              <Select value={form.expense_type} onValueChange={v => setForm(f => ({ ...f, expense_type: v as 'monthly' | 'one_time' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="Enter cost description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.date || !form.category || !form.description || !form.amount}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update' : 'Add'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CostManagementPage; 