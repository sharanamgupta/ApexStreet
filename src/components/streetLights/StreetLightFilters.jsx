import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import { streetLightModes, streetLightStatuses } from '../../data/streetLightData.js';

function StreetLightFilters({ filters, onChange, onReset, areaOptions = ['All Areas'] }) {
  return (
    <section className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.2)] ring-1 ring-white/5">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_150px_150px_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">
            Search
          </span>
          <span className="flex min-h-12 items-center gap-3 rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-slate-200 focus-within:border-[#72e7ff]/60 focus-within:ring-4 focus-within:ring-cyan-300/10">
            <DashboardIcon className="size-4 shrink-0 text-[#72e7ff]" name="search" />
            <input
              className="w-full min-w-0 border-0 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-600"
              type="search"
              value={filters.search}
              onChange={(event) => onChange('search', event.target.value)}
              placeholder="Search by light ID or area..."
            />
          </span>
        </label>

        <FilterSelect
          label="Area"
          value={filters.area}
          onChange={(value) => onChange('area', value)}
          options={areaOptions}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={(value) => onChange('status', value)}
          options={['All', ...streetLightStatuses]}
        />
        <FilterSelect
          label="Mode"
          value={filters.mode}
          onChange={(value) => onChange('mode', value)}
          options={['All', ...streetLightModes]}
        />

        <button
          className="min-h-12 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-4 text-sm font-black text-[#91dff3] transition hover:bg-cyan-300/12"
          type="button"
          onClick={onReset}
        >
          Clear
        </button>
      </div>
    </section>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>
      <select
        className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-200 outline-none transition focus:border-[#72e7ff]/60 focus:ring-4 focus:ring-cyan-300/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option className="bg-[#07131f]" key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default StreetLightFilters;
