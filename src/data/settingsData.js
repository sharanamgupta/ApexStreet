export const initialUserProfile = {
  name: 'ApexStreet Admin',
  email: 'admin@apexstreet.city',
  role: 'System Administrator',
  avatar: 'A',
  department: 'Smart Infrastructure & Lighting Ops',
  location: 'Central Control Hub',
};

export const initialAppearanceSettings = {
  theme: 'dark', // dark, light, system
  density: 'comfortable', // comfortable, compact
  glowEffects: true,
  animations: true,
};

export const initialNotificationSettings = {
  systemAlerts: true,
  faultNotifications: true,
  automationAlerts: true,
  activityNotifications: false,
  reportNotifications: true,
  emailDigest: true,
};

export const initialSystemPreferences = {
  defaultMode: 'Auto', // Auto, Manual
  defaultBrightness: 75,
  autoFaultMonitoring: true,
  autoActivityLogging: true,
  telemetryIntervalSeconds: 30,
  emergencyOverrideLevel: 100,
};

export const initialSecuritySessionData = {
  lastLogin: '2026-08-13 09:00:10 AM',
  lastIpAddress: '192.168.1.50 (Secure Local Hub)',
  twoFactorStatus: 'Enabled',
  encryption: 'TLS 1.3 AES-256 GCM',
  activeSessionsCount: 1,
};
