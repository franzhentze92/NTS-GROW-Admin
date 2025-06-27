import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X as Close, Calendar, User, Target, FileText, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

// Shared mockTrials object (should be imported from a central file in a real app)
const initialTrials = [
  {
    id: 5,
    name: 'Nitrogen Rate Trial – Corn 2025',
    trial_code: 'N-CORN-2025',
    crop: 'Corn',
    season: 'Wet 2025',
    status: 'ongoing',
    variables: [
      { 
        name: 'Yield', 
        unit: 'kg/ha', 
        frequency: 'At harvest',
        description: 'Total grain yield per hectare at physiological maturity'
      },
      { 
        name: 'Plant Height', 
        unit: 'cm', 
        frequency: 'Weekly',
        description: 'Height from soil surface to the tip of the highest leaf'
      },
      { 
        name: 'Leaf Color', 
        unit: 'Score 1–5', 
        frequency: 'Biweekly',
        description: 'Visual assessment of leaf greenness using standardized color chart'
      },
      { 
        name: 'Lodging', 
        unit: '%', 
        frequency: 'At harvest',
        description: 'Percentage of plants that have fallen over or are leaning significantly'
      }
    ],
    treatments: [
      { name: 'Control', description: 'No nitrogen applied' },
      { name: 'Low N', description: 'Low nitrogen rate' },
      { name: 'Medium N', description: 'Medium nitrogen rate' },
      { name: 'High N', description: 'High nitrogen rate' }
    ],
    plots: [
      { id: 'P1', treatment: 'Control', replication: 1, location: 'North-East' },
      { id: 'P2', treatment: 'Control', replication: 2, location: 'North-West' },
      { id: 'P3', treatment: 'Control', replication: 3, location: 'South-East' },
      { id: 'P4', treatment: 'Low N', replication: 1, location: 'North-East' },
      { id: 'P5', treatment: 'Low N', replication: 2, location: 'North-West' },
      { id: 'P6', treatment: 'Low N', replication: 3, location: 'South-East' },
      { id: 'P7', treatment: 'Medium N', replication: 1, location: 'North-East' },
      { id: 'P8', treatment: 'Medium N', replication: 2, location: 'North-West' },
      { id: 'P9', treatment: 'Medium N', replication: 3, location: 'South-East' },
      { id: 'P10', treatment: 'High N', replication: 1, location: 'North-East' },
      { id: 'P11', treatment: 'High N', replication: 2, location: 'North-West' },
      { id: 'P12', treatment: 'High N', replication: 3, location: 'South-East' }
    ],
    team: [
      { id: 1, name: 'Dr. Sarah Johnson', role: 'Lead Researcher', email: 'sarah.johnson@example.com' },
      { id: 2, name: 'Mike Chen', role: 'Field Technician', email: 'mike.chen@example.com' },
      { id: 3, name: 'Lisa Rodriguez', role: 'Data Collector', email: 'lisa.rodriguez@example.com' }
    ],
    entries: [
      {
        id: 1,
        plot: 'P1',
        variable: 'Plant Height',
        value: 45.2,
        unit: 'cm',
        date: '2025-01-15',
        collector: 'Mike Chen',
        notes: 'Measured from soil surface to tip of highest leaf'
      },
      {
        id: 2,
        plot: 'P1',
        variable: 'Leaf Color',
        value: 4,
        unit: 'Score 1–5',
        date: '2025-01-15',
        collector: 'Lisa Rodriguez',
        notes: 'Visual assessment using standardized color chart'
      },
      {
        id: 3,
        plot: 'P4',
        variable: 'Plant Height',
        value: 52.8,
        unit: 'cm',
        date: '2025-01-15',
        collector: 'Mike Chen',
        notes: 'Measured from soil surface to tip of highest leaf'
      }
    ]
  }
];

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing', color: 'default' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const ENTRIES_PER_PAGE = 10;

const DataCollectionManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trials, setTrials] = useState(initialTrials);
  const [selectedTrialId, setSelectedTrialId] = useState(id || (trials.length > 0 ? String(trials[0].id) : ''));
  const trialIndex = trials.findIndex(t => String(t.id) === String(selectedTrialId));
  const trial = trialIndex !== -1 ? trials[trialIndex] : null;

  // Dialog state
  const [showPlotDialog, setShowPlotDialog] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Data Summary filter state
  const [filterDate, setFilterDate] = useState('__all__');
  const [filterPlot, setFilterPlot] = useState('__all__');
  const [filterVariable, setFilterVariable] = useState('__all__');
  const [filterCollector, setFilterCollector] = useState('__all__');

  // Compute unique filter options for summary
  const uniqueDates = Array.from(new Set(trial ? trial.entries.map(e => e.date) : []));
  const uniquePlots = Array.from(new Set(trial ? trial.entries.map(e => e.plot) : []));
  const uniqueVariables = Array.from(new Set(trial ? trial.entries.map(e => e.variable) : []));
  const uniqueCollectors = Array.from(new Set(trial ? trial.entries.map(e => e.collector) : []));

  // Filtered entries for summary
  const filteredEntries = trial ? trial.entries.filter(e =>
    (filterDate === '__all__' || e.date === filterDate) &&
    (filterPlot === '__all__' || e.plot === filterPlot) &&
    (filterVariable === '__all__' || e.variable === filterVariable) &&
    (filterCollector === '__all__' || e.collector === filterCollector)
  ) : [];

  // Sort entries by date descending
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const totalPages = Math.ceil(sortedEntries.length / ENTRIES_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedEntries = sortedEntries.slice((currentPage - 1) * ENTRIES_PER_PAGE, currentPage * ENTRIES_PER_PAGE);

  // Status update handler
  const handleStatusChange = (newStatus) => {
    const updated = [...trials];
    updated[trialIndex].status = newStatus;
    setTrials(updated);
  };

  // Plot handlers
  const handleAddPlot = () => {
    setEditingPlot({ id: '', treatment: '', replication: 1, location: '' });
    setShowPlotDialog(true);
  };
  const handleEditPlot = (plot) => {
    setEditingPlot({ ...plot });
    setShowPlotDialog(true);
  };
  const handleDeletePlot = (idx) => {
    const updated = [...trials];
    updated[trialIndex].plots.splice(idx, 1);
    setTrials(updated);
  };
  const handleSavePlot = () => {
    const updated = [...trials];
    if (editingPlot._editIdx !== undefined) {
      updated[trialIndex].plots[editingPlot._editIdx] = { ...editingPlot };
    } else {
      updated[trialIndex].plots.push({ ...editingPlot });
    }
    setTrials(updated);
    setShowPlotDialog(false);
    setEditingPlot(null);
  };

  // Team handlers
  const handleAddTeamMember = () => {
    setEditingTeamMember({ name: '', role: '', email: '' });
    setShowTeamDialog(true);
  };
  const handleEditTeamMember = (member) => {
    setEditingTeamMember({ ...member });
    setShowTeamDialog(true);
  };
  const handleDeleteTeamMember = (idx) => {
    const updated = [...trials];
    updated[trialIndex].team.splice(idx, 1);
    setTrials(updated);
  };
  const handleSaveTeamMember = () => {
    const updated = [...trials];
    if (editingTeamMember._editIdx !== undefined) {
      updated[trialIndex].team[editingTeamMember._editIdx] = { ...editingTeamMember };
    } else {
      updated[trialIndex].team.push({ ...editingTeamMember, id: Date.now() });
    }
    setTrials(updated);
    setShowTeamDialog(false);
    setEditingTeamMember(null);
  };

  // Entry handlers
  const handleAddEntry = () => {
    setEditingEntry({ 
      plot: '', 
      variable: '', 
      value: '', 
      unit: '', 
      date: new Date().toISOString().split('T')[0], 
      collector: '', 
      notes: '' 
    });
    setShowEntryDialog(true);
  };
  const handleEditEntry = (entry) => {
    setEditingEntry({ ...entry });
    setShowEntryDialog(true);
  };
  const handleDeleteEntry = (idx) => {
    const updated = [...trials];
    updated[trialIndex].entries.splice(idx, 1);
    setTrials(updated);
  };
  const handleSaveEntry = () => {
    const updated = [...trials];
    // Always set the unit from the variable definition
    const selectedVar = trial.variables.find(v => v.name === editingEntry.variable);
    const entryToSave = {
      ...editingEntry,
      unit: selectedVar ? selectedVar.unit : '',
    };
    if (editingEntry._editIdx !== undefined) {
      updated[trialIndex].entries[editingEntry._editIdx] = { ...entryToSave };
    } else {
      updated[trialIndex].entries.push({ ...entryToSave, id: Date.now() });
    }
    setTrials(updated);
    setShowEntryDialog(false);
    setEditingEntry(null);
  };

  // When variable changes, update the unit automatically
  const handleVariableChange = (value) => {
    const selectedVar = trial.variables.find(v => v.name === value);
    setEditingEntry(entry => ({
      ...entry,
      variable: value,
      unit: selectedVar ? selectedVar.unit : '',
    }));
  };

  if (!id) {
    // Show all trials
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold mb-6">Data Collection & Entry Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trials.map(trial => (
            <Card key={trial.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{trial.name}</CardTitle>
                <CardDescription>
                  Code: {trial.trial_code} | Crop: {trial.crop} | Season: {trial.season}
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant={trial.status === 'completed' ? 'success' : trial.status === 'cancelled' ? 'destructive' : 'default'}>
                    {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">{trial.variables.length} Variables</Badge>
                  <Badge variant="outline">{trial.plots.length} Plots</Badge>
                  <Badge variant="outline">{trial.entries.length} Entries</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={() => navigate(`/agronomist/field-trials/${trial.id}/data-collection`)}>
                  Manage Data Collection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!trial) {
    return <div className="p-8 text-red-600 text-lg">Trial not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <Button variant="ghost" onClick={() => navigate('/agronomist/field-trials/data-collection')} className="mb-4">
        Back to All Trials
      </Button>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{trial.name} – Data Collection & Entry Management</CardTitle>
          <CardDescription>Manage plots, team members, and data collection entries for this trial.</CardDescription>
          <div className="flex items-center gap-4 mt-2">
            <span>Status:</span>
            <Select value={trial.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant={trial.status === 'completed' ? 'success' : trial.status === 'cancelled' ? 'destructive' : 'default'}>
              {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Plots Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Plots ({trial.plots.length})
              </h3>
              <Button onClick={handleAddPlot}>Add Plot</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Plot ID</th>
                    <th className="p-2 border">Treatment</th>
                    <th className="p-2 border">Replication</th>
                    <th className="p-2 border">Location</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trial.plots.map((plot, i) => (
                    <tr key={i}>
                      <td className="p-2 border font-medium">{plot.id}</td>
                      <td className="p-2 border">{plot.treatment}</td>
                      <td className="p-2 border">{plot.replication}</td>
                      <td className="p-2 border">{plot.location}</td>
                      <td className="p-2 border">
                        <Button size="sm" variant="outline" onClick={() => { setEditingPlot({ ...plot, _editIdx: i }); setShowPlotDialog(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeletePlot(i)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Team Members ({trial.team.length})
              </h3>
              <Button onClick={handleAddTeamMember}>Add Team Member</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Role</th>
                    <th className="p-2 border">Email</th>
                    <th className="p-2 border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trial.team.map((member, i) => (
                    <tr key={i}>
                      <td className="p-2 border font-medium">{member.name}</td>
                      <td className="p-2 border">{member.role}</td>
                      <td className="p-2 border">{member.email}</td>
                      <td className="p-2 border">
                        <Button size="sm" variant="outline" onClick={() => { setEditingTeamMember({ ...member, _editIdx: i }); setShowTeamDialog(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteTeamMember(i)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Entries Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Collection Entries</CardTitle>
              <CardDescription>Manage data collection entries for {trial.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filter Bar for Data Summary */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All dates</SelectItem>
                      {uniqueDates.map(date => (
                        <SelectItem key={date} value={date}>{date}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Plot</label>
                  <Select value={filterPlot} onValueChange={setFilterPlot}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All plots" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All plots</SelectItem>
                      {uniquePlots.map(plot => (
                        <SelectItem key={plot} value={plot}>{plot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Variable</label>
                  <Select value={filterVariable} onValueChange={setFilterVariable}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All variables" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All variables</SelectItem>
                      {uniqueVariables.map(variable => (
                        <SelectItem key={variable} value={variable}>{variable}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Collector</label>
                  <Select value={filterCollector} onValueChange={setFilterCollector}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All collectors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All collectors</SelectItem>
                      {uniqueCollectors.map(collector => (
                        <SelectItem key={collector} value={collector}>{collector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddEntry}>Add Entry</Button>
                </div>
              </div>

              {/* Data Summary Table */}
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
                    {paginatedEntries.map((entry, i) => (
                      <tr key={i}>
                        <td className="p-2 border">{entry.date}</td>
                        <td className="p-2 border font-medium">{entry.plot}</td>
                        <td className="p-2 border">{entry.variable}</td>
                        <td className="p-2 border">{entry.value}</td>
                        <td className="p-2 border">{entry.unit}</td>
                        <td className="p-2 border">{entry.collector}</td>
                        <td className="p-2 border text-gray-600 max-w-xs truncate">{entry.notes}</td>
                        <td className="p-2 border">
                          <Button size="sm" variant="outline" onClick={() => { setEditingEntry({ ...entry, _editIdx: i }); setShowEntryDialog(true); }}>Edit</Button>
                          <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteEntry(i)}>Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-4 mt-4">
                  <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm">Page {currentPage} of {totalPages}</span>
                  <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Plot Dialog */}
      <Dialog open={showPlotDialog} onOpenChange={setShowPlotDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlot && editingPlot._editIdx !== undefined ? 'Edit Plot' : 'Add Plot'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Plot ID</Label>
              <Input value={editingPlot?.id || ''} onChange={e => setEditingPlot({ ...editingPlot, id: e.target.value })} />
            </div>
            <div>
              <Label>Treatment</Label>
              <Select value={editingPlot?.treatment || ''} onValueChange={value => setEditingPlot({ ...editingPlot, treatment: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select treatment" />
                </SelectTrigger>
                <SelectContent>
                  {trial.treatments.map((treatment) => (
                    <SelectItem key={treatment.name} value={treatment.name}>
                      {treatment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Replication</Label>
              <Input 
                type="number" 
                min="1" 
                value={editingPlot?.replication || 1} 
                onChange={e => setEditingPlot({ ...editingPlot, replication: parseInt(e.target.value) || 1 })} 
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input value={editingPlot?.location || ''} onChange={e => setEditingPlot({ ...editingPlot, location: e.target.value })} />
            </div>
            <Button onClick={handleSavePlot}>Save Plot</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Member Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeamMember && editingTeamMember._editIdx !== undefined ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={editingTeamMember?.name || ''} onChange={e => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })} />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={editingTeamMember?.role || ''} onChange={e => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editingTeamMember?.email || ''} onChange={e => setEditingTeamMember({ ...editingTeamMember, email: e.target.value })} />
            </div>
            <Button onClick={handleSaveTeamMember}>Save Team Member</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entry Dialog */}
      <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEntry && editingEntry._editIdx !== undefined ? 'Edit Data Entry' : 'Add Data Entry'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={editingEntry?.date || ''} 
                  onChange={e => setEditingEntry({ ...editingEntry, date: e.target.value })} 
                />
              </div>
              <div>
                <Label>Plot</Label>
                <Select value={editingEntry?.plot || ''} onValueChange={value => setEditingEntry({ ...editingEntry, plot: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot" />
                  </SelectTrigger>
                  <SelectContent>
                    {trial.plots.map((plot) => (
                      <SelectItem key={plot.id} value={plot.id}>
                        {plot.id} - {plot.treatment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Variable</Label>
                <Select value={editingEntry?.variable || ''} onValueChange={handleVariableChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select variable" />
                  </SelectTrigger>
                  <SelectContent>
                    {trial.variables.map((variable) => (
                      <SelectItem key={variable.name} value={variable.name}>
                        {variable.name} ({variable.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Collector</Label>
                <Select value={editingEntry?.collector || ''} onValueChange={value => setEditingEntry({ ...editingEntry, collector: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collector" />
                  </SelectTrigger>
                  <SelectContent>
                    {trial.team.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 items-end">
              <div>
                <Label>Value</Label>
                <Input 
                  value={editingEntry?.value || ''} 
                  onChange={e => setEditingEntry({ ...editingEntry, value: e.target.value })} 
                />
              </div>
              <div>
                <Label>Unit</Label>
                <div className="py-2 px-3 bg-gray-100 rounded border text-gray-700 min-h-[40px] flex items-center">
                  {editingEntry?.unit || '--'}
                </div>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea 
                value={editingEntry?.notes || ''} 
                onChange={e => setEditingEntry({ ...editingEntry, notes: e.target.value })}
                placeholder="Additional notes about this data collection..."
              />
            </div>
            <Button onClick={handleSaveEntry}>Save Entry</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataCollectionManager;
