import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, MapPin, FileText, Users, Calendar, DollarSign } from 'lucide-react';

// Placeholder/mock data
const crops = ['Corn', 'Soybeans', 'Wheat', 'Cotton'];
const trialTypes = ['Fertility Trial', 'Product Comparison', 'Nutrient Rate Test', 'Planting Date Trial'];
const seasons = ['2024', '2025', '2026'];
const statuses = [
  { value: 'planned', label: 'Planned' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];
const farms = ['Green Acres', 'Sunset Valley', 'Riverbend'];
const fieldBlocks = ['Block A', 'Block B', 'Block C'];
const users = [
  { id: '1', name: 'Dr. Sarah Johnson' },
  { id: '2', name: 'Mike Chen' },
  { id: '3', name: 'Lisa Rodriguez' }
];
const categories = ['Standard', 'Enterprise', 'Demo'];

export const TrialFormDialog = ({ open, onOpenChange, onSave }) => {
  // Form state
  const [tab, setTab] = useState('details');
  const [trialName, setTrialName] = useState('');
  const [trialCode, setTrialCode] = useState('');
  const [crop, setCrop] = useState('');
  const [variety, setVariety] = useState('');
  const [trialType, setTrialType] = useState('');
  const [season, setSeason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('planned');
  const [objective, setObjective] = useState('');
  const [farm, setFarm] = useState('');
  const [fieldBlock, setFieldBlock] = useState('');
  const [gps, setGps] = useState('');
  const [trialArea, setTrialArea] = useState('');
  const [lead, setLead] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [roles, setRoles] = useState({});
  const [tasks, setTasks] = useState([{ name: '', date: '', status: 'pending', responsible: '' }]);
  const [notifications, setNotifications] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [isDraft, setIsDraft] = useState(false);

  // Handlers for dynamic fields
  const handleAddTask = () => setTasks([...tasks, { name: '', date: '', status: 'pending', responsible: '' }]);
  const handleTaskChange = (idx, field, value) => {
    setTasks(tasks.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };
  const handleRemoveTask = (idx) => setTasks(tasks.filter((_, i) => i !== idx));
  const handleAddTag = () => {
    if (customTag && !tags.includes(customTag)) {
      setTags([...tags, customTag]);
      setCustomTag('');
    }
  };
  const handleRemoveTag = (tag) => setTags(tags.filter(t => t !== tag));
  const handleCollaboratorToggle = (id) => {
    setCollaborators(collaborators.includes(id) ? collaborators.filter(cid => cid !== id) : [...collaborators, id]);
  };
  const handleRoleChange = (id, role) => setRoles({ ...roles, [id]: role });

  // Main form submit
  const handleSubmit = (launch = false) => {
    const trialData = {
      name: trialName,
      trial_code: trialCode,
      crop,
      variety_hybrid: variety,
      trial_type: trialType,
      season,
      start_date: startDate,
      end_date: endDate,
      status,
      objective,
      farm_name: farm,
      field_location: fieldBlock,
      trial_area: parseFloat(trialArea) || 0,
      responsible_agronomist_id: lead,
      collaborators,
      roles,
      tasks,
      notifications,
      attachments,
      tags,
      trial_category: category,
      budget: parseFloat(budget) || 0,
      is_draft: !launch
    };
    
    onSave(trialData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New Field Trial</DialogTitle>
          <DialogDescription>Fill in all required details to create a new trial.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          {/* Trial Details */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Trial Name</Label>
                <Input value={trialName} onChange={e => setTrialName(e.target.value)} placeholder="e.g. N Test – Corn 2025" />
              </div>
              <div>
                <Label>Trial Code</Label>
                <Input value={trialCode} onChange={e => setTrialCode(e.target.value)} placeholder="Auto or manual" />
              </div>
              <div>
                <Label>Crop</Label>
                <Select value={crop} onValueChange={setCrop}>
                  <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                  <SelectContent>{crops.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety / Hybrid</Label>
                <Input value={variety} onChange={e => setVariety(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <Label>Trial Type</Label>
                <Select value={trialType} onValueChange={setTrialType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{trialTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                  <SelectContent>{seasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Objective / Purpose</Label>
                <Textarea value={objective} onChange={e => setObjective(e.target.value)} placeholder="Describe the trial objectives and methodology" rows={3} />
              </div>
            </div>
          </TabsContent>

          {/* Location & Mapping */}
          <TabsContent value="location" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Farm / Project Location</Label>
                <Select value={farm} onValueChange={setFarm}>
                  <SelectTrigger><SelectValue placeholder="Select farm" /></SelectTrigger>
                  <SelectContent>{farms.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign Existing Field Block</Label>
                <Select value={fieldBlock} onValueChange={setFieldBlock}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>{fieldBlocks.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>GPS Coordinates</Label>
                <Input value={gps} onChange={e => setGps(e.target.value)} placeholder="Autofilled or manual" />
              </div>
              <div>
                <Label>Calculated Trial Area</Label>
                <Input value={trialArea} readOnly placeholder="Auto-calculated from map" />
              </div>
            </div>
            <div>
              <Label>Draw Trial Area on Map</Label>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Map drawing tool integration here</p>
                  <p className="text-sm text-gray-500">Draw your trial area on the map</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Team & Access */}
          <TabsContent value="team" className="space-y-4">
            <div>
              <Label>Lead Agronomist</Label>
              <Select value={lead} onValueChange={setLead}>
                <SelectTrigger><SelectValue placeholder="Select lead agronomist" /></SelectTrigger>
                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Collaborators</Label>
              <div className="space-y-2">
                {users.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={collaborators.includes(user.id)}
                        onChange={() => handleCollaboratorToggle(user.id)}
                      />
                      <span>{user.name}</span>
                    </div>
                    {collaborators.includes(user.id) && (
                      <Select value={roles[user.id] || 'viewer'} onValueChange={(value) => handleRoleChange(user.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Timeline & Tasks */}
          <TabsContent value="timeline" className="space-y-4">
            <div>
              <Label>Trial Timeline</Label>
              <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Timeline/Gantt chart integration</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Tasks / Milestones</Label>
                <Button onClick={handleAddTask} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <Input
                      placeholder="Task name"
                      value={task.name}
                      onChange={e => handleTaskChange(idx, 'name', e.target.value)}
                    />
                    <Input
                      type="date"
                      value={task.date}
                      onChange={e => handleTaskChange(idx, 'date', e.target.value)}
                    />
                    <Select value={task.status} onValueChange={(value) => handleTaskChange(idx, 'status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Select value={task.responsible} onValueChange={(value) => handleTaskChange(idx, 'responsible', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Responsible" />
                        </SelectTrigger>
                        <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button onClick={() => handleRemoveTask(idx)} size="sm" variant="outline">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={notifications}
                onChange={e => setNotifications(e.target.checked)}
              />
              <Label>Email notifications for tasks</Label>
            </div>
          </TabsContent>

          {/* Attachments */}
          <TabsContent value="attachments" className="space-y-4">
            <div>
              <Label>Upload Protocol</Label>
              <Input type="file" accept=".pdf,.doc,.docx" />
            </div>
            <div>
              <Label>Upload Pre-Trial Data</Label>
              <Input type="file" accept=".xlsx,.csv,.pdf" />
            </div>
            <div>
              <Label>Additional Documents</Label>
              <Input type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.jpg,.png" />
            </div>
            <div className="text-sm text-gray-500">
              Supported formats: PDF, Word, Excel, Images (JPG, PNG)
            </div>
          </TabsContent>

          {/* Tags & Metadata */}
          <TabsContent value="tags" className="space-y-4">
            <div>
              <Label>Custom Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={customTag}
                  onChange={e => setCustomTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                />
                <Button onClick={handleAddTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Trial Category (Optional)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Budget */}
          <TabsContent value="budget" className="space-y-4">
            <div>
              <Label>Estimated Total Budget</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSubmit(false)}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(true)}>
            Launch Trial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 