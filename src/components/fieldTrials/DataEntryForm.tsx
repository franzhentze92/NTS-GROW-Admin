import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';

// Mock data for demonstration
const MOCK_ENTRIES = [
  {
    id: 1,
    date: '2025-01-15',
    plot: 'P1',
    variable: 'Plant Height',
    value: 45.2,
    unit: 'cm',
    collector: 'Mike Chen',
    notes: 'Measured from soil surface to tip of highest leaf'
  },
  {
    id: 2,
    date: '2025-01-15',
    plot: 'P1',
    variable: 'Leaf Color',
    value: 4,
    unit: 'Score 1–5',
    collector: 'Lisa Rodriguez',
    notes: 'Visual assessment using standardized color chart'
  },
  {
    id: 3,
    date: '2025-01-15',
    plot: 'P4',
    variable: 'Plant Height',
    value: 52.8,
    unit: 'cm',
    collector: 'Mike Chen',
    notes: 'Measured from soil surface to tip of highest leaf'
  }
];

const MOCK_VARIABLES = [
  { name: 'Plant Height', unit: 'cm' },
  { name: 'Leaf Color', unit: 'Score 1–5' },
  { name: 'Lodging', unit: '%' },
  { name: 'Yield', unit: 'kg/ha' }
];

const MOCK_PLOTS = ['P1', 'P2', 'P3', 'P4'];
const MOCK_COLLECTORS = ['Mike Chen', 'Lisa Rodriguez', 'Dr. Sarah Johnson'];

const DataSummary = () => {
  const [entries, setEntries] = useState(MOCK_ENTRIES);
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  // Filter state
  const [filterDate, setFilterDate] = useState('__all__');
  const [filterPlot, setFilterPlot] = useState('__all__');
  const [filterVariable, setFilterVariable] = useState('__all__');
  const [filterCollector, setFilterCollector] = useState('__all__');

  // Compute unique filter options
  const uniqueDates = Array.from(new Set(entries.map(e => e.date)));
  const uniquePlots = Array.from(new Set(entries.map(e => e.plot)));
  const uniqueVariables = Array.from(new Set(entries.map(e => e.variable)));
  const uniqueCollectors = Array.from(new Set(entries.map(e => e.collector)));

  // Filtered entries
  const filteredEntries = entries.filter(e =>
    (filterDate === '__all__' || e.date === filterDate) &&
    (filterPlot === '__all__' || e.plot === filterPlot) &&
    (filterVariable === '__all__' || e.variable === filterVariable) &&
    (filterCollector === '__all__' || e.collector === filterCollector)
  );

  // Dialog handlers
  const handleAdd = () => {
    setEditingEntry({ id: null, date: '', plot: '', variable: '', value: '', unit: '', collector: '', notes: '' });
    setShowDialog(true);
  };
  const handleEdit = (entry) => {
    setEditingEntry({ ...entry });
    setShowDialog(true);
  };
  const handleDelete = (id) => {
    setEntries(entries.filter(e => e.id !== id));
  };
  const handleDialogSave = () => {
    if (editingEntry.id) {
      setEntries(entries.map(e => e.id === editingEntry.id ? editingEntry : e));
    } else {
      setEntries([...entries, { ...editingEntry, id: Date.now() }]);
    }
    setShowDialog(false);
    setEditingEntry(null);
  };
  const handleDialogChange = (field, value) => {
    if (field === 'variable') {
      const variable = MOCK_VARIABLES.find(v => v.name === value);
      setEditingEntry(entry => ({ ...entry, variable: value, unit: variable ? variable.unit : '' }));
    } else {
      setEditingEntry(entry => ({ ...entry, [field]: value }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Summary
          </CardTitle>
          <CardDescription>View and manage all data collection entries for this trial.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
              <Label className="block mb-1">Date</Label>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {uniqueDates.map(date => (
                    <SelectItem key={date} value={date}>{date}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block mb-1">Plot</Label>
              <Select value={filterPlot} onValueChange={setFilterPlot}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {uniquePlots.map(plot => (
                    <SelectItem key={plot} value={plot}>{plot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block mb-1">Variable</Label>
              <Select value={filterVariable} onValueChange={setFilterVariable}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {uniqueVariables.map(variable => (
                    <SelectItem key={variable} value={variable}>{variable}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block mb-1">Collector</Label>
              <Select value={filterCollector} onValueChange={setFilterCollector}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {uniqueCollectors.map(collector => (
                    <SelectItem key={collector} value={collector}>{collector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filterDate !== '__all__' || filterPlot !== '__all__' || filterVariable !== '__all__' || filterCollector !== '__all__') && (
              <Button variant="outline" onClick={() => { setFilterDate('__all__'); setFilterPlot('__all__'); setFilterVariable('__all__'); setFilterCollector('__all__'); }}>Clear Filters</Button>
            )}
            <Button className="ml-auto bg-green-600 hover:bg-green-700 text-white" onClick={handleAdd}>
              <Plus className="mr-1" size={16} />
              Add Entry
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Plot</th>
                  <th className="p-2 border">Variable</th>
                  <th className="p-2 border">Value</th>
                  <th className="p-2 border">Unit</th>
                  <th className="p-2 border">Collector</th>
                  <th className="p-2 border">Notes</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{entry.date}</td>
                    <td className="p-2 border font-medium">{entry.plot}</td>
                    <td className="p-2 border">{entry.variable}</td>
                    <td className="p-2 border">{entry.value}</td>
                    <td className="p-2 border">{entry.unit}</td>
                    <td className="p-2 border">{entry.collector}</td>
                    <td className="p-2 border text-gray-600 max-w-xs truncate">{entry.notes}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Entry Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntry?.id ? 'Edit Entry' : 'Add Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={editingEntry?.date || ''} 
                  onChange={e => handleDialogChange('date', e.target.value)} 
                />
              </div>
              <div>
                <Label>Plot</Label>
                <Select value={editingEntry?.plot || ''} onValueChange={value => handleDialogChange('plot', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_PLOTS.map(plot => (
                      <SelectItem key={plot} value={plot}>{plot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Variable</Label>
                <Select value={editingEntry?.variable || ''} onValueChange={value => handleDialogChange('variable', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_VARIABLES.map(variable => (
                      <SelectItem key={variable.name} value={variable.name}>
                        {variable.name} ({variable.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <div className="py-2 px-3 bg-gray-100 rounded border text-gray-700 min-h-[40px] flex items-center">
                  {editingEntry?.unit || '--'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Value</Label>
                <Input 
                  value={editingEntry?.value || ''} 
                  onChange={e => handleDialogChange('value', e.target.value)} 
                />
              </div>
              <div>
                <Label>Collector</Label>
                <Select value={editingEntry?.collector || ''} onValueChange={value => handleDialogChange('collector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_COLLECTORS.map(collector => (
                      <SelectItem key={collector} value={collector}>{collector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={editingEntry?.notes || ''} 
                onChange={e => handleDialogChange('notes', e.target.value)}
                placeholder="Additional notes about this data collection..."
              />
            </div>
            <Button onClick={handleDialogSave} className="bg-green-600 hover:bg-green-700 text-white">
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataSummary;
