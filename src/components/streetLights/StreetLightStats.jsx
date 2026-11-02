import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';

const statTone = {
  TOTAL: 'text-[#72e7ff] bg-[#72e7ff]/10 ring-[#72e7ff]/20',
  ON: 'text-[#73ffba] bg-[#73ffba]/10 ring-[#73ffba]/20',
  OFF: 'text-slate-300 bg-slate-400/10 ring-slate-300/15',
  FAULT: 'text-[#ff9b8d] bg-[#ff9b8d]/10 ring-[#ff9b8d]/20',
};

function StreetLightStats({ stats }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Street light statistics">
      {stats.map((stat) => (
        <article
          className="relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_20px_54px_rgba(0,0,0,0.22)] ring-1 ring-white/5"
          key={stat.id}
        >
          <div className="flex items-center justify-between gap-3">
            <div className={`grid size-10 place-items-center rounded-md ring-1 ${statTone[stat.status]}`}>
              <DashboardIcon className="size-5" name={stat.icon} />
            </div>
            <span className="size-2.5 rounded-full bg-current text-[#72e7ff] shadow-[0_0_18px_currentColor]" />
          </div>
          <p className="mt-4 text-[0.72rem] font-black uppercase tracking-[0.12em] text-slate-400">
            {stat.label}
          </p>
          <strong className="mt-2 block text-3xl font-black leading-none text-slate-50">{stat.value}</strong>
        </article>
      ))}
    </section>
  );
}

export default StreetLightStats;
