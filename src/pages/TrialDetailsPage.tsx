import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Users, FileText, Tag, ChevronLeft, Edit, Plus, CheckCircle, AlertCircle, Clock, Map, Package, Database, BarChart3, Calculator, Target } from 'lucide-react';

// Mock trial data (replace with real fetch by ID)
const mockTrial = {
  id: 5,
  name: 'Nitrogen Rate Trial – Corn 2025',
  status: 'ongoing',
  trial_code: 'N-CORN-2025',
  category: 'Fertility',
  location: 'Demo Farm Alpha',
  gps: '-34.6037, -58.3816',
  trial_area: 1.2,
  crop: 'Corn',
  variety_hybrid: 'Pioneer 30F35',
  trial_type: 'Fertility Rate Trial',
  season: 'Wet 2025',
  startDate: '2025-06-01',
  endDate: '2025-09-30',
  objective: 'Evaluate the yield response of corn to different nitrogen rates in a loamy soil field.',
  owner: { id: 10, name: 'Maria Fernandez', avatar: '/avatars/maria.jpg', role: 'Lead Agronomist' },
  collaborators: [
    { id: 11, name: 'Carlos Ruiz', avatar: '/avatars/carlos.jpg', role: 'Editor' },
    { id: 12, name: 'Ana Gomez', avatar: '/avatars/ana.jpg', role: 'Viewer' }
  ],
  tags: ['Nitrogen', 'Corn', '2025'],
  notifications: true,
  budget: 1500,
  spent: 0,
  attachments: [
    { id: 1, name: 'Protocol.pdf', url: '#' },
    { id: 2, name: 'Pre-trial Data.xlsx', url: '#' }
  ],
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
  tasks: [
    { id: 21, title: "Sowing", status: "completed", dueDate: "2025-06-01", assignee: "Maria Fernandez", icon: "✔️", priority: "high" },
    { id: 22, title: "First measurement – emergence", status: "pending", dueDate: "2025-06-15", assignee: "Carlos Ruiz", icon: "🌱", priority: "medium" },
    { id: 23, title: "Plant height", status: "pending", dueDate: "2025-07-10", assignee: "Ana Gomez", icon: "📏", priority: "medium" },
    { id: 24, title: "Harvest and final data collection", status: "pending", dueDate: "2025-09-30", assignee: "Maria Fernandez", icon: "🌾", priority: "high" }
  ],
  field_layout: null // Placeholder for map/field designer data
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  planning: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
  ongoing: 'bg-blue-100 text-blue-800'
};

const TrialDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // TODO: Fetch trial by id
  const trial = mockTrial; // Replace with real fetch

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2"><ChevronLeft className="w-4 h-4 mr-1" />Back to Trials</Button>
      
      {/* Header */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">{trial.name} <Badge className={statusColors[trial.status]}>{trial.status}</Badge></CardTitle>
            <CardDescription>Trial Code: {trial.trial_code} | Category: {trial.category}</CardDescription>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{trial.location}</div>
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />GPS: {trial.gps}</div>
              <div className="flex items-center"><Map className="w-4 h-4 mr-1" />Area: {trial.trial_area} ha</div>
              <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{trial.startDate} - {trial.endDate}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">Crop: {trial.crop}</Badge>
              <Badge variant="outline">Variety: {trial.variety_hybrid}</Badge>
              <Badge variant="outline">Type: {trial.trial_type}</Badge>
              <Badge variant="outline">Season: {trial.season}</Badge>
            </div>
            <div className="text-xs text-gray-700 mt-2"><span className="font-medium">Objective:</span> {trial.objective}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {trial.tags.map(tag => <Badge key={tag} variant="secondary"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 min-w-[180px]">
            <div className="text-right mb-1">
              <div className="text-xs font-medium text-gray-900">Owner</div>
              <div className="flex items-center space-x-1">
                <Avatar className="w-6 h-6"><AvatarImage src={trial.owner.avatar} /><AvatarFallback className="text-xs">{trial.owner.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                <span className="text-xs text-gray-600">{trial.owner.name}</span>
              </div>
            </div>
            <div className="text-right mb-1">
              <div className="text-xs font-medium text-gray-900">Team</div>
              <div className="flex flex-wrap gap-1 justify-end">
                {trial.collaborators.map(c => (
                  <div key={c.id} className="flex items-center gap-1">
                    <Avatar className="w-5 h-5"><AvatarImage src={c.avatar} /><AvatarFallback className="text-xs">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                    <span className="text-xs text-gray-600">{c.name}</span>
                    {c.role && <Badge variant="outline" className="text-[10px]">{c.role}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Trial Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-600">{trial.treatments.length}</CardTitle>
            <CardDescription>Treatments</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-green-600">{trial.variables.length}</CardTitle>
            <CardDescription>Variables</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-600">{trial.replications}</CardTitle>
            <CardDescription>Replications</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-orange-600">{trial.totalPlots}</CardTitle>
            <CardDescription>Total Plots</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Navigation to Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Field Trial Modules</CardTitle>
          <CardDescription>Access all trial management and analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(`/agronomist/field-trials/treatments?trial=${trial.id}`)}
            >
              <Package className="w-6 h-6" />
              <span className="text-sm font-medium">Variables & Treatments</span>
              <span className="text-xs text-gray-500">Design & Manage</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(`/agronomist/field-trials/data-collection?trial=${trial.id}`)}
            >
              <Database className="w-6 h-6" />
              <span className="text-sm font-medium">Data Collection</span>
              <span className="text-xs text-gray-500">Enter & Manage Data</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(`/agronomist/field-trials/analytics/analysis?trial=${trial.id}`)}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm font-medium">Analytics</span>
              <span className="text-xs text-gray-500">Charts & Visualizations</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(`/agronomist/field-trials/analytics/statistics?trial=${trial.id}`)}
            >
              <Calculator className="w-6 h-6" />
              <span className="text-sm font-medium">Statistics</span>
              <span className="text-xs text-gray-500">Statistical Analysis</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Treatments Section */}
      <Card>
        <CardHeader>
          <CardTitle>Treatments</CardTitle>
          <CardDescription>Experimental treatments and their specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trial.treatments.map((treatment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{treatment.name}</h4>
                  <Badge variant="outline">{index + 1}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{treatment.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="font-medium">Application:</span> {treatment.application}</div>
                  <div><span className="font-medium">Rate:</span> {treatment.rate}</div>
                  <div><span className="font-medium">Timing:</span> {treatment.timing}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Variables Section */}
      <Card>
        <CardHeader>
          <CardTitle>Variables</CardTitle>
          <CardDescription>Measured variables and their specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trial.variables.map((variable, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{variable.name}</h4>
                  <Badge variant="secondary">{variable.unit}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{variable.description}</p>
                <div className="text-xs">
                  <span className="font-medium">Frequency:</span> {variable.frequency}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experimental Design */}
      <Card>
        <CardHeader>
          <CardTitle>Experimental Design</CardTitle>
          <CardDescription>Trial layout and design specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{trial.designType}</div>
              <div className="text-sm text-gray-600">Design Type</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{trial.replications}</div>
              <div className="text-sm text-gray-600">Replications</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{trial.plotSize.width}×{trial.plotSize.length} {trial.plotSize.unit}</div>
              <div className="text-sm text-gray-600">Plot Size</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-bold">{trial.rowSpacing} cm</div>
              <div className="text-sm text-gray-600">Row Spacing</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map/Field Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Field Layout / Map</CardTitle>
          <CardDescription>Drawn trial area and plot layout</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Map/Field Designer integration here</p>
              <p className="text-sm text-gray-500">Draw or view your trial area and plots</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8 text-lg">
            <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" />Budget: <span className="font-bold">${trial.budget.toLocaleString()}</span></div>
            <div className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-blue-600" />Spent: <span className="font-bold">${trial.spent.toLocaleString()}</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments/Pictures */}
      <Card>
        <CardHeader>
          <CardTitle>Attachments & Pictures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {trial.attachments.map(att => (
              <a key={att.id} href={att.url} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                <FileText className="w-5 h-5 text-gray-500" />
                <span>{att.name}</span>
              </a>
            ))}
            {trial.attachments.length === 0 && <span className="text-gray-500">No attachments uploaded.</span>}
          </div>
        </CardContent>
      </Card>

      {/* Tasks/Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks & Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trial.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {task.status === 'completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : task.status === 'in-progress' ? <Clock className="w-4 h-4 text-yellow-500" /> : <AlertCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm font-medium">{task.title}</span>
                  <Badge variant="outline">{task.priority}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{task.assignee}</span>
                  <span className="text-xs text-gray-500">{task.dueDate}</span>
                  <Button variant="ghost" size="sm"><Edit className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
            {trial.tasks.length === 0 && <span className="text-gray-500">No tasks added yet.</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialDetailsPage; 