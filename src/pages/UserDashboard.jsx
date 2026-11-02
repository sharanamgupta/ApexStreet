import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import { getStoredToken } from '../utils/auth.js';

async function request(path) {
  const response = await fetch(path, { headers: { Authorization: `Bearer ${getStoredToken()}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Request failed (${response.status})`);
  return data;
}

function Panel({ title, kicker, children, action }) {
  return <section className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5"><div className="mb-4 flex items-start justify-between gap-3"><div><p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">{kicker}</p><h2 className="mt-1 text-xl font-black text-slate-50">{title}</h2></div>{action}</div>{children}</section>;
}

function Metric({ label, value, tone = 'text-slate-50' }) {
  return <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4"><span className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</span><strong className={`mt-2 block text-3xl font-black ${tone}`}>{value}</strong></div>;
}

function UserDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({ lights: [], areas: [], report: null, activities: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      request('/api/street-lights'),
      request('/api/areas'),
      request('/api/reports?dateRange=30d&area=All%20Areas&reportType=all&search='),
      request('/api/activity-logs?dateRange=30d&status=all&module=All%20Modules&area=All%20Areas&search='),
    ]).then(([lights, areas, report, activity]) => {
      if (active) { setData({ lights: Array.isArray(lights) ? lights : [], areas: Array.isArray(areas) ? areas : [], report, activities: Array.isArray(activity?.logs) ? activity.logs : [] }); setError(''); }
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => {
    const lights = data.lights;
    const faulty = lights.filter((light) => light.faultStatus || light.status === 'FAULT').length;
    const on = lights.filter((light) => light.status === 'ON' && !light.faultStatus).length;
    const off = lights.filter((light) => light.status === 'OFF' && !light.faultStatus).length;
    const manual = lights.filter((light) => light.mode === 'MANUAL').length;
    const average = lights.length ? Math.round(lights.reduce((sum, light) => sum + (light.brightness || 0), 0) / lights.length) : 0;
    return { total: lights.length, faulty, on, off, manual, average };
  }, [data.lights]);
  const faults = data.report?.faults?.recentFaultRecords || [];

  return <AppShell activePage="Dashboard" title="Dashboard"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="user-dashboard-title">
    <header className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 sm:p-6"><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">View Only Access</p><h1 className="mt-2 text-3xl font-black text-slate-50" id="user-dashboard-title">Smart Street Network</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Live read-only status from the ApexStreet operations database.</p></header>
    {loading ? <div className="mt-4 rounded-lg border border-cyan-200/12 bg-cyan-300/5 p-4 text-sm font-semibold text-slate-300">Loading network data...</div> : null}
    {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Network metrics"><Metric label="Total lights" value={counts.total} /><Metric label="Online" value={counts.on} tone="text-[#73ffba]" /><Metric label="Offline" value={counts.off} tone="text-slate-300" /><Metric label="Faults" value={counts.faulty} tone="text-[#ffb4a8]" /><Metric label="Average brightness" value={`${counts.average}%`} tone="text-[#72e7ff]" /></section>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Panel kicker="Network" title="Current light status" action={<button type="button" onClick={() => navigate('/user-dashboard/street-lights')} className="text-xs font-black text-[#72e7ff]">View lights</button>}><div className="grid grid-cols-3 gap-3"><Metric label="Areas" value={data.areas.length} /><Metric label="Manual mode" value={counts.manual} tone="text-[#ffd36d]" /><Metric label="Fault rate" value={`${counts.total ? Math.round(counts.faulty * 100 / counts.total) : 0}%`} tone="text-[#ffb4a8]" /></div></Panel>
      <Panel kicker="Maintenance" title="Active fault alerts" action={<button type="button" onClick={() => navigate('/user-dashboard/faults')} className="text-xs font-black text-[#72e7ff]">View faults</button>}><div className="space-y-2">{faults.filter((fault) => fault.status !== 'RESOLVED').slice(0, 4).map((fault) => <div className="flex items-center justify-between gap-3 rounded-md border border-[#ff9f91]/15 bg-[#ff9f91]/5 p-3" key={fault.id}><div><strong className="block text-sm text-slate-100">{fault.lightId}</strong><span className="text-xs text-slate-400">{fault.area} · {fault.issueType}</span></div><span className="text-xs font-black text-[#ffb4a8]">{fault.severity}</span></div>)}{!faults.length ? <p className="text-sm text-slate-500">No fault records found.</p> : null}</div></Panel>
      <Panel kicker="Areas" title="Area health" action={<button type="button" onClick={() => navigate('/user-dashboard/areas')} className="text-xs font-black text-[#72e7ff]">View areas</button>}><div className="space-y-2">{data.areas.slice(0, 6).map((area) => <div className="flex items-center justify-between gap-3 rounded-md border border-cyan-200/10 bg-[#05101a]/70 p-3" key={area.id}><div><strong className="block text-sm text-slate-100">{area.name}</strong><span className="text-xs text-slate-500">{area.totalLights} lights · {area.faultLights} faults</span></div><span className={`text-xs font-black ${area.faultLights ? 'text-[#ffb4a8]' : 'text-[#73ffba]'}`}>{area.respondingPercentage}% online</span></div>)}{!data.areas.length ? <p className="text-sm text-slate-500">No areas found.</p> : null}</div></Panel>
      <Panel kicker="Activity" title="Recent system activity" action={<button type="button" onClick={() => navigate('/user-dashboard/reports')} className="text-xs font-black text-[#72e7ff]">View reports</button>}><div className="space-y-2">{data.activities.slice(0, 6).map((activity) => <div className="flex gap-3 rounded-md border border-cyan-200/10 bg-[#05101a]/70 p-3" key={activity.id}><DashboardIcon className="mt-0.5 size-4 shrink-0 text-[#72e7ff]" name="activity" /><div><strong className="block text-sm text-slate-100">{activity.action}</strong><span className="text-xs text-slate-400">{activity.description}</span></div></div>)}{!data.activities.length ? <p className="text-sm text-slate-500">No recent activity found.</p> : null}</div></Panel>
    </div>
  </main></AppShell>;
}

export default UserDashboard;
