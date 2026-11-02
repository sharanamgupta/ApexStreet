import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';
import UserProfileDrawer from './UserProfileDrawer.jsx';
import NotificationsDrawer, { useNotifications } from './NotificationsDrawer.jsx';
import { applyThemeAndDensity, loadSettings } from '../../utils/settingsStorage.js';
import { getStoredUser, getUserRole, logout } from '../../utils/auth.js';

const operatorNavItems = [
  { label: 'Dashboard', icon: 'grid', path: '/dashboard' },
  { label: 'Street Lights', icon: 'street', path: '/street-lights' },
  { label: 'Monitor Lights', icon: 'activity', path: '/monitor-lights' },
  { label: 'Areas', icon: 'map', path: '/areas' },
  { label: 'Automation', icon: 'automation', path: '/automation' },
  { label: 'Reports', icon: 'report', path: '/reports' },
  { label: 'Activity Logs', icon: 'activity', path: '/activity-logs' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];

const userNavItems = [
  { label: 'Dashboard', icon: 'grid', path: '/user-dashboard' },
  { label: 'Street Lights', icon: 'street', path: '/user-dashboard/street-lights' },
  { label: 'Areas', icon: 'map', path: '/user-dashboard/areas' },
  { label: 'Faults', icon: 'warning', path: '/user-dashboard/faults' },
  { label: 'Reports', icon: 'report', path: '/user-dashboard/reports' },
  { label: 'Report', icon: 'warning', path: '/user-dashboard/report' },
];

function formatCurrentDate() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function AppShell({ activePage, title, children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notificationState = useNotifications();

  useEffect(() => {
    const settings = loadSettings();
    applyThemeAndDensity(settings.appearance);
    if (settings.profile) {
      setUserProfile(settings.profile);
    }
  }, []);

  function toggleSidebar() {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setIsMobileNavOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  }

  return (
    <div className="min-h-screen bg-[#061018] text-slate-100">
      <div className="fixed inset-0 app-bg-gradient" />
      <div className="fixed inset-0 app-bg-grid bg-[size:64px_64px] [mask-image:linear-gradient(180deg,black,transparent_92%)]" />

      <div
        className={`relative grid min-h-screen ${
          isSidebarCollapsed ? 'md:grid-cols-[92px_minmax(0,1fr)]' : 'md:grid-cols-[278px_minmax(0,1fr)]'
        }`}
      >
        <Sidebar
          activePage={activePage}
          collapsed={isSidebarCollapsed}
          mobileOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          onToggle={toggleSidebar}
        />

        <div className="min-w-0">
          <Navbar
            title={title}
            userProfile={userProfile}
            unreadCount={notificationState.unreadCount}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
          {children}
        </div>
      </div>

      {/* Drawers */}
      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notificationState={notificationState}
      />
    </div>
  );
}

function Sidebar({ activePage, collapsed, mobileOpen, onToggle, onClose }) {
  const navigate = useNavigate();
  const role = getUserRole();
  const isUser = role === 'USER';
  const navItems = isUser ? userNavItems : operatorNavItems;

  function handleLogoutClick() {
    logout();
    onClose();
    navigate('/login');
  }

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 grid size-11 place-items-center rounded-md border border-cyan-200/20 bg-[#07131f]/95 text-[#72e7ff] shadow-2xl backdrop-blur transition-all duration-150 hover:scale-105 hover:border-cyan-200/40 md:hidden"
        type="button"
        onClick={onToggle}
        aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={mobileOpen}
      >
        <DashboardIcon name="menu" />
      </button>

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-cyan-200/12 bg-[#06111b]/96 shadow-[18px_0_54px_rgba(0,0,0,0.28)] transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0',
          collapsed ? 'md:w-[92px]' : 'md:w-[278px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Dashboard navigation"
      >
        <div className="relative flex min-h-24 items-center gap-3 border-b border-cyan-200/10 px-5">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg border border-cyan-200/20 bg-cyan-300/10 text-[#72e7ff] shadow-[0_14px_34px_rgba(47,193,255,0.14)] transition-transform duration-200 hover:scale-105">
            <DashboardIcon name="street" />
          </div>
          <div className={collapsed ? 'hidden md:hidden' : 'block'}>
            <strong className="block text-sm font-black tracking-wide text-slate-50">APEXSTREET</strong>
            <span className="mt-1 block text-xs font-semibold text-slate-400">
              {isUser ? 'User Portal (View Only)' : 'Smart City Ops'}
            </span>
          </div>
        </div>

        <button
          className="absolute right-[-16px] top-26 hidden size-8 place-items-center rounded-md border border-cyan-200/20 bg-[#07131f] text-[#72e7ff] transition-all duration-150 hover:scale-110 hover:border-cyan-200/40 md:grid"
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <DashboardIcon className={collapsed ? 'rotate-180 transition-transform duration-200' : 'transition-transform duration-200'} name="chevron" />
        </button>

        <nav className="flex flex-1 flex-col gap-1.5 p-3.5">
          {navItems.map((item) =>
            item.path ? (
              <Link
                className={`group flex min-h-12 items-center gap-3 rounded-md border px-3.5 font-extrabold transition-all duration-200 ${
                  activePage === item.label
                    ? 'border-cyan-200/16 bg-cyan-300/10 text-slate-50 shadow-[inset_3px_0_0_#72e7ff]'
                    : 'border-transparent text-slate-400 hover:border-cyan-200/10 hover:bg-cyan-300/6 hover:text-slate-100'
                }`}
                key={item.label}
                to={item.path}
                onClick={onClose}
              >
                <DashboardIcon className="size-5 shrink-0 transition-transform duration-200 group-hover:scale-110" name={item.icon} />
                <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
              </Link>
            ) : (
              <button
                className="group flex min-h-12 items-center gap-3 rounded-md border border-transparent px-3.5 text-left font-extrabold text-slate-400 opacity-70 transition hover:border-cyan-200/10 hover:bg-cyan-300/6 hover:text-slate-100 disabled:cursor-not-allowed"
                key={item.label}
                type="button"
                disabled
                aria-disabled="true"
              >
                <DashboardIcon className="size-5 shrink-0" name={item.icon} />
                <span className={collapsed ? 'md:hidden' : ''}>{item.label}</span>
              </button>
            ),
          )}
        </nav>

        <div className="border-t border-cyan-200/10 p-3.5">
          <button
            className="flex w-full min-h-12 items-center gap-3 rounded-md px-3.5 font-extrabold text-[#ffb4a8] transition-all duration-200 hover:bg-[#ff9b8d]/12 hover:translate-x-1"
            type="button"
            onClick={handleLogoutClick}
          >
            <DashboardIcon className="size-5 shrink-0" name="logOut" />
            <span className={collapsed ? 'md:hidden' : ''}>Logout</span>
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}

function Navbar({ title, userProfile, unreadCount, onOpenProfile, onOpenNotifications }) {
  const storedUser = getStoredUser();
  const role = getUserRole();
  const displayName = storedUser?.name || userProfile?.name || (role === 'USER' ? 'User' : 'Operator');
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-cyan-200/12 bg-[#061018]/82 px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-8">
      <div className="pl-14 md:pl-0">
        <p className="mb-1 text-[0.72rem] font-black uppercase tracking-[0.16em] text-[#72e7ff]">
          {role === 'USER' ? 'User Dashboard' : 'Control Center'}
        </p>
        <h1 className="text-2xl font-black leading-tight text-slate-50">{title}</h1>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="hidden min-h-11 items-center gap-2 rounded-md border border-cyan-200/12 bg-[#09151f]/70 px-3 text-sm font-semibold text-slate-300 transition-all duration-150 hover:border-cyan-200/25 sm:flex">
          <DashboardIcon className="size-4 text-[#72e7ff]" name="clock" />
          <span>{formatCurrentDate()}</span>
        </div>

        {/* Notifications Bell Button */}
        <button
          className="relative grid size-11 place-items-center rounded-md border border-cyan-200/12 bg-[#09151f]/70 text-slate-100 transition-all duration-150 hover:scale-105 hover:bg-cyan-300/12 hover:border-cyan-200/30"
          type="button"
          onClick={onOpenNotifications}
          aria-label="Open Notifications"
        >
          <DashboardIcon className="size-5 transition-transform duration-150 hover:rotate-12" name="bell" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-[#72e7ff] px-1 text-[0.68rem] font-black text-[#041018] shadow-[0_0_12px_rgba(114,231,255,0.8)]">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile Card Button */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex min-h-11 items-center gap-2 rounded-md border border-cyan-200/12 bg-[#09151f]/70 px-3 text-sm font-bold text-slate-300 transition-all duration-150 hover:scale-[1.02] hover:border-cyan-200/30 hover:bg-cyan-300/10"
          aria-label="Open User Profile"
        >
          <span className="size-2 rounded-full bg-[#73ffba] shadow-[0_0_16px_rgba(115,255,186,0.48)]" />
          <span className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-[#8df0ff] to-[#55c9ff] font-black text-[#041018]">
            {avatarChar}
          </span>
          <div className="flex flex-col text-left">
            <span className="truncate max-w-[120px]">{displayName}</span>
            <span className="text-[0.65rem] font-bold uppercase text-[#72e7ff]">
              {role || 'USER'}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}

export default AppShell;
