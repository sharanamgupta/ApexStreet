import {
  initialAppearanceSettings,
  initialNotificationSettings,
  initialSecuritySessionData,
  initialSystemPreferences,
  initialUserProfile,
} from '../data/settingsData.js';

export const STORAGE_KEY = 'apexstreet-settings';

export const getDefaultSettings = () => ({
  profile: { ...initialUserProfile },
  appearance: { ...initialAppearanceSettings },
  notifications: { ...initialNotificationSettings },
  preferences: { ...initialSystemPreferences },
  securityInfo: { ...initialSecuritySessionData },
});

export const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultSettings();

    const parsed = JSON.parse(stored);
    const defaults = getDefaultSettings();

    return {
      profile: { ...defaults.profile, ...(parsed.profile || {}) },
      appearance: { ...defaults.appearance, ...(parsed.appearance || {}) },
      notifications: { ...defaults.notifications, ...(parsed.notifications || {}) },
      preferences: { ...defaults.preferences, ...(parsed.preferences || {}) },
      securityInfo: { ...defaults.securityInfo, ...(parsed.securityInfo || {}) },
    };
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
    return getDefaultSettings();
  }
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
};

export const resetSettings = () => {
  const defaults = getDefaultSettings();
  saveSettings(defaults);
  return defaults;
};

export const applyThemeAndDensity = (appearance) => {
  if (typeof document === 'undefined') return;

  const currentTheme = 'dark';
  const density = appearance?.density || 'comfortable';

  document.documentElement.setAttribute('data-theme', currentTheme);
  document.documentElement.setAttribute('data-density', density);
};
