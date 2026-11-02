import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import { statusStyles } from './streetLightUi.js';

function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles.OFF;

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-black ${style.className}`}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: style.dot }} />
      {style.label}
    </span>
  );
}

function ModeBadge({ mode }) {
  const isAuto = mode === 'Auto';

  return (
    <span
      className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-2.5 text-xs font-black uppercase ${
        isAuto
          ? 'border-cyan-200/18 bg-cyan-300/8 text-[#91dff3]'
          : 'border-[#ffd36d]/18 bg-[#ffd36d]/10 text-[#ffe4a4]'
      }`}
    >
      <DashboardIcon className="size-3.5" name={isAuto ? 'automation' : 'manual'} />
      {mode}
    </span>
  );
}

function FaultBadge({ faultStatus }) {
  const hasFault = faultStatus === 'Fault';

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border px-2.5 text-xs font-black ${
        hasFault
          ? 'border-[#ff9b8d]/20 bg-[#ff9b8d]/12 text-[#ffb4a8]'
          : 'border-[#73ffba]/18 bg-[#73ffba]/8 text-[#b1ffd3]'
      }`}
    >
      {faultStatus}
    </span>
  );
}

export { FaultBadge, ModeBadge, StatusBadge };
