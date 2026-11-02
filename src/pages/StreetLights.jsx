import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardIcon from '../components/dashboard/DashboardIcon.jsx';
import AppShell from '../components/layout/AppShell.jsx';
import DeleteConfirmation from '../components/streetLights/DeleteConfirmation.jsx';
import StreetLightFilters from '../components/streetLights/StreetLightFilters.jsx';
import StreetLightModal from '../components/streetLights/StreetLightModal.jsx';
import StreetLightStats from '../components/streetLights/StreetLightStats.jsx';
import StreetLightTable from '../components/streetLights/StreetLightTable.jsx';
import { streetLightModes, streetLightStatuses } from '../data/streetLightData.js';
import { areasApi } from '../utils/areasApi.js';
import { getStoredToken } from '../utils/auth.js';
import { normalizeLightForm } from '../components/streetLights/streetLightUi.js';

const defaultFilters = { search: '', area: 'All Areas', status: 'All', mode: 'All' };
const lightsPerPage = 8;

async function request(path, options = {}) {
  const token = getStoredToken();
  const response = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.message || `Street Lights request failed (${response.status}).`);
  return data;
}

function modeToUi(mode) {
  return { AUTO: 'Auto', MANUAL: 'Manual', SCHEDULED: 'Scheduled', ENERGY_SAVING: 'Energy Saving' }[mode] || mode || 'Auto';
}

function toUiLight(light) {
  return {
    id: light.lightId || light.id || '',
    area: light.area || '',
    status: light.status || 'OFF',
    mode: modeToUi(light.mode),
    brightness: light.brightness ?? 0,
    powerRating: light.powerRating ?? 0,
    faultStatus: light.faultStatus ? 'Fault' : 'No Fault',
    lastUpdated: light.updatedAt ? new Date(light.updatedAt).toLocaleString() : 'Not available',
  };
}

function toApiLight(light) {
  return {
    lightId: light.id,
    area: light.area,
    status: light.status,
    mode: String(light.mode || 'Auto').toUpperCase().replace(' ', '_'),
    brightness: Number(light.brightness),
    powerRating: Number(light.powerRating),
    faultStatus: light.faultStatus === 'Fault',
  };
}

function getStats(lights, statistics) {
  const statusCount = (status) => lights.filter((light) => light.status === status).length;
  return [
    { id: 'total', label: 'Total Lights', status: 'TOTAL', value: statistics?.totalLights ?? lights.length, icon: 'grid' },
    { id: 'online', label: 'Online', status: 'ON', value: statistics?.onlineLights ?? statusCount('ON'), icon: 'power' },
    { id: 'offline', label: 'Offline', status: 'OFF', value: statistics?.offlineLights ?? statusCount('OFF'), icon: 'moon' },
    { id: 'faulty', label: 'Faulty', status: 'FAULT', value: statistics?.faultyLights ?? lights.filter((light) => light.faultStatus === 'Fault' || light.status === 'FAULT').length, icon: 'warning' },
  ];
}

function StreetLights() {
  const [searchParams] = useSearchParams();
  const requestedArea = searchParams.get('area');
  const requestedMode = searchParams.get('mode');
  const requestedStatus = searchParams.get('status');
  const initialArea = requestedArea || defaultFilters.area;
  const initialMode = streetLightModes.includes(requestedMode) ? requestedMode : defaultFilters.mode;
  const initialStatus = streetLightStatuses.includes(requestedStatus) ? requestedStatus : defaultFilters.status;

  const [lights, setLights] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [areaNames, setAreaNames] = useState([]);
  const [filters, setFilters] = useState(() => ({ ...defaultFilters, area: initialArea, mode: initialMode, status: initialStatus }));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mutationError, setMutationError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalState, setModalState] = useState({ type: null, light: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  async function loadLights() {
    setLoading(true);
    setLoadError('');
    try {
      const [items, summary, names] = await Promise.all([request('/api/street-lights'), request('/api/street-lights/statistics'), areasApi.names()]);
      setLights(Array.isArray(items) ? items.map(toUiLight) : []);
      setStatistics(summary || null);
      setAreaNames(Array.isArray(names) ? names : []);
    } catch (error) {
      setLights([]);
      setStatistics(null);
      setLoadError(error.message || 'Unable to load street lights.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLights(); }, []);

  const stats = useMemo(() => getStats(lights, statistics), [lights, statistics]);
  const existingIds = useMemo(() => lights.map((light) => light.id), [lights]);
  const filteredLights = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return lights.filter((light) => (!query || light.id.toLowerCase().includes(query) || light.area.toLowerCase().includes(query)) && (filters.area === 'All Areas' || light.area === filters.area) && (filters.status === 'All' || light.status === filters.status) && (filters.mode === 'All' || light.mode === filters.mode));
  }, [filters, lights]);
  const totalPages = Math.max(1, Math.ceil(filteredLights.length / lightsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLights = filteredLights.slice((safePage - 1) * lightsPerPage, safePage * lightsPerPage);

  function updateFilter(key, value) { setFilters((current) => ({ ...current, [key]: value })); setCurrentPage(1); }
  function resetFilters() { setFilters(defaultFilters); setCurrentPage(1); }
  function openAddModal() { setMutationError(''); setModalState({ type: 'add', light: normalizeLightForm({ area: areaNames[0] || '' }) }); }

  async function handleSave(light) {
    setMutationError('');
    try {
      const path = modalState.type === 'edit' ? `/api/street-lights/${encodeURIComponent(light.id)}` : '/api/street-lights';
      const saved = await request(path, { method: modalState.type === 'edit' ? 'PUT' : 'POST', body: JSON.stringify(toApiLight(light)) });
      const updated = toUiLight(saved);
      setLights((current) => modalState.type === 'edit' ? current.map((item) => item.id === updated.id ? updated : item) : [updated, ...current]);
      setModalState({ type: null, light: null });
      setCurrentPage(1);
      const summary = await request('/api/street-lights/statistics');
      setStatistics(summary);
    } catch (error) {
      setMutationError(error.message || 'Unable to save this street light.');
    }
  }

  async function handleDelete(light) {
    setMutationError('');
    try {
      await request(`/api/street-lights/${encodeURIComponent(light.id)}`, { method: 'DELETE' });
      setLights((current) => current.filter((item) => item.id !== light.id));
      setDeleteTarget(null);
      setCurrentPage(1);
      const summary = await request('/api/street-lights/statistics');
      setStatistics(summary);
    } catch (error) {
      setMutationError(error.message || 'Unable to delete this street light.');
      setDeleteTarget(null);
    }
  }

  return <AppShell activePage="Street Lights" title="Street Lights"><main className="p-4 sm:p-5 lg:p-8" aria-labelledby="street-lights-title"><header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6"><div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" /><div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div><p className="mb-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">Street Light Management</p><h1 className="text-4xl font-black leading-tight text-slate-50" id="street-lights-title">Street Lights</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">Monitor and manage the city&apos;s smart street-light network.</p></div><button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#8df0ff] to-[#55c9ff] px-4 text-sm font-black text-[#041018] shadow-[0_16px_34px_rgba(47,193,255,0.22)] transition hover:brightness-105" type="button" onClick={openAddModal}><DashboardIcon className="size-4" name="plus" />Add Street Light</button></div></header>
    {loadError ? <div className="mt-4 rounded-lg border border-rose-300/20 bg-rose-300/[0.06] px-4 py-3 text-sm font-semibold text-rose-200">{loadError}</div> : null}
    {mutationError ? <div className="mt-4 rounded-lg border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm font-semibold text-amber-200">{mutationError}</div> : null}
    <div className="mt-4"><StreetLightStats stats={stats} /></div><div className="mt-4"><StreetLightFilters filters={filters} areaOptions={['All Areas', ...areaNames]} onChange={updateFilter} onReset={resetFilters} /></div>
    <div className="mt-4"><div className="mb-3 flex flex-col gap-2 text-sm font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span>Showing <strong className="text-slate-100">{paginatedLights.length}</strong> of <strong className="text-slate-100">{filteredLights.length}</strong> matching street lights</span>{loading ? <span className="rounded-full border border-cyan-200/12 bg-cyan-300/7 px-3 py-1 text-xs font-black text-[#91dff3]">Loading...</span> : null}</div><StreetLightTable lights={paginatedLights} onDelete={setDeleteTarget} onEdit={(light) => { setMutationError(''); setModalState({ type: 'edit', light }); }} onResetFilters={resetFilters} onView={(light) => { setMutationError(''); setModalState({ type: 'view', light }); }} /></div>
    <Pagination currentPage={safePage} totalPages={totalPages} totalItems={filteredLights.length} onPageChange={setCurrentPage} /></main>
    {modalState.type ? <StreetLightModal mode={modalState.type} light={modalState.light} areaOptions={areaNames} existingIds={existingIds} onClose={() => setModalState({ type: null, light: null })} onSave={handleSave} /> : null}{deleteTarget ? <DeleteConfirmation light={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} /> : null}</AppShell>;
}

function Pagination({ currentPage, totalItems, totalPages, onPageChange }) {
  if (totalItems <= lightsPerPage) return null;
  return <nav className="mt-4 flex flex-col gap-3 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between" aria-label="Street lights pagination"><span className="text-sm font-semibold text-slate-400">Page <strong className="text-slate-100">{currentPage}</strong> of <strong className="text-slate-100">{totalPages}</strong></span><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex"><button className="min-h-10 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 text-sm font-black text-[#91dff3] disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Previous</button><span className="min-w-12 text-center text-sm font-black text-slate-200">{currentPage}</span><button className="min-h-10 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 text-sm font-black text-[#91dff3] disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</button></div></nav>;
}

export default StreetLights;
