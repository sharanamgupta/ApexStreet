import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import BrightnessMeter from './BrightnessMeter.jsx';
import StreetLightCard from './StreetLightCard.jsx';
import { FaultBadge, ModeBadge, StatusBadge } from './StreetLightBadges.jsx';

function StreetLightTable({ lights, onView, onEdit, onDelete, onResetFilters }) {
  if (lights.length === 0) {
    return (
      <section className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-10 text-center shadow-[0_20px_54px_rgba(0,0,0,0.2)]">
        <div className="mx-auto grid size-14 place-items-center rounded-lg border border-cyan-200/14 bg-cyan-300/8 text-[#72e7ff]">
          <DashboardIcon className="size-7" name="street" />
        </div>
        <h2 className="mt-5 text-2xl font-black text-slate-50">No street lights found</h2>
        <p className="mt-2 text-sm font-semibold text-slate-400">Try changing your search or filters.</p>
        <button
          className="mt-5 min-h-11 rounded-md border border-cyan-200/16 bg-cyan-300/8 px-4 text-sm font-black text-[#91dff3]"
          type="button"
          onClick={onResetFilters}
        >
          Clear Filters
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="hidden overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 shadow-[0_20px_54px_rgba(0,0,0,0.2)] ring-1 ring-white/5 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-cyan-200/10 bg-white/[0.025]">
              <tr>
                {[
                  'Light ID',
                  'Area',
                  'Status',
                  'Mode',
                  'Brightness',
                  'Power',
                  'Fault',
                  'Last Updated',
                  'Actions',
                ].map((heading) => (
                  <th
                    className="px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-500"
                    key={heading}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-200/8">
              {lights.map((light) => (
                <tr className="transition hover:bg-cyan-300/[0.035]" key={light.id}>
                  <td className="px-4 py-4 font-black text-slate-50">{light.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-300">{light.area}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={light.status} />
                  </td>
                  <td className="px-4 py-4">
                    <ModeBadge mode={light.mode} />
                  </td>
                  <td className="px-4 py-4">
                    <BrightnessMeter value={light.brightness} />
                  </td>
                  <td className="px-4 py-4 text-sm font-black text-slate-200">{light.powerRating}W</td>
                  <td className="px-4 py-4">
                    <FaultBadge faultStatus={light.faultStatus} />
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-slate-400">{light.lastUpdated}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <IconButton icon="eye" label="View" onClick={() => onView(light)} />
                      <IconButton icon="edit" label="Edit" onClick={() => onEdit(light)} />
                      <IconButton danger icon="trash" label="Delete" onClick={() => onDelete(light)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-3 lg:hidden" aria-label="Street light cards">
        {lights.map((light) => (
          <StreetLightCard
            key={light.id}
            light={light}
            onDelete={onDelete}
            onEdit={onEdit}
            onView={onView}
          />
        ))}
      </section>
    </>
  );
}

function IconButton({ danger = false, icon, label, onClick }) {
  return (
    <button
      className={`grid size-9 place-items-center rounded-md border transition ${
        danger
          ? 'border-[#ff9b8d]/20 bg-[#ff9b8d]/8 text-[#ffb4a8] hover:bg-[#ff9b8d]/12'
          : 'border-cyan-200/14 bg-cyan-300/8 text-[#91dff3] hover:bg-cyan-300/12'
      }`}
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <DashboardIcon className="size-4" name={icon} />
    </button>
  );
}

export default StreetLightTable;
