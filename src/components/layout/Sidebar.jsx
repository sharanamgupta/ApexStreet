import React from 'react';
import { Link } from 'react-router-dom';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';

const navItems = [
  { label: 'Dashboard', icon: 'grid', active: true },
  { label: 'Street Lights', icon: 'street' },
  { label: 'Areas', icon: 'map' },
  { label: 'Automation', icon: 'automation' },
  { label: 'Reports', icon: 'report' },
  { label: 'Activity Logs', icon: 'activity' },
  { label: 'Settings', icon: 'settings' },
];

function Sidebar({ isCollapsed, isMobileOpen, onToggle, onClose }) {
  return (
    <>
      <button
        className="mobile-nav-toggle"
        type="button"
        onClick={onToggle}
        aria-label={isMobileOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isMobileOpen}
      >
        <DashboardIcon name="menu" />
      </button>
      <aside
        className={[
          'dashboard-sidebar',
          isCollapsed ? 'is-collapsed' : '',
          isMobileOpen ? 'is-mobile-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Dashboard navigation"
      >
        <div className="sidebar-brand">
          <div className="sidebar-logo" aria-hidden="true">
            <DashboardIcon name="street" />
          </div>
          <div>
            <strong>APEXSTREET</strong>
            <span>Smart City Ops</span>
          </div>
        </div>

        <button
          className="collapse-button"
          type="button"
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <DashboardIcon name="chevron" />
        </button>

        <nav className="sidebar-nav">
          {navItems.map((item) =>
            item.active ? (
              <Link
                className="sidebar-link is-active"
                key={item.label}
                to="/dashboard"
                onClick={onClose}
              >
                <DashboardIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                className="sidebar-link"
                key={item.label}
                type="button"
                disabled
                aria-disabled="true"
              >
                <DashboardIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <Link className="sidebar-link logout-link" to="/login">
            <DashboardIcon name="logOut" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
      {isMobileOpen ? (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation overlay"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}

export default Sidebar;
