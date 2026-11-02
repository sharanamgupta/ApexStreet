import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';

function DeleteConfirmation({ light, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/62 p-4 backdrop-blur-sm">
      <section
        className="w-full max-w-md rounded-lg border border-[#ff9b8d]/18 bg-[#07131f] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div className="grid size-12 place-items-center rounded-lg border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 text-[#ffb4a8]">
          <DashboardIcon className="size-6" name="trash" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-slate-50" id="delete-title">
          Delete {light.id}?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          This permanently removes the street light and its maintenance conversation from the database.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="min-h-11 rounded-md border border-cyan-200/14 px-4 text-sm font-black text-slate-300"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="min-h-11 rounded-md border border-[#ff9b8d]/20 bg-[#ff9b8d]/12 px-4 text-sm font-black text-[#ffb4a8]"
            type="button"
            onClick={() => onConfirm(light)}
          >
            Delete Light
          </button>
        </div>
      </section>
    </div>
  );
}

export default DeleteConfirmation;
