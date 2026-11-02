import React, { useEffect, useMemo, useState } from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import {
  automationTimeline,
  streetLightModes,
  streetLightStatuses,
} from '../../data/streetLightData.js';
import BrightnessMeter from './BrightnessMeter.jsx';
import { FaultBadge, ModeBadge, StatusBadge } from './StreetLightBadges.jsx';
import { normalizeLightForm } from './streetLightUi.js';

function StreetLightModal({ mode, light, existingIds, onClose, onSave, areaOptions = [] }) {
  const isDetails = mode === 'view';
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(() => normalizeLightForm(light));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(normalizeLightForm(light));
    setErrors({});
  }, [light, mode]);

  const title = useMemo(() => {
    if (isDetails) return `${light.id} Details`;
    if (isEdit) return `Edit ${light.id}`;
    return 'Add Street Light';
  }, [isDetails, isEdit, light]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function validate() {
    const nextErrors = {};
    const normalizedId = form.id.trim().toUpperCase();
    const brightness = Number(form.brightness);
    const powerRating = Number(form.powerRating);

    if (!normalizedId) {
      nextErrors.id = 'Light ID is required.';
    } else if (!isEdit && existingIds.includes(normalizedId)) {
      nextErrors.id = 'Light ID already exists.';
    }

    if (!form.area) nextErrors.area = 'Area is required.';
    if (!form.status) nextErrors.status = 'Status is required.';
    if (!form.mode) nextErrors.mode = 'Mode is required.';

    if (!Number.isFinite(brightness) || brightness < 0 || brightness > 100) {
      nextErrors.brightness = 'Brightness must be between 0 and 100.';
    }

    if (!Number.isFinite(powerRating) || powerRating <= 0) {
      nextErrors.powerRating = 'Power rating must be greater than 0.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    onSave({
      ...form,
      id: form.id.trim().toUpperCase(),
      brightness: Number(form.brightness),
      powerRating: Number(form.powerRating),
      lastUpdated: isEdit ? 'just now' : 'just now',
    });
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/62 p-0 backdrop-blur-sm sm:place-items-center sm:p-6">
      <section
        className="max-h-[100vh] w-full overflow-y-auto rounded-t-lg border border-cyan-200/12 bg-[#07131f] shadow-[0_30px_90px_rgba(0,0,0,0.45)] ring-1 ring-white/5 sm:max-h-[92vh] sm:max-w-2xl sm:rounded-lg"
        aria-labelledby="street-light-modal-title"
        role="dialog"
        aria-modal="true"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-cyan-200/10 bg-[#07131f]/95 p-5 backdrop-blur">
          <div>
            <p className="text-[0.7rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
              Street Light
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-50" id="street-light-modal-title">
              {title}
            </h2>
          </div>
          <button
            className="grid size-10 place-items-center rounded-md border border-cyan-200/14 bg-cyan-300/8 text-[#91dff3]"
            type="button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <DashboardIcon className="size-5" name="x" />
          </button>
        </header>

        {isDetails ? (
          <LightDetails light={light} />
        ) : (
          <form className="grid gap-4 p-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Light ID"
                value={form.id}
                onChange={(value) => updateField('id', value)}
                error={errors.id}
                disabled={isEdit}
              />
              <SelectField
                label="Area"
                value={form.area}
                onChange={(value) => updateField('area', value)}
                options={areaOptions}
                error={errors.area}
              />
              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => updateField('status', value)}
                options={isEdit ? streetLightStatuses : streetLightStatuses.filter((status) => status !== 'FAULT')}
                error={errors.status}
              />
              <SelectField
                label="Mode"
                value={form.mode}
                onChange={(value) => updateField('mode', value)}
                options={streetLightModes}
                error={errors.mode}
              />
              <NumberField
                label="Brightness"
                value={form.brightness}
                min="0"
                max="100"
                onChange={(value) => updateField('brightness', value)}
                error={errors.brightness}
                suffix="%"
              />
              <NumberField
                label="Power Rating"
                value={form.powerRating}
                min="1"
                onChange={(value) => updateField('powerRating', value)}
                error={errors.powerRating}
                suffix="W"
              />
            </div>

            <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-500">
                Brightness Preview
              </span>
              <BrightnessMeter value={Math.max(0, Math.min(100, Number(form.brightness) || 0))} />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-cyan-200/10 pt-4 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 rounded-md border border-cyan-200/14 bg-transparent px-4 text-sm font-black text-slate-300"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#8df0ff] to-[#55c9ff] px-4 text-sm font-black text-[#041018] shadow-[0_16px_34px_rgba(47,193,255,0.22)]"
                type="submit"
              >
                <DashboardIcon className="size-4" name="save" />
                {isEdit ? 'Save Changes' : 'Add Street Light'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function LightDetails({ light }) {
  return (
    <div className="grid gap-5 p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Light ID" value={light.id} />
        <Detail label="Area" value={light.area} />
        <Detail label="Current Status" value={<StatusBadge status={light.status} />} />
        <Detail label="Operating Mode" value={<ModeBadge mode={light.mode} />} />
        <Detail label="Brightness" value={<BrightnessMeter value={light.brightness} />} />
        <Detail label="Power Rating" value={`${light.powerRating}W`} />
        <Detail label="Fault Status" value={<FaultBadge faultStatus={light.faultStatus} />} />
        <Detail label="Last Updated" value={light.lastUpdated} />
      </div>

      <section className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.13em] text-[#72e7ff]">
          Automation Timeline
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {automationTimeline.map((item) => (
            <article
              className="rounded-lg border border-cyan-200/10 bg-white/[0.035] p-3 text-center"
              key={`${item.time}-${item.action}`}
            >
              <span className="mx-auto mb-2 block size-2.5 rounded-full bg-[#72e7ff] shadow-[0_0_18px_rgba(114,231,255,0.45)]" />
              <strong className="block text-sm font-black text-slate-50">{item.time}</strong>
              <span className="mt-1 block text-xs font-black text-[#91dff3]">
                {item.action} {item.brightness}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-500">
        {label}
      </span>
      <div className="text-sm font-black text-slate-50">{value}</div>
    </div>
  );
}

function TextField({ disabled = false, error, label, onChange, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>
      <input
        className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-[#72e7ff]/60 focus:ring-4 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-65"
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p className="mt-2 text-sm font-semibold text-[#ffb4a8]">{error}</p> : null}
    </label>
  );
}

function NumberField({ error, label, max, min, onChange, suffix, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>
      <span className="flex min-h-12 items-center rounded-md border border-cyan-200/12 bg-[#05101a]/80 focus-within:border-[#72e7ff]/60 focus-within:ring-4 focus-within:ring-cyan-300/10">
        <input
          className="min-w-0 flex-1 border-0 bg-transparent px-3 text-sm font-bold text-slate-100 outline-none"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="px-3 text-sm font-black text-slate-500">{suffix}</span>
      </span>
      {error ? <p className="mt-2 text-sm font-semibold text-[#ffb4a8]">{error}</p> : null}
    </label>
  );
}

function SelectField({ error, label, onChange, options, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.13em] text-slate-400">
        {label}
      </span>
      <select
        className="min-h-12 w-full rounded-md border border-cyan-200/12 bg-[#05101a]/80 px-3 text-sm font-bold text-slate-100 outline-none transition focus:border-[#72e7ff]/60 focus:ring-4 focus:ring-cyan-300/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option className="bg-[#07131f]" key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <p className="mt-2 text-sm font-semibold text-[#ffb4a8]">{error}</p> : null}
    </label>
  );
}

export default StreetLightModal;
