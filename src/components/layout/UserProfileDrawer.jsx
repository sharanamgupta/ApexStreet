import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import { getStoredUser, getUserRole, logout } from '../../utils/auth.js';
import { loadSettings } from '../../utils/settingsStorage.js';

function UserProfileDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const storedUser = getStoredUser();
  const settings = loadSettings();
  const profile = settings?.profile || {};
  const security = settings?.securityInfo || {};
  const role = getUserRole() || 'USER';

  const displayName = storedUser?.name || profile.name || (role === 'USER' ? 'Apex User' : 'Apex Operator');
  const email = storedUser?.email || profile.email || `${role.toLowerCase()}@apexstreet.city`;
  const username = storedUser?.username || storedUser?.name?.toLowerCase().replace(/\s+/g, '_') || profile.name?.toLowerCase().replace(/\s+/g, '_') || 'apex_operator';
  const department = profile.department || 'Smart Infrastructure & City Lighting';
  const location = profile.location || 'Central Command Hub';

  function handleLogout() {
    logout();
    onClose();
    navigate('/login');
  }

  function handleNavigateSettings() {
    onClose();
    navigate('/settings');
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/65 backdrop-blur-sm transition-opacity duration-200">
      {/* Backdrop overlay dismiss */}
      <button
        className="fixed inset-0 cursor-default border-none bg-transparent"
        type="button"
        onClick={onClose}
        aria-label="Close user profile drawer"
      />

      {/* Drawer content */}
      <aside
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-cyan-200/14 bg-[#06111b]/98 p-6 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-label="User profile details"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-200/10 pb-5">
          <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
            <DashboardIcon className="size-4" name="user" />
            <span>Logged In Account Profile</span>
          </div>
          <button
            className="grid size-9 place-items-center rounded-md border border-cyan-200/14 bg-cyan-300/8 text-[#91dff3] transition hover:scale-105 hover:bg-cyan-300/20"
            type="button"
            onClick={onClose}
            aria-label="Close profile drawer"
          >
            <DashboardIcon className="size-5" name="x" />
          </button>
        </div>

        {/* Profile Info Banner */}
        <div className="mt-6 flex items-center gap-4 rounded-lg border border-cyan-200/12 bg-gradient-to-br from-[#071929]/90 to-[#040e17]/90 p-5 shadow-lg">
          <div className="relative flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#72e7ff] to-[#3b82f6] text-2xl font-black text-[#041018] shadow-[0_0_25px_rgba(114,231,255,0.35)]">
            {displayName.charAt(0).toUpperCase()}
            <span className="absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-[#06111b] bg-[#73ffba] shadow-[0_0_12px_#73ffba]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-black text-slate-50">{displayName}</h2>
              <span className="shrink-0 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase text-[#72e7ff]">
                {role}
              </span>
            </div>
            <p className="truncate text-xs font-semibold text-slate-400">@{username}</p>
            <span className="mt-1 inline-flex items-center gap-1.5 text-[0.7rem] font-bold text-[#73ffba]">
              <span className="size-1.5 rounded-full bg-[#73ffba] animate-pulse" />
              Active Session
            </span>
          </div>
        </div>

        {/* Scrollable details area */}
        <div className="mt-6 flex-1 overflow-y-auto pr-1 space-y-5">
          {/* Personal & Account Details */}
          <section className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4">
            <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#72e7ff] flex items-center gap-2">
              <DashboardIcon className="size-4" name="user" /> User Information
            </h3>
            <div className="grid gap-3 text-xs">
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Full Name</span>
                <strong className="font-bold text-slate-100">{displayName}</strong>
              </div>
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Username</span>
                <strong className="font-bold text-slate-100">@{username}</strong>
              </div>
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Registered Email</span>
                <strong className="font-bold text-[#72e7ff]">{email}</strong>
              </div>
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Assigned Role</span>
                <strong className="font-bold text-slate-100">{role}</strong>
              </div>
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Department</span>
                <strong className="font-bold text-slate-100">{department}</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Location Hub</span>
                <strong className="font-bold text-slate-100">{location}</strong>
              </div>
            </div>
          </section>

          {/* Security & System Info */}
          <section className="rounded-lg border border-cyan-200/10 bg-[#05101a]/70 p-4">
            <h3 className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#72e7ff] flex items-center gap-2">
              <DashboardIcon className="size-4" name="shield" /> Security & Session
            </h3>
            <div className="grid gap-3 text-xs">
              <div className="flex justify-between border-b border-cyan-200/6 pb-2">
                <span className="font-semibold text-slate-400">Last Login Time</span>
                <strong className="font-bold text-slate-100">{security.lastLogin || 'Just now'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-400">Two-Factor Auth</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#73ffba]">
                  <DashboardIcon className="size-3.5" name="check" /> {security.twoFactorStatus || 'Enabled'}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 grid gap-2.5 border-t border-cyan-200/10 pt-4">
          <button
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-200/20 bg-cyan-300/10 font-black text-[#72e7ff] transition hover:bg-cyan-300/20 hover:border-cyan-200/40"
            type="button"
            onClick={handleNavigateSettings}
          >
            <DashboardIcon className="size-4" name="settings" />
            <span>Account Settings</span>
          </button>

          <button
            className="flex w-full min-h-11 items-center justify-center gap-2 rounded-md border border-[#ff9b8d]/20 bg-[#ff9b8d]/10 font-black text-[#ffb4a8] transition hover:bg-[#ff9b8d]/20 hover:border-[#ff9b8d]/40"
            type="button"
            onClick={handleLogout}
          >
            <DashboardIcon className="size-4" name="logOut" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}

export default UserProfileDrawer;
