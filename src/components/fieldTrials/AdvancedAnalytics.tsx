import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  LineChart, 
  Activity, 
  TrendingUp, 
  Download, 
  FileText, 
  Target, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';

const MOCK_TREATMENTS = [
  { id: '1', name: 'Control', color: '#6B7280' },
  { id: '2', name: 'Low N', color: '#10B981' },
  { id: '3', name: 'Medium N', color: '#3B82F6' },
  { id: '4', name: 'High N', color: '#EF4444' },
];

const MOCK_VARIABLES = [
  { id: '1', name: 'Plant Height', unit: 'cm', type: 'growth' },
  { id: '2', name: 'Yield', unit: 'kg/ha', type: 'yield' },
  { id: '3', name: 'Protein Content', unit: '%', type: 'quality' },
  { id: '4', name: 'Soil Moisture', unit: '%', type: 'environmental' },
];

const MOCK_ANOVA_RESULTS = [
  { variable: 'Plant Height', fValue: 12.45, pValue: 0.002, significant: true, degreesOfFreedom: 3 },
  { variable: 'Yield', fValue: 18.23, pValue: 0.001, significant: true, degreesOfFreedom: 3 },
  { variable: 'Protein Content', fValue: 2.15, pValue: 0.156, significant: false, degreesOfFreedom: 3 },
  { variable: 'Soil Moisture', fValue: 5.67, pValue: 0.023, significant: true, degreesOfFreedom: 3 },
];

const MOCK_TREATMENT_COMPARISONS = [
  { variable: 'Yield', treatment1: 'Control', treatment2: 'High N', difference: 1250, pValue: 0.001, significant: true },
  { variable: 'Yield', treatment1: 'Low N', treatment2: 'High N', difference: 850, pValue: 0.008, significant: true },
  { variable: 'Plant Height', treatment1: 'Control', treatment2: 'Medium N', difference: 15.2, pValue: 0.012, significant: true },
  { variable: 'Protein Content', treatment1: 'Low N', treatment2: 'High N', difference: 2.1, pValue: 0.234, significant: false },
];

const MOCK_CHART_DATA = {
  'Plant Height': {
    'Control': [25.5, 24.8, 26.1, 25.9],
    'Low N': [26.1, 25.9, 27.3, 27.1],
    'Medium N': [27.3, 27.1, 28.5, 28.2],
    'High N': [28.5, 28.2, 29.8, 29.5],
  },
  'Yield': {
    'Control': [3200, 3150, 3250, 3180],
    'Low N': [3800, 3750, 3850, 3820],
    'Medium N': [4200, 4180, 4250, 4220],
    'High N': [4450, 4420, 4480, 4450],
  }
};

const AdvancedAnalytics: React.FC = () => {
  const [selectedVariable, setSelectedVariable] = useState('2');
  const [chartType, setChartType] = useState('bar');
  const [selectedTreatments, setSelectedTreatments] = useState(['1', '2', '3', '4']);

  const getSignificanceIcon = (significant: boolean) => {
    return significant ? 
      <CheckCircle className="text-green-500" size={16} /> : 
      <XCircle className="text-red-500" size={16} />;
  };

  const getPValueColor = (pValue: number) => {
    if (pValue < 0.001) return 'text-red-600 font-bold';
    if (pValue < 0.01) return 'text-orange-600 font-bold';
    if (pValue < 0.05) return 'text-yellow-600 font-bold';
    return 'text-gray-600';
  };

  const renderMockChart = (variableName: string) => {
    const data = MOCK_CHART_DATA[variableName as keyof typeof MOCK_CHART_DATA];
    if (!data) return <div className="text-gray-500">No data available</div>;

    const treatments = Object.keys(data);
    const values = treatments.map(t => {
      const treatmentData = data[t as keyof typeof data];
      return treatmentData.reduce((a, b) => a + b, 0) / treatmentData.length;
    });

    return (
      <div className="h-64 flex items-end justify-center gap-4 p-4">
        {treatments.map((treatment, index) => {
          const treatmentInfo = MOCK_TREATMENTS.find(t => t.name === treatment);
          const height = (values[index] / Math.max(...values)) * 200;
          return (
            <div key={treatment} className="flex flex-col items-center">
              <div 
                className="w-12 rounded-t"
                style={{ 
                  height: `${height}px`, 
                  backgroundColor: treatmentInfo?.color,
                  minHeight: '20px'
                }}
              ></div>
              <div className="text-xs mt-2 text-center">
                <div className="font-medium">{treatment}</div>
                <div>{values[index].toFixed(1)}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-gray-600">Statistical analysis and data visualization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2" size={16} />
            Export Report
          </Button>
          <Button variant="outline">
            <FileText className="mr-2" size={16} />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium">Variable</label>
              <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_VARIABLES.map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Chart Type</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="box">Box Plot</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Treatments</label>
              <div className="flex gap-2 mt-1">
                {MOCK_TREATMENTS.map(t => (
                  <Badge 
                    key={t.id} 
                    variant={selectedTreatments.includes(t.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (selectedTreatments.includes(t.id)) {
                        setSelectedTreatments(prev => prev.filter(id => id !== t.id));
                      } else {
                        setSelectedTreatments(prev => [...prev, t.id]);
                      }
                    }}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="anova">ANOVA</TabsTrigger>
          <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="text-blue-600" />
                  {MOCK_VARIABLES.find(v => v.id === selectedVariable)?.name} by Treatment
                </CardTitle>
                <CardDescription>
                  Average values across treatments with standard error
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderMockChart(MOCK_VARIABLES.find(v => v.id === selectedVariable)?.name || '')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="text-green-600" />
                  Time Series Analysis
                </CardTitle>
                <CardDescription>
                  Temporal trends in {MOCK_VARIABLES.find(v => v.id === selectedVariable)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Time series chart placeholder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="anova" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ANOVA Results</CardTitle>
              <CardDescription>
                Analysis of variance for all measured variables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>F-Value</TableHead>
                    <TableHead>P-Value</TableHead>
                    <TableHead>Significant</TableHead>
                    <TableHead>DF</TableHead>
                    <TableHead>Effect Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_ANOVA_RESULTS.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{result.variable}</TableCell>
                      <TableCell>{result.fValue.toFixed(3)}</TableCell>
                      <TableCell className={getPValueColor(result.pValue)}>
                        {result.pValue.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSignificanceIcon(result.significant)}
                          <span>{result.significant ? 'Yes' : 'No'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{result.degreesOfFreedom}</TableCell>
                      <TableCell>
                        <Badge variant={result.significant ? "default" : "secondary"}>
                          {(result.fValue / (result.fValue + result.degreesOfFreedom)).toFixed(3)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparisons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Comparisons</CardTitle>
              <CardDescription>
                Pairwise comparisons with significance testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variable</TableHead>
                    <TableHead>Comparison</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>P-Value</TableHead>
                    <TableHead>Significant</TableHead>
                    <TableHead>Confidence Interval</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TREATMENT_COMPARISONS.map((comparison, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{comparison.variable}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{comparison.treatment1}</Badge>
                          <span>vs</span>
                          <Badge variant="outline">{comparison.treatment2}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>{comparison.difference}</TableCell>
                      <TableCell className={getPValueColor(comparison.pValue)}>
                        {comparison.pValue.toFixed(3)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSignificanceIcon(comparison.significant)}
                          <span>{comparison.significant ? 'Yes' : 'No'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          ±{(comparison.difference * 0.1).toFixed(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="text-purple-600" />
                  Correlation Matrix
                </CardTitle>
                <CardDescription>
                  Relationships between variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Correlation matrix placeholder
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="text-orange-600" />
                  Regression Analysis
                </CardTitle>
                <CardDescription>
                  Linear and non-linear relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Regression analysis placeholder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
