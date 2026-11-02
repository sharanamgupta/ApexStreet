import React, { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell.jsx';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import { automationApi, pageToZone } from '../utils/automationApi.js';
const streetLightModes = ['Auto', 'Manual'];

const weekdaySchedule = [
  { id: 'sunset', start: '18:30', end: '22:00', action: 'ON', brightness: 100 },
  { id: 'late-night', start: '22:00', end: '05:00', action: 'DIM', brightness: 50 },
  { id: 'dawn', start: '05:00', end: '06:00', action: 'ON', brightness: 100 },
  { id: 'sunrise', start: '06:00', end: '18:30', action: 'OFF', brightness: 0 },
];

const weekendSchedule = [
  { id: 'weekend-sunset', start: '18:30', end: '23:00', action: 'ON', brightness: 100 },
  { id: 'weekend-night', start: '23:00', end: '05:00', action: 'DIM', brightness: 60 },
  { id: 'weekend-dawn', start: '05:00', end: '06:00', action: 'ON', brightness: 100 },
  { id: 'weekend-sunrise', start: '06:00', end: '18:30', action: 'OFF', brightness: 0 },
];

const presets = [
  { id: 'normal', label: 'Normal', mode: 'Scheduled', brightness: 100, className: 'border-cyan-200/25 bg-cyan-300/8 text-[#72e7ff]' },
  { id: 'energy', label: 'Energy Saving', mode: 'Energy Saving', brightness: 60, className: 'border-[#73ffba]/25 bg-[#73ffba]/8 text-[#73ffba]' },
  { id: 'festival', label: 'Festival', mode: 'Scheduled', brightness: 100, className: 'border-[#ffcd78]/30 bg-[#ffcd78]/8 text-[#ffcd78]' },
  { id: 'emergency', label: 'Emergency', mode: 'Manual', brightness: 100, className: 'border-[#ff9f91]/30 bg-[#ff9f91]/8 text-[#ffb4a8]' },
];

const cloneSchedule = (schedule) => schedule.map((phase) => ({ ...phase }));

function currentPhase(schedule, now) {
  const current = now.getHours() * 60 + now.getMinutes();
  const minutes = (value) => { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; };
  return schedule.find((phase) => { const start = minutes(phase.start); const end = minutes(phase.end); return start <= end ? current >= start && current < end : current >= start || current < end; }) || schedule[0];
}

function Panel({ children, className = '' }) {
  return <section className={`rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl ${className}`}>{children}</section>;
}

function Toggle({ checked, onChange, label }) {
  return <button className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${checked ? 'bg-[#73ffba]' : 'bg-slate-700'}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span className={`inline-block size-5 rounded-full bg-[#07131f] shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} /></button>;
}

function Metric({ icon, label, value, color = 'text-[#72e7ff]' }) {
  return <div className="flex items-center gap-3 rounded-lg border border-cyan-200/10 bg-[#07131f]/75 p-4"><span className={`grid size-10 place-items-center rounded-md bg-white/[0.03] ${color}`}><DashboardIcon className="size-5" name={icon} /></span><div className="min-w-0"><span className="block text-[0.68rem] font-black uppercase tracking-[0.11em] text-slate-500">{label}</span><strong className="mt-1 block truncate text-base font-black text-slate-50">{value}</strong></div></div>;
}

function Automation() {
  const [zones, setZones] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleKind, setScheduleKind] = useState('weekday');
  const [automationEnabled, setAutomationEnabled] = useState(true);
  const [showFaultsOnly, setShowFaultsOnly] = useState(false);
  const [eventDraft, setEventDraft] = useState({ name: '', date: '', brightness: 100 });
  const [now, setNow] = useState(new Date());

  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);

  const selectedZone = zones.find((zone) => zone.name === selectedArea) || zones[0];
  const schedule = selectedZone?.[scheduleKind] || [];
  const phase = currentPhase(schedule, now) || { action: 'OFF', brightness: 0 };
  const allLights = zones.flatMap((zone) => Array.isArray(zone.lights) ? zone.lights : []);
  const faults = allLights.filter((light) => light.faultStatus === 'Fault');
  const overrides = allLights.filter((light) => light.override);
  const visibleLights = showFaultsOnly ? (selectedZone?.lights || []).filter((light) => light.faultStatus === 'Fault') : (selectedZone?.lights || []);

  const refresh = async (areaId = selectedZone?.areaId) => { if (!areaId) return; const page = await automationApi.page(areaId); setZones((current) => current.map((z) => z.areaId === areaId ? pageToZone(page) : z)); };
  useEffect(() => { let cancelled = false; (async () => { try { const summaries = await automationApi.summaries(); const pages = await Promise.all(summaries.map((s) => automationApi.page(s.id))); if (!cancelled) { const next = pages.map(pageToZone); setZones(next); setSelectedArea(next[0]?.name || ''); setAutomationEnabled(next.every((z) => z.enabled !== false)); } } catch (e) { if (!cancelled) setError(e.message); } finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; }; }, []);
  async function updateZone(updater) { if (!selectedZone) return; const next = updater(selectedZone); setZones((current) => current.map((zone) => zone.areaId === selectedZone.areaId ? next : zone)); try { await automationApi.configuration(selectedZone.areaId, { enabled: next.enabled ?? automationEnabled, mode: 'NORMAL', faultHoldEnabled: next.faultBehavior, season: (next.season || 'Summer').toUpperCase() }); await refresh(selectedZone.areaId); } catch (e) { setError(e.message); } }
  async function toggleNetwork(enabled) { setAutomationEnabled(enabled); try { await Promise.all(zones.map((zone) => automationApi.configuration(zone.areaId, { enabled, mode: 'NORMAL', faultHoldEnabled: zone.faultBehavior, season: (zone.season || 'Summer').toUpperCase() }))); await Promise.all(zones.map((zone) => refresh(zone.areaId))); setError(''); } catch (e) { setError(`Automation setting was not saved: ${e.message}`); } }
  async function updateLight(id, changes) {
    try {
      if (changes.mode === 'Auto' || changes.override === null) {
        await automationApi.clearOverride(selectedZone.areaId, id);
      } else {
        await automationApi.override(selectedZone.areaId, id, {
          mode: 'MANUAL',
          brightness: changes.brightness ?? selectedZone.lights.find((l) => l.id === id)?.brightness ?? 100,
          durationMinutes: changes.override?.expires?.includes('2 hours') ? 120 : null
        });
      }
      await refresh(selectedZone.areaId);
      setError('');
    } catch (e) {
      setError(`Light mode change failed: ${e.message}`);
    }
  }
  async function updateSchedule(id, field, value) { try { const item = schedule.find((p) => p.id === id); const next = { ...item, [field]: field === 'brightness' ? Number(value) : value }; await automationApi.updatePhase(selectedZone.areaId, id, { startTime: next.start, endTime: next.end, action: next.action, brightness: next.brightness, weekType: scheduleKind === 'weekday' ? 'WEEKDAY' : 'WEEKEND', phaseOrder: 0, priority: 0 }); await refresh(selectedZone.areaId); setError(''); } catch (e) { setError(`Schedule was not saved: ${e.message}`); } }
  async function removePhase(id) { try { await automationApi.deletePhase(selectedZone.areaId, id); await refresh(selectedZone.areaId); setError(''); } catch (e) { setError(`Phase was not deleted: ${e.message}`); } }
  async function addPhase() { try { await automationApi.createPhase(selectedZone.areaId, { startTime: '12:00', endTime: '13:00', action: 'DIM', brightness: 50, weekType: scheduleKind === 'weekday' ? 'WEEKDAY' : 'WEEKEND', phaseOrder: schedule.length, priority: 0 }); await refresh(selectedZone.areaId); setError(''); } catch (e) { setError(`Phase was not created: ${e.message}`); } }
  async function runScheduleNow() { try { await automationApi.runNow(selectedZone.areaId, scheduleKind === 'weekday' ? 'WEEKDAY' : 'WEEKEND'); await refresh(selectedZone.areaId); setError('Schedule evaluated. Check Activity Logs for per-light results.'); } catch (e) { setError(`Schedule could not run: ${e.message}`); } }

  function applyPreset(preset) {
    updateZone((zone) => ({
      ...zone,
      weekday: zone.weekday.map((entry) => ({ ...entry, brightness: entry.action === 'OFF' ? 0 : preset.id === 'energy' && entry.action === 'DIM' ? 35 : preset.brightness })),
      weekend: zone.weekend.map((entry) => ({ ...entry, brightness: entry.action === 'OFF' ? 0 : preset.id === 'energy' && entry.action === 'DIM' ? 45 : preset.brightness })),
      lights: zone.lights,
    }));
  }

  function returnToSchedule() { automationApi.returnToSchedule(selectedZone.areaId).then(() => refresh(selectedZone.areaId)).catch((e) => setError(e.message)); }
  function addEvent(event) { event.preventDefault(); if (!eventDraft.name.trim() || !eventDraft.date) return; automationApi.createEvent(selectedZone.areaId, { name: eventDraft.name, eventDate: eventDraft.date, brightness: Number(eventDraft.brightness), enabled: true }).then(() => refresh(selectedZone.areaId)).catch((e) => setError(e.message)); setEventDraft({ name: '', date: '', brightness: 100 }); }

  if (loading) return <AppShell activePage="Automation" title="Automation"><main className="p-8 text-sm font-semibold text-slate-400">Loading automation data…</main></AppShell>;
  if (error && !selectedZone) return <AppShell activePage="Automation" title="Automation"><main className="p-8 text-sm font-semibold text-[#ffb4a8]">Unable to load Automation data: {error}</main></AppShell>;
  if (!selectedZone) return <AppShell activePage="Automation" title="Automation"><main className="p-8 text-sm font-semibold text-slate-400">No areas are available for automation.</main></AppShell>;

  return <AppShell activePage="Automation" title="Automation"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="automation-title">
    <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6"><div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" /><div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Control Orchestration</p><h1 className="text-4xl font-black leading-tight text-slate-50" id="automation-title">Zone Automation</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Control every city zone and every individual light with layered schedules, overrides, event plans, and priority rules.</p></div><div className="flex items-center gap-3 rounded-lg border border-cyan-200/12 bg-[#05101a]/80 px-4 py-3"><Toggle checked={automationEnabled} onChange={toggleNetwork} label="Toggle all automation" /><div><strong className="block text-sm font-black text-slate-100">Network automation</strong><span className="text-xs font-semibold text-slate-400">{automationEnabled ? 'Schedules are evaluating live' : 'All schedules are paused'}</span></div></div></div></header>

    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon="automation" label="Engine" value={automationEnabled ? 'Active' : 'Paused'} color={automationEnabled ? 'text-[#73ffba]' : 'text-slate-400'} /><Metric icon="clock" label="Current rule" value={automationEnabled ? `${phase.action} ${phase.brightness}%` : 'Manual control'} /><Metric icon="manual" label="Active overrides" value={`${overrides.length} lights`} color="text-[#ffcd78]" /><Metric icon="warning" label="Fault attention" value={`${faults.length} lights`} color={faults.length ? 'text-[#ffb4a8]' : 'text-[#73ffba]'} /></section>

    <section className="mt-4"><div className="mb-3"><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Zone Workspace</p><h2 className="text-xl font-black text-slate-50">Choose a city area</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{zones.map((zone) => { const details = { color: 'text-[#72e7ff]' }; const zoneFaults = zone.lights.filter((light) => light.faultStatus === 'Fault').length; return <button key={zone.id} className={`min-h-28 rounded-lg border p-4 text-left transition ${selectedArea === zone.name ? 'border-[#72e7ff]/55 bg-cyan-300/10 shadow-[inset_3px_0_0_#72e7ff]' : 'border-cyan-200/10 bg-[#07131f]/72 hover:border-cyan-200/25 hover:bg-cyan-300/5'}`} type="button" onClick={() => setSelectedArea(zone.name)}><div className="flex items-start justify-between gap-3"><span className={`grid size-9 place-items-center rounded-md border border-current/15 bg-white/[0.03] ${details.color}`}><DashboardIcon className="size-4" name="map" /></span><span className="text-xs font-black text-slate-500">{zone.lights.length} lights</span></div><strong className="mt-3 block text-base font-black text-slate-100">{zone.name}</strong><span className="mt-1 block text-xs font-semibold text-slate-400">{zone.type}{zoneFaults ? ` | ${zoneFaults} fault flagged` : ' | Healthy'}</span></button>; })}</div></section>

    <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.85fr)]"><Panel className="p-5 sm:p-6"><div className="flex flex-col gap-4 border-b border-cyan-200/10 pb-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">{selectedZone.type}</p><h2 className="mt-1 text-2xl font-black text-slate-50">{selectedZone.name} schedule</h2><p className="mt-1 text-sm text-slate-400">Target level: {selectedZone.target}% | Mode: Auto | Season: {selectedZone.season}</p><p className="mt-2 text-xs font-semibold text-[#ffcd78]">Today is {now.toLocaleDateString(undefined, { weekday: 'long' })}. The {scheduleKind} schedule is evaluated only on {scheduleKind === 'weekday' ? 'Monday–Friday' : 'Saturday–Sunday'}.</p></div><span className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#73ffba]/25 bg-[#73ffba]/8 px-4 text-sm font-black text-[#73ffba]">Auto</span></div><div className="mt-5 flex flex-wrap gap-2">{presets.map((preset) => <button key={preset.id} className={`min-h-10 rounded-md border px-3 text-xs font-black transition hover:brightness-110 ${preset.className}`} type="button" onClick={() => applyPreset(preset)}>{preset.label}</button>)}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="inline-flex rounded-md border border-cyan-200/12 bg-[#05101a]/80 p-1" role="tablist" aria-label="Schedule type">{['weekday', 'weekend'].map((kind) => <button className={`min-h-9 rounded px-3 text-xs font-black capitalize ${scheduleKind === kind ? 'bg-cyan-300/14 text-[#72e7ff]' : 'text-slate-400'}`} key={kind} type="button" role="tab" aria-selected={scheduleKind === kind} onClick={() => setScheduleKind(kind)}>{kind}</button>)}</div><div className="flex gap-2"><button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 text-xs font-black text-[#91dff3] transition hover:bg-cyan-300/14" type="button" onClick={runScheduleNow}>Run schedule now</button><button className="inline-flex min-h-10 items-center gap-2 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-3 text-xs font-black text-[#91dff3] transition hover:bg-cyan-300/14" type="button" onClick={addPhase}><DashboardIcon className="size-4" name="plus" /> Add phase</button></div></div><ScheduleTable schedule={schedule} onUpdate={updateSchedule} onRemove={removePhase} /></Panel>
      <div className="grid gap-4"><Panel className="p-5"><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Rule Safeguards</p><h2 className="mt-1 text-xl font-black text-slate-50">Priority and fault behavior</h2><div className="mt-4 space-y-3 text-sm"><div className="flex items-center justify-between rounded-md border border-[#ff9f91]/16 bg-[#ff9f91]/5 p-3"><span className="font-bold text-slate-200">Emergency and manual commands</span><strong className="text-xs font-black text-[#ffb4a8]">Override schedules</strong></div><label className="flex items-center justify-between gap-3 rounded-md border border-cyan-200/10 bg-[#05101a]/60 p-3"><span><strong className="block text-sm text-slate-200">Fault hold policy</strong><span className="text-xs text-slate-400">Flag faults and preserve the last safe command.</span></span><Toggle checked={selectedZone.faultBehavior} onChange={(checked) => updateZone((zone) => ({ ...zone, faultBehavior: checked }))} label="Toggle fault behavior" /></label><label className="block"><span className="mb-1 block text-xs font-black uppercase tracking-[0.12em] text-slate-500">Seasonal schedule</span><select className="min-h-10 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100" value={selectedZone.season} onChange={(event) => updateZone((zone) => ({ ...zone, season: event.target.value }))}><option>Summer</option><option>Winter</option><option>Monsoon</option></select></label></div></Panel></div></div>

    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.7fr)]"><Panel className="p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Individual Control</p><h2 className="text-xl font-black text-slate-50">{selectedZone.name} light overrides</h2></div><button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3 text-xs font-black ${showFaultsOnly ? 'border-[#ff9f91]/30 bg-[#ff9f91]/10 text-[#ffb4a8]' : 'border-cyan-200/14 text-slate-300'}`} type="button" onClick={() => setShowFaultsOnly((current) => !current)}><DashboardIcon className="size-4" name="warning" />{showFaultsOnly ? 'Showing faults' : 'Show faults'}</button></div><LightTable lights={visibleLights} zoneMode={selectedZone.mode} manualMode={!automationEnabled} onUpdate={updateLight} /></Panel>
      <Panel className="p-5"><p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Calendar Exception</p><h2 className="mt-1 text-xl font-black text-slate-50">Event and holiday plan</h2><p className="mt-2 text-sm leading-6 text-slate-400">Event rules take precedence over the normal area schedule for their date.</p><form className="mt-4 grid gap-3" onSubmit={addEvent}><input className="min-h-11 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100 placeholder:text-slate-600" placeholder="Festival or event name" value={eventDraft.name} onChange={(event) => setEventDraft((draft) => ({ ...draft, name: event.target.value }))} /><input className="min-h-11 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100" type="date" value={eventDraft.date} onChange={(event) => setEventDraft((draft) => ({ ...draft, date: event.target.value }))} /><label className="rounded-md border border-cyan-200/10 bg-[#05101a]/55 p-3"><span className="flex items-center justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-400">Event brightness <strong className="text-[#72e7ff]">{eventDraft.brightness}%</strong></span><input className="mt-2 w-full accent-[#72e7ff]" type="range" min="0" max="100" value={eventDraft.brightness} onChange={(event) => setEventDraft((draft) => ({ ...draft, brightness: event.target.value }))} /></label><button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-200/18 bg-cyan-300/9 px-4 text-sm font-black text-[#91dff3] transition hover:bg-cyan-300/14" type="submit"><DashboardIcon className="size-4" name="plus" /> Add event plan</button></form><div className="mt-4 space-y-2">{selectedZone.events.length ? selectedZone.events.map((event) => <div className="flex items-center justify-between gap-3 rounded-md border border-[#ffcd78]/15 bg-[#ffcd78]/5 p-3" key={event.id}><div><strong className="block text-sm text-slate-100">{event.name}</strong><span className="text-xs text-slate-400">{event.date}</span></div><strong className="text-sm font-black text-[#ffcd78]">{event.brightness}%</strong></div>) : <div className="rounded-md border border-dashed border-cyan-200/12 p-4 text-sm font-semibold text-slate-500">No event plans for this area.</div>}</div></Panel></div>
  </main></AppShell>;
}

function ScheduleTable({ schedule, onUpdate, onRemove }) {
  return <div className="mt-4 overflow-x-auto rounded-lg border border-cyan-200/10"><table className="min-w-[690px] w-full text-left"><thead className="bg-white/[0.02]"><tr>{['Time window', 'Action', 'Brightness', 'Rule output', ''].map((label) => <th className="p-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{schedule.map((entry) => <tr className="border-t border-cyan-200/8" key={entry.id}><td className="p-3"><div className="flex items-center gap-2"><input className="h-10 w-27 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-2 text-sm font-bold text-slate-100" type="time" value={entry.start} onChange={(event) => onUpdate(entry.id, 'start', event.target.value)} /><span className="text-slate-600">to</span><input className="h-10 w-27 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-2 text-sm font-bold text-slate-100" type="time" value={entry.end} onChange={(event) => onUpdate(entry.id, 'end', event.target.value)} /></div></td><td className="p-3"><select className="h-10 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-2 text-sm font-bold text-slate-100" value={entry.action} onChange={(event) => onUpdate(entry.id, 'action', event.target.value)}>{['ON', 'DIM', 'OFF'].map((action) => <option className="bg-[#07131f]" key={action}>{action}</option>)}</select></td><td className="p-3"><div className="flex items-center gap-2"><input className="accent-[#72e7ff]" type="range" min="0" max="100" value={entry.brightness} onChange={(event) => onUpdate(entry.id, 'brightness', event.target.value)} /><strong className="w-10 text-sm font-black text-[#72e7ff]">{entry.brightness}%</strong></div></td><td className="p-3"><span className={`rounded px-2 py-1 text-xs font-black ${entry.action === 'OFF' ? 'bg-slate-400/10 text-slate-300' : entry.action === 'DIM' ? 'bg-cyan-300/10 text-[#72e7ff]' : 'bg-[#73ffba]/10 text-[#73ffba]'}`}>{entry.action} at {entry.brightness}%</span></td><td className="p-3"><button className="grid size-9 place-items-center rounded-md text-slate-500 transition hover:bg-[#ff9f91]/10 hover:text-[#ffb4a8]" type="button" title="Delete schedule phase" aria-label="Delete schedule phase" onClick={() => onRemove(entry.id)}><DashboardIcon className="size-4" name="trash" /></button></td></tr>)}</tbody></table></div>;
}

function LightTable({ lights, zoneMode, onUpdate, manualMode }) {
  return <div className="mt-4 overflow-x-auto rounded-lg border border-cyan-200/10"><table className="min-w-[850px] w-full text-left"><thead className="bg-white/[0.02]"><tr>{['Light', 'Health', 'Mode', 'Brightness', 'Override', 'Priority'].map((label) => <th className="p-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500" key={label}>{label}</th>)}</tr></thead><tbody>{lights.map((light) => <tr className="border-t border-cyan-200/8" key={light.id}><td className="p-3"><strong className="block text-sm font-black text-slate-100">{light.id}</strong><span className="text-xs text-slate-500">{light.area}</span></td><td className="p-3"><span className={`rounded px-2 py-1 text-xs font-black ${light.faultStatus === 'Fault' ? 'bg-[#ff9f91]/10 text-[#ffb4a8]' : 'bg-[#73ffba]/10 text-[#73ffba]'}`}>{light.faultStatus === 'Fault' ? 'Flagged fault' : 'Healthy'}</span></td><td className="p-3"><select className="h-10 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-2 text-sm font-bold text-slate-100" value={light.mode} onChange={(event) => onUpdate(light.id, { mode: event.target.value, priority: event.target.value === 'Auto' ? 'Schedule' : 'Manual' })}>{streetLightModes.map((mode) => <option className="bg-[#07131f]" key={mode}>{mode}</option>)}</select></td><td className="p-3"><div className="flex items-center gap-2"><input className="accent-[#72e7ff]" type="range" min="0" max="100" value={light.brightness} onChange={(event) => { const brightness = Number(event.target.value); onUpdate(light.id, { brightness, status: brightness === 0 ? 'OFF' : brightness < 100 ? 'DIM' : 'ON', priority: 'Manual', override: { expires: 'Until cleared' } }); }} /><strong className="w-10 text-sm text-[#72e7ff]">{light.brightness}%</strong></div></td><td className="p-3">{light.override ? <button className="rounded bg-[#ffcd78]/10 px-2 py-1 text-xs font-black text-[#ffcd78]" type="button" title="Clear override" onClick={() => onUpdate(light.id, { override: null, priority: 'Schedule', mode: zoneMode })}>{light.override.expires}</button> : <button className="rounded border border-cyan-200/14 px-2 py-1 text-xs font-black text-[#91dff3]" type="button" onClick={() => onUpdate(light.id, { priority: 'Manual', override: { expires: 'Returns in 2 hours' } })}>Keep on 2h</button>}</td><td className="p-3"><span className={`text-xs font-black ${light.priority === 'Emergency' ? 'text-[#ffb4a8]' : light.priority === 'Manual' ? 'text-[#ffcd78]' : 'text-slate-400'}`}>{light.priority}</span></td></tr>)}{lights.length === 0 && <tr><td colSpan="6" className="p-10 text-center text-sm font-semibold text-slate-500">No faulty lights in this area.</td></tr>}</tbody></table></div>;
}

export default Automation;
