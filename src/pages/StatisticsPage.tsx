import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart3, TrendingUp, Calculator, Target } from 'lucide-react';

// Mock data (should be replaced with real API data in production)
const mockTrials = [
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
      { name: 'Yield', unit: 'kg/ha', frequency: 'At harvest', description: 'Total grain yield per hectare at physiological maturity' },
      { name: 'Plant Height', unit: 'cm', frequency: 'Weekly', description: 'Height from soil surface to the tip of the highest leaf' },
      { name: 'Leaf Color', unit: 'Score 1–5', frequency: 'Biweekly', description: 'Visual assessment of leaf greenness using standardized color chart' },
      { name: 'Lodging', unit: '%', frequency: 'At harvest', description: 'Percentage of plants that have fallen over or are leaning significantly' }
    ],
    replications: 3,
    designType: 'RCBD',
    plotSize: { width: 3, length: 5, unit: 'm' },
    rowSpacing: 75,
    totalPlots: 12,
    // Mock statistical data
    statisticalData: {
      'Yield': {
        'Control': [6500, 6600, 6700],
        'Low N': [7200, 7300, 7400],
        'Medium N': [7800, 7900, 8000],
        'High N': [8000, 8100, 8200]
      },
      'Plant Height': {
        'Control': [45, 60, 80],
        'Low N': [48, 65, 85],
        'Medium N': [52, 70, 90],
        'High N': [54, 72, 92]
      },
      'Leaf Color': {
        'Control': [2, 3],
        'Low N': [3, 4],
        'Medium N': [4, 5],
        'High N': [4, 5]
      },
      'Lodging': {
        'Control': [10],
        'Low N': [8],
        'Medium N': [6],
        'High N': [5]
      }
    }
  }
];

// Statistical calculation functions
const calculateMean = (values: number[]) => values.reduce((sum, val) => sum + val, 0) / values.length;

const calculateStdDev = (values: number[]) => {
  const mean = calculateMean(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

const calculateSE = (values: number[]) => calculateStdDev(values) / Math.sqrt(values.length);

const calculateCV = (values: number[]) => (calculateStdDev(values) / calculateMean(values)) * 100;

const calculateMin = (values: number[]) => Math.min(...values);

const calculateMax = (values: number[]) => Math.max(...values);

const calculateRange = (values: number[]) => calculateMax(values) - calculateMin(values);

// ANOVA calculation (simplified)
const calculateANOVA = (data: Record<string, number[]>) => {
  const treatments = Object.keys(data);
  const allValues = treatments.flatMap(t => data[t]);
  const grandMean = calculateMean(allValues);
  
  // Between-group sum of squares
  const ssBetween = treatments.reduce((sum, treatment) => {
    const treatmentMean = calculateMean(data[treatment]);
    return sum + data[treatment].length * Math.pow(treatmentMean - grandMean, 2);
  }, 0);
  
  // Within-group sum of squares
  const ssWithin = treatments.reduce((sum, treatment) => {
    const treatmentMean = calculateMean(data[treatment]);
    return sum + data[treatment].reduce((tSum, val) => tSum + Math.pow(val - treatmentMean, 2), 0);
  }, 0);
  
  const dfBetween = treatments.length - 1;
  const dfWithin = allValues.length - treatments.length;
  
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  
  const fValue = msBetween / msWithin;
  const pValue = 1 / (1 + Math.exp(-fValue + 3)); // Simplified p-value calculation
  
  return {
    ssBetween,
    ssWithin,
    dfBetween,
    dfWithin,
    msBetween,
    msWithin,
    fValue,
    pValue,
    significant: pValue < 0.05
  };
};

const StatisticsPage = () => {
  const [selectedTrialId, setSelectedTrialId] = useState(mockTrials[0].id);
  const [selectedVariable, setSelectedVariable] = useState(mockTrials[0].variables[0].name);
  const trial = mockTrials.find(t => t.id === selectedTrialId);
  const variableData = trial.statisticalData[selectedVariable];

  const descriptiveStats = Object.entries(variableData).map(([treatment, values]) => ({
    treatment,
    n: values.length,
    mean: calculateMean(values),
    stdDev: calculateStdDev(values),
    se: calculateSE(values),
    cv: calculateCV(values),
    min: calculateMin(values),
    max: calculateMax(values),
    range: calculateRange(values)
  }));

  const anovaResults = calculateANOVA(variableData);

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Statistical Analysis Report</h1>
          <p className="text-muted-foreground">Comprehensive statistical analysis for field trial data</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      {/* Trial and Variable Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Trial</label>
          <Select value={String(selectedTrialId)} onValueChange={v => setSelectedTrialId(Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Select trial" />
            </SelectTrigger>
            <SelectContent>
              {mockTrials.map(trial => (
                <SelectItem key={trial.id} value={String(trial.id)}>{trial.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Select Variable</label>
          <Select value={selectedVariable} onValueChange={setSelectedVariable}>
            <SelectTrigger>
              <SelectValue placeholder="Select variable" />
            </SelectTrigger>
            <SelectContent>
              {trial.variables.map(variable => (
                <SelectItem key={variable.name} value={variable.name}>{variable.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trial Information */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Trial Code</div>
              <div className="text-lg font-semibold">{trial.trial_code}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Crop</div>
              <div className="text-lg font-semibold">{trial.crop}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Design</div>
              <div className="text-lg font-semibold">{trial.designType}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Replications</div>
              <div className="text-lg font-semibold">{trial.replications}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Analysis Tabs */}
      <Tabs defaultValue="descriptive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="descriptive">Descriptive Statistics</TabsTrigger>
          <TabsTrigger value="anova">ANOVA</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        {/* Descriptive Statistics */}
        <TabsContent value="descriptive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descriptive Statistics - {selectedVariable}</CardTitle>
              <CardDescription>Basic statistical measures for each treatment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Treatment</TableHead>
                      <TableHead>n</TableHead>
                      <TableHead>Mean</TableHead>
                      <TableHead>Std Dev</TableHead>
                      <TableHead>Std Error</TableHead>
                      <TableHead>CV (%)</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                      <TableHead>Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {descriptiveStats.map((stat) => (
                      <TableRow key={stat.treatment}>
                        <TableCell className="font-medium">{stat.treatment}</TableCell>
                        <TableCell>{stat.n}</TableCell>
                        <TableCell>{stat.mean.toFixed(2)}</TableCell>
                        <TableCell>{stat.stdDev.toFixed(2)}</TableCell>
                        <TableCell>{stat.se.toFixed(2)}</TableCell>
                        <TableCell>{stat.cv.toFixed(1)}</TableCell>
                        <TableCell>{stat.min.toFixed(2)}</TableCell>
                        <TableCell>{stat.max.toFixed(2)}</TableCell>
                        <TableCell>{stat.range.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Comparison with Error Bars</CardTitle>
              <CardDescription>Mean values with standard error bars</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={descriptiveStats.map(stat => ({
                  name: stat.treatment,
                  mean: stat.mean,
                  se: stat.se
                }))}
                bars={[{ dataKey: 'mean', fill: '#2e7d32', name: 'Mean' }]}
                xAxisDataKey="name"
                height={300}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANOVA Analysis */}
        <TabsContent value="anova" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis of Variance (ANOVA) - {selectedVariable}</CardTitle>
              <CardDescription>One-way ANOVA results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source of Variation</TableHead>
                      <TableHead>Sum of Squares</TableHead>
                      <TableHead>df</TableHead>
                      <TableHead>Mean Square</TableHead>
                      <TableHead>F-value</TableHead>
                      <TableHead>P-value</TableHead>
                      <TableHead>Significance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Between Treatments</TableCell>
                      <TableCell>{anovaResults.ssBetween.toFixed(2)}</TableCell>
                      <TableCell>{anovaResults.dfBetween}</TableCell>
                      <TableCell>{anovaResults.msBetween.toFixed(2)}</TableCell>
                      <TableCell>{anovaResults.fValue.toFixed(3)}</TableCell>
                      <TableCell>{anovaResults.pValue.toFixed(4)}</TableCell>
                      <TableCell>
                        <Badge variant={anovaResults.significant ? "default" : "secondary"}>
                          {anovaResults.significant ? "Significant" : "Not Significant"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Within Treatments (Error)</TableCell>
                      <TableCell>{anovaResults.ssWithin.toFixed(2)}</TableCell>
                      <TableCell>{anovaResults.dfWithin}</TableCell>
                      <TableCell>{anovaResults.msWithin.toFixed(2)}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell>{(anovaResults.ssBetween + anovaResults.ssWithin).toFixed(2)}</TableCell>
                      <TableCell>{anovaResults.dfBetween + anovaResults.dfWithin}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Significance Interpretation */}
          <Card>
            <CardHeader>
              <CardTitle>Statistical Significance Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant={anovaResults.significant ? "default" : "secondary"}>
                    {anovaResults.significant ? "Significant Difference" : "No Significant Difference"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    (α = 0.05)
                  </span>
                </div>
                <p className="text-sm">
                  {anovaResults.significant 
                    ? `The F-value of ${anovaResults.fValue.toFixed(3)} with a p-value of ${anovaResults.pValue.toFixed(4)} indicates that there are statistically significant differences between treatments at the 5% significance level.`
                    : `The F-value of ${anovaResults.fValue.toFixed(3)} with a p-value of ${anovaResults.pValue.toFixed(4)} indicates that there are no statistically significant differences between treatments at the 5% significance level.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Correlation Analysis */}
        <TabsContent value="correlation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
              <CardDescription>Correlation coefficients between variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variable</TableHead>
                      {trial.variables.map(v => <TableHead key={v.name}>{v.name}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trial.variables.map(variable1 => (
                      <TableRow key={variable1.name}>
                        <TableCell className="font-medium">{variable1.name}</TableCell>
                        {trial.variables.map(variable2 => {
                          if (variable1.name === variable2.name) {
                            return <TableCell key={variable2.name} className="bg-gray-50 font-bold">1.000</TableCell>;
                          }
                          // Mock correlation calculation
                          const correlation = Math.random() * 0.8 + 0.2;
                          const significance = correlation > 0.7 ? 'high' : correlation > 0.4 ? 'medium' : 'low';
                          return (
                            <TableCell key={variable2.name} className={correlation > 0.7 ? 'bg-green-50' : correlation > 0.4 ? 'bg-yellow-50' : 'bg-red-50'}>
                              <div>
                                <div className="font-medium">{correlation.toFixed(3)}</div>
                                <div className="text-xs text-muted-foreground">{significance}</div>
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistical Summary */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Findings */}
            <Card>
              <CardHeader>
                <CardTitle>Key Statistical Findings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Treatment Effects</h4>
                  <p className="text-sm text-muted-foreground">
                    {anovaResults.significant 
                      ? "Significant differences were observed between treatments."
                      : "No significant differences were observed between treatments."
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Variability</h4>
                  <p className="text-sm text-muted-foreground">
                    Coefficient of variation ranges from {Math.min(...descriptiveStats.map(s => s.cv)).toFixed(1)}% to {Math.max(...descriptiveStats.map(s => s.cv)).toFixed(1)}%.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Sample Size</h4>
                  <p className="text-sm text-muted-foreground">
                    Each treatment has {descriptiveStats[0].n} replications, providing adequate statistical power.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Further Analysis</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Consider post-hoc tests (Tukey, LSD) if ANOVA is significant</li>
                    <li>• Evaluate assumptions (normality, homogeneity of variance)</li>
                    <li>• Consider non-parametric alternatives if needed</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Reporting</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include effect sizes (η², Cohen's d)</li>
                    <li>• Report confidence intervals</li>
                    <li>• Document all statistical procedures used</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatisticsPage; 