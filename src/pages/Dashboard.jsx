import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { getStoredToken } from '../utils/auth.js';
import { quickActions } from '../data/dashboardData.js';

const emptyDashboard = { statistics: null, lights: [], areas: [], automation: [], automationPage: null, activities: [] };

async function request(path) {
  const response = await fetch(path, { headers: { Authorization: `Bearer ${getStoredToken()}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data;
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl ${className}`}>{children}</section>;
}

function SectionHeading({ kicker, title, action }) {
  return <div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-1.5 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">{kicker}</p><h2 className="text-xl font-black leading-tight text-slate-50 sm:text-2xl">{title}</h2></div>{action}</div>;
}

function Metric({ label, value }) {
  return <div className="min-w-0 rounded-md bg-white/[0.035] p-2"><strong className="block truncate text-sm font-black text-slate-100">{value}</strong><span className="mt-0.5 block truncate text-[0.7rem] font-bold text-slate-500">{label}</span></div>;
}

function MetricBlock({ label, value }) {
  return <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3"><span className="text-[0.68rem] font-black uppercase tracking-[0.11em] text-slate-500">{label}</span><strong className="mt-1.5 block text-base font-black text-slate-50">{value}</strong></div>;
}

function EmptyState({ message }) {
  return <div className="rounded-lg border border-dashed border-cyan-200/10 bg-white/[0.02] px-4 py-7 text-center text-sm font-semibold text-slate-500">{message}</div>;
}

function StatCard({ label, value, detail, icon, tone }) {
  const tones = { danger: 'text-[#ff9b8d] bg-[#ff9b8d]/10 ring-[#ff9b8d]/20', muted: 'text-slate-300 bg-slate-400/10 ring-slate-300/15', network: 'text-[#72e7ff] bg-[#72e7ff]/10 ring-[#72e7ff]/20', success: 'text-[#73ffba] bg-[#73ffba]/10 ring-[#73ffba]/20' };
  return <article className="relative min-h-40 overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_62px_rgba(0,0,0,0.22)] ring-1 ring-white/5"><div className={`grid size-11 place-items-center rounded-md ring-1 ${tones[tone]}`}><DashboardIcon className="size-5" name={icon} /></div><p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p><strong className="mt-2 block text-3xl font-black leading-none text-slate-50">{value}</strong><span className="mt-3 block text-sm font-semibold text-slate-400">{detail}</span><div className="absolute -bottom-11 -right-8 size-30 rounded-full bg-cyan-300/7" /></article>;
}

function getPhase(phases = []) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return phases.find((phase) => {
    if (!phase?.startTime || !phase?.endTime) return false;
    const startParts = String(phase.startTime).split(':').map(Number);
    const endParts = String(phase.endTime).split(':').map(Number);
    const start = startParts[0] * 60 + startParts[1];
    const end = endParts[0] * 60 + endParts[1];
    return start <= end ? currentMinutes >= start && currentMinutes < end : currentMinutes >= start || currentMinutes < end;
  });
}

function formatTime(timestamp) {
  if (!timestamp) return 'Time unavailable';
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function QuickActions() {
  const navigate = useNavigate();
  const handleActionClick = (action) => {
    if (action.label === 'Add Street Light') navigate('/street-lights');
    else if (action.label === 'Automation Settings') navigate('/automation');
    else if (action.label === 'View Faults') navigate('/street-lights?status=FAULT');
    else if (action.label === 'View Reports') navigate('/reports');
  };

  return <Panel className="p-5 sm:p-6"><SectionHeading kicker="Operations" title="Quick Actions" /><div className="grid gap-2.5 sm:grid-cols-2">{quickActions.map((action) => <button className="group flex min-h-14 items-center gap-3 rounded-lg border border-cyan-200/12 bg-[#05101a]/70 px-3 text-left font-black text-slate-200 transition-all duration-200 hover:scale-[1.02] hover:border-cyan-200/30 hover:bg-cyan-300/10" key={action.label} type="button" onClick={() => handleActionClick(action)}><DashboardIcon className="size-5 shrink-0 text-[#72e7ff] transition-transform duration-200 group-hover:scale-110" name={action.icon} /><span>{action.label}</span></button>)}</div></Panel>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let active = true;
    const activityParams = new URLSearchParams({ dateRange: 'all', status: 'all', module: 'All Modules', area: 'All Areas', search: '' });
    Promise.allSettled([
      request('/api/street-lights/statistics'),
      request('/api/street-lights'),
      request('/api/areas'),
      request('/api/automation/areas'),
      request(`/api/activity-logs?${activityParams.toString()}`),
    ]).then((results) => {
      if (!active) return;
      const [statistics, lights, areas, automation, activities] = results;
      const labels = ['street-light statistics', 'street lights', 'areas', 'automation', 'activity'];
      const nextErrors = results.map((result, index) => result.status === 'rejected' ? labels[index] : null).filter(Boolean);
      const nextData = {
        statistics: statistics.status === 'fulfilled' ? statistics.value : null,
        lights: lights.status === 'fulfilled' && Array.isArray(lights.value) ? lights.value : [],
        areas: areas.status === 'fulfilled' && Array.isArray(areas.value) ? areas.value : [],
        automation: automation.status === 'fulfilled' && Array.isArray(automation.value) ? automation.value : [],
        automationPage: null,
        activities: activities.status === 'fulfilled' && Array.isArray(activities.value?.logs) ? activities.value.logs : [],
      };
      setData(nextData);
      setErrors(nextErrors);
      setLoading(false);
      const firstArea = nextData.automation[0];
      if (firstArea?.id) request(`/api/automation/areas/${firstArea.id}`).then((page) => { if (active) setData((current) => ({ ...current, automationPage: page })); }).catch(() => undefined);
    });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => {
    const statuses = data.lights.map((light) => String(light.status || '').toUpperCase());
    return {
      total: data.statistics?.totalLights ?? data.lights.length,
      on: data.statistics?.onlineLights ?? statuses.filter((status) => status === 'ON').length,
      off: data.statistics?.offlineLights ?? statuses.filter((status) => status === 'OFF').length,
      dim: statuses.filter((status) => status === 'DIM').length,
      fault: data.statistics?.faultyLights ?? data.lights.filter((light, index) => statuses[index] === 'FAULT' || light.faultStatus).length,
    };
  }, [data]);

  const faults = useMemo(() => data.lights.filter((light) => String(light.status || '').toUpperCase() === 'FAULT' || light.faultStatus), [data.lights]);
  const activePhase = getPhase(data.automationPage?.phases);
  const automationActive = data.automation.some((item) => item.enabled);
  const automationMode = data.automationPage?.mode || data.automation[0]?.mode || 'Unavailable';
  const brightnessRule = activePhase?.brightness == null ? data.automationPage?.lights?.[0]?.brightness : activePhase.brightness;

  if (loading) return <AppShell activePage="Dashboard" title="Dashboard"><main className="p-4 sm:p-5 lg:p-8"><div className="mx-auto max-w-7xl animate-pulse space-y-4"><div className="h-28 rounded-lg bg-white/[0.05]" /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div className="h-40 rounded-lg bg-white/[0.05]" key={item} />)}</div><div className="grid gap-4 lg:grid-cols-2"><div className="h-64 rounded-lg bg-white/[0.05]" /><div className="h-64 rounded-lg bg-white/[0.05]" /></div></div></main></AppShell>;

  return <AppShell activePage="Dashboard" title="Dashboard"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="dashboard-title"><div className="mx-auto max-w-7xl space-y-4"><header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6"><div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" /><div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Street Light Operations</p><h1 className="text-3xl font-black leading-tight text-slate-50" id="dashboard-title">Dashboard</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Monitor the current street-light network, faults, areas and automation status.</p></div><div className="flex items-center gap-2 rounded-full border border-[#73ffba]/25 bg-[#73ffba]/10 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#73ffba]"><span className="size-2 rounded-full bg-[#73ffba]" />Live data</div></div></header>
      {errors.length > 0 ? <div className="rounded-lg border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3 text-sm font-semibold text-amber-200">Some dashboard data could not be loaded: {errors.join(', ')}. Available information is still shown.</div> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary cards"><StatCard label="Total Street Lights" value={counts.total} detail="Across the network" tone="network" icon="grid" /><StatCard label="Lights ON" value={counts.on} detail="Currently powered on" tone="success" icon="power" /><StatCard label="Lights OFF" value={counts.off} detail="Currently powered off" tone="muted" icon="moon" /><StatCard label="Faulty Lights" value={counts.fault} detail="Requires attention" tone="danger" icon="alert" /></section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]"><Panel className="p-5 sm:p-6"><SectionHeading kicker="Live Network" title="Street-Light Status" action={<button type="button" onClick={() => navigate('/street-lights')} className="rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/15">View Lights</button>} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><MetricBlock label="ON" value={counts.on} /><MetricBlock label="OFF" value={counts.off} /><MetricBlock label="DIM" value={counts.dim} /><MetricBlock label="Fault" value={counts.fault} /></div></Panel><Panel className="p-5 sm:p-6"><SectionHeading kicker="Automation" title="Automation Status" action={<button type="button" onClick={() => navigate('/automation')} className="rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/15">Manage</button>} />{data.automation.length === 0 ? <EmptyState message="No automation status available." /> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2"><MetricBlock label="Status" value={automationActive ? 'Active' : 'Inactive'} /><MetricBlock label="Current Mode" value={automationMode} /><MetricBlock label="Current Phase" value={activePhase?.action || 'No active phase'} /><MetricBlock label="Brightness Rule" value={brightnessRule == null ? 'Not available' : `${brightnessRule}%`} /></div>}</Panel></div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]"><Panel className="p-5 sm:p-6"><SectionHeading kicker="Area Monitoring" title="Area Overview" action={<span className="rounded-full border border-cyan-200/16 bg-cyan-300/8 px-3 py-1.5 text-xs font-bold text-[#91dff3]">{data.areas.length} Areas</span>} />{data.areas.length === 0 ? <EmptyState message="No areas available." /> : <div className="grid gap-2.5 sm:grid-cols-2">{data.areas.map((area) => <button type="button" onClick={() => navigate(`/street-lights?area=${encodeURIComponent(area.name)}`)} className="group rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3 text-left transition hover:border-cyan-200/30 hover:bg-[#071726]/90" key={area.id}><div className="flex items-center justify-between gap-3"><strong className="font-black text-slate-50">{area.name}</strong><DashboardIcon name="chevron" className="size-3.5 text-[#72e7ff] transition-transform group-hover:translate-x-1" /></div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Lights" value={area.totalLights ?? 0} /><Metric label="Faults" value={area.faultLights ?? 0} /></div></button>)}</div>}</Panel><Panel className="p-5 sm:p-6"><SectionHeading kicker="Maintenance" title="Active Faults" action={<button type="button" onClick={() => navigate('/street-lights?status=FAULT')} className="rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/15">View Faults</button>} />{faults.length === 0 ? <EmptyState message="No active faults found." /> : <div className="grid gap-2.5">{faults.slice(0, 5).map((light) => <div className="flex items-center justify-between gap-3 rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3" key={light.lightId || light.id}><div className="min-w-0"><strong className="block font-black text-slate-50">{light.lightId || light.id}</strong><span className="block truncate text-xs font-semibold text-slate-400">{light.area || 'Area unavailable'}</span></div><div className="flex items-center gap-2"><span className="rounded-full bg-[#ff9b8d]/12 px-2 py-1 text-[0.68rem] font-black text-[#ffb4a8]">{light.status || 'FAULT'}</span><button type="button" onClick={() => navigate(`/street-lights?search=${encodeURIComponent(light.lightId || light.id)}`)} className="rounded-md border border-cyan-200/16 px-2 py-1 text-[0.68rem] font-black text-[#91dff3] hover:bg-cyan-300/10">Inspect</button></div></div>)}</div>}</Panel></div>

      <Panel className="p-5 sm:p-6"><SectionHeading kicker="Activity" title="Recent Activity" action={<button type="button" onClick={() => navigate('/activity-logs')} className="rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/15">View Activity</button>} />{data.activities.length === 0 ? <EmptyState message="No recent activity recorded." /> : <div className="grid gap-2.5 sm:grid-cols-2">{data.activities.slice(0, 6).map((activity) => <article className="flex items-start gap-3 rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-3" key={activity.id}><div className="grid size-8 shrink-0 place-items-center rounded-md bg-cyan-300/10 text-[#72e7ff]"><DashboardIcon name={String(activity.type || '').toLowerCase().includes('fault') ? 'warning' : 'activity'} className="size-4" /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><strong className="text-sm font-black text-slate-50">{activity.activity || activity.action || activity.type || 'Activity'}</strong><time className="text-[0.68rem] font-bold text-[#91dff3]">{formatTime(activity.timestamp)}</time></div><p className="mt-1 truncate text-xs leading-5 text-slate-400">{activity.description || activity.target || 'System activity recorded.'}</p></div></article>)}</div>}</Panel>

      <QuickActions />
    </div></main></AppShell>;
}

export default Dashboard;
