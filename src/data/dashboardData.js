export const dashboardStats = [
  {
    id: 'total-lights',
    label: 'Total Street Lights',
    value: '500',
    detail: 'Across 6 monitored areas',
    trend: 'Simulated city network',
    tone: 'network',
    icon: 'grid',
  },
  {
    id: 'lights-online',
    label: 'Lights Online',
    value: '320',
    detail: '64% of total network',
    trend: 'Up 8.4% vs yesterday',
    tone: 'success',
    icon: 'power',
  },
  {
    id: 'lights-off',
    label: 'Lights Off',
    value: '165',
    detail: '33% of total network',
    trend: 'Scheduled dimming active',
    tone: 'muted',
    icon: 'moon',
  },
  {
    id: 'faulty-lights',
    label: 'Faulty Lights',
    value: '15',
    detail: 'Requires attention',
    trend: '3 critical issues',
    tone: 'danger',
    icon: 'alert',
  },
  {
    id: 'energy-saved',
    label: 'Estimated Energy Saved',
    value: '32.4 kWh',
    detail: '18.6% reduction',
    trend: 'Estimated / simulated',
    tone: 'energy',
    icon: 'bolt',
  },
];

export const areaData = [
  {
    id: 'main-road',
    name: 'Main Road',
    lights: 124,
    online: 118,
    faults: 2,
    brightness: '100%',
    health: 98,
    status: 'Operational',
  },
  {
    id: 'market',
    name: 'Market',
    lights: 86,
    online: 79,
    faults: 4,
    brightness: '85%',
    health: 92,
    status: 'Warning',
  },
  {
    id: 'residential-area',
    name: 'Residential Area',
    lights: 112,
    online: 71,
    faults: 3,
    brightness: '50%',
    health: 94,
    status: 'Operational',
  },
  {
    id: 'park',
    name: 'Park',
    lights: 58,
    online: 45,
    faults: 5,
    brightness: '45%',
    health: 78,
    status: 'Critical',
  },
  {
    id: 'highway',
    name: 'Highway',
    lights: 72,
    online: 55,
    faults: 1,
    brightness: '100%',
    health: 96,
    status: 'Operational',
  },
  {
    id: 'school-zone',
    name: 'School Zone',
    lights: 48,
    online: 38,
    faults: 0,
    brightness: '35%',
    health: 100,
    status: 'Operational',
  },
];

export const automationData = {
  status: 'Active',
  currentMode: 'Automatic',
  currentPhase: 'Daytime Shutdown',
  currentBrightness: '0%',
  nextTransition: '6h 08m',
  schedule: [
    {
      time: '06:00 AM',
      action: 'Off',
      brightness: '0%',
      state: 'current',
    },
    {
      time: '06:30 PM',
      action: 'On',
      brightness: '100%',
      state: 'upcoming',
    },
    {
      time: '10:00 PM',
      action: 'Dim',
      brightness: '50%',
      state: 'upcoming',
    },
  ],
};

export const energyData = {
  todayConsumption: '124.6 kWh',
  estimatedSaved: '32.4 kWh',
  estimatedSavings: '18.6%',
  label: 'Estimated / Simulated',
  week: [
    { day: 'Monday', shortDay: 'Mon', value: 118 },
    { day: 'Tuesday', shortDay: 'Tue', value: 126 },
    { day: 'Wednesday', shortDay: 'Wed', value: 121 },
    { day: 'Thursday', shortDay: 'Thu', value: 124 },
    { day: 'Friday', shortDay: 'Fri', value: 116 },
    { day: 'Saturday', shortDay: 'Sat', value: 108 },
    { day: 'Sunday', shortDay: 'Sun', value: 112 },
  ],
};

export const lightStatusData = [
  { label: 'On', value: 320, color: '#72e7ff' },
  { label: 'Off', value: 165, color: '#61788b' },
  { label: 'Faulty', value: 15, color: '#ff9b8d' },
];

export const faultAlerts = [
  {
    id: 'SL003',
    area: 'Park',
    issue: 'Lamp fault detected',
    severity: 'Critical',
    time: '10:12 PM',
  },
  {
    id: 'SL027',
    area: 'Main Road',
    issue: 'Communication issue',
    severity: 'Warning',
    time: '09:48 PM',
  },
  {
    id: 'SL104',
    area: 'Market',
    issue: 'Light unavailable',
    severity: 'Warning',
    time: '09:21 PM',
  },
];

export const recentActivities = [
  {
    id: 'activity-1',
    time: '06:30 PM',
    type: 'Automation',
    message: '24 lights switched ON automatically.',
    icon: 'automation',
  },
  {
    id: 'activity-2',
    time: '06:42 PM',
    type: 'Manual Override',
    message: 'SL021 changed to Manual Mode.',
    icon: 'manual',
  },
  {
    id: 'activity-3',
    time: '10:00 PM',
    type: 'Automation',
    message: 'Night dimming activated at 50%.',
    icon: 'automation',
  },
  {
    id: 'activity-4',
    time: '10:12 PM',
    type: 'Fault Detection',
    message: 'SL003 reported a fault.',
    icon: 'fault',
  },
];

export const quickActions = [
  {
    label: 'Add Street Light',
    icon: 'plus',
    route: null,
  },
  {
    label: 'Automation Settings',
    icon: 'bolt',
    route: null,
  },
  {
    label: 'View Faults',
    icon: 'warning',
    route: null,
  },
  {
    label: 'View Reports',
    icon: 'chart',
    route: null,
  },
];

export const manualLightsData = {
  totalManual: 42,
  activeOverrides: 8,
  autoModeTotal: 458,
  list: [
    { id: 'SL002', area: 'Market', status: 'OFF', brightness: '0%', mode: 'Manual', reason: 'Manual Power Cut', operator: 'Op_Ramesh', lastUpdated: '8 min ago' },
    { id: 'SL007', area: 'Main Road', status: 'ON', brightness: '90%', mode: 'Manual', reason: 'Road Inspection', operator: 'Op_Anand', lastUpdated: '5 min ago' },
    { id: 'SL021', area: 'Residential Area', status: 'ON', brightness: '100%', mode: 'Manual', reason: 'Maintenance Override', operator: 'Op_Priya', lastUpdated: '14 min ago' },
    { id: 'SL045', area: 'Park', status: 'DIM', brightness: '30%', mode: 'Manual', reason: 'Event Night Dimming', operator: 'Op_Suresh', lastUpdated: '22 min ago' },
    { id: 'SL088', area: 'Highway', status: 'ON', brightness: '100%', mode: 'Manual', reason: 'Construction Zone Safety', operator: 'Op_Karan', lastUpdated: '30 min ago' },
  ],
};
