import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar, MapPin, Users, TrendingUp, Plus, Search, Filter, MoreHorizontal, DollarSign, Clock, CheckCircle, AlertCircle, Edit, Trash2, Map, FileText } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import FieldDesigner from '@/components/fieldTrials/FieldDesigner';
import { TrialFormDialog } from '@/components/fieldTrials/TrialFormDialog';
import { useNavigate } from 'react-router-dom';

// Enhanced mock data for trials with coordinates and budget
const mockTrials = [
  {
    id: 1,
    name: "Corn Yield Optimization Trial",
    status: "active",
    location: "Field A - North Block",
    crop: "Corn",
    startDate: "2024-03-15",
    endDate: "2024-10-20",
    coordinates: { lat: 40.7128, lng: -74.0060 },
    budget: 15000,
    spent: 8750,
    owner: { id: 1, name: "Dr. Sarah Johnson", avatar: "/avatars/sarah.jpg", role: "Lead Agronomist" },
    collaborators: [
      { id: 1, name: "Dr. Sarah Johnson", avatar: "/avatars/sarah.jpg", role: "Lead Agronomist" },
      { id: 2, name: "Mike Chen", avatar: "/avatars/mike.jpg", role: "Field Technician" },
      { id: 3, name: "Lisa Rodriguez", avatar: "/avatars/lisa.jpg", role: "Data Analyst" }
    ],
    treatments: 4,
    replications: 3,
    plots: 12,
    completion: 65,
    design: "RCBD",
    tasks: [
      { id: 1, title: "Weekly soil pH monitoring", status: "completed", dueDate: "2024-03-20", assignee: "Mike Chen", priority: "high" },
      { id: 2, title: "Fertilizer application", status: "in-progress", dueDate: "2024-03-25", assignee: "Dr. Sarah Johnson", priority: "high" },
      { id: 3, title: "Plant height measurements", status: "pending", dueDate: "2024-03-30", assignee: "Lisa Rodriguez", priority: "medium" },
      { id: 4, title: "Pest monitoring", status: "pending", dueDate: "2024-04-05", assignee: "Mike Chen", priority: "low" }
    ]
  },
  {
    id: 2,
    name: "Soybean Disease Resistance Study",
    status: "planning",
    location: "Field B - East Section",
    crop: "Soybeans",
    startDate: "2024-04-01",
    endDate: "2024-09-15",
    coordinates: { lat: 40.7589, lng: -73.9851 },
    budget: 12000,
    spent: 0,
    owner: { id: 4, name: "Dr. Robert Kim", avatar: "/avatars/robert.jpg", role: "Pathologist" },
    collaborators: [
      { id: 4, name: "Dr. Robert Kim", avatar: "/avatars/robert.jpg", role: "Pathologist" },
      { id: 5, name: "Emma Wilson", avatar: "/avatars/emma.jpg", role: "Research Assistant" }
    ],
    treatments: 6,
    replications: 4,
    plots: 24,
    completion: 0,
    design: "Split-Plot",
    tasks: [
      { id: 5, title: "Field preparation", status: "pending", dueDate: "2024-03-28", assignee: "Emma Wilson", priority: "high" },
      { id: 6, title: "Seed treatment application", status: "pending", dueDate: "2024-04-02", assignee: "Dr. Robert Kim", priority: "high" }
    ]
  },
  {
    id: 3,
    name: "Wheat Fertilizer Response Trial",
    status: "completed",
    location: "Field C - South Block",
    crop: "Wheat",
    startDate: "2023-09-01",
    endDate: "2024-06-15",
    coordinates: { lat: 40.7505, lng: -73.9934 },
    budget: 8000,
    spent: 8000,
    owner: { id: 6, name: "Dr. James Miller", avatar: "/avatars/james.jpg", role: "Soil Scientist" },
    collaborators: [
      { id: 6, name: "Dr. James Miller", avatar: "/avatars/james.jpg", role: "Soil Scientist" },
      { id: 7, name: "Anna Thompson", avatar: "/avatars/anna.jpg", role: "Field Manager" }
    ],
    treatments: 3,
    replications: 5,
    plots: 15,
    completion: 100,
    design: "RCBD",
    tasks: [
      { id: 7, title: "Final yield measurements", status: "completed", dueDate: "2024-06-10", assignee: "Anna Thompson", priority: "high" },
      { id: 8, title: "Data analysis", status: "completed", dueDate: "2024-06-15", assignee: "Dr. James Miller", priority: "high" }
    ]
  },
  {
    id: 4,
    name: "Cotton Irrigation Efficiency Study",
    status: "active",
    location: "Field D - West Section",
    crop: "Cotton",
    startDate: "2024-02-01",
    endDate: "2024-11-30",
    coordinates: { lat: 40.7484, lng: -73.9857 },
    budget: 20000,
    spent: 12000,
    owner: { id: 8, name: "Dr. Maria Garcia", avatar: "/avatars/maria.jpg", role: "Irrigation Specialist" },
    collaborators: [
      { id: 8, name: "Dr. Maria Garcia", avatar: "/avatars/maria.jpg", role: "Irrigation Specialist" },
      { id: 9, name: "Tom Davis", avatar: "/avatars/tom.jpg", role: "Field Technician" }
    ],
    treatments: 5,
    replications: 3,
    plots: 15,
    completion: 45,
    design: "Strip-Plot",
    tasks: [
      { id: 9, title: "Irrigation system maintenance", status: "completed", dueDate: "2024-03-15", assignee: "Tom Davis", priority: "high" },
      { id: 10, title: "Soil moisture monitoring", status: "in-progress", dueDate: "2024-03-22", assignee: "Dr. Maria Garcia", priority: "high" },
      { id: 11, title: "Plant stress assessment", status: "pending", dueDate: "2024-03-29", assignee: "Tom Davis", priority: "medium" }
    ]
  },
  {
    id: 5,
    name: "Nitrogen Rate Trial – Corn 2025",
    status: "ongoing",
    location: "Demo Farm Alpha",
    crop: "Corn",
    variety_hybrid: "Pioneer 30F35",
    trial_code: "N-CORN-2025",
    trial_type: "Fertility Rate Trial",
    season: "Wet 2025",
    startDate: "2025-06-01",
    endDate: "2025-09-30",
    objective: "Evaluate the yield response of corn to different nitrogen rates in a loamy soil field.",
    farm_name: "Demo Farm Alpha",
    trial_area: 1.2,
    area_unit: "ha",
    owner: { id: 10, name: "Maria Fernandez", avatar: "/avatars/maria.jpg", role: "Lead Agronomist" },
    collaborators: [
      { id: 11, name: "Carlos Ruiz", avatar: "/avatars/carlos.jpg", role: "Editor" },
      { id: 12, name: "Ana Gomez", avatar: "/avatars/ana.jpg", role: "Viewer" }
    ],
    tasks: [
      { id: 21, title: "Sowing", status: "completed", dueDate: "2025-06-01", assignee: "Maria Fernandez", icon: "✔️" },
      { id: 22, title: "First measurement – emergence", status: "pending", dueDate: "2025-06-15", assignee: "Carlos Ruiz", icon: "🌱" },
      { id: 23, title: "Plant height", status: "pending", dueDate: "2025-07-10", assignee: "Ana Gomez", icon: "📏" },
      { id: 24, title: "Harvest and final data collection", status: "pending", dueDate: "2025-09-30", assignee: "Maria Fernandez", icon: "🌾" }
    ],
    budget: 1500,
    spent: 0,
    tags: ["Nitrogen", "Corn", "2025"],
    category: "Fertility",
    gps: "-34.6037, -58.3816",
    is_draft: false
  },
];

// Enhanced chart data
const statusData = [
  { name: 'Active', value: 2, color: '#10b981' },
  { name: 'Planning', value: 1, color: '#f59e0b' },
  { name: 'Completed', value: 1, color: '#3b82f6' }
];

const ownerData = [
  { name: 'Dr. Sarah Johnson', trials: 1, color: '#10b981' },
  { name: 'Dr. Robert Kim', trials: 1, color: '#f59e0b' },
  { name: 'Dr. James Miller', trials: 1, color: '#3b82f6' },
  { name: 'Dr. Maria Garcia', trials: 1, color: '#8b5cf6' }
];

const budgetData = [
  { name: 'Corn Trial', budget: 15000, spent: 8750 },
  { name: 'Soybean Trial', budget: 12000, spent: 0 },
  { name: 'Wheat Trial', budget: 8000, spent: 8000 },
  { name: 'Cotton Trial', budget: 20000, spent: 12000 }
];

const cropData = [
  { name: 'Corn', trials: 1 },
  { name: 'Soybeans', trials: 1 },
  { name: 'Wheat', trials: 1 },
  { name: 'Cotton', trials: 1 }
];

// Trial templates
const trialTemplates = [
  {
    id: 'rcbd',
    name: 'Randomized Complete Block Design',
    description: 'Standard design for field trials with blocking to control field variation',
    icon: '📊',
    complexity: 'Medium'
  },
  {
    id: 'split-plot',
    name: 'Split-Plot Design',
    description: 'For trials with two factors where one factor is harder to apply',
    icon: '🔀',
    complexity: 'High'
  },
  {
    id: 'latin-square',
    name: 'Latin Square Design',
    description: 'Balanced design that controls for two sources of variation',
    icon: '⬜',
    complexity: 'Medium'
  },
  {
    id: 'strip-plot',
    name: 'Strip-Plot Design',
    description: 'For trials with two factors that are applied in strips',
    icon: '📏',
    complexity: 'High'
  },
  {
    id: 'custom',
    name: 'Custom Design',
    description: 'Create your own experimental design from scratch',
    icon: '⚙️',
    complexity: 'Variable'
  }
];

// Add mock users and tags for selection
const mockUsers = [
  { id: 1, name: "Dr. Sarah Johnson", avatar: "/avatars/sarah.jpg", role: "Lead Agronomist" },
  { id: 2, name: "Mike Chen", avatar: "/avatars/mike.jpg", role: "Field Technician" },
  { id: 3, name: "Lisa Rodriguez", avatar: "/avatars/lisa.jpg", role: "Data Analyst" },
  { id: 4, name: "Dr. Robert Kim", avatar: "/avatars/robert.jpg", role: "Pathologist" },
  { id: 5, name: "Emma Wilson", avatar: "/avatars/emma.jpg", role: "Research Assistant" },
  { id: 6, name: "Dr. James Miller", avatar: "/avatars/james.jpg", role: "Soil Scientist" },
  { id: 7, name: "Anna Thompson", avatar: "/avatars/anna.jpg", role: "Field Manager" },
  { id: 8, name: "Dr. Maria Garcia", avatar: "/avatars/maria.jpg", role: "Irrigation Specialist" },
  { id: 9, name: "Tom Davis", avatar: "/avatars/tom.jpg", role: "Field Technician" }
];
const mockTags = ["Yield", "Disease", "Irrigation", "Fertilizer", "Organic", "Remote Sensing"];
const mockAuditTrail = [
  { id: 1, action: 'Created trial', user: 'Dr. Sarah Johnson', date: '2024-03-01 09:00' },
  { id: 2, action: 'Added collaborator Mike Chen', user: 'Dr. Sarah Johnson', date: '2024-03-01 09:10' },
  { id: 3, action: 'Changed status to Active', user: 'Mike Chen', date: '2024-03-15 08:00' },
];

const FieldTrialsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cropFilter, setCropFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [collaboratorIds, setCollaboratorIds] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignee: '',
    priority: 'medium',
    status: 'pending'
  });
  const [showFieldDesigner, setShowFieldDesigner] = useState(false);
  const [selectedTrialForDesign, setSelectedTrialForDesign] = useState(null);
  const navigate = useNavigate();

  const filteredTrials = mockTrials.filter(trial => {
    const matchesSearch = trial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trial.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trial.status === statusFilter;
    const matchesCrop = cropFilter === 'all' || trial.crop === cropFilter;
    return matchesSearch && matchesStatus && matchesCrop;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'planning': return '🟡';
      case 'completed': return '🔵';
      default: return '⚪';
    }
  };

  // Handler for opening trial details
  const handleViewDetails = (trial: any) => {
    setSelectedTrial(trial);
    setShowDetailDialog(true);
  };

  // Handler for collaborator selection (mocked as checkboxes for now)
  const handleCollaboratorToggle = (id: number) => {
    setCollaboratorIds(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  // Handler for tag selection (mocked as checkboxes for now)
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddTask = (trialId: number) => {
    setSelectedTrial(mockTrials.find(t => t.id === trialId));
    setShowTaskDialog(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status
    });
    setShowTaskDialog(true);
  };

  const handleSaveTask = () => {
    // Mock save task logic
    setShowTaskDialog(false);
    setSelectedTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      assignee: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDesignField = (trial: any) => {
    setSelectedTrialForDesign(trial);
    setShowFieldDesigner(true);
  };

  const handleSaveFieldDesign = (design: any) => {
    // Mock save field design logic
    console.log('Saving field design:', design);
    setShowFieldDesigner(false);
    setSelectedTrialForDesign(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Field Trials</h1>
          <p className="text-gray-600 mt-1">Manage and track your agricultural research trials</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Trial
        </Button>
      </div>

      {/* Enhanced Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockTrials.length}</div>
            <p className="text-blue-100 text-sm">Across all crops</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Trials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockTrials.filter(t => t.status === 'active').length}
            </div>
            <p className="text-green-100 text-sm">Currently running</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${mockTrials.reduce((sum, trial) => sum + trial.budget, 0).toLocaleString()}
            </div>
            <p className="text-purple-100 text-sm">Allocated across trials</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${mockTrials.reduce((sum, trial) => sum + trial.spent, 0).toLocaleString()}
            </div>
            <p className="text-orange-100 text-sm">Expenses to date</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trial Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trial Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={ownerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="trials"
                >
                  {ownerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget vs Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                <Bar dataKey="spent" fill="#10b981" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trials by Crop</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cropData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trials" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Locations</CardTitle>
          <CardDescription>Geographic distribution of field trials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Interactive Map</p>
              <p className="text-sm text-gray-500">Showing {mockTrials.length} trial locations</p>
              <div className="mt-4 space-y-2">
                {mockTrials.map(trial => (
                  <div key={trial.id} className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-medium">{trial.name}</span>
                    <span className="text-gray-500">({trial.location})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Management</CardTitle>
          <CardDescription>Search and filter your field trials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search trials by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="Corn">Corn</SelectItem>
                <SelectItem value="Soybeans">Soybeans</SelectItem>
                <SelectItem value="Wheat">Wheat</SelectItem>
                <SelectItem value="Cotton">Cotton</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enhanced Trials Table */}
          <div className="space-y-4">
            {filteredTrials.map((trial) => (
              <Card key={trial.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{trial.name}</h3>
                        <Badge className={getStatusColor(trial.status)}>{getStatusIcon(trial.status)} {trial.status}</Badge>
                        {trial['trial_code'] ? <Badge variant="secondary">Code: {trial['trial_code']}</Badge> : null}
                        {trial['category'] ? <Badge variant="outline">{trial['category']}</Badge> : null}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-1">
                        <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />{trial.location}</div>
                        {trial['gps'] ? <div className="flex items-center"><MapPin className="w-4 h-4 mr-1" />GPS: {trial['gps']}</div> : null}
                        {trial['trial_area'] ? <div className="flex items-center"><Map className="w-4 h-4 mr-1" />Area: {trial['trial_area']} ha</div> : null}
                        <div className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{trial.startDate} - {trial.endDate}</div>
                        <div className="flex items-center"><DollarSign className="w-4 h-4 mr-1" />${trial.spent?.toLocaleString?.() ?? 0} / ${trial.budget?.toLocaleString?.() ?? 0}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <Badge variant="outline">Crop: {trial.crop}</Badge>
                        {trial['variety_hybrid'] ? <Badge variant="outline">Variety: {trial['variety_hybrid']}</Badge> : null}
                        {trial['trial_type'] ? <Badge variant="outline">Type: {trial['trial_type']}</Badge> : null}
                        {trial['season'] ? <Badge variant="outline">Season: {trial['season']}</Badge> : null}
                      </div>
                      {trial['objective'] ? <div className="text-xs text-gray-700 mb-1"><span className="font-medium">Objective:</span> {trial['objective']}</div> : null}
                      <div className="flex flex-wrap gap-2 mb-1">
                        {(trial['tags'] || []).map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                      </div>
                      {trial['notifications'] ? <Badge variant="destructive">Notifications Enabled</Badge> : null}
                    </div>
                    {/* Right: Owner, Team, Attachments */}
                    <div className="flex flex-col items-end gap-2 min-w-[180px]">
                      {/* Owner */}
                      <div className="text-right mb-1">
                        <div className="text-xs font-medium text-gray-900">Owner</div>
                        <div className="flex items-center space-x-1">
                          <Avatar className="w-6 h-6"><AvatarImage src={trial.owner?.avatar} /><AvatarFallback className="text-xs">{trial.owner?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                          <span className="text-xs text-gray-600">{trial.owner?.name}</span>
                        </div>
                      </div>
                      {/* Team */}
                      <div className="text-right mb-1">
                        <div className="text-xs font-medium text-gray-900">Team</div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {(trial.collaborators || []).map((c) => (
                            <div key={c.id} className="flex items-center gap-1">
                              <Avatar className="w-5 h-5"><AvatarImage src={c.avatar} /><AvatarFallback className="text-xs">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                              <span className="text-xs text-gray-600">{c.name}</span>
                              {c.role && <Badge variant="outline" className="text-[10px]">{c.role}</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Attachments */}
                      {trial['attachments'] && trial['attachments'].length > 0 ? (
                        <div className="flex items-center gap-1 mt-1">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-600">{trial['attachments'].length} attachment{trial['attachments'].length > 1 ? 's' : ''}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{trial.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${trial.completion}%` }} />
                    </div>
                  </div>
                  {/* Tasks Section */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">Tasks</h4>
                      <Button variant="outline" size="sm" onClick={() => handleAddTask(trial.id)}>
                        <Plus className="w-3 h-3 mr-1" />Add Task
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(trial.tasks || []).slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <span className="text-sm font-medium">{task.title}</span>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{task.assignee}</span>
                            <span className="text-xs text-gray-500">{task.dueDate}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}><Edit className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      ))}
                      {(trial.tasks || []).length > 5 && (
                        <div className="text-center">
                          <Button variant="ghost" size="sm">View all {trial.tasks.length} tasks</Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="secondary" onClick={() => navigate(`/trials/${trial.id}`)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Trial Dialog - Using New Comprehensive Form */}
      <TrialFormDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onSave={(trial) => {
          console.log('New trial created:', trial);
          setShowCreateDialog(false);
          // TODO: Add the new trial to the list and refresh
        }}
      />

      {/* Task Management Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTrial && `Add a task for ${selectedTrial.name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="taskTitle">Task Title</Label>
              <Input
                id="taskTitle"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Weekly soil pH monitoring"
              />
            </div>
            <div>
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskDueDate">Due Date</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="taskAssignee">Assignee</Label>
                <Select value={newTask.assignee} onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map(user => (
                      <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taskPriority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="taskStatus">Status</Label>
                <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask}>
                {selectedTask ? 'Update Task' : 'Add Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Field Designer Dialog */}
      <Dialog open={showFieldDesigner} onOpenChange={setShowFieldDesigner}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Field Layout Designer</DialogTitle>
            <DialogDescription>
              {selectedTrialForDesign && `Design field layout for ${selectedTrialForDesign.name}`}
            </DialogDescription>
          </DialogHeader>
          {selectedTrialForDesign && (
            <FieldDesigner
              trialId={selectedTrialForDesign.id}
              onSave={handleSaveFieldDesign}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldTrialsPage; 