import React from 'react';
import DashboardIcon from './DashboardIcon.jsx';

function StatCard({ stat }) {
  return (
    <article className={`stat-card stat-card-${stat.tone}`}>
      <div className="stat-icon" aria-hidden="true">
        <DashboardIcon name={stat.icon} />
      </div>
      <div>
        <p>{stat.label}</p>
        <strong>{stat.value}</strong>
        <span>{stat.detail}</span>
      </div>
      <em>{stat.trend}</em>
    </article>
  );
}

export default StatCard;
