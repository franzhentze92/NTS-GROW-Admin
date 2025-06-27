import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { addDays, subDays, subMonths, subYears, isAfter } from 'date-fns';

// Simple interface for our data
interface Product {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  product_id: string;
  product_name: string;
  production_date: string;
  batch_no: string;
  work_order: string;
  ph: number;
  conductivity_ms: number;
  sg: number;
  volume: number;
  note?: string;
  created_at: string;
}

const ProductBatchProductionPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterProduct, setFilterProduct] = useState('');
  const [dateRange, setDateRange] = useState('all');
  
  // Form state
  const [formData, setFormData] = useState({
    product_id: '',
    production_date: '',
    batch_no: '',
    work_order: '',
    ph: '',
    conductivity_ms: '',
    sg: '',
    volume: '',
    note: ''
  });

  const [viewBatch, setViewBatch] = useState<Batch | null>(null);
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [deleteBatch, setDeleteBatch] = useState<Batch | null>(null);
  const [editFormData, setEditFormData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Date range filter logic
  const now = new Date();
  let fromDate: Date | null = null;
  if (dateRange === '7d') fromDate = subDays(now, 7);
  else if (dateRange === '30d') fromDate = subDays(now, 30);
  else if (dateRange === '6m') fromDate = subMonths(now, 6);
  else if (dateRange === '1y') fromDate = subYears(now, 1);

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=id,name`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Fetch batches from Supabase
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Join with products to get product names
          const batchesWithNames = data.map((batch: any) => ({
            ...batch,
            product_name: products.find(p => p.id === batch.product_id)?.name || 'Unknown Product'
          }));
          setBatches(batchesWithNames);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchBatches();
  }, [products]);

  // Filtered batches by product and date
  const filteredBatches = batches.filter(batch => {
    const matchesProduct = !filterProduct || batch.product_id === filterProduct;
    const matchesDate = !fromDate || (batch.production_date && isAfter(new Date(batch.production_date), fromDate));
    return matchesProduct && matchesDate;
  });

  // KPI calculations (on filteredBatches)
  const totalBatches = filteredBatches.length;
  const totalVolume = filteredBatches.reduce((sum, b) => sum + (b.volume || 0), 0);
  const avgPh = filteredBatches.length ? (filteredBatches.reduce((sum, b) => sum + (b.ph || 0), 0) / filteredBatches.length).toFixed(2) : '-';
  const avgConductivity = filteredBatches.length ? (filteredBatches.reduce((sum, b) => sum + (b.conductivity_ms || 0), 0) / filteredBatches.length).toFixed(2) : '-';
  const avgSg = filteredBatches.length ? (filteredBatches.reduce((sum, b) => sum + (b.sg || 0), 0) / filteredBatches.length).toFixed(3) : '-';

  // Prepare time series data (sorted by date)
  const timeSeries = [...filteredBatches]
    .filter(b => b.production_date)
    .sort((a, b) => new Date(a.production_date).getTime() - new Date(b.production_date).getTime())
    .map(b => ({
      date: b.production_date,
      ph: b.ph,
      conductivity_ms: b.conductivity_ms,
      sg: b.sg,
      volume: b.volume
    }));

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare payload, converting empty strings to null for numbers/dates
    const payload = {
      product_id: formData.product_id || null,
      production_date: formData.production_date || null,
      batch_no: formData.batch_no || null,
      work_order: formData.work_order || null,
      ph: formData.ph === '' ? null : parseFloat(formData.ph),
      conductivity_ms: formData.conductivity_ms === '' ? null : parseFloat(formData.conductivity_ms),
      sg: formData.sg === '' ? null : parseFloat(formData.sg),
      volume: formData.volume === '' ? null : parseInt(formData.volume, 10),
      note: formData.note || null
    };
    console.log('Submitting batch payload:', payload);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches`, {
        method: 'POST',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error:', response.status, errorText);
      }
      if (response.ok) {
        // Reset form and close dialog
        setFormData({
          product_id: '',
          production_date: '',
          batch_no: '',
          work_order: '',
          ph: '',
          conductivity_ms: '',
          sg: '',
          volume: '',
          note: ''
        });
        setIsAddDialogOpen(false);
        
        // Refresh batches
        const refreshResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const batchesWithNames = data.map((batch: any) => ({
            ...batch,
            product_name: products.find(p => p.id === batch.product_id)?.name || 'Unknown Product'
          }));
          setBatches(batchesWithNames);
        }
      }
    } catch (error) {
      console.error('Error adding batch:', error);
    }
  };

  // Edit form handler
  const handleEditChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Edit submit handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBatch) return;
    const payload = {
      product_id: editFormData.product_id || null,
      production_date: editFormData.production_date || null,
      batch_no: editFormData.batch_no || null,
      work_order: editFormData.work_order || null,
      ph: editFormData.ph === '' ? null : parseFloat(editFormData.ph),
      conductivity_ms: editFormData.conductivity_ms === '' ? null : parseFloat(editFormData.conductivity_ms),
      sg: editFormData.sg === '' ? null : parseFloat(editFormData.sg),
      volume: editFormData.volume === '' ? null : parseInt(editFormData.volume, 10),
      note: editFormData.note || null
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?id=eq.${editBatch.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setEditBatch(null);
        setEditFormData(null);
        // Refresh batches
        const refreshResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const batchesWithNames = data.map((batch: any) => ({
            ...batch,
            product_name: products.find(p => p.id === batch.product_id)?.name || 'Unknown Product'
          }));
          setBatches(batchesWithNames);
        }
      }
    } catch (error) {
      console.error('Error editing batch:', error);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteBatch) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?id=eq.${deleteBatch.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      if (response.ok) {
        setDeleteBatch(null);
        setIsDeleting(false);
        // Refresh batches
        const refreshResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/product_batches?select=*`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          const batchesWithNames = data.map((batch: any) => ({
            ...batch,
            product_name: products.find(p => p.id === batch.product_id)?.name || 'Unknown Product'
          }));
          setBatches(batchesWithNames);
        }
      }
    } catch (error) {
      setIsDeleting(false);
      console.error('Error deleting batch:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Title and Subtitle */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Product Batch Production</h1>
        <p className="text-muted-foreground mt-1">Monitor, analyze, and manage all product batch production records with KPIs, trends, and full batch history.</p>
      </div>

      {/* Filters at the top */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div>
              <Label htmlFor="filter-product">Filter by Product</Label>
              <select
                id="filter-product"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">All Products</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="date-range">Date Range</Label>
              <select
                id="date-range"
                value={dateRange}
                onChange={e => setDateRange(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="6m">Last 6 Months</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">Total Batches</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalBatches}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">Total Volume (L)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{totalVolume} L</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">Avg pH</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{avgPh} pH</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">Avg Conductivity (mS)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{avgConductivity} mS</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">Avg SG</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{avgSg} SG</CardContent>
        </Card>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader><CardTitle>pH Over Time</CardTitle></CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d ? new Date(d).toLocaleDateString() : ''} />
                <YAxis label={{ value: 'pH', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={d => d ? new Date(d).toLocaleDateString() : ''} formatter={v => `${v} pH`} />
                <Legend formatter={() => 'pH'} />
                <Line type="monotone" dataKey="ph" stroke="#8884d8" name="pH" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Conductivity (mS) Over Time</CardTitle></CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d ? new Date(d).toLocaleDateString() : ''} />
                <YAxis label={{ value: 'mS', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={d => d ? new Date(d).toLocaleDateString() : ''} formatter={v => `${v} mS`} />
                <Legend formatter={() => 'Conductivity (mS)'} />
                <Line type="monotone" dataKey="conductivity_ms" stroke="#82ca9d" name="Conductivity (mS)" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>SG Over Time</CardTitle></CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d ? new Date(d).toLocaleDateString() : ''} />
                <YAxis label={{ value: 'SG', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={d => d ? new Date(d).toLocaleDateString() : ''} formatter={v => `${v} SG`} />
                <Legend formatter={() => 'SG'} />
                <Line type="monotone" dataKey="sg" stroke="#ffc658" name="SG" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Volume (L) Over Time</CardTitle></CardHeader>
          <CardContent style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ left: 10, right: 10, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => d ? new Date(d).toLocaleDateString() : ''} />
                <YAxis label={{ value: 'L', angle: -90, position: 'insideLeft' }} />
                <Tooltip labelFormatter={d => d ? new Date(d).toLocaleDateString() : ''} formatter={v => `${v} L`} />
                <Legend formatter={() => 'Volume (L)'} />
                <Line type="monotone" dataKey="volume" stroke="#ff7300" name="Volume (L)" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Product Batch Production</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddDialogOpen(true)}>Add New Batch</Button>
          </DialogTrigger>
          <DialogContent style={{ maxHeight: 500, overflowY: 'auto' }}>
            <DialogHeader>
              <DialogTitle>Add New Product Batch</DialogTitle>
            </DialogHeader>
            {/* Debug print of formData */}
            <pre>{JSON.stringify(formData, null, 2)}</pre>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="product">Product</Label>
                <select
                  id="product"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="production_date">Production Date</Label>
                <Input
                  id="production_date"
                  type="date"
                  value={formData.production_date}
                  onChange={(e) => setFormData({ ...formData, production_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="batch_no">Batch No</Label>
                <Input
                  id="batch_no"
                  value={formData.batch_no}
                  onChange={(e) => setFormData({ ...formData, batch_no: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="work_order">Work Order</Label>
                <Input
                  id="work_order"
                  value={formData.work_order}
                  onChange={(e) => setFormData({ ...formData, work_order: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ph">pH</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.01"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="conductivity_ms">Conductivity (mS)</Label>
                  <Input
                    id="conductivity_ms"
                    type="number"
                    step="0.01"
                    value={formData.conductivity_ms}
                    onChange={(e) => setFormData({ ...formData, conductivity_ms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sg">SG</Label>
                  <Input
                    id="sg"
                    type="number"
                    step="0.001"
                    value={formData.sg}
                    onChange={(e) => setFormData({ ...formData, sg: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="volume">Volume (L)</Label>
                  <Input
                    id="volume"
                    type="number"
                    step="1"
                    value={formData.volume}
                    onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Batch</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Batches ({filteredBatches.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Production Date</TableHead>
                <TableHead>Batch No</TableHead>
                <TableHead>Work Order</TableHead>
                <TableHead>pH</TableHead>
                <TableHead>Conductivity (mS)</TableHead>
                <TableHead>SG</TableHead>
                <TableHead>Volume (L)</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell>{batch.product_name}</TableCell>
                  <TableCell>{batch.production_date ? new Date(batch.production_date).toLocaleDateString() : ''}</TableCell>
                  <TableCell>{batch.batch_no}</TableCell>
                  <TableCell>{batch.work_order}</TableCell>
                  <TableCell>{batch.ph}</TableCell>
                  <TableCell>{batch.conductivity_ms}</TableCell>
                  <TableCell>{batch.sg}</TableCell>
                  <TableCell>{batch.volume}</TableCell>
                  <TableCell>{batch.note}</TableCell>
                  <TableCell>{batch.created_at ? new Date(batch.created_at).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setViewBatch(batch)}>View</Button>{' '}
                    <Button size="sm" variant="outline" onClick={() => { setEditBatch(batch); setEditFormData(batch); }}>Edit</Button>{' '}
                    <Button size="sm" variant="destructive" onClick={() => setDeleteBatch(batch)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={!!viewBatch} onOpenChange={() => setViewBatch(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Batch Details</DialogTitle>
          </DialogHeader>
          {viewBatch && (
            <div className="space-y-2">
              <div><b>Product:</b> {viewBatch.product_name}</div>
              <div><b>Production Date:</b> {viewBatch.production_date ? new Date(viewBatch.production_date).toLocaleDateString() : ''}</div>
              <div><b>Batch No:</b> {viewBatch.batch_no}</div>
              <div><b>Work Order:</b> {viewBatch.work_order}</div>
              <div><b>pH:</b> {viewBatch.ph}</div>
              <div><b>Conductivity (mS):</b> {viewBatch.conductivity_ms}</div>
              <div><b>SG:</b> {viewBatch.sg}</div>
              <div><b>Volume (L):</b> {viewBatch.volume}</div>
              <div><b>Note:</b> {viewBatch.note}</div>
              <div><b>Created:</b> {viewBatch.created_at ? new Date(viewBatch.created_at).toLocaleDateString() : ''}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editBatch} onOpenChange={() => { setEditBatch(null); setEditFormData(null); }}>
        <DialogContent style={{ maxHeight: 500, overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
          </DialogHeader>
          {editFormData && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-product">Product</Label>
                <select
                  id="edit-product"
                  value={editFormData.product_id}
                  onChange={e => handleEditChange('product_id', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-production_date">Production Date</Label>
                <Input
                  id="edit-production_date"
                  type="date"
                  value={editFormData.production_date || ''}
                  onChange={e => handleEditChange('production_date', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-batch_no">Batch No</Label>
                <Input
                  id="edit-batch_no"
                  value={editFormData.batch_no || ''}
                  onChange={e => handleEditChange('batch_no', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-work_order">Work Order</Label>
                <Input
                  id="edit-work_order"
                  value={editFormData.work_order || ''}
                  onChange={e => handleEditChange('work_order', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-ph">pH</Label>
                  <Input
                    id="edit-ph"
                    type="number"
                    step="0.01"
                    value={editFormData.ph || ''}
                    onChange={e => handleEditChange('ph', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-conductivity_ms">Conductivity (mS)</Label>
                  <Input
                    id="edit-conductivity_ms"
                    type="number"
                    step="0.01"
                    value={editFormData.conductivity_ms || ''}
                    onChange={e => handleEditChange('conductivity_ms', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-sg">SG</Label>
                  <Input
                    id="edit-sg"
                    type="number"
                    step="0.001"
                    value={editFormData.sg || ''}
                    onChange={e => handleEditChange('sg', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-volume">Volume (L)</Label>
                  <Input
                    id="edit-volume"
                    type="number"
                    step="1"
                    value={editFormData.volume || ''}
                    onChange={e => handleEditChange('volume', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-note">Note (Optional)</Label>
                <Input
                  id="edit-note"
                  value={editFormData.note || ''}
                  onChange={e => handleEditChange('note', e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setEditBatch(null); setEditFormData(null); }}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteBatch} onOpenChange={() => setDeleteBatch(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader>
            <DialogTitle>Delete Batch</DialogTitle>
          </DialogHeader>
          {deleteBatch && (
            <div className="space-y-4">
              <div>Are you sure you want to delete batch <b>{deleteBatch.batch_no}</b>?</div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDeleteBatch(null)}>Cancel</Button>
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Deleting...' : 'Delete'}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductBatchProductionPage; 