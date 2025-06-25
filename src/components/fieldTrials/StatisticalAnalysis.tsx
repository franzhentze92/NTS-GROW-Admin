import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Eye,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface StatisticalResult {
  variable: string;
  testType: 'anova' | 'ttest' | 'correlation';
  fValue?: number;
  tValue?: number;
  pValue: number;
  significant: boolean;
  degreesOfFreedom?: number;
  effectSize?: number;
  confidenceInterval?: [number, number];
}

interface TreatmentComparison {
  variable: string;
  treatment1: string;
  treatment2: string;
  mean1: number;
  mean2: number;
  difference: number;
  standardError: number;
  tValue: number;
  pValue: number;
  significant: boolean;
  effectSize: number;
}

interface ChartData {
  type: 'bar' | 'line' | 'box' | 'scatter';
  title: string;
  data: any;
  options: any;
}

interface StatisticalAnalysisProps {
  trialData?: any;
  onExport?: (data: any) => void;
}

const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ 
  trialData = {}, 
  onExport = () => {} 
}) => {
  const [selectedVariable, setSelectedVariable] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<StatisticalResult[]>([]);
  const [treatmentComparisons, setTreatmentComparisons] = useState<TreatmentComparison[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock statistical analysis functions
  const performANOVA = (data: any, variable: string): StatisticalResult => {
    // Simulate ANOVA calculation
    const fValue = Math.random() * 20 + 1;
    const pValue = Math.random();
    const significant = pValue < 0.05;
    
    return {
      variable,
      testType: 'anova',
      fValue,
      pValue,
      significant,
      degreesOfFreedom: 3,
      effectSize: Math.random() * 0.8 + 0.2
    };
  };

  const performTTest = (data: any, variable: string, treatment1: string, treatment2: string): TreatmentComparison => {
    // Simulate t-test calculation
    const mean1 = Math.random() * 100 + 50;
    const mean2 = Math.random() * 100 + 50;
    const difference = mean1 - mean2;
    const tValue = Math.random() * 5 + 1;
    const pValue = Math.random();
    const significant = pValue < 0.05;
    
    return {
      variable,
      treatment1,
      treatment2,
      mean1,
      mean2,
      difference,
      standardError: Math.abs(difference) / tValue,
      tValue,
      pValue,
      significant,
      effectSize: Math.abs(difference) / 20
    };
  };

  const runAnalysis = async () => {
    if (!selectedVariable) return;
    
    setIsAnalyzing(true);
    
    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Perform ANOVA
    const anovaResult = performANOVA(trialData, selectedVariable);
    
    // Perform pairwise comparisons
    const comparisons: TreatmentComparison[] = [];
    const treatments = trialData.treatments || [];
    
    for (let i = 0; i < treatments.length; i++) {
      for (let j = i + 1; j < treatments.length; j++) {
        const comparison = performTTest(
          trialData, 
          selectedVariable, 
          treatments[i].name, 
          treatments[j].name
        );
        comparisons.push(comparison);
      }
    }
    
    setAnalysisResults([anovaResult]);
    setTreatmentComparisons(comparisons);
    setIsAnalyzing(false);
  };

  const generateCharts = () => {
    const newCharts: ChartData[] = [
      {
        type: 'bar',
        title: `${selectedVariable} by Treatment`,
        data: {
          labels: trialData.treatments?.map((t: any) => t.name) || [],
          datasets: [{
            label: selectedVariable,
            data: trialData.treatments?.map(() => Math.random() * 100 + 50) || [],
            backgroundColor: trialData.treatments?.map((t: any) => t.color) || []
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      },
      {
        type: 'box',
        title: `${selectedVariable} Distribution`,
        data: {
          labels: trialData.treatments?.map((t: any) => t.name) || [],
          datasets: trialData.treatments?.map((t: any) => ({
            label: t.name,
            data: Array.from({ length: 20 }, () => Math.random() * 100 + 50),
            backgroundColor: t.color + '20',
            borderColor: t.color
          })) || []
        },
        options: {
          responsive: true
        }
      }
    ];
    
    setCharts(newCharts);
  };

  useEffect(() => {
    if (selectedVariable) {
      generateCharts();
    }
  }, [selectedVariable]);

  const getSignificanceColor = (significant: boolean) => {
    return significant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getSignificanceIcon = (significant: boolean) => {
    return significant ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Statistical Analysis</CardTitle>
          <CardDescription>
            Perform statistical tests to determine treatment effects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Variable</label>
              <Select value={selectedVariable} onValueChange={setSelectedVariable}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose a variable to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {trialData.measurements?.map((measurement: any) => (
                    <SelectItem key={measurement.id} value={measurement.name}>
                      {measurement.name} ({measurement.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={runAnalysis} 
              disabled={!selectedVariable || isAnalyzing}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button variant="outline" onClick={() => onExport({ analysisResults, treatmentComparisons })}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Tabs defaultValue="anova" className="space-y-6">
          <TabsList>
            <TabsTrigger value="anova">ANOVA Results</TabsTrigger>
            <TabsTrigger value="comparisons">Treatment Comparisons</TabsTrigger>
            <TabsTrigger value="charts">Visualizations</TabsTrigger>
            <TabsTrigger value="summary">Summary Report</TabsTrigger>
          </TabsList>

          <TabsContent value="anova" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ANOVA Results</CardTitle>
                <CardDescription>
                  Analysis of Variance results for {selectedVariable}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variable</TableHead>
                      <TableHead>F-Value</TableHead>
                      <TableHead>P-Value</TableHead>
                      <TableHead>Significance</TableHead>
                      <TableHead>Effect Size</TableHead>
                      <TableHead>DF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisResults.map((result) => (
                      <TableRow key={result.variable}>
                        <TableCell className="font-medium">{result.variable}</TableCell>
                        <TableCell>{result.fValue?.toFixed(3)}</TableCell>
                        <TableCell>{result.pValue.toFixed(4)}</TableCell>
                        <TableCell>
                          <Badge className={getSignificanceColor(result.significant)}>
                            <div className="flex items-center gap-1">
                              {getSignificanceIcon(result.significant)}
                              {result.significant ? 'Significant' : 'Not Significant'}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{result.effectSize?.toFixed(3)}</TableCell>
                        <TableCell>{result.degreesOfFreedom}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparisons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Comparisons</CardTitle>
                <CardDescription>
                  Pairwise comparisons between treatments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Comparison</TableHead>
                      <TableHead>Mean Difference</TableHead>
                      <TableHead>Standard Error</TableHead>
                      <TableHead>T-Value</TableHead>
                      <TableHead>P-Value</TableHead>
                      <TableHead>Significance</TableHead>
                      <TableHead>Effect Size</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatmentComparisons.map((comparison, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {comparison.treatment1} vs {comparison.treatment2}
                        </TableCell>
                        <TableCell>{comparison.difference.toFixed(2)}</TableCell>
                        <TableCell>{comparison.standardError.toFixed(3)}</TableCell>
                        <TableCell>{comparison.tValue.toFixed(3)}</TableCell>
                        <TableCell>{comparison.pValue.toFixed(4)}</TableCell>
                        <TableCell>
                          <Badge className={getSignificanceColor(comparison.significant)}>
                            <div className="flex items-center gap-1">
                              {getSignificanceIcon(comparison.significant)}
                              {comparison.significant ? 'Yes' : 'No'}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>{comparison.effectSize.toFixed(3)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map((chart, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{chart.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                        <p>Chart visualization would be rendered here</p>
                        <p className="text-sm">Using Chart.js or similar library</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Statistical Summary Report</CardTitle>
                <CardDescription>
                  Comprehensive summary of statistical findings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResults.length}
                    </div>
                    <div className="text-sm text-gray-600">Tests Performed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {treatmentComparisons.filter(c => c.significant).length}
                    </div>
                    <div className="text-sm text-gray-600">Significant Differences</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {charts.length}
                    </div>
                    <div className="text-sm text-gray-600">Visualizations</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Key Findings</h3>
                  <ul className="space-y-2 text-sm">
                    {analysisResults.map((result) => (
                      <li key={result.variable} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong>{result.variable}:</strong> {result.significant 
                            ? `Significant differences found (p = ${result.pValue.toFixed(4)})` 
                            : `No significant differences found (p = ${result.pValue.toFixed(4)})`
                          }
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Recommendations</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Based on the statistical analysis, consider the following recommendations:
                    </p>
                    <ul className="mt-2 text-sm text-blue-700 space-y-1">
                      <li>• Focus on treatments showing significant differences</li>
                      <li>• Consider effect sizes when interpreting results</li>
                      <li>• Replicate significant findings in future trials</li>
                      <li>• Document all statistical procedures for publication</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default StatisticalAnalysis;
