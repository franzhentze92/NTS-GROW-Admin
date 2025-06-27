import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FileText, Edit, Save, X as Close } from 'lucide-react';

const applicationMethods = ['Soil', 'Foliar', 'Drip', 'Broadcast'];
const timingOptions = ['Pre-sowing', 'V4 stage', 'At planting', 'Custom'];
const units = ['kg/ha', 'L/ha', 'cm', '%', '°Brix'];
const frequencyOptions = ['Weekly', 'Monthly', 'At harvest', 'Custom'];
const dataTypes = ['Numeric', 'Categorical', 'Boolean', 'Image-based'];
const designTypes = ['RCBD', 'Split-Plot', 'Latin Square', 'Factorial', 'Custom'];
const mockProducts = ['Biofert A', 'Urea', 'Compost', 'Custom'];
const mockTeam = [
  { id: 1, name: 'Dr. Sarah Johnson' },
  { id: 2, name: 'Mike Chen' },
  { id: 3, name: 'Lisa Rodriguez' }
];

// Shared mockTrials object (should be imported from a central file in a real app)
const mockTrials = {
  5: {
    id: 5,
    name: 'Nitrogen Rate Trial – Corn 2025',
    status: 'ongoing',
    trial_code: 'N-CORN-2025',
    category: 'Fertility',
    location: 'Demo Farm Alpha',
    crop: 'Corn',
    season: 'Wet 2025',
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
      { name: 'Control', application: 'Soil', rate: '0 kg N/ha', timing: 'Pre-sowing' },
      { name: 'Low N', application: 'Soil', rate: '60 kg N/ha', timing: 'Pre-sowing' },
      { name: 'Medium N', application: 'Soil', rate: '120 kg N/ha', timing: 'Pre-sowing' },
      { name: 'High N', application: 'Soil', rate: '180 kg N/ha', timing: 'Pre-sowing' }
    ],
    replications: 3,
    designType: 'RCBD',
    plotSize: { width: 3, length: 5, unit: 'm' },
    rowSpacing: 75, // cm
    totalPlots: 12
  }
};

export default function VariableTreatmentDesignForm() {
  const { id } = useParams();
  const trial = mockTrials[String(id)] || { name: 'Trial', variables: [], treatments: [], replications: 0, designType: '', plotSize: {}, rowSpacing: '', totalPlots: 0 };

  // State for editing replications & layout
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [layoutData, setLayoutData] = useState({
    designType: trial.designType || '',
    replications: trial.replications || 0,
    plotSize: {
      width: trial.plotSize?.width || 0,
      length: trial.plotSize?.length || 0,
      unit: trial.plotSize?.unit || 'm'
    },
    rowSpacing: trial.rowSpacing || 0,
    totalPlots: trial.totalPlots || 0
  });

  const handleLayoutSave = () => {
    // In a real app, this would update the backend
    console.log('Saving layout data:', layoutData);
    setIsEditingLayout(false);
  };

  const handleLayoutCancel = () => {
    setLayoutData({
      designType: trial.designType || '',
      replications: trial.replications || 0,
      plotSize: {
        width: trial.plotSize?.width || 0,
        length: trial.plotSize?.length || 0,
        unit: trial.plotSize?.unit || 'm'
      },
      rowSpacing: trial.rowSpacing || 0,
      totalPlots: trial.totalPlots || 0
    });
    setIsEditingLayout(false);
  };

  // Display all Section 2 data at the top
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{trial.name} – Variable & Treatment Design</CardTitle>
          <CardDescription>All treatments, variables, and replications for this trial.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Replications & Layout Section - Moved to top for prominence */}
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
                        {designTypes.map((type) => (
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

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Treatments</h3>
            <table className="min-w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Application</th>
                  <th className="p-2 border">Rate</th>
                  <th className="p-2 border">Timing</th>
                </tr>
              </thead>
              <tbody>
                {trial.treatments.map((t, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{t.name}</td>
                    <td className="p-2 border">{t.application}</td>
                    <td className="p-2 border">{t.rate}</td>
                    <td className="p-2 border">{t.timing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Variables</h3>
            <table className="min-w-full text-sm border mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Variable</th>
                  <th className="p-2 border">Unit</th>
                  <th className="p-2 border">Frequency</th>
                  <th className="p-2 border">Description</th>
                </tr>
              </thead>
              <tbody>
                {trial.variables.map((v, i) => (
                  <tr key={i}>
                    <td className="p-2 border font-medium">{v.name}</td>
                    <td className="p-2 border">{v.unit}</td>
                    <td className="p-2 border">{v.frequency}</td>
                    <td className="p-2 border text-gray-700">{v.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* ...rest of the form for editing/adding if needed... */}
    </div>
  );
} 