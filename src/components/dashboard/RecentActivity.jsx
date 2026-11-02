import React from 'react';
import DashboardIcon from './DashboardIcon.jsx';

function RecentActivity({ activities }) {
  return (
    <section className="dashboard-section compact-section" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Activity</p>
          <h2 id="activity-title">Recent Activity</h2>
        </div>
      </div>

      <ol className="activity-timeline">
        {activities.map((activity) => (
          <li className={`activity-item activity-${activity.icon}`} key={activity.id}>
            <div className="activity-icon" aria-hidden="true">
              <DashboardIcon name={activity.icon === 'fault' ? 'warning' : activity.icon} />
            </div>
            <time>{activity.time}</time>
            <div>
              <strong>{activity.type}</strong>
              <p>{activity.message}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default RecentActivity;
