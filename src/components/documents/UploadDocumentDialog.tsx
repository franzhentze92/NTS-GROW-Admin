import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { uploadDocument } from '@/lib/documentsApi';
import { toast } from '@/components/ui/use-toast';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

const DOCUMENT_CATEGORIES = [
  'Soil Analysis',
  'Leaf Analysis',
  'Fertilizer Recommendations',
  'Pest & Disease Reports',
  'Irrigation Plans',
  'Crop Management',
  'Field Visit Reports',
  'Harvest Records',
  'Weather Data',
  'Other Agriculture'
];

const UploadDocumentDialog: React.FC<UploadDocumentDialogProps> = ({ open, onOpenChange, currentUserId }) => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Set name from filename without extension
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/csv': ['.csv'],
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, metadata }: { file: File, metadata: any }) => uploadDocument(file, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Document uploaded successfully.' });
      handleClose();
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Upload failed: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleSubmit = () => {
    if (!file || !name || !category || !currentUserId) {
      toast({ title: 'Validation Error', description: 'Please provide a file, name, and category.', variant: 'destructive' });
      return;
    }

    const metadata = { name, description, category, uploaded_by_user_id: currentUserId };
    uploadMutation.mutate({ file, metadata });
  };

  const handleClose = () => {
    setFile(null);
    setName('');
    setDescription('');
    setCategory('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a New Document</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            {...getRootProps()}
            className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-2 border rounded-md">
              <div className="flex items-center gap-2">
                <FileIcon className="h-6 w-6 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q1 Financial Report" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief summary of the document..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDocumentDialog; 