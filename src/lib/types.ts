// Define types for the Task Calendar & Activity Tracker

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'design' | 'development' | 'qa' | 'content' | 'support';

export type Project = 'web-traffic' | 'overview' | 'analytics' | 'financial' | 'other';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: string;
  project: Project;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  startDate: Date;
  dueDate: Date;
  lastUpdated: Date;
  comments?: string;
}

export interface TaskFilterState {
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  project?: Project | 'all';
  category?: TaskCategory | 'all';
  status?: TaskStatus[] | 'all';
  search?: string;
}

// Message types for the messaging system
export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  subject: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  is_read: boolean;
  is_starred: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // User info for display
  from_user?: {
    id: string;
    name: string;
    email: string;
  };
  to_user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateMessageData {
  to_user_id: string;
  subject: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface UpdateMessageData {
  is_read?: boolean;
  is_starred?: boolean;
  is_archived?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'developer' | 'designer';
  password?: string;
  avatar_url?: string;
  avatarUrl?: string;
  address?: string;
  phone_number?: string;
}

// Document Management Types
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
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by_user_id: string;
}

export interface Analysis {
  id: string;
  created_at: string;
  client_name: string;
  consultant: string;
  analysis_type: 'soil' | 'leaf';
  crop: string;
  category: string;
  status: 'Draft' | 'Ready to be Checked' | 'Checked Ready to be Emailed' | 'Emailed';
  status_updated_at: string;
  updated_by: { id: string, name: string };
  eal_lab_no?: string;
  test_count?: number;
  notes?: string;
  pdf_file_path?: string;
  sample_no?: string;
  // Step tracking fields
  draft_by?: string;
  draft_date?: string;
  ready_check_by?: string;
  ready_check_date?: string;
  checked_by?: string;
  checked_date?: string;
  emailed_by?: string;
  emailed_date?: string;
}

export type AnalysisForCreate = Omit<Analysis, 'id' | 'created_at' | 'status_updated_at' | 'updated_by'> & {
  updated_by: string;
};

// Field Visit Types
export interface FieldVisit {
  id: string;
  farm_name: string;
  farmer_name: string;
  agronomist: string;
  visit_date: string;
  visit_type: 'routine' | 'emergency' | 'follow-up' | 'initial';
  crop_type: string;
  field_size: number;
  field_size_unit: 'hectares' | 'acres';
  soil_type?: string;
  weather_conditions?: string;
  observations: string;
  recommendations: string;
  next_visit_date?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  photos?: string[];
  created_at: string;
  updated_at: string;
  created_by: { id: string; name: string };
}

export interface CreateFieldVisitData {
  farm_name: string;
  farmer_name: string;
  agronomist: string;
  visit_date: string;
  visit_type: 'routine' | 'emergency' | 'follow-up' | 'initial';
  crop_type: string;
  field_size: number;
  field_size_unit: 'hectares' | 'acres';
  soil_type?: string;
  weather_conditions?: string;
  observations: string;
  recommendations: string;
  next_visit_date?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  photos?: string[];
}

export interface UpdateFieldVisitData extends Partial<CreateFieldVisitData> {
  id: string;
}
