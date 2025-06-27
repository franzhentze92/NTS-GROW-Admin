import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    // Mock variable data for analytics
    data: {
      'Yield': [
        { date: '2025-03-01', Control: 6500, 'Low N': 7200, 'Medium N': 7800, 'High N': 8000 },
        { date: '2025-03-15', Control: 6600, 'Low N': 7300, 'Medium N': 7900, 'High N': 8100 },
        { date: '2025-04-01', Control: 6700, 'Low N': 7400, 'Medium N': 8000, 'High N': 8200 }
      ],
      'Plant Height': [
        { date: '2025-02-01', Control: 45, 'Low N': 48, 'Medium N': 52, 'High N': 54 },
        { date: '2025-02-15', Control: 60, 'Low N': 65, 'Medium N': 70, 'High N': 72 },
        { date: '2025-03-01', Control: 80, 'Low N': 85, 'Medium N': 90, 'High N': 92 }
      ],
      'Leaf Color': [
        { date: '2025-02-01', Control: 2, 'Low N': 3, 'Medium N': 4, 'High N': 4 },
        { date: '2025-03-01', Control: 3, 'Low N': 4, 'Medium N': 5, 'High N': 5 }
      ],
      'Lodging': [
        { date: '2025-04-01', Control: 10, 'Low N': 8, 'Medium N': 6, 'High N': 5 }
      ]
    }
  }
];

const AnalysisPage = () => {
  const [selectedTrialId, setSelectedTrialId] = useState(mockTrials[0].id);
  const trial = mockTrials.find(t => t.id === selectedTrialId);

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold">Field Trials Analysis</h1>
        <div className="w-full md:w-72">
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Variables</CardTitle>
            <CardDescription>Total variables measured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trial.variables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Treatments</CardTitle>
            <CardDescription>Number of treatments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trial.treatments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Replications</CardTitle>
            <CardDescription>Replications per treatment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trial.replications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Design</CardTitle>
            <CardDescription>Experimental design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{trial.designType}</div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics for each variable */}
      <div className="space-y-10 mt-8">
        {trial.variables.map((variable, variableIndex) => {
          const variableData = trial.data[variable.name] || [];
          const treatments = trial.treatments.map(t => t.name);
          // Prepare data for charts
          const lineChartData = variableData.map(row => ({
            name: row.date,
            ...treatments.reduce((acc, t) => { acc[t] = row[t]; return acc; }, {})
          }));
          const barChartData = treatments.map(treatment => ({
            name: treatment,
            value: variableData.length ? variableData[variableData.length - 1][treatment] : 0
          }));
          
          // Different colors for each variable
          const variableColors = ['#2e7d32', '#795548', '#4caf50', '#8884d8', '#ff9800', '#e91e63', '#9c27b0', '#607d8b'];
          const barColor = variableColors[variableIndex % variableColors.length];
          
          return (
            <Card key={variable.name} className="shadow-lg">
              <CardHeader>
                <CardTitle>{variable.name} <span className="text-base text-gray-500 font-normal">({variable.unit})</span></CardTitle>
                <CardDescription>{variable.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-2">Time Series</h3>
                    <LineChart
                      data={lineChartData}
                      lines={treatments.map((t, i) => ({ dataKey: t, stroke: ['#2e7d32', '#795548', '#4caf50', '#8884d8'][i % 4], name: t }))}
                      xAxisDataKey="name"
                      height={260}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Treatment Comparison</h3>
                    <BarChart
                      data={barChartData}
                      bars={[{ dataKey: 'value', fill: barColor, name: variable.name }]}
                      xAxisDataKey="name"
                      height={260}
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="font-semibold mb-2">Raw Data Table</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          {treatments.map(t => <TableHead key={t}>{t}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variableData.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell>{row.date}</TableCell>
                            {treatments.map(t => <TableCell key={t}>{row[t]}</TableCell>)}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisPage;
