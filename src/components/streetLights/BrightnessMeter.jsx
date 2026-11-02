import React from 'react';

function BrightnessMeter({ value }) {
  return (
    <div className="min-w-[112px]">
      <div className="flex items-center gap-2">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-cyan-300/10">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-[#318ed8] to-[#86eeff]"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="w-10 text-right text-xs font-black text-slate-200">{value}%</span>
      </div>
    </div>
  );
}

export default BrightnessMeter;
