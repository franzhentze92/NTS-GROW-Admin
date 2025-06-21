// Define types for the Task Calendar & Activity Tracker

export type TaskStatus = 'todo' | 'in-progress' | 'blocked' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 'design' | 'development' | 'qa' | 'content' | 'support';

export type Project = 'web-traffic' | 'dashboard' | 'analytics' | 'financial' | 'other';

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
