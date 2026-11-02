import React from 'react';
import DashboardIcon from '../dashboard/DashboardIcon.jsx';

function formatCurrentDate() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function Navbar() {
  return (
    <header className="dashboard-navbar">
      <div>
        <p className="navbar-kicker">Control Center</p>
        <h1>Dashboard</h1>
      </div>

      <div className="navbar-actions">
        <div className="navbar-date">
          <DashboardIcon name="clock" />
          <span>{formatCurrentDate()}</span>
        </div>
        <button className="nav-icon-button" type="button" aria-label="Notifications">
          <DashboardIcon name="bell" />
          <span className="notification-dot" />
        </button>
        <div className="admin-profile" aria-label="Administrator profile">
          <span className="status-dot" aria-label="System online" />
          <div className="admin-avatar" aria-hidden="true">
            A
          </div>
          <span>Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
