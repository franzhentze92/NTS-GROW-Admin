import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDocuments, deleteDocument, getDocumentUrl } from '@/lib/documentsApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Search, Download, Trash2 } from 'lucide-react';
import UploadDocumentDialog from '@/components/documents/UploadDocumentDialog'; 
import { toast } from '@/components/ui/use-toast';

const getCurrentUserId = (): string | null => {
  const user = localStorage.getItem('currentUser');
  if (user) {
    const userData = JSON.parse(user);
    if (userData && typeof userData.id === 'string' && userData.id.length > 0) {
      return userData.id;
    }
  }
  return null;
};

const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ docId, filePath }: { docId: string, filePath: string }) => deleteDocument(docId, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast({ title: 'Success', description: 'Document deleted successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete document: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleDelete = (docId: string, filePath: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      deleteMutation.mutate({ docId, filePath });
    }
  };

  const handleDownload = (filePath: string) => {
    const url = getDocumentUrl(filePath);
    if (url) {
      // In a real app, you might want to use a more robust download method
      // that handles cross-origin issues, but for simplicity, we'll open in a new tab.
      window.open(url, '_blank');
    } else {
      toast({ title: 'Error', description: 'Could not retrieve download URL.', variant: 'destructive' });
    }
  };

  const categories = ['all', ...Array.from(new Set(documents.map(d => d.category)))];

  const filteredDocuments = documents
    .filter(doc => categoryFilter === 'all' || doc.category === categoryFilter)
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Documents Library</CardTitle>
            <Button onClick={() => setUploadOpen(true)} disabled={!currentUserId}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by document name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>File Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Loading documents...</TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-red-500">
                      Error: {error.message}
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center">No documents found.</TableCell>
                    </TableRow>
                ) : (
                  filteredDocuments.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.category}</TableCell>
                      <TableCell>{doc.file_type}</TableCell>
                      <TableCell>{doc.file_size ? `${(doc.file_size / 1024).toFixed(2)} KB` : '-'}</TableCell>
                      <TableCell>{doc.uploaded_by_user?.name || 'Unknown'}</TableCell>
                      <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(doc.file_path)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {currentUserId === doc.uploaded_by_user_id && (
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(doc.id, doc.file_path)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {currentUserId && (
        <UploadDocumentDialog 
          open={isUploadOpen} 
          onOpenChange={setUploadOpen} 
          currentUserId={currentUserId}
        /> 
      )}
    </div>
  );
};

export default DocumentsPage; 