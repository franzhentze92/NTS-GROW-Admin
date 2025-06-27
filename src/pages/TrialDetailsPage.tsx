import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, DollarSign, Users, FileText, Tag, ChevronLeft, Edit, Plus, CheckCircle, AlertCircle, Clock, Map } from 'lucide-react';

// Mock trial data (replace with real fetch by ID)
const mockTrial = {
  id: 1,
  name: 'Corn Yield Optimization Trial',
  status: 'active',
  trial_code: 'CORN2024-01',
  category: 'Standard',
  location: 'Field A - North Block',
  gps: '40.7128, -74.0060',
  trial_area: 2.5,
  crop: 'Corn',
  variety_hybrid: 'Pioneer 1234',
  trial_type: 'Fertility Trial',
  season: '2024',
  startDate: '2024-03-15',
  endDate: '2024-10-20',
  objective: 'Optimize nitrogen application for maximum yield.',
  owner: { id: 1, name: 'Dr. Sarah Johnson', avatar: '/avatars/sarah.jpg', role: 'Lead Agronomist' },
  collaborators: [
    { id: 2, name: 'Mike Chen', avatar: '/avatars/mike.jpg', role: 'Field Technician' },
    { id: 3, name: 'Lisa Rodriguez', avatar: '/avatars/lisa.jpg', role: 'Data Analyst' }
  ],
  tags: ['Yield', 'Fertilizer'],
  notifications: true,
  budget: 15000,
  spent: 8750,
  attachments: [
    { id: 1, name: 'Protocol.pdf', url: '#' },
    { id: 2, name: 'Pre-trial Data.xlsx', url: '#' }
  ],
  tasks: [
    { id: 1, title: 'Weekly soil pH monitoring', status: 'completed', dueDate: '2024-03-20', assignee: 'Mike Chen', priority: 'high' },
    { id: 2, title: 'Fertilizer application', status: 'in-progress', dueDate: '2024-03-25', assignee: 'Dr. Sarah Johnson', priority: 'high' },
    { id: 3, title: 'Plant height measurements', status: 'pending', dueDate: '2024-03-30', assignee: 'Lisa Rodriguez', priority: 'medium' },
    { id: 4, title: 'Pest monitoring', status: 'pending', dueDate: '2024-04-05', assignee: 'Mike Chen', priority: 'low' }
  ],
  field_layout: null // Placeholder for map/field designer data
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  planning: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800'
};

const TrialDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // TODO: Fetch trial by id
  const trial = mockTrial; // Replace with real fetch

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2"><ChevronLeft className="w-4 h-4 mr-1" />Back to Trials</Button>
      {/* Variable & Treatment Design and Data Collection Buttons */}
      <div className="flex justify-end gap-2 mb-4">
        <Button variant="secondary" onClick={() => navigate(`/trials/${id}/variable-design`)}>
          Variable & Treatment Design
        </Button>
        <Button variant="secondary" onClick={() => navigate(`/trials/${id}/data-entry`)}>
          Data Collection & Entry
        </Button>
      </div>
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
            {trial.notifications && <Badge variant="destructive" className="mt-2">Notifications Enabled</Badge>}
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