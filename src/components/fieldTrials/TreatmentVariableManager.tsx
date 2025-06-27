import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Plus, Edit, Trash2, Droplets, Thermometer, Leaf, Target, Calendar, Tag, Save, X as Close } from 'lucide-react';
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
    treatments: [
      { name: 'Control', description: 'No nitrogen applied', application: 'Soil', rate: '0 kg N/ha', timing: 'Pre-sowing' },
      { name: 'Low N', description: 'Low nitrogen rate', application: 'Soil', rate: '60 kg N/ha', timing: 'Pre-sowing' },
      { name: 'Medium N', description: 'Medium nitrogen rate', application: 'Soil', rate: '120 kg N/ha', timing: 'Pre-sowing' },
      { name: 'High N', description: 'High nitrogen rate', application: 'Soil', rate: '180 kg N/ha', timing: 'Pre-sowing' }
    ],
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
    replications: 3,
    designType: 'RCBD',
    plotSize: { width: 3, length: 5, unit: 'm' },
    rowSpacing: 75, // cm
    totalPlots: 12
  },
  // ...add more trials as needed
];

const TREATMENT_TYPES = [
  { value: 'control', label: 'Control' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'pesticide', label: 'Pesticide' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'other', label: 'Other' },
];

const VARIABLE_TYPES = [
  { value: 'growth', label: 'Growth' },
  { value: 'yield', label: 'Yield' },
  { value: 'quality', label: 'Quality' },
  { value: 'environmental', label: 'Environmental' },
  { value: 'other', label: 'Other' },
];

const FREQUENCIES = [
  'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'At planting', 'At harvest', 'Seasonal'
];

const DESIGN_TYPES = ['RCBD', 'Split-Plot', 'Latin Square', 'Factorial', 'Custom'];

const STATUS_OPTIONS = [
  { value: 'ongoing', label: 'Ongoing', color: 'default' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const TreatmentVariableManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trials, setTrials] = useState(initialTrials);
  const trialIndex = trials.findIndex(t => String(t.id) === String(id));
  const trial = trialIndex !== -1 ? trials[trialIndex] : null;

  // Dialog state
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [editingVariable, setEditingVariable] = useState(null);

  // Layout editing state
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [layoutData, setLayoutData] = useState({
    designType: trial?.designType || '',
    replications: trial?.replications || 0,
    plotSize: {
      width: trial?.plotSize?.width || 0,
      length: trial?.plotSize?.length || 0,
      unit: trial?.plotSize?.unit || 'm'
    },
    rowSpacing: trial?.rowSpacing || 0,
    totalPlots: trial?.totalPlots || 0
  });

  // Layout handlers
  const handleLayoutSave = () => {
    const updated = [...trials];
    updated[trialIndex] = {
      ...updated[trialIndex],
      designType: layoutData.designType,
      replications: layoutData.replications,
      plotSize: layoutData.plotSize,
      rowSpacing: layoutData.rowSpacing,
      totalPlots: layoutData.totalPlots
    };
    setTrials(updated);
    setIsEditingLayout(false);
  };

  const handleLayoutCancel = () => {
    setLayoutData({
      designType: trial?.designType || '',
      replications: trial?.replications || 0,
      plotSize: {
        width: trial?.plotSize?.width || 0,
        length: trial?.plotSize?.length || 0,
        unit: trial?.plotSize?.unit || 'm'
      },
      rowSpacing: trial?.rowSpacing || 0,
      totalPlots: trial?.totalPlots || 0
    });
    setIsEditingLayout(false);
  };

  // Treatment handlers
  const handleAddTreatment = () => {
    setEditingTreatment({ name: '', description: '', application: '', rate: '', timing: '' });
    setShowTreatmentDialog(true);
  };
  const handleEditTreatment = (t) => {
    setEditingTreatment({ ...t });
    setShowTreatmentDialog(true);
  };
  const handleDeleteTreatment = (idx) => {
    const updated = [...trials];
    updated[trialIndex].treatments.splice(idx, 1);
    setTrials(updated);
  };
  const handleSaveTreatment = () => {
    const updated = [...trials];
    if (editingTreatment._editIdx !== undefined) {
      updated[trialIndex].treatments[editingTreatment._editIdx] = { ...editingTreatment };
    } else {
      updated[trialIndex].treatments.push({ ...editingTreatment });
    }
    setTrials(updated);
    setShowTreatmentDialog(false);
    setEditingTreatment(null);
  };

  // Variable handlers
  const handleAddVariable = () => {
    setEditingVariable({ name: '', unit: '', frequency: '', description: '' });
    setShowVariableDialog(true);
  };
  const handleEditVariable = (v) => {
    setEditingVariable({ ...v });
    setShowVariableDialog(true);
  };
  const handleDeleteVariable = (idx) => {
    const updated = [...trials];
    updated[trialIndex].variables.splice(idx, 1);
    setTrials(updated);
  };
  const handleSaveVariable = () => {
    const updated = [...trials];
    if (editingVariable._editIdx !== undefined) {
      updated[trialIndex].variables[editingVariable._editIdx] = { ...editingVariable };
    } else {
      updated[trialIndex].variables.push({ ...editingVariable });
    }
    setTrials(updated);
    setShowVariableDialog(false);
    setEditingVariable(null);
  };

  // Status update handler
  const handleStatusChange = (newStatus) => {
    const updated = [...trials];
    updated[trialIndex].status = newStatus;
    setTrials(updated);
  };

  if (!id) {
    // Show all trials
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold mb-6">All Trials</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trials.map(trial => (
            <Card key={trial.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{trial.name}</CardTitle>
                <CardDescription>Code: {trial.trial_code} | Crop: {trial.crop} | Season: {trial.season}</CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant={trial.status === 'completed' ? 'success' : trial.status === 'cancelled' ? 'destructive' : 'default'}>
                    {trial.status.charAt(0).toUpperCase() + trial.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" onClick={() => navigate(`/agronomist/field-trials/${trial.id}/treatments`)}>
                  Manage Treatments & Variables
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!trial) {
    return <div className="p-8 text-red-600">Trial not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <Button variant="ghost" onClick={() => navigate('/agronomist/field-trials/treatments')} className="mb-4">Back to All Trials</Button>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{trial.name} – Treatments & Variables</CardTitle>
          <CardDescription>Manage all treatments and variables for this trial.</CardDescription>
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
          {/* Replications & Layout Section */}
          <div className="mb-6 p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg text-blue-800">📐 Replications & Layout</h3>
              {!isEditingLayout ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingLayout(true)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLayoutSave}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLayoutCancel}
                    className="flex items-center gap-1"
                  >
                    <Close className="h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            
            {!isEditingLayout ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Design Type</div>
                  <div className="text-lg font-semibold">{trial.designType}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Replications</div>
                  <div className="text-lg font-semibold">{trial.replications}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Plot Size</div>
                  <div className="text-lg font-semibold">{trial.plotSize.width} × {trial.plotSize.length} {trial.plotSize.unit}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Row Spacing</div>
                  <div className="text-lg font-semibold">{trial.rowSpacing} cm</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-600">Total Plots</div>
                  <div className="text-lg font-semibold">{trial.totalPlots}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="designType">Design Type</Label>
                    <Select
                      value={layoutData.designType}
                      onValueChange={(value) => setLayoutData({ ...layoutData, designType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select design type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DESIGN_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="replications">Replications</Label>
                    <Input
                      id="replications"
                      type="number"
                      min="1"
                      value={layoutData.replications}
                      onChange={(e) => setLayoutData({ ...layoutData, replications: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Plot Size</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    <div>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Width"
                        value={layoutData.plotSize.width}
                        onChange={(e) => setLayoutData({
                          ...layoutData,
                          plotSize: { ...layoutData.plotSize, width: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="Length"
                        value={layoutData.plotSize.length}
                        onChange={(e) => setLayoutData({
                          ...layoutData,
                          plotSize: { ...layoutData.plotSize, length: parseFloat(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div>
                      <Select
                        value={layoutData.plotSize.unit}
                        onValueChange={(value) => setLayoutData({
                          ...layoutData,
                          plotSize: { ...layoutData.plotSize, unit: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="ft">ft</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rowSpacing">Row Spacing (cm)</Label>
                    <Input
                      id="rowSpacing"
                      type="number"
                      step="0.1"
                      value={layoutData.rowSpacing}
                      onChange={(e) => setLayoutData({ ...layoutData, rowSpacing: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalPlots">Total Plots</Label>
                    <Input
                      id="totalPlots"
                      type="number"
                      min="1"
                      value={layoutData.totalPlots}
                      onChange={(e) => setLayoutData({ ...layoutData, totalPlots: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Treatments</h3>
              <Button onClick={handleAddTreatment}>Add Treatment</Button>
            </div>
            <table className="min-w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Application</th>
                  <th className="p-2 border">Rate</th>
                  <th className="p-2 border">Timing</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trial.treatments.map((t, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{t.name}</td>
                    <td className="p-2 border">{t.description}</td>
                    <td className="p-2 border">{t.application}</td>
                    <td className="p-2 border">{t.rate}</td>
                    <td className="p-2 border">{t.timing}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => { setEditingTreatment({ ...t, _editIdx: i }); setShowTreatmentDialog(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteTreatment(i)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Treatment Dialog */}
            <Dialog open={showTreatmentDialog} onOpenChange={setShowTreatmentDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTreatment && editingTreatment._editIdx !== undefined ? 'Edit Treatment' : 'Add Treatment'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Name</Label>
                  <Input value={editingTreatment?.name || ''} onChange={e => setEditingTreatment({ ...editingTreatment, name: e.target.value })} />
                  <Label>Description</Label>
                  <Input value={editingTreatment?.description || ''} onChange={e => setEditingTreatment({ ...editingTreatment, description: e.target.value })} />
                  <Label>Application</Label>
                  <Input value={editingTreatment?.application || ''} onChange={e => setEditingTreatment({ ...editingTreatment, application: e.target.value })} />
                  <Label>Rate</Label>
                  <Input value={editingTreatment?.rate || ''} onChange={e => setEditingTreatment({ ...editingTreatment, rate: e.target.value })} />
                  <Label>Timing</Label>
                  <Input value={editingTreatment?.timing || ''} onChange={e => setEditingTreatment({ ...editingTreatment, timing: e.target.value })} />
                  <Button onClick={handleSaveTreatment}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Variables</h3>
              <Button onClick={handleAddVariable}>Add Variable</Button>
            </div>
            <table className="min-w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Variable</th>
                  <th className="p-2 border">Unit</th>
                  <th className="p-2 border">Frequency</th>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trial.variables.map((v, i) => (
                  <tr key={i}>
                    <td className="p-2 border font-medium">{v.name}</td>
                    <td className="p-2 border">{v.unit}</td>
                    <td className="p-2 border">{v.frequency}</td>
                    <td className="p-2 border text-gray-700">{v.description}</td>
                    <td className="p-2 border">
                      <Button size="sm" variant="outline" onClick={() => { setEditingVariable({ ...v, _editIdx: i }); setShowVariableDialog(true); }}>Edit</Button>
                      <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDeleteVariable(i)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Variable Dialog */}
            <Dialog open={showVariableDialog} onOpenChange={setShowVariableDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingVariable && editingVariable._editIdx !== undefined ? 'Edit Variable' : 'Add Variable'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Label>Name</Label>
                  <Input value={editingVariable?.name || ''} onChange={e => setEditingVariable({ ...editingVariable, name: e.target.value })} />
                  <Label>Unit</Label>
                  <Input value={editingVariable?.unit || ''} onChange={e => setEditingVariable({ ...editingVariable, unit: e.target.value })} />
                  <Label>Frequency</Label>
                  <Input value={editingVariable?.frequency || ''} onChange={e => setEditingVariable({ ...editingVariable, frequency: e.target.value })} />
                  <Label>Description</Label>
                  <Textarea 
                    value={editingVariable?.description || ''} 
                    onChange={e => setEditingVariable({ ...editingVariable, description: e.target.value })}
                    placeholder="Explain what this variable measures and how it should be collected..."
                  />
                  <Button onClick={handleSaveVariable}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TreatmentVariableManager; 