import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/layout/AppShell.jsx';
import UserAreaCard from '../components/areas/UserAreaCard.jsx';
import AreaModal from '../components/areas/AreaModal.jsx';
import { areasApi } from '../utils/areasApi.js';

function UserAreas() {
  const navigate = useNavigate();
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { areasApi.list({}).then(setAreas).catch((err) => setError(err.message)); }, []);

  const totalLights = areas.reduce((sum, item) => sum + item.lights, 0);
  const totalFaults = areas.reduce((sum, item) => sum + item.faults, 0);
  const totalOn = areas.reduce((sum, item) => sum + item.on, 0);
  const activePercent = totalLights ? Math.round((totalOn / totalLights) * 100) : 0;

  function handleViewLights(area) {
    setSelectedArea(null);
    navigate(`/user-dashboard/street-lights?area=${encodeURIComponent(area.name)}`);
  }

  return (
    <AppShell activePage="Areas" title="Areas">
      <main className="p-4 sm:p-5 lg:p-8" aria-labelledby="user-areas-title">
        <header className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/5 backdrop-blur-xl sm:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(109,211,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(109,211,255,0.035)_1px,transparent_1px)] bg-[size:56px_56px]" />
          <div className="relative flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-0.5 text-[0.7rem] font-black uppercase tracking-wider text-[#72e7ff]">
                View Only Access
              </span>
            </div>
            <h1 className="text-3xl font-black leading-tight text-slate-50 sm:text-4xl" id="user-areas-title">
              City Areas Overview
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Explore area-wise street-light distribution, operational health, energy statistics, and zone fault counts.
            </p>
          </div>
        </header>

        {error ? <div className="mt-4 rounded-lg border border-[#ff9f91]/25 bg-[#ff9f91]/8 p-4 text-sm font-semibold text-[#ffb4a8]" role="alert">{error}</div> : null}
        <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Area summary metrics">
          <MetricSummary label="Total Zones" value={areas.length} subtext="Monitored areas" />
          <MetricSummary label="Total Fixtures" value={totalLights} subtext="Active street lights" />
          <MetricSummary label="Average Health" value={`${activePercent}%`} subtext="Network active rate" tone="text-[#73ffba]" />
          <MetricSummary label="Active Faults" value={totalFaults} subtext="Reported area issues" tone="text-[#ff9f91]" />
        </section>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <UserAreaCard
              area={area}
              key={area.id}
              onView={(target) => setSelectedArea(target)}
            />
          ))}
        </div>
      </main>

      {selectedArea ? (
        <AreaModal
          area={selectedArea}
          existingNames={[]}
          mode="view"
          onClose={() => setSelectedArea(null)}
          onSave={() => setSelectedArea(null)}
          onViewLights={handleViewLights}
        />
      ) : null}
    </AppShell>
  );
}

function MetricSummary({ label, value, subtext, tone = 'text-slate-50' }) {
  return (
    <article className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
      <span className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</span>
      <strong className={`mt-2 block text-2xl font-black ${tone}`}>{value}</strong>
      <span className="mt-1 block text-xs font-semibold text-slate-400">{subtext}</span>
    </article>
  );
}

export default UserAreas;
