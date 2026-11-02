import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import BrightnessMeter from './BrightnessMeter.jsx';
import { FaultBadge, ModeBadge, StatusBadge } from './StreetLightBadges.jsx';

function UserStreetLightTable({ lights, onView, onResetFilters }) {
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
      {/* Desktop Table View */}
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
                  'Action',
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
                    <button
                      className="inline-flex items-center gap-1.5 rounded-md border border-cyan-200/14 bg-cyan-300/8 px-3 py-1.5 text-xs font-black text-[#91dff3] hover:bg-cyan-300/14 transition"
                      type="button"
                      onClick={() => onView(light)}
                      title="View Details"
                    >
                      <DashboardIcon className="size-3.5" name="eye" />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile Card View */}
      <section className="grid gap-3 lg:hidden" aria-label="Street light cards">
        {lights.map((light) => (
          <article
            className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]"
            key={light.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-50">{light.id}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-400">{light.area}</p>
              </div>
              <StatusBadge status={light.status} />
            </div>

            <div className="mt-4 grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Mode</span>
                <ModeBadge mode={light.mode} />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                    Brightness
                  </span>
                  <span className="text-sm font-bold text-slate-300">{light.powerRating}W</span>
                </div>
                <BrightnessMeter value={light.brightness} />
              </div>
              <div className="flex items-center justify-between gap-3">
                <FaultBadge faultStatus={light.faultStatus} />
                <time className="text-sm font-bold text-slate-400">{light.lastUpdated}</time>
              </div>
            </div>

            <div className="mt-4">
              <button
                className="w-full inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-cyan-200/14 bg-cyan-300/8 text-xs font-black text-[#91dff3] hover:bg-cyan-300/14 transition"
                type="button"
                onClick={() => onView(light)}
              >
                <DashboardIcon className="size-4" name="eye" />
                View Details
              </button>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}

export default UserStreetLightTable;
