// NTS G.R.O.W Admin Constants

// Color theme
export const COLORS = {
  primary: '#2e7d32', // Green
  secondary: '#795548', // Brown
  accent: '#4caf50', // Light Green
  neutral: '#9e9e9e', // Gray
  background: '#f5f5f5',
  text: '#333333',
};

// Mock user data
export const MOCK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@ntsgrow.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'John Doe', email: 'john@ntsgrow.com', password: 'password', role: 'manager' },
  { id: 3, name: 'Jane Smith', email: 'jane@ntsgrow.com', password: 'password', role: 'analyst' },
];

// Navigation items with hierarchical structure
export const NAV_ITEMS = [
  {
    id: 'analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    children: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
      { id: 'traffic', label: 'Web Traffic Analytics', path: '/traffic', icon: 'LineChart' },
      { id: 'financial', label: 'Financial Analytics', path: '/financial', icon: 'DollarSign' },
    ]
  },
  {
    id: 'development',
    label: 'Development',
    icon: 'Code',
    children: [
      { id: 'tasks', label: 'Task Calendar', path: '/tasks', icon: 'Calendar' },
      { id: 'task-management', label: 'Task Management', path: '/task-management', icon: 'ClipboardEdit' },
      { id: 'strategies', label: 'Monthly Strategies', path: '/strategies', icon: 'Target' },
    ]
  },
  {
    id: 'messaging',
    label: 'Admins Messaging',
    icon: 'MessageSquare',
    children: [
      { id: 'inbox', label: 'Inbox', path: '/inbox', icon: 'Inbox' },
    ]
  },
];