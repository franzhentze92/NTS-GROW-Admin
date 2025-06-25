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
import { Plus, Edit, Trash2, Droplets, Thermometer, Leaf, Target, Calendar, Tag } from 'lucide-react';

const MOCK_TREATMENTS = [
  { id: '1', name: 'Control', description: 'No treatment applied', type: 'control', applicationRate: '', applicationMethod: '', color: '#6B7280', plots: ['A1', 'A2'] },
  { id: '2', name: 'Low N', description: 'Low nitrogen application', type: 'fertilizer', applicationRate: '50 kg/ha', applicationMethod: 'Broadcast', color: '#10B981', plots: ['B1', 'B2'] },
  { id: '3', name: 'Medium N', description: 'Medium nitrogen application', type: 'fertilizer', applicationRate: '100 kg/ha', applicationMethod: 'Broadcast', color: '#3B82F6', plots: ['C1', 'C2'] },
  { id: '4', name: 'High N', description: 'High nitrogen application', type: 'fertilizer', applicationRate: '150 kg/ha', applicationMethod: 'Broadcast', color: '#EF4444', plots: ['D1', 'D2'] },
];

const MOCK_VARIABLES = [
  { id: '1', name: 'Plant Height', unit: 'cm', frequency: 'Weekly', description: 'Average plant height per plot', type: 'growth', plots: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'] },
  { id: '2', name: 'Yield', unit: 'kg/ha', frequency: 'At harvest', description: 'Grain yield per hectare', type: 'yield', plots: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'] },
  { id: '3', name: 'Protein Content', unit: '%', frequency: 'At harvest', description: 'Protein content in grain', type: 'quality', plots: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'] },
  { id: '4', name: 'Soil Moisture', unit: '%', frequency: 'Daily', description: 'Soil moisture content at 20cm depth', type: 'environmental', plots: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'] },
];

const MOCK_PLOTS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];

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

const TreatmentVariableManager: React.FC = () => {
  const [treatments, setTreatments] = useState(MOCK_TREATMENTS);
  const [variables, setVariables] = useState(MOCK_VARIABLES);
  const [showTreatmentDialog, setShowTreatmentDialog] = useState(false);
  const [showVariableDialog, setShowVariableDialog] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<any>(null);
  const [editingVariable, setEditingVariable] = useState<any>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <Leaf className="text-green-600" />;
      case 'yield': return <Target className="text-orange-600" />;
      case 'quality': return <Tag className="text-blue-600" />;
      case 'environmental': return <Thermometer className="text-purple-600" />;
      default: return <Leaf className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="treatments" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Treatment Management</h2>
            <Button onClick={() => { setEditingTreatment(null); setShowTreatmentDialog(true); }}>
              <Plus className="mr-2" /> Add Treatment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {treatments.map(treatment => (
              <Card key={treatment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{treatment.name}</CardTitle>
                      <CardDescription>{treatment.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingTreatment(treatment); setShowTreatmentDialog(true); }}>
                        <Edit size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {}}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: treatment.color }}></span>
                    <Badge variant="outline">{treatment.type}</Badge>
                  </div>
                  {treatment.applicationRate && (
                    <div className="text-sm text-gray-600">
                      <Droplets className="inline mr-1" size={14} />
                      {treatment.applicationRate}
                    </div>
                  )}
                  {treatment.applicationMethod && (
                    <div className="text-sm text-gray-600">
                      <Target className="inline mr-1" size={14} />
                      {treatment.applicationMethod}
                    </div>
                  )}
                  <Separator />
                  <div className="text-sm">
                    <span className="font-medium">Assigned to:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {treatment.plots.map(plot => (
                        <Badge key={plot} variant="secondary" className="text-xs">{plot}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Variable Management</h2>
            <Button onClick={() => { setEditingVariable(null); setShowVariableDialog(true); }}>
              <Plus className="mr-2" /> Add Variable
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variables.map(variable => (
              <Card key={variable.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{variable.name}</CardTitle>
                      <CardDescription>{variable.description}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => { setEditingVariable(variable); setShowVariableDialog(true); }}>
                        <Edit size={16} />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => {}}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(variable.type)}
                    <Badge variant="outline">{variable.type}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Unit:</span> {variable.unit}
                  </div>
                  <div className="text-sm text-gray-600">
                    <Calendar className="inline mr-1" size={14} />
                    {variable.frequency}
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <span className="font-medium">Measured on:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {variable.plots.map(plot => (
                        <Badge key={plot} variant="secondary" className="text-xs">{plot}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Treatment Dialog */}
      <Dialog open={showTreatmentDialog} onOpenChange={setShowTreatmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTreatment ? 'Edit Treatment' : 'Add Treatment'}</DialogTitle>
            <DialogDescription>Configure treatment details and assignments.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Treatment name" defaultValue={editingTreatment?.name} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Treatment description" defaultValue={editingTreatment?.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select defaultValue={editingTreatment?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TREATMENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Color</Label>
                <Input type="color" defaultValue={editingTreatment?.color || '#3B82F6'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Application Rate</Label>
                <Input placeholder="e.g., 50 kg/ha" defaultValue={editingTreatment?.applicationRate} />
              </div>
              <div>
                <Label>Application Method</Label>
                <Input placeholder="e.g., Broadcast" defaultValue={editingTreatment?.applicationMethod} />
              </div>
            </div>
            <div>
              <Label>Assign to Plots</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOCK_PLOTS.map(plot => (
                  <Badge key={plot} variant="outline" className="cursor-pointer hover:bg-green-100">
                    {plot}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              {editingTreatment ? 'Update Treatment' : 'Add Treatment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Variable Dialog */}
      <Dialog open={showVariableDialog} onOpenChange={setShowVariableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVariable ? 'Edit Variable' : 'Add Variable'}</DialogTitle>
            <DialogDescription>Configure measurement variable details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="Variable name" defaultValue={editingVariable?.name} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Variable description" defaultValue={editingVariable?.description} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select defaultValue={editingVariable?.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIABLE_TYPES.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Unit</Label>
                <Input placeholder="e.g., cm, kg/ha" defaultValue={editingVariable?.unit} />
              </div>
            </div>
            <div>
              <Label>Measurement Frequency</Label>
              <Select defaultValue={editingVariable?.frequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Measure on Plots</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {MOCK_PLOTS.map(plot => (
                  <Badge key={plot} variant="outline" className="cursor-pointer hover:bg-green-100">
                    {plot}
                  </Badge>
                ))}
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              {editingVariable ? 'Update Variable' : 'Add Variable'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TreatmentVariableManager; 