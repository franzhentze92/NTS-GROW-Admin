import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, FileText, Image as ImageIcon } from 'lucide-react';

// Mock data structure: trialId -> data
const mockTrials = {
  '1': {
    id: '1',
    name: 'Corn Yield Optimization Trial',
    code: 'CORN2024-01',
    variables: [
      { id: 'yield', name: 'Yield', type: 'numeric', unit: 'kg/ha', min: 0, max: 20000 },
      { id: 'brix', name: 'Brix', type: 'numeric', unit: '°Brix', min: 0, max: 30 },
      { id: 'disease', name: 'Disease Index', type: 'categorical', options: ['None', 'Mild', 'Moderate', 'Severe'] },
      { id: 'photo', name: 'Canopy Image', type: 'image' },
      { id: 'lodging', name: 'Lodging', type: 'boolean' },
    ],
    treatments: [
      { id: 'control', name: 'Control' },
      { id: 'biofert', name: 'Biofert A' },
    ],
    plots: [
      { id: 'plot1', name: 'Plot 1', treatment: 'control' },
      { id: 'plot2', name: 'Plot 2', treatment: 'biofert' },
      { id: 'plot3', name: 'Plot 3', treatment: 'control' },
    ],
    team: [
      { id: 1, name: 'Dr. Sarah Johnson' },
      { id: 2, name: 'Mike Chen' },
      { id: 3, name: 'Lisa Rodriguez' }
    ],
    entries: [
      { id: 1, plot: 'plot1', variable: 'yield', value: 12000, date: '2024-06-01', user: 'Mike Chen' },
      { id: 2, plot: 'plot2', variable: 'yield', value: 11500, date: '2024-06-01', user: 'Mike Chen' },
      { id: 3, plot: 'plot1', variable: 'brix', value: 14.2, date: '2024-06-01', user: 'Lisa Rodriguez' },
    ]
  },
  '2': {
    id: '2',
    name: 'Soybean Disease Resistance Study',
    code: 'SOY2024-01',
    variables: [
      { id: 'disease', name: 'Disease Index', type: 'categorical', options: ['None', 'Mild', 'Moderate', 'Severe'] },
      { id: 'yield', name: 'Yield', type: 'numeric', unit: 'kg/ha', min: 0, max: 8000 },
    ],
    treatments: [
      { id: 'control', name: 'Control' },
      { id: 'fungicide', name: 'Fungicide' },
    ],
    plots: [
      { id: 'plot1', name: 'Plot 1', treatment: 'control' },
      { id: 'plot2', name: 'Plot 2', treatment: 'fungicide' },
    ],
    team: [
      { id: 4, name: 'Dr. Robert Kim' },
      { id: 5, name: 'Emma Wilson' }
    ],
    entries: [
      { id: 1, plot: 'plot1', variable: 'disease', value: 'Mild', date: '2024-06-01', user: 'Emma Wilson' },
    ]
  }
};

export default function DataCollectionEntryPage() {
  const { id } = useParams();
  const trial = mockTrials[String(id)] || { name: 'Trial', code: '', variables: [], treatments: [], plots: [], team: [], entries: [] };
  const [selectedPlot, setSelectedPlot] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [entryValue, setEntryValue] = useState('');
  const [entryFile, setEntryFile] = useState(null);
  const [entryBool, setEntryBool] = useState(false);
  const [entryUser, setEntryUser] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [entryNotes, setEntryNotes] = useState('');

  // Find selected variable object
  const variable = trial.variables.find(v => v.id === selectedVariable);
  // Find selected plot object
  const plot = trial.plots.find(p => p.id === selectedPlot);

  // Filter previous entries for this trial/plot/variable
  const previousEntries = trial.entries.filter(e =>
    (!selectedPlot || e.plot === selectedPlot) &&
    (!selectedVariable || e.variable === selectedVariable)
  );

  // Handle dynamic value input
  const handleValueChange = (e) => {
    setEntryValue(e.target.value);
  };

  // Handle submit (mock)
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would save the entry to backend
    alert('Entry saved (mock)!');
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Trial context header */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{trial.name}</CardTitle>
          <CardDescription>
            <span className="mr-4">Code: {trial.code}</span>
            <span>Plots: {trial.plots.length}</span>
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Data Collection & Entry</CardTitle>
          <CardDescription>Enter and manage data for your field trial plots and variables.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Section 1: Select plot and variable (scoped to this trial) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Plot</Label>
              <Select value={selectedPlot} onValueChange={setSelectedPlot}>
                <SelectTrigger><SelectValue placeholder="Select plot" /></SelectTrigger>
                <SelectContent>{trial.plots.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({trial.treatments.find(t => t.id === p.treatment)?.name})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Variable</Label>
              <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                <SelectTrigger><SelectValue placeholder="Select variable" /></SelectTrigger>
                <SelectContent>{trial.variables.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Section 2: Dynamic entry form */}
          {selectedPlot && selectedVariable && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label>Value</Label>
                {variable?.type === 'numeric' && (
                  <Input
                    type="number"
                    value={entryValue}
                    onChange={handleValueChange}
                    min={variable.min}
                    max={variable.max}
                    step="any"
                    placeholder={`Enter value (${variable.unit})`}
                  />
                )}
                {variable?.type === 'categorical' && (
                  <Select value={entryValue} onValueChange={setEntryValue}>
                    <SelectTrigger><SelectValue placeholder="Select value" /></SelectTrigger>
                    <SelectContent>{variable.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                  </Select>
                )}
                {variable?.type === 'boolean' && (
                  <div className="flex items-center gap-2">
                    <Switch checked={entryBool} onCheckedChange={setEntryBool} />
                    <span>{entryBool ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {variable?.type === 'image' && (
                  <div className="flex flex-col gap-2">
                    <Input type="file" accept="image/*" onChange={e => setEntryFile(e.target.files?.[0] || null)} />
                    {entryFile && <div className="flex items-center gap-2 text-xs"><ImageIcon className="w-4 h-4" />{entryFile.name}</div>}
                  </div>
                )}
                {/* Show variable details/help */}
                <div className="text-xs text-gray-500 mt-1">
                  {variable?.unit && <span className="mr-2">Unit: {variable.unit}</span>}
                  {variable?.min !== undefined && variable?.max !== undefined && <span>Range: {variable.min}–{variable.max}</span>}
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={entryDate} onChange={e => setEntryDate(e.target.value)} />
              </div>
              <div>
                <Label>Responsible User</Label>
                <Select value={entryUser} onValueChange={setEntryUser}>
                  <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                  <SelectContent>{trial.team.map(u => <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes (optional)</Label>
                <Textarea value={entryNotes} onChange={e => setEntryNotes(e.target.value)} placeholder="Add any notes or comments" rows={2} />
              </div>
              <Button type="submit">Save Entry</Button>
            </form>
          )}

          {/* Section 3: Previous entries (scoped to this trial) */}
          <div>
            <Label className="mb-2">Previous Entries</Label>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Plot</th>
                    <th className="p-2 border">Treatment</th>
                    <th className="p-2 border">Variable</th>
                    <th className="p-2 border">Value</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">User</th>
                  </tr>
                </thead>
                <tbody>
                  {previousEntries.length === 0 && (
                    <tr><td colSpan={6} className="text-center p-2">No entries yet.</td></tr>
                  )}
                  {previousEntries.map(e => {
                    const plotObj = trial.plots.find(p => p.id === e.plot);
                    const treatmentName = trial.treatments.find(t => t.id === plotObj?.treatment)?.name || '';
                    const variableObj = trial.variables.find(v => v.id === e.variable);
                    return (
                      <tr key={e.id}>
                        <td className="p-2 border">{plotObj?.name}</td>
                        <td className="p-2 border">{treatmentName}</td>
                        <td className="p-2 border">{variableObj?.name}</td>
                        <td className="p-2 border">{e.value}</td>
                        <td className="p-2 border">{e.date}</td>
                        <td className="p-2 border">{e.user}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 