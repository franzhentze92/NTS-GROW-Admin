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
export const MOCK_USERS: Array<{
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'agronomist' | 'admin' | 'super-admin';
}> = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Super Admin', email: 'superadmin@ntsgrow.com', password: 'admin123', role: 'super-admin' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Admin User', email: 'admin@ntsgrow.com', password: 'password', role: 'admin' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Agronomist', email: 'agronomist@ntsgrow.com', password: 'password', role: 'agronomist' },
];

// Navigation items with hierarchical structure and role-based access
export const NAV_ITEMS = [
  {
    id: 'grow-agronomist',
    label: 'G.R.O.W Agronomist',
    icon: 'Leaf',
    roles: ['agronomist', 'admin', 'super-admin'], // All roles can access
    children: [
      {
        id: 'soil-plant-therapy',
        label: 'Soil & Plant Therapy',
        icon: 'Sprout',
        children: [
          {
            id: 'soil',
            label: 'Soil',
            icon: 'Droplets',
            children: [
              { id: 'create-soil-chart', label: 'Create Soil Chart', path: '/agronomist/soil/create-chart', icon: 'BarChart' },
              { id: 'create-soil-report', label: 'Create Soil Report', path: '/agronomist/soil/create-report', icon: 'FileText' },
              { id: 'view-soil-reports', label: 'View Saved Reports', path: '/agronomist/soil/reports', icon: 'FolderOpen' },
            ]
          },
          {
            id: 'plant',
            label: 'Plant',
            icon: 'Leaf',
            children: [
              { id: 'create-leaf-chart', label: 'Create Leaf Chart', path: '/agronomist/plant/create-chart', icon: 'BarChart' },
              { id: 'create-leaf-report', label: 'Create Leaf Report', path: '/agronomist/plant/create-report', icon: 'FileText' },
              { id: 'view-leaf-reports', label: 'View Saved Reports', path: '/agronomist/plant/reports', icon: 'FolderOpen' },
            ]
          }
        ]
      },
      {
        id: 'analysis-monitoring',
        label: 'Analysis Creation Monitoring',
        icon: 'Activity',
        children: [
          { id: 'enter-analysis', label: 'Enter New Analysis', path: '/agronomist/analysis/enter', icon: 'Plus' },
          { id: 'analysis-reports', label: 'Analysis Reports', path: '/agronomist/analysis/reports', icon: 'BarChart3' },
        ]
      },
      { id: 'g-man-chat', label: 'G-Man Chat', path: '/agronomist/g-man-chat', icon: 'MessageCircle' },
      { id: 'weather', label: 'Weather', path: '/agronomist/weather', icon: 'Cloud' },
      { id: 'fertiliser-prices', label: 'Fertiliser Prices', path: '/agronomist/fertiliser-prices', icon: 'DollarSign' },
      { id: 'agronomist-documents', label: 'Documents', path: '/agronomist/documents', icon: 'Folder' },
      { id: 'crop-nutrition', label: 'Crop Nutrition Thresholds', path: '/agronomist/crop-nutrition', icon: 'Scale' },
    ]
  },
  {
    id: 'grow-admin',
    label: 'G.R.O.W Admin',
    icon: 'Shield',
    roles: ['admin', 'super-admin'], // Only admin and super-admin can access
    children: [
      {
        id: 'grow-analytics',
        label: 'G.R.O.W Analytics',
        icon: 'BarChart3',
        children: [
          { id: 'admin-dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
          { id: 'web-traffic', label: 'Web Traffic Analytics', path: '/admin/web-traffic', icon: 'LineChart' },
          { id: 'financial-analytics', label: 'Financial Analytics', path: '/admin/financial', icon: 'DollarSign' },
        ]
      },
      {
        id: 'grow-development',
        label: 'G.R.O.W Development',
        icon: 'Code',
        children: [
          { id: 'task-calendar', label: 'Task Calendar', path: '/admin/task-calendar', icon: 'Calendar' },
          { id: 'monthly-strategies', label: 'Monthly Strategies', path: '/admin/monthly-strategies', icon: 'Target' },
        ]
      },
    ]
  },
  {
    id: 'grow-super-admin',
    label: 'G.R.O.W Super Admin',
    icon: 'Crown',
    roles: ['super-admin'], // Only super-admin can access
    children: [
      { id: 'task-management', label: 'Task Management', path: '/super-admin/task-management', icon: 'ClipboardEdit' },
      { id: 'strategy-management', label: 'Strategy Management', path: '/super-admin/strategy-management', icon: 'Target' },
      { id: 'cost-management', label: 'Cost Management', path: '/super-admin/cost-management', icon: 'DollarSign' },
    ]
  }
];