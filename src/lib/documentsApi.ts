import { supabase } from './supabaseClient';
import { CreateMessageData } from './types';

export interface Document {
    id: string;
    name: string;
    description?: string;
    category: string;
    file_type?: string;
    file_path: string;
    file_size?: number;
    uploaded_by_user_id?: string;
    created_at: string;
    updated_at: string;
    uploaded_by_user?: { name: string };
  }
  
  export interface CreateDocumentData {
    name: string;
    description?: string;
    category: string;
    file_type?: string;
    file_path: string;
    file_size?: number;
    uploaded_by_user_id: string;
  }
  
  const BUCKET_NAME = 'document-uploads';
  
  // Fetch all documents
  export const fetchDocuments = async (): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        uploaded_by_user:users(name)
      `)
      .order('created_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching documents:', error);
      throw new Error(error.message);
    }
  
    return data || [];
  };
  
  // Upload a file and create a document record
  export const uploadDocument = async (file: File, metadata: Omit<CreateDocumentData, 'file_path' | 'file_type' | 'file_size' | 'uploaded_by_user_id'> & { uploaded_by_user_id: string }): Promise<Document> => {
    const userId = metadata.uploaded_by_user_id;
    
    // 1. Upload the file to Supabase Storage
    const file_path = `${userId}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(file_path, file);
  
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(uploadError.message);
    }
  
    // 2. Create the document record in the database
    const documentData: CreateDocumentData = {
      ...metadata,
      file_path,
      file_type: file.type || 'unknown',
      file_size: file.size,
      uploaded_by_user_id: userId,
    };
  
    const { data, error: recordError } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();
  
    if (recordError) {
      console.error('Error creating document record:', recordError);
      // Clean up by deleting the uploaded file if the record creation fails
      await supabase.storage.from(BUCKET_NAME).remove([file_path]);
      throw new Error(recordError.message);
    }
  
    return data;
  };
  
  // Delete a document and its associated file
  export const deleteDocument = async (documentId: string, filePath: string): Promise<void> => {
    // 1. Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
  
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      throw new Error(storageError.message);
    }
  
    // 2. Delete the document record from the database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);
  
    if (dbError) {
      console.error('Error deleting document record:', dbError);
      throw new Error(dbError.message);
    }
  };
  
  // Get a public URL for a file (e.g., for downloading)
  export const getDocumentUrl = (filePath: string): string => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
  
    return data?.publicUrl || '';
  }; 