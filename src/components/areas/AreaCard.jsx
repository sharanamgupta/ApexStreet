import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';

function AreaCard({ area, onDelete, onEdit, onView }) {
  const activePercent = area.lights ? Math.round(((area.on + area.dim) / area.lights) * 100) : 0;
  return (
    <article className="group relative overflow-hidden rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-5 shadow-[0_20px_54px_rgba(0,0,0,0.2)] ring-1 ring-white/5 transition duration-200 hover:-translate-y-1 hover:border-cyan-200/25 hover:shadow-[0_26px_65px_rgba(0,0,0,0.3)]">
      <div className="absolute right-0 top-0 h-24 w-24 bg-[radial-gradient(circle,rgba(114,231,255,0.14),transparent_68%)]" />
      <div className="relative flex items-start justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#72e7ff]">{area.type}</p><h2 className="mt-1 text-xl font-black text-slate-50">{area.name}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{area.description}</p></div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wide ${area.automation === 'Active' ? 'border-emerald-300/20 bg-emerald-300/10 text-[#73ffba]' : 'border-amber-200/20 bg-amber-200/10 text-[#ffd08a]'}`}>{area.automation}</span>
      </div>
      <div className="relative mt-5 flex items-end justify-between border-b border-cyan-200/10 pb-4"><div><strong className="text-3xl font-black text-slate-50">{area.lights}</strong><span className="ml-2 text-sm font-bold text-slate-500">Lights</span></div><span className="text-xs font-bold text-[#91dff3]">{activePercent}% responding</span></div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center"><Metric label="ON" value={area.on} tone="text-[#73ffba]" /><Metric label="DIM" value={area.dim} tone="text-[#72e7ff]" /><Metric label="OFF" value={area.off} tone="text-slate-300" /><Metric label="FAULTS" value={area.faults} tone={area.faults ? 'text-[#ff9f91]' : 'text-slate-400'} /></div>
      <div className="mt-5 space-y-3"><Progress label="Network activity" value={activePercent} /><div className="flex items-center justify-between text-xs font-bold text-slate-400"><span>Energy</span><strong className="text-slate-100">{area.energy} kWh</strong><span className="text-[#73ffba]">-{area.savings}%</span></div></div>
      <div className="mt-5 flex items-center gap-2 border-t border-cyan-200/10 pt-4"><button className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md border border-cyan-200/14 bg-cyan-300/8 text-xs font-black text-[#91dff3] transition hover:bg-cyan-300/14" type="button" onClick={() => onView(area)}><DashboardIcon className="size-4" name="eye" /> View Area</button><IconButton label={`Edit ${area.name}`} icon="edit" onClick={() => onEdit(area)} /><IconButton label={`Delete ${area.name}`} icon="trash" onClick={() => onDelete(area)} danger /></div>
    </article>
  );
}

function Metric({ label, value, tone }) { return <div><strong className={`block text-lg font-black ${tone}`}>{value}</strong><span className="text-[0.62rem] font-black uppercase tracking-wide text-slate-500">{label}</span></div>; }
function Progress({ label, value }) { return <div><div className="mb-1.5 flex justify-between text-[0.68rem] font-black uppercase tracking-wide text-slate-500"><span>{label}</span><span>{value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[#72e7ff]" style={{ width: `${value}%` }} /></div></div>; }
function IconButton({ label, icon, onClick, danger = false }) { return <button className={`grid size-10 shrink-0 place-items-center rounded-md border transition ${danger ? 'border-[#ff9f91]/18 bg-[#ff9f91]/7 text-[#ffb4a8] hover:bg-[#ff9f91]/14' : 'border-cyan-200/14 bg-white/[0.03] text-slate-300 hover:bg-cyan-300/10 hover:text-[#72e7ff]'}`} type="button" aria-label={label} title={label} onClick={onClick}><DashboardIcon className="size-4" name={icon} /></button>; }
export default AreaCard;
