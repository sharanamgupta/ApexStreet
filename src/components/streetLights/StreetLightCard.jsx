import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import BrightnessMeter from './BrightnessMeter.jsx';
import { FaultBadge, ModeBadge, StatusBadge } from './StreetLightBadges.jsx';

function StreetLightCard({ light, onView, onEdit, onDelete }) {
  return (
    <article className="rounded-lg border border-cyan-200/12 bg-[#07131f]/82 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ActionButton icon="eye" label="View" onClick={() => onView(light)} />
        <ActionButton icon="edit" label="Edit" onClick={() => onEdit(light)} />
        <ActionButton icon="trash" label="Delete" danger onClick={() => onDelete(light)} />
      </div>
    </article>
  );
}

function ActionButton({ danger = false, icon, label, onClick }) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-black transition ${
        danger
          ? 'border-[#ff9b8d]/20 bg-[#ff9b8d]/8 text-[#ffb4a8] hover:bg-[#ff9b8d]/12'
          : 'border-cyan-200/14 bg-cyan-300/8 text-[#91dff3] hover:bg-cyan-300/12'
      }`}
      type="button"
      onClick={onClick}
    >
      <DashboardIcon className="size-3.5" name={icon} />
      {label}
    </button>
  );
}

export default StreetLightCard;
