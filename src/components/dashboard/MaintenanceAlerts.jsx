import React from 'react';

function MaintenanceAlerts({ alerts }) {
  return (
    <section className="dashboard-section compact-section" aria-labelledby="alerts-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Maintenance</p>
          <h2 id="alerts-title">Maintenance &amp; Fault Alerts</h2>
        </div>
        <button className="text-action" type="button" disabled>
          View All Faults
        </button>
      </div>

      <div className="alert-list">
        {alerts.map((alert) => (
          <article className={`alert-item severity-${alert.severity.toLowerCase()}`} key={alert.id}>
            <div>
              <strong>{alert.id}</strong>
              <span>{alert.area}</span>
            </div>
            <p>{alert.issue}</p>
            <span className="severity-label">{alert.severity}</span>
            <time>{alert.time}</time>
            <button type="button" disabled>
              View
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MaintenanceAlerts;
