import React from 'react';
import { Link } from 'react-router-dom';
import DashboardIcon from './DashboardIcon.jsx';

function QuickActions({ actions }) {
  return (
    <section className="dashboard-section compact-section" aria-labelledby="quick-actions-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Operations</p>
          <h2 id="quick-actions-title">Quick Actions</h2>
        </div>
      </div>

      <div className="quick-action-grid">
        {actions.map((action) =>
          action.route ? (
            <Link className="quick-action" key={action.label} to={action.route}>
              <DashboardIcon name={action.icon} />
              <span>{action.label}</span>
            </Link>
          ) : (
            <button className="quick-action" key={action.label} type="button" disabled>
              <DashboardIcon name={action.icon} />
              <span>{action.label}</span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}

export default QuickActions;
