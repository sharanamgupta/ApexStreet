import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import AreaCard from '../components/areas/AreaCard.jsx';
import AreaModal from '../components/areas/AreaModal.jsx';
import { areaTypes } from '../data/areaData.js';
import { areasApi } from '../utils/areasApi.js';

const defaultFilters = { search: '', type: 'All Areas', automation: 'All' };

function Areas() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [summary, setSummary] = useState({ totalAreas: 0, totalLights: 0, activeAreas: 0, areasWithFaults: 0 });
  const [filters, setFilters] = useState(defaultFilters);
  const [modal, setModal] = useState({ mode: null, area: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { const [items, counts] = await Promise.all([areasApi.list(filters), areasApi.summary()]); setAreas(items); setSummary(counts); }
    catch (err) { setError(err.message); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [filters]);

  async function saveArea(value) {
    try { if (modal.mode === 'edit') await areasApi.update(value.id, value); else await areasApi.create(value); setModal({ mode: null, area: null }); await load(); }
    catch (err) { setError(err.message); }
  }
  async function viewArea(area) {
    try { setModal({ mode: 'view', area: await areasApi.get(area.id) }); }
    catch (err) { setError(err.message); }
  }
  async function deleteArea() {
    try { await areasApi.remove(deleteTarget.id); setDeleteTarget(null); await load(); }
    catch (err) { setError(err.message); }
  }
  function viewLights(area) { navigate(`/street-lights?area=${encodeURIComponent(area.name)}`); }
  const existingNames = areas.map((area) => area.name.toLowerCase());

  return <AppShell activePage="Areas" title="Areas"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="areas-title">
    <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6"><div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" /><div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Zone Intelligence</p><h1 className="text-4xl font-black leading-tight text-slate-50" id="areas-title">Areas</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Monitor street-light networks across different city zones.</p></div><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#8df0ff] to-[#55c9ff] px-4 text-sm font-black text-[#041018] shadow-[0_16px_34px_rgba(47,193,255,0.22)]" type="button" onClick={() => setModal({ mode: 'add', area: null })}><DashboardIcon className="size-4" name="plus" /> Add Area</button></div></header>
    {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}
    <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Area summary">{[['Total Areas', summary.totalAreas, 'map', 'text-[#72e7ff]'], ['Total Lights', summary.totalLights, 'street', 'text-[#91dff3]'], ['Active Areas', summary.activeAreas, 'power', 'text-[#73ffba]'], ['Areas With Faults', summary.areasWithFaults, 'warning', 'text-[#ff9f91]']].map(([label, value, icon, tone]) => <div className="flex items-center gap-4 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]" key={label}><div className={`grid size-11 shrink-0 place-items-center rounded-md bg-white/5 ${tone}`}><DashboardIcon className="size-5" name={icon} /></div><div><p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p><strong className="mt-1 block text-2xl font-black text-slate-50">{value}</strong></div></div>)}</section>
    <section className="mt-4 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.2)]"><div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px_auto] lg:items-end"><label><span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">Search by area</span><span className="flex min-h-12 items-center gap-3 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3"><DashboardIcon className="size-4 text-[#72e7ff]" name="search" /><input className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600" type="search" placeholder="Search area name..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></span></label><Filter label="Area Type" value={filters.type} options={['All Areas', ...areaTypes]} onChange={(type) => setFilters({ ...filters, type })} /><Filter label="Automation" value={filters.automation} options={['All', 'Active', 'Inactive']} onChange={(automation) => setFilters({ ...filters, automation })} /><button className="min-h-12 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-4 text-sm font-black text-[#91dff3]" type="button" onClick={() => setFilters(defaultFilters)}>Clear</button></div></section>
    <div className="mb-3 mt-5 flex items-center justify-between text-sm font-semibold text-slate-400"><span>Showing <strong className="text-slate-100">{areas.length}</strong> of {summary.totalAreas} city zones</span><span className="rounded-full border border-cyan-200/12 bg-cyan-300/7 px-3 py-1 text-xs font-black text-[#91dff3]">{loading ? 'Loading...' : 'Live database data'}</span></div><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{areas.map((area) => <AreaCard area={area} key={area.id} onDelete={setDeleteTarget} onEdit={(item) => setModal({ mode: 'edit', area: item })} onView={viewArea} />)}</section>{!loading && areas.length === 0 ? <div className="rounded-lg border border-dashed border-cyan-200/20 bg-[#07131f]/65 p-12 text-center"><DashboardIcon className="mx-auto size-8 text-[#72e7ff]" name="search" /><h2 className="mt-3 text-lg font-black text-slate-50">No areas found</h2><p className="mt-1 text-sm text-slate-400">Try clearing the search or filters.</p></div> : null}</main>{modal.mode && <AreaModal mode={modal.mode} area={modal.area} existingNames={existingNames} onClose={() => setModal({ mode: null, area: null })} onSave={saveArea} onViewLights={viewLights} />}{deleteTarget && <DeleteDialog area={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={deleteArea} />}</AppShell>;
}
function Filter({ label, value, options, onChange }) { return <label><span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">{label}</span><select className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option className="bg-[#07131f]" key={option}>{option}</option>)}</select></label>; }
function DeleteDialog({ area, onCancel, onConfirm }) { return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/65 p-4 backdrop-blur-sm"><section className="w-full max-w-md rounded-lg border border-[#ff9f91]/20 bg-[#101820] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.5)]" role="alertdialog" aria-modal="true"><div className="grid size-12 place-items-center rounded-md bg-[#ff9f91]/10 text-[#ffb4a8]"><DashboardIcon className="size-6" name="trash" /></div><h2 className="mt-5 text-xl font-black text-slate-50">Delete {area.name}?</h2><p className="mt-2 text-sm leading-6 text-slate-400">Areas with associated Street Lights cannot be deleted.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button className="min-h-11 rounded-md border border-cyan-200/14 px-4 text-sm font-black text-slate-300" type="button" onClick={onCancel}>Cancel</button><button className="min-h-11 rounded-md bg-[#ff9f91] px-4 text-sm font-black text-[#1e0c0a]" type="button" onClick={onConfirm}>Delete Area</button></div></section></div>; }
export default Areas;
