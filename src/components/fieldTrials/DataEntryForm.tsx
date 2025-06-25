import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Save, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Target,
  Leaf,
  Droplets,
  Thermometer,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Phone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Measurement {
  id: string;
  plotId: string;
  variableId: string;
  date: string;
  value: number;
  unit: string;
  notes?: string;
  collector?: string;
}

interface Variable {
  id: string;
  name: string;
  unit: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  icon: string;
  type: string;
}

interface Plot {
  id: string;
  plotNumber: string;
  treatmentId: string;
  treatmentName: string;
  treatmentColor: string;
}

interface DataEntryFormProps {
  trialData?: any;
  onSave?: (measurements: Measurement[]) => void;
  onExport?: (data: any) => void;
}

const MOCK_PLOTS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];
const MOCK_VARIABLES = [
  { id: '1', name: 'Plant Height', unit: 'cm', type: 'growth' },
  { id: '2', name: 'Yield', unit: 'kg/ha', type: 'yield' },
  { id: '3', name: 'Protein Content', unit: '%', type: 'quality' },
  { id: '4', name: 'Soil Moisture', unit: '%', type: 'environmental' },
];

const MOCK_DATA = {
  '2024-03-15': {
    'A1': { '1': 25.5, '2': null, '3': null, '4': 18.2 },
    'A2': { '1': 24.8, '2': null, '3': null, '4': 17.9 },
    'B1': { '1': 26.1, '2': null, '3': null, '4': 19.1 },
    'B2': { '1': 25.9, '2': null, '3': null, '4': 18.8 },
    'C1': { '1': 27.3, '2': null, '3': null, '4': 20.2 },
    'C2': { '1': 27.1, '2': null, '3': null, '4': 19.9 },
    'D1': { '1': 28.5, '2': null, '3': null, '4': 21.1 },
    'D2': { '1': 28.2, '2': null, '3': null, '4': 20.8 },
  },
  '2024-03-22': {
    'A1': { '1': 32.1, '2': null, '3': null, '4': 16.8 },
    'A2': { '1': 31.8, '2': null, '3': null, '4': 16.5 },
    'B1': { '1': 33.2, '2': null, '3': null, '4': 17.2 },
    'B2': { '1': 32.9, '2': null, '3': null, '4': 16.9 },
    'C1': { '1': 34.5, '2': null, '3': null, '4': 18.1 },
    'C2': { '1': 34.2, '2': null, '3': null, '4': 17.8 },
    'D1': { '1': 35.8, '2': null, '3': null, '4': 19.2 },
    'D2': { '1': 35.5, '2': null, '3': null, '4': 18.9 },
  }
};

const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  trialData = {}, 
  onSave = () => {}, 
  onExport = () => {} 
}) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2024-03-15');
  const [selectedVariable, setSelectedVariable] = useState<string>('1');
  const [isEditing, setIsEditing] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [data, setData] = useState(MOCK_DATA);
  const [entryMode, setEntryMode] = useState<'single' | 'bulk'>('single');
  const [validationErrors, setValidationErrors] = useState<any>({});

  // Mock variables
  const variables: Variable[] = [
    { id: '1', name: 'Plant Height', unit: 'cm', description: 'Average plant height per plot', icon: 'Leaf', type: 'growth' },
    { id: '2', name: 'Yield', unit: 'kg/ha', description: 'Grain yield per hectare', icon: 'Target', type: 'yield' },
    { id: '3', name: 'Soil Moisture', unit: '%', description: 'Soil moisture content at 20cm depth', icon: 'Droplets', type: 'environmental' },
    { id: '4', name: 'Temperature', unit: '°C', description: 'Air temperature at 2m height', icon: 'Thermometer', type: 'environmental' },
    { id: '5', name: 'Protein Content', unit: '%', description: 'Protein content in grain', icon: 'Target', type: 'quality' },
    { id: '6', name: 'Leaf Area Index', unit: 'm²/m²', description: 'Leaf area per ground area', icon: 'Leaf', type: 'growth' },
  ];

  const getVariableIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'Leaf': Leaf,
      'Target': Target,
      'Droplets': Droplets,
      'Thermometer': Thermometer,
    };
    const IconComponent = iconMap[iconName] || Target;
    return <IconComponent className="h-4 w-4" />;
  };

  const addMeasurement = () => {
    if (!selectedDate || !selectedVariable) return;

    const newMeasurement: Measurement = {
      id: `measurement-${Date.now()}`,
      plotId: '',
      variableId: selectedVariable,
      date: selectedDate,
      value: 0,
      unit: variables.find(v => v.id === selectedVariable)?.unit || '',
      notes: '',
      collector: 'Current User'
    };

    setMeasurements([...measurements, newMeasurement]);
    setSelectedDate('');
    setSelectedVariable('');
  };

  const updateMeasurement = (id: string, field: keyof Measurement, value: any) => {
    setMeasurements(measurements.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const startEditing = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (editingMeasurement) {
      setMeasurements(measurements.map(m => 
        m.id === editingMeasurement.id ? editingMeasurement : m
      ));
    }
    setIsEditing(false);
    setEditingMeasurement(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingMeasurement(null);
  };

  const handleSave = () => {
    onSave(measurements);
  };

  const handleExport = () => {
    const exportData = {
      trialName: trialData.name,
      exportDate: new Date().toISOString(),
      measurements,
      variables,
      plots: trialData.plots
    };
    onExport(exportData);
  };

  const getMeasurementsByDate = (date: string) => {
    return measurements.filter(m => m.date === date);
  };

  const getUniqueDates = () => {
    return [...new Set(measurements.map(m => m.date))].sort();
  };

  const validateData = (value: any, variableId: string) => {
    const variable = variables.find(v => v.id === variableId);
    if (!variable) return true;
    
    if (value === null || value === '') return true; // Allow empty values
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return false;
    
    // Basic validation rules
    switch (variable.name) {
      case 'Plant Height':
        return numValue >= 0 && numValue <= 500;
      case 'Yield':
        return numValue >= 0 && numValue <= 20000;
      case 'Protein Content':
        return numValue >= 0 && numValue <= 100;
      case 'Soil Moisture':
        return numValue >= 0 && numValue <= 100;
      default:
        return true;
    }
  };

  const handleDataChange = (plot: string, variableId: string, value: string) => {
    const newData = { ...data };
    if (!newData[selectedDate]) newData[selectedDate] = {};
    if (!newData[selectedDate][plot]) newData[selectedDate][plot] = {};
    
    newData[selectedDate][plot][variableId] = value === '' ? null : parseFloat(value);
    setData(newData);

    // Validate
    const isValid = validateData(value, variableId);
    setValidationErrors(prev => ({
      ...prev,
      [`${plot}-${variableId}`]: !isValid
    }));
  };

  const getDataQuality = () => {
    const totalEntries = MOCK_PLOTS.length * MOCK_VARIABLES.length;
    const filledEntries = MOCK_PLOTS.reduce((total, plot) => {
      return total + MOCK_VARIABLES.filter(v => 
        data[selectedDate]?.[plot]?.[v.id] !== null && data[selectedDate]?.[plot]?.[v.id] !== undefined
      ).length;
    }, 0);
    return (filledEntries / totalEntries) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Header with Data Quality */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Entry</h2>
          <p className="text-gray-600">Enter measurement data for your field trial</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Data Quality</div>
            <div className="text-lg font-bold">{getDataQuality().toFixed(1)}%</div>
          </div>
          <Progress value={getDataQuality()} className="w-24" />
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <Label>Date</Label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={e => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div>
              <Label>Variable</Label>
              <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variables.map((variable) => (
                    <SelectItem key={variable.id} value={variable.id}>
                      <div className="flex items-center gap-2">
                        {getVariableIcon(variable.icon)}
                        {variable.name} ({variable.unit})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Entry Mode</Label>
              <div className="flex gap-2 mt-1">
                <Button 
                  variant={entryMode === 'single' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setEntryMode('single')}
                >
                  Single
                </Button>
                <Button 
                  variant={entryMode === 'bulk' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setEntryMode('bulk')}
                >
                  Bulk
                </Button>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="mr-1" size={16} />
                Import CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-1" size={16} />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="mr-1" size={16} />
                Mobile Entry
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Save className="mr-1" size={16} />
                Save Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Entry Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getVariableIcon(variables.find(v => v.id === selectedVariable)?.icon || '')}
            {variables.find(v => v.id === selectedVariable)?.name} 
            ({variables.find(v => v.id === selectedVariable)?.unit})
          </CardTitle>
          <CardDescription>
            Enter data for {selectedDate} - {entryMode === 'single' ? 'Single variable entry' : 'Bulk entry for all variables'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plot</TableHead>
                <TableHead>Treatment</TableHead>
                {entryMode === 'bulk' ? variables.map(v => (
                  <TableHead key={v.id} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getVariableIcon(v.icon)}
                      {v.name}
                    </div>
                  </TableHead>
                )) : (
                  <TableHead className="text-center">Value</TableHead>
                )}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PLOTS.map(plot => (
                <TableRow key={plot}>
                  <TableCell className="font-medium">{plot}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plot.startsWith('A') ? 'Control' : 
                       plot.startsWith('B') ? 'Low N' :
                       plot.startsWith('C') ? 'Medium N' : 'High N'}
                    </Badge>
                  </TableCell>
                  {entryMode === 'bulk' ? variables.map(variable => (
                    <TableCell key={variable.id} className="text-center">
                      <Input
                        type="number"
                        value={data[selectedDate]?.[plot]?.[variable.id] || ''}
                        onChange={e => handleDataChange(plot, variable.id, e.target.value)}
                        className={`w-20 text-center ${validationErrors[`${plot}-${variable.id}`] ? 'border-red-500' : ''}`}
                        placeholder={variable.unit}
                      />
                    </TableCell>
                  )) : (
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        value={data[selectedDate]?.[plot]?.[selectedVariable] || ''}
                        onChange={e => handleDataChange(plot, selectedVariable, e.target.value)}
                        className={`w-20 text-center ${validationErrors[`${plot}-${selectedVariable}`] ? 'border-red-500' : ''}`}
                        placeholder={variables.find(v => v.id === selectedVariable)?.unit}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    {validationErrors[`${plot}-${selectedVariable}`] ? (
                      <AlertCircle className="text-red-500" size={16} />
                    ) : data[selectedDate]?.[plot]?.[selectedVariable] ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Data Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
          <CardDescription>Quick overview of entered data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {variables.map(variable => {
              const values = MOCK_PLOTS.map(plot => data[selectedDate]?.[plot]?.[variable.id]).filter(v => v !== null && v !== undefined);
              const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              const min = values.length > 0 ? Math.min(...values) : 0;
              const max = values.length > 0 ? Math.max(...values) : 0;
              
              return (
                <div key={variable.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getVariableIcon(variable.icon)}
                    <span className="font-medium">{variable.name}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>Avg: {avg.toFixed(1)} {variable.unit}</div>
                    <div>Min: {min.toFixed(1)} {variable.unit}</div>
                    <div>Max: {max.toFixed(1)} {variable.unit}</div>
                    <div>Count: {values.length}/{MOCK_PLOTS.length}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataEntryForm;
