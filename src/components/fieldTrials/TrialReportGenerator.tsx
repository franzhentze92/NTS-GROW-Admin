import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Edit, 
  Clock, 
  Users, 
  BarChart3,
  Image,
  Grid,
  File,
  Monitor,
  Globe,
  Copy,
  Send
} from 'lucide-react';

const REPORT_TEMPLATES = [
  { id: 'executive', name: 'Executive Summary', description: 'Brief overview for stakeholders', icon: <FileText /> },
  { id: 'detailed', name: 'Detailed Report', description: 'Comprehensive analysis and results', icon: <BarChart3 /> },
  { id: 'publication', name: 'Publication Ready', description: 'Academic paper format', icon: <Edit /> },
  { id: 'custom', name: 'Custom Template', description: 'Build your own report structure', icon: <Eye /> },
];

const REPORT_SECTIONS = [
  { id: 'title', name: 'Title Page', required: true, included: true },
  { id: 'executive', name: 'Executive Summary', required: false, included: true },
  { id: 'methods', name: 'Materials & Methods', required: true, included: true },
  { id: 'results', name: 'Results', required: true, included: true },
  { id: 'discussion', name: 'Discussion', required: false, included: true },
  { id: 'conclusions', name: 'Conclusions', required: false, included: true },
  { id: 'references', name: 'References', required: false, included: false },
  { id: 'appendices', name: 'Appendices', required: false, included: false },
];

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', icon: <File />, description: 'High-quality print format' },
  { id: 'word', name: 'Word', icon: <FileText />, description: 'Editable document format' },
  { id: 'powerpoint', name: 'PowerPoint', icon: <Monitor />, description: 'Presentation format' },
  { id: 'html', name: 'HTML', icon: <Globe />, description: 'Web-friendly format' },
];

const MOCK_REPORTS = [
  { id: '1', name: 'Nitrogen Trial Report v1.0', template: 'detailed', created: '2024-03-15', status: 'published', collaborators: 3 },
  { id: '2', name: 'Executive Summary v0.9', template: 'executive', created: '2024-03-14', status: 'draft', collaborators: 2 },
  { id: '3', name: 'Publication Draft v0.8', template: 'publication', created: '2024-03-13', status: 'draft', collaborators: 4 },
];

const TrialReportGenerator: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('detailed');
  const [reportTitle, setReportTitle] = useState('Nitrogen Fertilizer Trial Report - Wheat 2024');
  const [selectedSections, setSelectedSections] = useState(REPORT_SECTIONS.map(s => s.id));
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeTables, setIncludeTables] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Report Generator</h2>
          <p className="text-gray-600">Create and share comprehensive trial reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Share2 className="mr-2" size={16} />
            Share Report
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Download className="mr-2" size={16} />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Report Template</CardTitle>
              <CardDescription>Choose a template to start your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">{template.icon}</div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-600">{template.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Report Content */}
          <Card>
            <CardHeader>
              <CardTitle>Report Content</CardTitle>
              <CardDescription>Customize your report sections and content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Report Title</Label>
                <Input 
                  value={reportTitle} 
                  onChange={e => setReportTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">Sections to Include</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {REPORT_SECTIONS.map(section => (
                    <div key={section.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={section.id}
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={() => toggleSection(section.id)}
                        disabled={section.required}
                      />
                      <Label htmlFor={section.id} className="flex items-center gap-2">
                        {section.name}
                        {section.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">Content Elements</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                    />
                    <Label htmlFor="charts" className="flex items-center gap-2">
                      <BarChart3 size={16} />
                      Charts & Graphs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tables"
                      checked={includeTables}
                      onCheckedChange={(checked) => setIncludeTables(checked === true)}
                    />
                    <Label htmlFor="tables" className="flex items-center gap-2">
                      <Grid size={16} />
                      Data Tables
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="images"
                      checked={includeImages}
                      onCheckedChange={(checked) => setIncludeImages(checked === true)}
                    />
                    <Label htmlFor="images" className="flex items-center gap-2">
                      <Image size={16} />
                      Field Images
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>Choose your preferred export format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXPORT_FORMATS.map(format => (
                  <div
                    key={format.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      exportFormat === format.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExportFormat(format.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-green-600">{format.icon}</div>
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-sm text-gray-600">{format.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report History & Sharing */}
        <div className="space-y-6">
          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>Your recently generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_REPORTS.map(report => (
                  <div key={report.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm">{report.name}</div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {report.created}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        {report.collaborators}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      <Button size="sm" variant="ghost">
                        <Eye size={14} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit size={14} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download size={14} />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Copy className="mr-2" size={16} />
                Duplicate Last Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="mr-2" size={16} />
                Share with Team
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2" size={16} />
                Create Template
              </Button>
            </CardContent>
          </Card>

          {/* Report Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Report Preview</CardTitle>
              <CardDescription>Preview of your current report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 h-48 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-2" />
                  <p className="text-sm">Report preview will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrialReportGenerator;
