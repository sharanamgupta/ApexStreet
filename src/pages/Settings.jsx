import React, { useEffect, useState } from 'react';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { getStoredToken } from '../utils/auth.js';
import { applyThemeAndDensity, loadSettings, saveSettings } from '../utils/settingsStorage.js';

const APP_VERSION = '0.1.0';
const DEFAULT_SETTINGS = {
  appearance: { theme: 'dark', density: 'comfortable' },
  notifications: { faultAlerts: true, maintenanceAlerts: true },
  preferences: { autoRefreshInterval: '30', defaultDashboardView: 'overview' },
};

function Panel({ children, className = '' }) {
  return <section className={`rounded-2xl border border-white/[0.09] bg-[#07131f]/75 shadow-[0_18px_55px_rgba(0,0,0,0.22)] ring-1 ring-cyan-100/[0.025] backdrop-blur-xl ${className}`}>{children}</section>;
}

function SectionHeading({ kicker, title, description }) {
  return <div className="mb-6"><div className="mb-3 h-px w-8 bg-[#72e7ff]/70" /><p className="mb-1 text-[0.68rem] font-black uppercase tracking-[0.18em] text-[#72e7ff]/80">{kicker}</p><h2 className="text-lg font-black tracking-tight text-slate-50">{title}</h2>{description ? <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-400">{description}</p> : null}</div>;
}

function ToggleSwitch({ enabled, onChange, label, description }) {
  return <div className="flex items-center justify-between gap-6 py-3.5"><div><span className="block text-sm font-bold text-slate-200">{label}</span><span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span></div><button type="button" role="switch" aria-label={label} aria-checked={enabled} onClick={() => onChange(!enabled)} className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300/30 ${enabled ? 'border-cyan-200/70 bg-cyan-300 shadow-[0_0_16px_rgba(114,231,255,0.2)]' : 'border-white/15 bg-slate-800'}`}><span className={`pointer-events-none absolute left-1 top-1 inline-block size-5 rounded-full shadow-md transition-transform duration-200 ${enabled ? 'translate-x-5 bg-[#041018]' : 'bg-slate-400'}`} /></button></div>;
}

function normalizeSettings(stored) {
  const notifications = stored?.notifications || {};
  const preferences = stored?.preferences || {};
  return {
    appearance: { ...DEFAULT_SETTINGS.appearance, ...(stored?.appearance || {}) },
    notifications: {
      faultAlerts: notifications.faultAlerts ?? notifications.faultNotifications ?? true,
      maintenanceAlerts: notifications.maintenanceAlerts ?? notifications.maintenanceNotifications ?? true,
    },
    preferences: {
      autoRefreshInterval: String(preferences.autoRefreshInterval ?? DEFAULT_SETTINGS.preferences.autoRefreshInterval),
      defaultDashboardView: preferences.defaultDashboardView ?? DEFAULT_SETTINGS.preferences.defaultDashboardView,
    },
  };
}

function Settings() {
  const [settings, setSettings] = useState(() => normalizeSettings(loadSettings()));
  const [apiStatus, setApiStatus] = useState('Checking...');
  const [notice, setNotice] = useState('');

  useEffect(() => { applyThemeAndDensity(settings.appearance); }, [settings.appearance]);

  useEffect(() => {
    let active = true;
    fetch('/api/areas', { headers: { Authorization: `Bearer ${getStoredToken()}` } })
      .then((response) => { if (active) setApiStatus(response.ok ? 'Connected' : `Requires authentication (${response.status})`); })
      .catch(() => { if (active) setApiStatus('Unavailable'); });
    return () => { active = false; };
  }, []);

  const update = (section, key, value) => setSettings((current) => ({ ...current, [section]: { ...current[section], [key]: value } }));
  const showNotice = (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 3000); };

  const saveCurrentSettings = () => {
    const stored = loadSettings();
    saveSettings({ ...stored, appearance: { ...stored.appearance, ...settings.appearance }, notifications: { ...stored.notifications, ...settings.notifications }, preferences: { ...stored.preferences, ...settings.preferences } });
    applyThemeAndDensity(settings.appearance);
    showNotice('Settings saved successfully.');
  };

  const resetToDefaults = () => {
    const stored = loadSettings();
    const next = { appearance: { ...DEFAULT_SETTINGS.appearance }, notifications: { ...DEFAULT_SETTINGS.notifications }, preferences: { ...DEFAULT_SETTINGS.preferences } };
    setSettings(next);
    saveSettings({ ...stored, appearance: { ...stored.appearance, ...next.appearance }, notifications: { ...stored.notifications, ...next.notifications }, preferences: { ...stored.preferences, ...next.preferences } });
    applyThemeAndDensity(next.appearance);
    showNotice('Settings reset to defaults.');
  };

  return <AppShell>
    <div className="mx-auto max-w-6xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-white/[0.08] pb-6">
        <div><p className="mb-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#72e7ff]/80">Workspace configuration</p><h1 className="text-2xl font-black tracking-tight text-slate-50 sm:text-[1.75rem]">Settings</h1><p className="mt-2 text-sm text-slate-400">Manage the preferences used by your ApexStreet workspace.</p></div>
        {notice ? <p className="rounded-lg border border-emerald-300/20 bg-emerald-400/[0.08] px-3.5 py-2.5 text-xs font-bold text-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">{notice}</p> : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-6"><SectionHeading kicker="Alerts" title="Notifications" description="Choose which operational alerts are enabled in this browser." /><div className="divide-y divide-white/[0.08]"><ToggleSwitch enabled={settings.notifications.faultAlerts} onChange={(value) => update('notifications', 'faultAlerts', value)} label="Fault alerts" description="Notify when a street light fault is reported." /><ToggleSwitch enabled={settings.notifications.maintenanceAlerts} onChange={(value) => update('notifications', 'maintenanceAlerts', value)} label="Maintenance alerts" description="Notify when maintenance attention is required." /></div></Panel>
        <Panel className="p-6"><SectionHeading kicker="Workspace" title="Display Preferences" description="Set the defaults used when working with dashboard data." /><div className="space-y-5"><label className="block text-xs font-bold text-slate-300">Auto-refresh interval<select value={settings.preferences.autoRefreshInterval} onChange={(event) => update('preferences', 'autoRefreshInterval', event.target.value)} className="mt-2.5 block h-11 w-full rounded-lg border border-white/[0.1] bg-[#0b1b2a] px-3.5 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10"><option value="0">Off</option><option value="15">Every 15 seconds</option><option value="30">Every 30 seconds</option><option value="60">Every minute</option><option value="300">Every 5 minutes</option></select></label><label className="block text-xs font-bold text-slate-300">Default dashboard view<select value={settings.preferences.defaultDashboardView} onChange={(event) => update('preferences', 'defaultDashboardView', event.target.value)} className="mt-2.5 block h-11 w-full rounded-lg border border-white/[0.1] bg-[#0b1b2a] px-3.5 text-sm font-medium text-slate-200 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/10"><option value="overview">Overview</option><option value="street-lights">Street Lights</option><option value="areas">Areas</option><option value="automation">Automation</option></select></label></div></Panel>
        <Panel className="p-6"><SectionHeading kicker="Platform" title="System Information" description="Connection and application details for this installation." /><dl className="divide-y divide-white/[0.08] text-sm"><div className="flex items-center justify-between gap-4 py-3 first:pt-0"><dt className="text-slate-500">Application name</dt><dd className="font-bold text-slate-200">ApexStreet</dd></div><div className="flex items-center justify-between gap-4 py-3"><dt className="text-slate-500">Application version</dt><dd className="font-bold text-slate-200">v{APP_VERSION}</dd></div><div className="flex items-center justify-between gap-4 py-3 last:pb-0"><dt className="text-slate-500">Backend/API status</dt><dd className={`inline-flex items-center gap-2 font-bold ${apiStatus === 'Connected' ? 'text-emerald-300' : apiStatus === 'Checking...' ? 'text-amber-300' : 'text-rose-300'}`}><span className={`size-1.5 rounded-full ${apiStatus === 'Connected' ? 'bg-emerald-300' : apiStatus === 'Checking...' ? 'bg-amber-300' : 'bg-rose-300'}`} />{apiStatus}</dd></div></dl></Panel>
      </div>

      <Panel className="flex flex-wrap items-center justify-between gap-4 border-white/[0.08] bg-[#07131f]/55 p-5"><p className="text-xs text-slate-500">Changes are saved locally to this browser.</p><div className="flex flex-wrap items-center justify-end gap-3"><button type="button" onClick={resetToDefaults} className="h-10 rounded-lg border border-white/[0.12] px-4 text-xs font-bold text-slate-400 transition hover:border-white/25 hover:bg-white/[0.04] hover:text-slate-200">Reset to Default Settings</button><button type="button" onClick={saveCurrentSettings} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#72e7ff] px-5 text-xs font-black text-[#041018] shadow-[0_8px_24px_rgba(114,231,255,0.16)] transition hover:bg-cyan-200 hover:shadow-[0_10px_28px_rgba(114,231,255,0.24)] focus:outline-none focus:ring-2 focus:ring-cyan-200/40"><DashboardIcon name="save" className="size-4" />Save Settings</button></div></Panel>
    </div>
  </AppShell>;
}

export default Settings;
