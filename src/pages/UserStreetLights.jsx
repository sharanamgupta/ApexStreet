import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import StreetLightFilters from '../components/streetLights/StreetLightFilters.jsx';
import StreetLightModal from '../components/streetLights/StreetLightModal.jsx';
import StreetLightStats from '../components/streetLights/StreetLightStats.jsx';
import UserStreetLightTable from '../components/streetLights/UserStreetLightTable.jsx';
import { streetLightModes, streetLightStatuses } from '../data/streetLightData.js';
import { getStoredToken } from '../utils/auth.js';
import { getStreetLightStats } from '../components/streetLights/streetLightUi.js';

const defaultFilters = {
  search: '',
  area: 'All Areas',
  status: 'All',
  mode: 'All',
};

const lightsPerPage = 8;

function UserStreetLights() {
  const [searchParams] = useSearchParams();
  const requestedArea = searchParams.get('area');
  const requestedMode = searchParams.get('mode');
  const requestedStatus = searchParams.get('status');

  const initialArea = requestedArea || defaultFilters.area;
  const initialMode = streetLightModes.includes(requestedMode) ? requestedMode : defaultFilters.mode;
  const initialStatus = streetLightStatuses.includes(requestedStatus) ? requestedStatus : defaultFilters.status;

  const [lights, setLights] = useState([]);
  const [areaNames, setAreaNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    area: initialArea,
    mode: initialMode,
    status: initialStatus,
  }));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLight, setSelectedLight] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/street-lights', { headers: { Authorization: `Bearer ${getStoredToken()}` } }).then(async (response) => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.error || data.message || 'Unable to load street lights.');
        return data;
      }),
      fetch('/api/areas', { headers: { Authorization: `Bearer ${getStoredToken()}` } }).then(async (response) => {
        const data = await response.json().catch(() => []);
        if (!response.ok) throw new Error(data.error || data.message || 'Unable to load areas.');
        return data;
      }),
    ]).then(([items, areas]) => {
      if (!active) return;
      setLights((Array.isArray(items) ? items : []).map((light) => ({
        id: light.lightId,
        area: light.area,
        status: light.status,
        mode: ({ AUTO: 'Auto', MANUAL: 'Manual', SCHEDULED: 'Scheduled', ENERGY_SAVING: 'Energy Saving' }[light.mode] || light.mode),
        brightness: light.brightness ?? 0,
        powerRating: light.powerRating ?? 0,
        faultStatus: light.faultStatus || light.status === 'FAULT' ? 'Fault' : 'No Fault',
        lastUpdated: light.updatedAt,
      })));
      setAreaNames((Array.isArray(areas) ? areas : []).map((area) => area.name).filter(Boolean));
      setError('');
    }).catch((err) => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => getStreetLightStats(lights, [
    { id: 'total', label: 'Total Lights', status: 'TOTAL', icon: 'grid' },
    { id: 'online', label: 'Online', status: 'ON', icon: 'power' },
    { id: 'offline', label: 'Offline', status: 'OFF', icon: 'moon' },
    { id: 'faulty', label: 'Faulty', status: 'FAULT', icon: 'warning' },
  ]).map((stat) => stat.status === 'FAULT' ? { ...stat, value: lights.filter((light) => light.faultStatus === 'Fault' || light.status === 'FAULT').length } : stat), [lights]);

  const filteredLights = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return lights.filter((light) => {
      const matchesSearch =
        !query ||
        light.id.toLowerCase().includes(query) ||
        light.area.toLowerCase().includes(query);
      const matchesArea = filters.area === 'All Areas' || light.area === filters.area;
      const matchesStatus = filters.status === 'All' || light.status === filters.status;
      const matchesMode = filters.mode === 'All' || light.mode === filters.mode;

      return matchesSearch && matchesArea && matchesStatus && matchesMode;
    });
  }, [filters, lights]);

  const totalPages = Math.max(1, Math.ceil(filteredLights.length / lightsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * lightsPerPage;
  const paginatedLights = filteredLights.slice(pageStart, pageStart + lightsPerPage);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  }

  function resetFilters() {
    setFilters(defaultFilters);
    setCurrentPage(1);
  }

  return (
    <AppShell activePage="Street Lights" title="Street Lights">
      <main className="p-4 sm:p-5 lg:p-8" aria-labelledby="user-street-lights-title">
        <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-0.5 text-[0.7rem] font-black uppercase tracking-wider text-[#72e7ff]">
                View Only Access
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl" id="user-street-lights-title">
              Street Lights
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              View status, brightness levels, operating modes, area assignments, and fault diagnostic records.
            </p>
          </div>
        </header>

        <div className="mt-4">
          <StreetLightStats stats={stats} />
        </div>

        <div className="mt-4">
          <StreetLightFilters filters={filters} areaOptions={['All Areas', ...areaNames]} onChange={updateFilter} onReset={resetFilters} />
        </div>

        <div className="mt-4">
          <div className="mb-3 flex flex-col gap-2 text-sm font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing <strong className="text-slate-100">{paginatedLights.length}</strong> of{' '}
              <strong className="text-slate-100">{filteredLights.length}</strong> matching street lights
            </span>
            <span className="rounded-full border border-cyan-200/12 bg-cyan-300/7 px-3 py-1 text-xs font-black text-[#91dff3]">
              Read Only Mode
            </span>
          </div>

          <UserStreetLightTable
            lights={paginatedLights}
            onResetFilters={resetFilters}
            onView={(light) => setSelectedLight(light)}
          />
        </div>

        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          totalItems={filteredLights.length}
          onPageChange={setCurrentPage}
        />
      </main>

        {loading ? <div className="mt-4 rounded-lg border border-cyan-200/12 bg-cyan-300/5 p-4 text-sm font-semibold text-slate-300">Loading street lights...</div> : null}
        {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}
        {selectedLight ? (
        <StreetLightModal
          mode="view"
          light={selectedLight}
          existingIds={[]}
          onClose={() => setSelectedLight(null)}
          onSave={() => setSelectedLight(null)}
        />
      ) : null}
    </AppShell>
  );
}

function Pagination({ currentPage, totalItems, totalPages, onPageChange }) {
  if (totalItems <= lightsPerPage) return null;

  return (
    <nav
      className="mt-4 flex flex-col gap-3 rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-3 shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between"
      aria-label="Street lights pagination"
    >
      <span className="text-sm font-semibold text-slate-400">
        Page <strong className="text-slate-100">{currentPage}</strong> of{' '}
        <strong className="text-slate-100">{totalPages}</strong>
      </span>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:flex">
        <button
          className="min-h-10 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 text-sm font-black text-[#91dff3] disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <span className="min-w-12 text-center text-sm font-black text-slate-200">{currentPage}</span>
        <button
          className="min-h-10 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 text-sm font-black text-[#91dff3] disabled:cursor-not-allowed disabled:opacity-45"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export default UserStreetLights;
