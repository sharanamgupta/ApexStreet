import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import { monitorLightsApi } from '../utils/monitorLightsApi.js';
import { areasApi } from '../utils/areasApi.js';

function MonitorLights() {
  const [lights, setLights] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [summary, setSummary] = useState({ connected: 0, faults: 0, assignedJobs: 0, unassigned: 0 });
  const [areaNames, setAreaNames] = useState([]);
  const [filters, setFilters] = useState({ search: '', area: 'All areas', status: 'All statuses' });
  const [focusedLight, setFocusedLight] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());
  const areas = useMemo(() => ['All areas', ...areaNames], [areaNames]);

  async function loadData() {
    setLoading(true); setError('');
    try {
      const [items, counts, staff, names] = await Promise.all([monitorLightsApi.list(filters), monitorLightsApi.summary(), monitorLightsApi.technicians(), areasApi.names()]);
      setLights(items); setSummary(counts); setTechnicians(staff);
      setAreaNames(Array.isArray(names) ? names : []);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { loadData(); }, [filters]);
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => {
    if (!focusedLight) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [focusedLight]);

  async function focusLight(light) { setFocusedLight(light); setSelectedTechnician(light.assignedTechnician?.id || ''); setError(''); }
  async function assign() {
    if (!selectedTechnician || !focusedLight || actionPending) return;
    setActionPending(true);
    try { setFocusedLight(await monitorLightsApi.assign(focusedLight.lightId, { technicianId: Number(selectedTechnician) })); setError(''); await loadData(); }
    catch (err) { setError(err.message); }
    finally { setActionPending(false); }
  }
  async function progress() {
    if (!focusedLight || actionPending) return;
    setActionPending(true);
    try { setFocusedLight(await monitorLightsApi.updateMaintenance(focusedLight.lightId, { status: 'IN_PROGRESS' })); setError(''); await loadData(); }
    catch (err) { setError(err.message); }
    finally { setActionPending(false); }
  }
  async function resolve() {
    if (!focusedLight || actionPending) return;
    setActionPending(true);
    try {
      const updated = await monitorLightsApi.resolve(focusedLight.lightId);
      setFocusedLight(null); setLights((current) => current.map((item) => item.lightId === updated.lightId ? updated : item)); await loadData();
    } catch (err) { setError(err.message); }
    finally { setActionPending(false); }
  }

  return <AppShell activePage="Monitor Lights" title="Monitor Lights"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="monitor-lights-title">
    <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6"><div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" /><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Live Operations</p><h1 className="text-4xl font-black leading-tight text-slate-50" id="monitor-lights-title">Monitor Lights</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Inspect current lamp health, dispatch the right field technician, and close the loop when a repair is confirmed.</p></div><div className="flex items-center gap-3 rounded-lg border border-cyan-200/12 bg-[#05101a]/85 px-4 py-3"><span className="relative grid size-9 place-items-center rounded-md bg-[#73ffba]/10 text-[#73ffba]"><span className="absolute size-3 rounded-full bg-[#73ffba] animate-ping" /><span className="relative size-2 rounded-full bg-[#73ffba]" /></span><div><span className="block text-[0.65rem] font-black uppercase tracking-[0.13em] text-slate-500">Live scan</span><strong className="font-mono text-sm text-slate-100">{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</strong></div></div></div></header>
    {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard icon="power" label="Connected" value={summary.connected} detail="Reporting normally" tone="text-[#73ffba]" /><SummaryCard icon="warning" label="Faults" value={summary.faults} detail="Need field attention" tone="text-[#ffb4a8]" /><SummaryCard icon="user" label="Assigned jobs" value={summary.assignedJobs} detail="Technicians dispatched" tone="text-[#ffcd78]" /><SummaryCard icon="alert" label="Unassigned" value={summary.unassigned} detail="Awaiting ownership" tone="text-[#72e7ff]" /></section>
    <section className="mt-4 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.2)]"><div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_190px_180px] lg:items-end"><label><span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">Find a light</span><span className="flex min-h-12 items-center gap-3 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3"><DashboardIcon className="size-4 text-[#72e7ff]" name="search" /><input className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600" type="search" placeholder="Search light ID or area..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></span></label><SelectControl label="Area" value={filters.area} options={areas.includes(filters.area) ? areas : ['All areas']} onChange={(area) => setFilters({ ...filters, area })} /><SelectControl label="Health" value={filters.status} options={['All statuses', 'HEALTHY', 'OFFLINE', 'FAULT', 'ON', 'DIM']} onChange={(status) => setFilters({ ...filters, status })} /></div></section>
    <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.75fr)]"><section className="overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_20px_54px_rgba(0,0,0,0.2)]"><div className="flex items-center justify-between gap-3 border-b border-cyan-200/10 p-5"><div><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Network Inventory</p><h2 className="mt-1 text-xl font-black text-slate-50">Live light status</h2></div><span className="rounded-md border border-cyan-200/14 bg-cyan-300/7 px-2.5 py-1 text-xs font-black text-[#91dff3]">{loading ? 'Loading...' : `${lights.length} visible`}</span></div><div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-[#05101a]/60"><tr>{['Light', 'Live status', 'Health', 'Brightness', 'Maintenance', 'Actions'].map((label) => <th className="p-4 text-xs font-black uppercase tracking-[0.12em] text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{lights.map((light) => <tr className={`border-t border-cyan-200/8 transition hover:bg-white/[0.018] ${light.faultStatus ? 'bg-[#ff9f91]/[0.035]' : ''}`} key={light.lightId}><td className="p-4"><strong className="block font-mono text-sm font-black text-[#72e7ff]">{light.lightId}</strong><span className="mt-1 block text-xs font-semibold text-slate-400">{light.area}</span></td><td className="p-4"><StatusBadge light={light} /><span className="mt-1 block text-xs text-slate-500">{light.lastUpdated ? new Date(light.lastUpdated).toLocaleString() : ''}</span></td><td className="p-4"><strong className={light.health === 'HEALTHY' ? 'text-sm text-[#73ffba]' : 'text-sm text-[#ffb4a8]'}>{light.health}</strong></td><td className="p-4"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/8"><span className={`block h-full rounded-full ${light.faultStatus ? 'bg-[#ff9f91]' : 'bg-[#72e7ff]'}`} style={{ width: `${light.brightness}%` }} /></div><strong className="mt-1 block text-xs text-slate-300">{light.brightness}%</strong></td><td className="p-4"><MaintenanceStatus light={light} /></td><td className="p-4"><button className="inline-flex min-h-9 items-center gap-2 rounded-md border border-cyan-200/14 bg-cyan-300/7 px-3 text-xs font-black text-[#91dff3]" type="button" onClick={() => focusLight(light)}><DashboardIcon className="size-3.5" name={light.faultStatus ? 'warning' : 'eye'} />{light.faultStatus ? 'Triage' : 'Inspect'}</button></td></tr>)}{!loading && lights.length === 0 ? <tr><td colSpan="6" className="p-12 text-center text-sm font-semibold text-slate-500">No lights match the current filters.</td></tr> : null}</tbody></table></div></section><section className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_20px_54px_rgba(0,0,0,0.2)]"><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Field Team</p><h2 className="mt-1 text-xl font-black text-slate-50">Available technicians</h2><p className="mt-2 text-sm leading-6 text-slate-400">Assign the lowest-load specialist directly from a fault&apos;s triage panel.</p><div className="mt-5 space-y-3">{technicians.map((employee) => <div className="flex items-center gap-3 rounded-lg border border-cyan-200/10 bg-[#05101a]/60 p-3" key={employee.id}><span className="grid size-10 place-items-center rounded-md bg-cyan-300/10 text-sm font-black text-[#72e7ff]">{employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm text-slate-100">{employee.name}</strong><span className="block truncate text-xs text-slate-400">{employee.specialization}</span></div><span className="rounded px-2 py-1 text-[0.65rem] font-black bg-[#73ffba]/10 text-[#73ffba]">{employee.workload} jobs</span></div>)}{!loading && technicians.length === 0 ? <p className="rounded-lg border border-cyan-200/10 p-4 text-sm text-slate-500">No technicians have been configured.</p> : null}</div><div className="mt-5 rounded-lg border border-[#ff9f91]/15 bg-[#ff9f91]/5 p-4"><div className="flex gap-3"><DashboardIcon className="mt-0.5 size-5 shrink-0 text-[#ffb4a8]" name="warning" /><p className="text-sm leading-6 text-slate-300"><strong className="text-slate-100">Fault protocol:</strong> assign, diagnose, repair, then confirm.</p></div></div></section></div>
  </main>{focusedLight ? <TriageDialog light={focusedLight} technicians={technicians} technicianId={selectedTechnician} actionPending={actionPending} onTechnicianChange={setSelectedTechnician} onAssign={assign} onProgress={progress} onResolve={resolve} onClose={() => setFocusedLight(null)} /> : null}</AppShell>;
}

function SummaryCard({ icon, label, value, detail, tone }) { return <div className="flex items-center gap-4 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]"><span className={`grid size-11 shrink-0 place-items-center rounded-md bg-white/5 ${tone}`}><DashboardIcon className="size-5" name={icon} /></span><div><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p><strong className="mt-1 block text-2xl font-black text-slate-50">{value}</strong><span className="text-xs font-semibold text-slate-400">{detail}</span></div></div>; }
function SelectControl({ label, value, options, onChange }) { return <label><span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">{label}</span><select className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option className="bg-[#07131f]" key={option}>{option}</option>)}</select></label>; }
function StatusBadge({ light }) { const tone = light.faultStatus ? 'bg-[#ff9f91]/10 text-[#ffb4a8] border-[#ff9f91]/20' : light.status === 'ON' ? 'bg-[#73ffba]/10 text-[#73ffba] border-[#73ffba]/20' : 'bg-cyan-300/10 text-[#72e7ff] border-cyan-200/20'; return <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-black ${tone}`}><span className="size-1.5 rounded-full bg-current" />{light.faultStatus ? 'FAULT' : light.status}</span>; }
function MaintenanceStatus({ light }) { if (light.maintenanceStatus === 'RESOLVED') return <span className="text-xs font-black text-[#73ffba]">Repair confirmed</span>; if (light.assignedTechnician) return <div><strong className="block text-xs text-slate-200">{light.assignedTechnician.name}</strong><span className="text-xs text-[#ffcd78]">{light.maintenanceStatus}</span></div>; if (light.reportId) return <div><strong className="block text-xs font-black text-[#ffb4a8]">User report</strong><span className="text-xs text-slate-400">Awaiting assignment</span></div>; return light.faultStatus ? <span className="text-xs font-black text-[#ffb4a8]">Unassigned fault</span> : <span className="text-xs text-slate-500">No action needed</span>; }
function TriageDialog({ light, technicians, technicianId, actionPending, onTechnicianChange, onAssign, onProgress, onResolve, onClose }) {
  const isFault = light.faultStatus;
  const assigned = light.assignedTechnician;
  const hasActiveAssignment = assigned && ['ASSIGNED', 'IN_PROGRESS'].includes(light.maintenanceStatus);
  const areaTechnicians = technicians.filter((employee) => employee.area && employee.area.toLowerCase() === light.area.toLowerCase());
  return (
    <div className="fixed inset-0 z-[90] grid place-items-end bg-black/65 p-0 backdrop-blur-sm sm:place-items-center sm:p-6">
      <section className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-lg border border-cyan-200/15 bg-[#07131f] shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:rounded-lg" role="dialog" aria-modal="true" aria-labelledby="triage-title">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-cyan-200/10 p-5">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Maintenance Triage</p>
            <h2 className="mt-1 text-2xl font-black text-slate-50" id="triage-title">{light.lightId} <span className="text-slate-500">|</span> {light.area}</h2>
          </div>
          <button className="grid size-10 place-items-center rounded-md border border-cyan-200/14 bg-cyan-300/8 text-[#91dff3]" type="button" onClick={onClose} aria-label="Close triage"><DashboardIcon className="size-5" name="x" /></button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className={`rounded-lg border p-4 ${isFault ? 'border-[#ff9f91]/20 bg-[#ff9f91]/5' : 'border-[#73ffba]/20 bg-[#73ffba]/5'}`}>
            <div className="flex items-center gap-3">
              <DashboardIcon className={`size-5 ${isFault ? 'text-[#ffb4a8]' : 'text-[#73ffba]'}`} name={isFault ? 'warning' : 'check'} />
              <div><strong className="block text-sm text-slate-100">{isFault ? light.issue : 'Light is reporting normally'}</strong><span className="text-xs text-slate-400">Health {light.health} | Brightness {light.brightness}%</span>{light.reportId ? <span className="mt-1 block text-xs font-semibold text-[#ffcd78]">Reported by {light.reportedBy} · {light.reportStatus}</span> : null}</div>
            </div>
          </div>
          {isFault ? (
            <>
              <label><span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">Assign field employee for {light.area}</span><select className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100" value={technicianId} onChange={(event) => onTechnicianChange(event.target.value)}><option value="">Select a technician</option>{areaTechnicians.map((employee) => <option className="bg-[#07131f]" value={employee.id} key={employee.id}>{employee.name} - {employee.specialization} ({employee.workload} jobs)</option>)}</select>{areaTechnicians.length === 0 ? <span className="mt-2 block text-xs font-semibold text-[#ffb4a8]">No active physical-repair technician is assigned to this area.</span> : null}</label>
              {hasActiveAssignment ? <div className="rounded-lg border border-[#ffcd78]/20 bg-[#ffcd78]/5 p-4"><strong className="block text-sm text-[#ffcd78]">Assigned to {assigned.name}</strong></div> : null}
            </>
          ) : <p className="text-sm leading-6 text-slate-400">This light is currently healthy. Use the monitoring table to keep an eye on its status.</p>}
        </div>
        <footer className="flex shrink-0 flex-col-reverse gap-3 border-t border-cyan-200/10 bg-[#07131f] p-5 sm:flex-row sm:justify-end"><button className="min-h-11 rounded-md border border-cyan-200/14 px-4 text-sm font-black text-slate-300" type="button" onClick={onClose}>Close</button>{isFault && !hasActiveAssignment ? <button className="min-h-11 rounded-md bg-gradient-to-br from-[#8df0ff] to-[#55c9ff] px-4 text-sm font-black text-[#041018] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={!technicianId || actionPending} onClick={onAssign}>{actionPending ? 'Assigning...' : 'Assign employee'}</button> : null}{isFault && hasActiveAssignment && light.maintenanceStatus === 'ASSIGNED' ? <button className="min-h-11 rounded-md border border-[#ffcd78]/30 px-4 text-sm font-black text-[#ffcd78] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={actionPending} onClick={onProgress}>{actionPending ? 'Starting...' : 'Start work'}</button> : null}{isFault && hasActiveAssignment ? <button className="min-h-11 rounded-md bg-[#73ffba] px-4 text-sm font-black text-[#041018] disabled:cursor-not-allowed disabled:opacity-50" type="button" disabled={actionPending} onClick={onResolve}>{actionPending ? 'Confirming...' : 'Confirm fix'}</button> : null}</footer>
      </section>
    </div>
  );
}

export default MonitorLights;
