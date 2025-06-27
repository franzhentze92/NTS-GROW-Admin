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

// Mock data for Analysis Creation Monitoring
export const MOCK_CLIENTS = [
  { id: '1', name: 'Farm A - John Smith' },
  { id: '2', name: 'Farm B - Maria Garcia' },
  { id: '3', name: 'Farm C - David Wilson' },
];

export const CONSULTANTS = [
  { id: '1', name: 'Alan Montalbetti' },
  { id: '2', name: 'Adriano de Senna' },
  { id: '3', name: 'Marco Giorgio' },
  { id: '4', name: 'Graeme Sait' },
];

export const CROP_OPTIONS = [
  // Fruits
  { id: '1', name: 'Avocado' },
  { id: '2', name: 'Citrus' },
  { id: '3', name: 'Grapes' },
  { id: '4', name: 'Apples' },
  { id: '5', name: 'Pears' },
  { id: '6', name: 'Peaches' },
  { id: '7', name: 'Nectarines' },
  { id: '8', name: 'Plums' },
  { id: '9', name: 'Apricots' },
  { id: '10', name: 'Cherries' },
  { id: '11', name: 'Strawberries' },
  { id: '12', name: 'Blueberries' },
  { id: '13', name: 'Raspberries' },
  { id: '14', name: 'Blackberries' },
  { id: '15', name: 'Mangoes' },
  { id: '16', name: 'Bananas' },
  { id: '17', name: 'Pineapples' },
  { id: '18', name: 'Papayas' },
  { id: '19', name: 'Kiwifruit' },
  { id: '20', name: 'Figs' },
  { id: '21', name: 'Pomegranates' },
  { id: '22', name: 'Olives' },
  { id: '23', name: 'Dates' },
  { id: '24', name: 'Persimmons' },
  { id: '25', name: 'Quinces' },
  { id: '26', name: 'Mulberries' },
  { id: '27', name: 'Gooseberries' },
  { id: '28', name: 'Currants' },
  { id: '29', name: 'Cranberries' },
  { id: '30', name: 'Elderberries' },
  { id: '31', name: 'Boysenberries' },
  { id: '32', name: 'Loganberries' },
  { id: '33', name: 'Marionberries' },
  { id: '34', name: 'Tayberries' },
  { id: '35', name: 'Youngberries' },
  { id: '36', name: 'Dewberries' },
  { id: '37', name: 'Huckleberries' },
  { id: '38', name: 'Lingonberries' },
  { id: '39', name: 'Cloudberries' },
  { id: '40', name: 'Salmonberries' },
  { id: '41', name: 'Thimbleberries' },
  { id: '42', name: 'Wineberries' },
  { id: '43', name: 'Jostaberries' },
  { id: '44', name: 'Goji Berries' },
  { id: '45', name: 'Aronia Berries' },
  { id: '46', name: 'Sea Buckthorn' },
  { id: '47', name: 'Buffaloberries' },
  { id: '48', name: 'Chokecherries' },
  { id: '49', name: 'Nanking Cherries' },
  { id: '50', name: 'Cornelian Cherries' },
  { id: '51', name: 'Jujubes' },
  { id: '52', name: 'Loquats' },
  { id: '53', name: 'Medlars' },
  { id: '54', name: 'Sorbus' },
  { id: '55', name: 'Hawthorns' },
  { id: '56', name: 'Rowans' },
  { id: '57', name: 'Serviceberries' },
  { id: '58', name: 'Juneberries' },
  { id: '59', name: 'Saskatoons' },
  { id: '60', name: 'Chokeberries' },
  { id: '61', name: 'Silverberries' },
  { id: '62', name: 'Autumn Olives' },
  { id: '63', name: 'Russian Olives' },
  { id: '64', name: 'Sea Buckthorns' },
  { id: '65', name: 'Wolfberries' },
  { id: '66', name: 'Goumi Berries' },
  { id: '67', name: 'Noni' },
  { id: '68', name: 'Acerola' },
  { id: '69', name: 'Camu Camu' },
  { id: '70', name: 'Tamarillo' },
  { id: '71', name: 'Tree Tomato' },
  { id: '72', name: 'Cape Gooseberry' },
  { id: '73', name: 'Ground Cherry' },
  { id: '74', name: 'Tomatillo' },
  { id: '75', name: 'Physalis' },
  { id: '76', name: 'Goldenberry' },
  { id: '77', name: 'Inca Berry' },
  { id: '78', name: 'Poha Berry' },
  { id: '79', name: 'Husk Cherry' },
  { id: '80', name: 'Strawberry Tomato' },
  { id: '81', name: 'Chinese Lantern' },
  { id: '82', name: 'Winter Cherry' },
  { id: '83', name: 'Bladder Cherry' },
  { id: '84', name: 'Japanese Lantern' },
  { id: '85', name: 'Alkekengi' },
  { id: '86', name: 'Peruvian Ground Cherry' },
  { id: '87', name: 'Dwarf Cape Gooseberry' },
  { id: '88', name: 'Giant Ground Cherry' },
  { id: '89', name: 'Purple Ground Cherry' },
  { id: '90', name: 'Yellow Ground Cherry' },
  { id: '91', name: 'Red Ground Cherry' },
  { id: '92', name: 'Orange Ground Cherry' },
  { id: '93', name: 'White Ground Cherry' },
  { id: '94', name: 'Black Ground Cherry' },
  { id: '95', name: 'Green Ground Cherry' },
  { id: '96', name: 'Blue Ground Cherry' },
  { id: '97', name: 'Pink Ground Cherry' },
  { id: '98', name: 'Brown Ground Cherry' },
  { id: '99', name: 'Gray Ground Cherry' },
  
  // Vegetables
  { id: '101', name: 'Tomatoes' },
  { id: '102', name: 'Potatoes' },
  { id: '103', name: 'Carrots' },
  { id: '104', name: 'Onions' },
  { id: '105', name: 'Garlic' },
  { id: '106', name: 'Lettuce' },
  { id: '107', name: 'Spinach' },
  { id: '108', name: 'Kale' },
  { id: '109', name: 'Cabbage' },
  { id: '110', name: 'Broccoli' },
  { id: '111', name: 'Cauliflower' },
  { id: '112', name: 'Brussels Sprouts' },
  { id: '113', name: 'Peppers' },
  { id: '114', name: 'Cucumbers' },
  { id: '115', name: 'Zucchini' },
  { id: '116', name: 'Squash' },
  { id: '117', name: 'Pumpkins' },
  { id: '118', name: 'Eggplant' },
  { id: '119', name: 'Beans' },
  { id: '120', name: 'Peas' },
  { id: '121', name: 'Corn' },
  { id: '122', name: 'Asparagus' },
  { id: '123', name: 'Celery' },
  { id: '124', name: 'Parsnips' },
  { id: '125', name: 'Turnips' },
  { id: '126', name: 'Rutabagas' },
  { id: '127', name: 'Beets' },
  { id: '128', name: 'Radishes' },
  { id: '129', name: 'Sweet Potatoes' },
  { id: '130', name: 'Yams' },
  { id: '131', name: 'Ginger' },
  { id: '132', name: 'Turmeric' },
  { id: '133', name: 'Horseradish' },
  { id: '134', name: 'Wasabi' },
  { id: '135', name: 'Artichokes' },
  { id: '136', name: 'Cardoons' },
  { id: '137', name: 'Rhubarb' },
  { id: '138', name: 'Sorrel' },
  { id: '139', name: 'Dock' },
  { id: '140', name: 'Burdock' },
  { id: '141', name: 'Jerusalem Artichokes' },
  { id: '142', name: 'Sunchokes' },
  { id: '143', name: 'Crosnes' },
  { id: '144', name: 'Chinese Artichokes' },
  { id: '145', name: 'Japanese Artichokes' },
  { id: '146', name: 'Korean Artichokes' },
  { id: '147', name: 'Vietnamese Artichokes' },
  { id: '148', name: 'Thai Artichokes' },
  { id: '149', name: 'Indian Artichokes' },
  { id: '150', name: 'African Artichokes' },
  
  // Grains and Cereals
  { id: '151', name: 'Wheat' },
  { id: '152', name: 'Rice' },
  { id: '153', name: 'Corn/Maize' },
  { id: '154', name: 'Barley' },
  { id: '155', name: 'Oats' },
  { id: '156', name: 'Rye' },
  { id: '157', name: 'Sorghum' },
  { id: '158', name: 'Millet' },
  { id: '159', name: 'Quinoa' },
  { id: '160', name: 'Amaranth' },
  { id: '161', name: 'Buckwheat' },
  { id: '162', name: 'Teff' },
  { id: '163', name: 'Fonio' },
  { id: '164', name: 'Job\'s Tears' },
  { id: '165', name: 'Wild Rice' },
  { id: '166', name: 'Spelt' },
  { id: '167', name: 'Kamut' },
  { id: '168', name: 'Einkorn' },
  { id: '169', name: 'Emmer' },
  { id: '170', name: 'Durum' },
  { id: '171', name: 'Triticale' },
  
  // Nuts
  { id: '176', name: 'Almonds' },
  { id: '177', name: 'Walnuts' },
  { id: '178', name: 'Pecans' },
  { id: '179', name: 'Hazelnuts' },
  { id: '180', name: 'Pistachios' },
  { id: '181', name: 'Cashews' },
  { id: '182', name: 'Macadamia Nuts' },
  { id: '183', name: 'Brazil Nuts' },
  { id: '184', name: 'Pine Nuts' },
  { id: '185', name: 'Chestnuts' },
  { id: '186', name: 'Acorns' },
  { id: '187', name: 'Beechnuts' },
  { id: '188', name: 'Hickory Nuts' },
  { id: '189', name: 'Butternuts' },
  { id: '190', name: 'Black Walnuts' },
  { id: '191', name: 'English Walnuts' },
  { id: '192', name: 'Persian Walnuts' },
  { id: '193', name: 'Carpathian Walnuts' },
  { id: '194', name: 'California Walnuts' },
  { id: '195', name: 'Chandler Walnuts' },
  { id: '196', name: 'Howard Walnuts' },
  { id: '197', name: 'Tulare Walnuts' },
  { id: '198', name: 'Vina Walnuts' },
  { id: '199', name: 'Serr Walnuts' },
  { id: '200', name: 'Hartley Walnuts' },
  
  // Herbs and Spices
  { id: '201', name: 'Basil' },
  { id: '202', name: 'Rosemary' },
  { id: '203', name: 'Thyme' },
  { id: '204', name: 'Sage' },
  { id: '205', name: 'Oregano' },
  { id: '206', name: 'Mint' },
  { id: '207', name: 'Parsley' },
  { id: '208', name: 'Cilantro' },
  { id: '209', name: 'Dill' },
  { id: '210', name: 'Fennel' },
  { id: '211', name: 'Lavender' },
  { id: '212', name: 'Lemon Balm' },
  { id: '213', name: 'Lemon Verbena' },
  { id: '214', name: 'Lemon Grass' },
  { id: '215', name: 'Lemon Thyme' },
  { id: '216', name: 'Lemon Basil' },
  { id: '217', name: 'Lemon Mint' },
  { id: '218', name: 'Lemon Sage' },
  { id: '219', name: 'Lemon Rosemary' },
  { id: '220', name: 'Lemon Oregano' },
  { id: '221', name: 'Lemon Parsley' },
  { id: '222', name: 'Lemon Cilantro' },
  { id: '223', name: 'Lemon Dill' },
  { id: '224', name: 'Lemon Fennel' },
  { id: '225', name: 'Lemon Lavender' },
  
  // Other Crops
  { id: '226', name: 'Hemp' },
  { id: '227', name: 'Flax' },
  { id: '228', name: 'Sunflower' },
  { id: '229', name: 'Safflower' },
  { id: '230', name: 'Canola' },
  { id: '231', name: 'Rapeseed' },
  { id: '232', name: 'Mustard' },
  { id: '233', name: 'Sesame' },
  { id: '234', name: 'Poppy' },
  { id: '235', name: 'Chia' },
  { id: '236', name: 'Psyllium' },
  { id: '237', name: 'Plantain' },
  { id: '238', name: 'Chickweed' },
  { id: '239', name: 'Dandelion' },
  { id: '240', name: 'Nettle' },
  { id: '241', name: 'Comfrey' },
  { id: '242', name: 'Yarrow' },
  { id: '243', name: 'Calendula' },
  { id: '244', name: 'Chamomile' },
  { id: '245', name: 'Echinacea' },
  { id: '246', name: 'Ginseng' },
  { id: '247', name: 'Ginkgo' },
  { id: '248', name: 'St. John\'s Wort' },
  { id: '249', name: 'Valerian' },
  { id: '250', name: 'Passionflower' },
  
  // Other
  { id: '251', name: 'Other' },
];

export const CATEGORY_OPTIONS = [
  { id: '1', name: 'Horticulture' },
  { id: '2', name: 'Fruits and Vineyards' },
  { id: '3', name: 'Broadacre' },
  { id: '4', name: 'Pasture' },
];

export const FARM_OPTIONS = [
  { id: '1', name: 'North Farm' },
  { id: '2', name: 'South Farm' },
  { id: '3', name: 'East Farm' },
  { id: '4', name: 'West Farm' },
  { id: '5', name: 'Central Farm' },
  { id: '6', name: 'Yandina Farm' },
  { id: '7', name: 'Nutrition Farms' },
  { id: '8', name: 'Demo Farm' },
  { id: '9', name: 'Research Farm' },
  { id: '10', name: 'Other' },
];

export const PADDOCK_OPTIONS = [
  { id: '1', name: 'Paddock A' },
  { id: '2', name: 'Paddock B' },
  { id: '3', name: 'Paddock C' },
  { id: '4', name: 'Ginger Paddock' },
  { id: '5', name: 'Iowa Demo Field' },
  { id: '6', name: 'North Field' },
  { id: '7', name: 'South Field' },
  { id: '8', name: 'East Field' },
  { id: '9', name: 'West Field' },
  { id: '10', name: 'Central Field' },
  { id: '11', name: 'Orchard Block' },
  { id: '12', name: 'Vineyard Block' },
  { id: '13', name: 'Pasture Block' },
  { id: '14', name: 'Other' },
];

// Navigation items with hierarchical structure and role-based access
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
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
        label: 'Analysis Management',
        icon: 'ClipboardList',
        children: [
          { id: 'enter-analysis', label: 'Register New Analysis', path: '/agronomist/analysis/enter', icon: 'Plus' },
          { id: 'analysis-reports', label: 'Analysis Reports', path: '/agronomist/analysis/reports', icon: 'BarChart3' },
        ]
      },
      {
        id: 'satellite-imagery',
        label: 'Satellite Imagery',
        icon: 'Satellite',
        children: [
          { id: 'crop-health', label: 'Crop Health', path: '/agronomist/satellite/crop-health', icon: 'Leaf' },
          { id: 'weather', label: 'Weather', path: '/agronomist/satellite/weather', icon: 'Cloud' },
        ]
      },
      {
        id: 'smart-tools',
        label: 'G.R.O.W Smart Tools',
        icon: 'Zap',
        children: [
          {
            id: 'irrigation',
            label: 'Irrigation',
            icon: 'Droplets',
            children: [
              { id: 'irrigation-calculation', label: 'Irrigation Calculation', path: '/agronomist/smart-tools/irrigation/calculation', icon: 'Calculator' },
            ]
          },
          {
            id: 'crop-nutrition',
            label: 'Crop Nutrition',
            icon: 'Leaf',
            children: [
              { id: 'nts-product-recommendator', label: 'NTS Product Recommendator', path: '/agronomist/smart-tools/crop-nutrition/recommendator', icon: 'Package' },
            ]
          },
          {
            id: 'crop-protection',
            label: 'Crop Protection',
            icon: 'Shield',
            children: [
              { id: 'growing-degree-days', label: 'Growing Degree Days', path: '/agronomist/smart-tools/crop-protection/gdd', icon: 'Thermometer' },
            ]
          },
        ]
      },
      { id: 'chatbots', label: 'G-Man Chat', path: '/agronomist/chat', icon: 'MessageCircle' },
      { id: 'weather', label: 'General Weather', path: '/agronomist/weather', icon: 'Cloud' },
      { id: 'agronomist-documents', label: 'Documents', path: '/agronomist/documents', icon: 'Folder' },
      { id: 'crop-nutrition', label: 'Crop Nutrition Thresholds', path: '/agronomist/crop-nutrition', icon: 'Scale' },
      {
        id: 'client-management',
        label: 'Client Management',
        icon: 'Users',
        children: [
          { id: 'client-database', label: 'Client Database', path: '/agronomist/clients', icon: 'Database' },
        ]
      },
      {
        id: 'field-visits',
        label: 'Field Visits',
        icon: 'MapPin',
        children: [
          { id: 'field-visits-management', label: 'Field Visits Management', path: '/agronomist/field-visits', icon: 'ClipboardList' },
        ]
      },
      {
        id: 'field-trials',
        label: 'Field Trials',
        icon: 'Target',
        children: [
          { id: 'trial-project-management', label: 'Trial Project Management', path: '/agronomist/field-trials', icon: 'ClipboardList' },
          { id: 'trial-design', label: 'Advanced Map & Plot Design', path: '/agronomist/field-trials/design', icon: 'MapPin' },
          { id: 'treatment-variable-management', label: 'Treatment & Variable Management', path: '/agronomist/field-trials/treatments', icon: 'Package' },
          { id: 'data-entry', label: 'Data Collection & Entry', path: '/agronomist/field-trials/data-entry', icon: 'ClipboardEdit' },
          { id: 'trial-analytics', label: 'Analytics & Statistics', path: '/agronomist/field-trials/analytics', icon: 'BarChart3' },
          { id: 'trial-reports', label: 'Reporting & Sharing', path: '/agronomist/field-trials/reports', icon: 'FileText' },
          { id: 'weather-integration', label: 'Weather Integration', path: '/agronomist/field-trials/weather', icon: 'Cloud' },
          { id: 'satellite-integration', label: 'Satellite Integration', path: '/agronomist/field-trials/satellite', icon: 'Satellite' },
        ]
      },
      { id: 'product-batch-production', label: 'Product Batch Production', path: '/agronomist/product-batch-production', icon: 'Package' },
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
  },
  {
    id: 'grow-education',
    label: 'G.R.O.W Education',
    icon: 'Book',
    children: [
      { id: 'grow-library', label: 'G.R.O.W Library', path: '/education/library', icon: 'Book', comingSoon: true },
      {
        id: 'online-learning',
        label: 'Online Learning',
        icon: 'GraduationCap',
        children: [
          { id: 'courses', label: 'Courses', path: '/education/online-learning/courses', icon: 'ListChecks', comingSoon: true },
          { id: 'podcast', label: 'Podcast', path: '/education/online-learning/podcast', icon: 'Mic', comingSoon: true },
          { id: 'videos', label: 'Videos', path: '/education/online-learning/videos', icon: 'Video', comingSoon: true },
        ]
      },
      { id: 'grow-health-index', label: 'G.R.O.W Health Index', path: '/education/health-index', icon: 'HeartPulse', comingSoon: true },
      { id: 'events', label: 'Events', path: '/education/events', icon: 'Calendar', comingSoon: true },
      {
        id: 'grow-arcade',
        label: 'G.R.O.W Arcade',
        icon: 'Gamepad2',
        children: [
          { id: 'trivia-challenge', label: 'Trivia Challenge', path: '/education/arcade/trivia', icon: 'HelpCircle', comingSoon: true },
        ]
      },
    ]
  },
];

export const PRODUCTS = [
  {
    product_name: "Nutri‑Life B.Sub™",
    microbes: ["Bacillus subtilis"],
    application: ["Soil", "Foliar"],
    product_form: "Liquid",
    organic_certified: true,
    benefits: [
      "Phosphorus solubilization through organic acids and siderophores",
      "Plant hormone production (auxins, gibberellins, cytokinins)",
      "Induced systemic resistance (ISR) enhances disease tolerance",
      "Phytoalexin-like antimicrobial production",
      "Biofilm disruption and rhizosphere balance",
      "Stress resilience against heat, drought, UV, salinity, and chemicals",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Reduces reliance on chemical nutrients and pesticides"
    ],
    description: "Selected Bacillus subtilis strain with activator powder designed to boost growth, nutrient availability, resilience, rhizosphere balance, and natural immunity.",
    link: "https://nutri-tech.com.au/products/b-sub",
    image: "/assets/b-sub.webp"
  },
  {
    product_name: "Nutri‑Life BAM™",
    microbes: [
      "Lactic acid bacteria",
      "Purple non-sulfur bacteria",
      "Beneficial yeasts",
      "Fermenting fungi"
    ],
    application: ["Soil", "Foliar", "Compost"],
    product_form: "Liquid",
    organic_certified: true,
    benefits: [
      "Atmospheric nitrogen fixation (free‑living N₂ → NH₄⁺)",
      "Phosphorus solubilization through organic acids and siderophores",
      "Potassium solubilization via organic acids",
      "Iron reduction enhances iron availability",
      "Manganese reduction improves manganese uptake",
      "Organic matter decomposition accelerates crop residue breakdown",
      "Compost enhancement to speed composting",
      "Biofilm disruption and rhizosphere balance",
      "Moisture retention via microbial mucilage",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Stress resilience against heat, drought, UV, salinity, and chemicals",
      "Improves nutrient availability (P, N, K, micronutrients)",
      "Populates roots and leaves with beneficial microbes",
      "Improves soil structure and water‑holding capacity",
      "Promotes soil and effluent remediation (manure ponds, septic systems)",
      "Reduces reliance on chemical nutrients and fertilizers"
    ],
    description: "Anaerobic microbial blend optimized for soil, foliar, or compost — accelerates residue breakdown, boosts nutrient cycling and availability, resilience, and biological balance.",
    link: "https://nutri-tech.com.au/products/nutri-life-bam",
    image: "/assets/Nutri-LifeBAM20L.webp"
  },
  {
    product_name: "Nutri‑Life Bio‑N™",
    microbes: ["Azotobacter vinelandii"],
    application: ["Soil", "Seed treatment"],
    product_form: "Liquid",
    organic_certified: true,
    benefits: [
      "Atmospheric nitrogen fixation (free‑living N₂ → NH₄⁺)",
      "Plant hormone production (auxins, gibberellins, cytokinins)",
      "Enhances root development, function, and seedling emergence",
      "Moisture retention via microbial mucilage",
      "Phosphorus solubilization through organic acids and siderophores",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Improves nutrient availability (P, N)",
      "Reduces reliance on chemical fertilizers"
    ],
    description: "Azotobacter vinelandii inoculant supplying nitrogen fixation, growth hormones, root/seedling support, moisture retention, P mobilization, and rhizosphere balance.",
    link: "https://nutri-tech.com.au/products/bio-n",
    image: "/assets/Nutri-LifeBio-N5L.webp"
  },
  {
    product_name: "Nutri‑Life Micro‑Force™",
    microbes: ["Bacillus amyloliquefaciens", "Other Bacillus spp."],
    application: ["Soil", "Foliar"],
    product_form: "Solid/Liquid depending on brewing",
    organic_certified: false,
    benefits: [
      "Plant hormone production (auxins, gibberellins, cytokinins)",
      "Atmospheric nitrogen fixation (free‑living N₂ → NH₄⁺)",
      "Phosphorus solubilization through organic acids and siderophores",
      "Potassium solubilization",
      "Improves nutrient availability (P, N, K, micronutrients)",
      "Enhances root development, function, and seedling emergence",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Stress resilience against heat, drought, UV, salinity, and chemicals",
      "Reduces reliance on chemical nutrients"
    ],
    description: "Bacillus-dominant blend designed for on-farm brewing to boost nutrient cycling, root growth, resilience, hormone production, and rhizosphere balance.",
    link: "https://nutri-tech.com.au/products/micro-force",
    image: "/assets/Nutri-LifeMicro-Force20kg.webp"
  },
  {
    product_name: "Nutri‑Life Bio‑P™",
    microbes: ["Bacillus polymyxa", "Bacillus megaterium"],
    application: ["Soil", "Foliar", "Seed"],
    product_form: "Liquid",
    organic_certified: false,
    benefits: [
      "Phosphorus solubilization through organic acids and siderophores",
      "Enhances root development, function, and seedling emergence",
      "Increases nutrient availability (P)",
      "Increases Brix (sugar) levels and overall crop quality"
    ],
    description: "Bacillus spp. inoculant to unlock locked‑up soil phosphate reserves, enhancing root growth, sugar levels, quality, and yield.",
    link: "https://nutri-tech.com.au/products/bio-p",
    image: "/assets/Nutri-LifeBio-P5L_11109878-ee20-4f0c-b071-ca0d55fc945a.webp"
  },
  {
    product_name: "Nutri‑Life Bio‑Plex™",
    microbes: ["Azotobacter vinelandii", "Bacillus subtilis"],
    application: ["Foliar"],
    product_form: "Liquid",
    organic_certified: true,
    benefits: [
      "Atmospheric nitrogen fixation (free‑living N₂ → NH₄⁺)",
      "Plant hormone production (auxins, gibberellins, cytokinins)",
      "Phosphorus solubilization through organic acids and siderophores",
      "Increases Brix (sugar) levels and overall crop quality",
      "Vitamin production on leaf surfaces (C, E, B‑group)",
      "Induced systemic resistance (ISR) enhances disease tolerance",
      "Bio‑balancing probiotic supports healthy phyllosphere"
    ],
    description: "Foliar inoculum combining N‑fixing Azotobacter and Bacillus for hormone and vitamin production, phosphorus availability, immunity, quality, and balance.",
    link: "https://nutri-tech.com.au/products/bio-plex",
    image: "/assets/Nutri-LifeBio-Plex5L.webp"
  },
  {
    product_name: "Nutri‑Life Platform®",
    microbes: [
      "Glomus intraradices",
      "Glomus clarum", 
      "Glomus aggregatum",
      "Glomus deserticola",
      "Glomus macrocarpum",
      "Glomus caledonium",
      "Glomus mosseae",
      "Gigaspora rosea",
      "Gigaspora margarita",
      "Scutelospora heterogama",
      "Azospirillum brasilense",
      "Azotobacter chroococcum",
      "Gluconacetobacter diazotrophicus",
      "Bacillus megaterium",
      "Pseudomonas fluorescens"
    ],
    application: ["Seed treatment", "Soil"],
    product_form: "Solid",
    organic_certified: false,
    benefits: [
      "Mycorrhizal symbiosis",
      "Atmospheric nitrogen fixation (free‑living N₂ → NH₄⁺)",
      "Phosphorus solubilization through organic acids and siderophores",
      "Potassium solubilization",
      "Iron reduction enhances iron availability",
      "Manganese reduction improves manganese uptake",
      "Zinc mobilization",
      "Plant hormone production (auxins etc.)",
      "Enhances root development, function, and seedling emergence",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Stress resilience against heat, drought, UV, salinity, and chemicals",
      "Expands root zone via AMF colonization and glomalin production",
      "Reduces reliance on chemical nutrients"
    ],
    description: "Multi‑species seed/soil inoculant combining mycorrhizal fungi with beneficial bacteria to expand root zone, unlock nutrients (NPK + micronutrients), support hormones, resilience, and microbial balance.",
    link: "https://nutri-tech.com.au/products/platform",
    image: "/assets/Platform_1Kg_03122024.webp"
  },
  {
    product_name: "Nutri‑Life Tricho‑Shield™",
    microbes: ["Trichoderma harzianum", "T. lignorum", "T. koningii"],
    application: ["Soil", "Foliar", "Seed"],
    product_form: "Solid",
    organic_certified: false,
    benefits: [
      "Plant hormone production via Trichoderma metabolites",
      "Induced systemic resistance (ISR) enhances disease tolerance",
      "Pathogen suppression",
      "Insect pest biocontrol",
      "Bio‑balancing probiotic supports healthy rhizosphere and phyllosphere",
      "Enhances root development, function, and seedling emergence",
      "Suitable across all crop stages (seed to harvest)"
    ],
    description: "Talc-based Trichoderma blend to enhance growth, root development, immunity, microbial balance, and disease suppression throughout the crop cycle.",
    link: "https://nutri-tech.com.au/products/tricho-shield",
    image: "/assets/Nutri-LifeTricho-Shield1kg.webp"
  },
  {
    product_name: "Nutri‑Life Myco‑Force™",
    microbes: ["Beauveria bassiana", "Metarhizium anisopliae", "Lecanicillium lecanii"],
    application: ["Soil", "Foliar"],
    product_form: "Solid (talc)",
    organic_certified: true,
    benefits: [
      "Repopulates soil with beneficial fungi (Trichoderma, Beauveria, Metarhizium)",
      "Insect pest biocontrol",
      "Assists recovery from insect damage through entomopathogenic fungi",
      "Bio‑balancing probiotic supports healthy rhizosphere",
      "Suitable across all crop stages (seed to harvest)",
      "Reduces reliance on chemical nutrients and pesticides"
    ],
    description: "Talc‑based entomopathogenic fungal blend to restore beneficial fungal populations, aid insect‑damage recovery, and support microbial balance.",
    link: "https://nutri-tech.com.au/products/myco-force",
    image: "/assets/Nutri-LifeMyco-Force5kg.webp"
  }
  // ... more products ...
];