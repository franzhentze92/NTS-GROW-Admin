import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, BarChart } from 'lucide-react';

// Mock data - in real app, this would come from API
const initialTrials = [
  {
    id: 1,
    name: 'Wheat Yield Trial 2024',
    code: 'WYT-2024-001',
    crop: 'Wheat',
    variety: 'Spring Wheat',
    type: 'Yield Trial',
    season: 'Spring 2024',
    objective: 'Evaluate new wheat varieties for yield potential',
    location: 'Research Farm A',
    gps: '-34.9285, 138.6007',
    area: '2.5 hectares',
    owner: 'Dr. Sarah Johnson',
    team: ['Dr. Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez'],
    tags: ['wheat', 'yield', 'spring'],
    notifications: true,
    attachments: 3,
    budget: '$15,000',
    status: 'Ongoing',
    variables: [
      { name: 'Plant Height', description: 'Height of plants in centimeters', unit: 'cm' },
      { name: 'Yield', description: 'Grain yield per plot', unit: 'kg/ha' },
      { name: 'Protein Content', description: 'Protein percentage in grain', unit: '%' },
      { name: 'Disease Resistance', description: 'Resistance to common wheat diseases', unit: 'scale 1-5' }
    ],
    entries: [
      { date: '2024-03-15', plot: 'A1', variable: 'Plant Height', value: '85', unit: 'cm', collector: 'Mike Chen', notes: 'Good growth observed' },
      { date: '2024-03-15', plot: 'A2', variable: 'Plant Height', value: '82', unit: 'cm', collector: 'Mike Chen', notes: 'Slightly shorter than A1' },
      { date: '2024-03-20', plot: 'A1', variable: 'Yield', value: '4200', unit: 'kg/ha', collector: 'Lisa Rodriguez', notes: 'Excellent yield' },
      { date: '2024-03-20', plot: 'A2', variable: 'Yield', value: '3950', unit: 'kg/ha', collector: 'Lisa Rodriguez', notes: 'Good yield' },
      { date: '2024-03-25', plot: 'A1', variable: 'Protein Content', value: '12.5', unit: '%', collector: 'Dr. Sarah Johnson', notes: 'High protein content' },
      { date: '2024-03-25', plot: 'A2', variable: 'Protein Content', value: '11.8', unit: '%', collector: 'Dr. Sarah Johnson', notes: 'Standard protein level' },
      { date: '2024-03-30', plot: 'A1', variable: 'Disease Resistance', value: '4', unit: 'scale 1-5', collector: 'Mike Chen', notes: 'Very resistant' },
      { date: '2024-03-30', plot: 'A2', variable: 'Disease Resistance', value: '3', unit: 'scale 1-5', collector: 'Mike Chen', notes: 'Moderate resistance' }
    ]
  },
  {
    id: 2,
    name: 'Corn Hybrid Trial 2024',
    code: 'CHT-2024-002',
    crop: 'Corn',
    variety: 'Hybrid Corn',
    type: 'Hybrid Trial',
    season: 'Summer 2024',
    objective: 'Test new corn hybrid performance',
    location: 'Research Farm B',
    gps: '-34.9285, 138.6007',
    area: '3.0 hectares',
    owner: 'Dr. Michael Brown',
    team: ['Dr. Michael Brown', 'Emma Wilson', 'David Lee'],
    tags: ['corn', 'hybrid', 'summer'],
    notifications: true,
    attachments: 5,
    budget: '$20,000',
    status: 'Completed',
    variables: [
      { name: 'Plant Height', description: 'Height of corn plants', unit: 'cm' },
      { name: 'Ear Length', description: 'Length of corn ears', unit: 'cm' },
      { name: 'Kernel Count', description: 'Number of kernels per ear', unit: 'kernels' },
      { name: 'Moisture Content', description: 'Moisture percentage at harvest', unit: '%' }
    ],
    entries: [
      { date: '2024-06-10', plot: 'B1', variable: 'Plant Height', value: '220', unit: 'cm', collector: 'Emma Wilson', notes: 'Excellent height' },
      { date: '2024-06-10', plot: 'B2', variable: 'Plant Height', value: '215', unit: 'cm', collector: 'Emma Wilson', notes: 'Good height' },
      { date: '2024-07-15', plot: 'B1', variable: 'Ear Length', value: '18', unit: 'cm', collector: 'David Lee', notes: 'Long ears' },
      { date: '2024-07-15', plot: 'B2', variable: 'Ear Length', value: '16', unit: 'cm', collector: 'David Lee', notes: 'Standard length' },
      { date: '2024-07-20', plot: 'B1', variable: 'Kernel Count', value: '650', unit: 'kernels', collector: 'Dr. Michael Brown', notes: 'High kernel count' },
      { date: '2024-07-20', plot: 'B2', variable: 'Kernel Count', value: '580', unit: 'kernels', collector: 'Dr. Michael Brown', notes: 'Good kernel count' },
      { date: '2024-08-05', plot: 'B1', variable: 'Moisture Content', value: '14.2', unit: '%', collector: 'Emma Wilson', notes: 'Optimal moisture' },
      { date: '2024-08-05', plot: 'B2', variable: 'Moisture Content', value: '15.1', unit: '%', collector: 'Emma Wilson', notes: 'Slightly high moisture' }
    ]
  }
];

const DataSummaryPage = () => {
  const [trials] = useState(initialTrials);
  const [selectedTrialId, setSelectedTrialId] = useState(trials.length > 0 ? String(trials[0].id) : '');
  const [openVariable, setOpenVariable] = useState(null);

  const selectedTrial = trials.find(t => String(t.id) === selectedTrialId);

  // Filter states for summary table
  const [filterDate, setFilterDate] = useState('__all__');
  const [filterPlot, setFilterPlot] = useState('__all__');
  const [filterVariable, setFilterVariable] = useState('__all__');
  const [filterCollector, setFilterCollector] = useState('__all__');

  // Compute unique filter options
  const uniqueDates = selectedTrial ? Array.from(new Set(selectedTrial.entries.map(e => e.date))) : [];
  const uniquePlots = selectedTrial ? Array.from(new Set(selectedTrial.entries.map(e => e.plot))) : [];
  const uniqueVariables = selectedTrial ? Array.from(new Set(selectedTrial.entries.map(e => e.variable))) : [];
  const uniqueCollectors = selectedTrial ? Array.from(new Set(selectedTrial.entries.map(e => e.collector))) : [];

  // Filtered entries for summary table
  const filteredEntries = selectedTrial ? selectedTrial.entries.filter(e =>
    (filterDate === '__all__' || e.date === filterDate) &&
    (filterPlot === '__all__' || e.plot === filterPlot) &&
    (filterVariable === '__all__' || e.variable === filterVariable) &&
    (filterCollector === '__all__' || e.collector === filterCollector)
  ) : [];

  // Entries for the open variable
  const variableEntries = selectedTrial && openVariable
    ? selectedTrial.entries.filter(e => e.variable === openVariable)
    : [];

  return (
    <div className="max-w-7xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Summary</h1>
          <p className="text-gray-600 mt-2">View and analyze field trial data across all variables</p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* Trial Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Selection</CardTitle>
          <CardDescription>Select a trial to view its data summary</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="font-semibold">Select Trial:</label>
            <Select value={selectedTrialId} onValueChange={setSelectedTrialId}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Select a trial" />
              </SelectTrigger>
              <SelectContent>
                {trials.map(trial => (
                  <SelectItem key={trial.id} value={String(trial.id)}>
                    {trial.name} ({trial.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTrial && (
              <Badge variant={selectedTrial.status === 'Ongoing' ? 'default' : 'secondary'}>
                {selectedTrial.status}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTrial ? (
        <>
          {/* Variables by Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data by Variable</CardTitle>
              <CardDescription>Click on a variable to view all entries for that variable</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uniqueVariables.map(variable => {
                  const variableData = selectedTrial.variables.find(v => v.name === variable);
                  const entryCount = selectedTrial.entries.filter(e => e.variable === variable).length;
                  
                  return (
                    <Card key={variable} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-lg">{variable}</h4>
                        <Badge variant="outline">{entryCount} entries</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{variableData?.description}</p>
                      <div className="text-xs text-gray-500 mb-3">Unit: {variableData?.unit}</div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setOpenVariable(variable)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Entries
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Summary Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Summary Table</CardTitle>
              <CardDescription>All data entries for {selectedTrial.name}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
                    <SelectTrigger>
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
              </div>

              {/* Summary Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plot</TableHead>
                      <TableHead>Variable</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Collector</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className="font-medium">{entry.plot}</TableCell>
                        <TableCell>{entry.variable}</TableCell>
                        <TableCell>{entry.value}</TableCell>
                        <TableCell>{entry.unit}</TableCell>
                        <TableCell>{entry.collector}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Variable Modal */}
          <Dialog open={!!openVariable} onOpenChange={(open) => !open && setOpenVariable(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>All Entries for {openVariable}</DialogTitle>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Plot</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Collector</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variableEntries.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell className="font-medium">{entry.plot}</TableCell>
                        <TableCell className="font-semibold">{entry.value}</TableCell>
                        <TableCell>{entry.unit}</TableCell>
                        <TableCell>{entry.collector}</TableCell>
                        <TableCell className="max-w-xs">{entry.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Total entries: {variableEntries.length}
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please select a trial to view data summary</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataSummaryPage; 