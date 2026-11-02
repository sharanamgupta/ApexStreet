import React from 'react';

function NetworkOverview({ areas }) {
  return (
    <section className="dashboard-section network-section" aria-labelledby="network-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Area Monitoring</p>
          <h2 id="network-title">City Light Network</h2>
        </div>
        <span className="simulated-pill">Conceptual network view</span>
      </div>

      <div className="network-map" aria-label="Conceptual city light network by area">
        <div className="network-spine" aria-hidden="true" />
        {areas.map((area, index) => {
          const statusClass = area.status.toLowerCase();

          return (
            <article
              className={`area-card status-${statusClass}`}
              key={area.id}
              style={{ '--area-index': index + 1, '--health': `${area.health}%` }}
            >
              <div className="area-card-header">
                <div>
                  <h3>{area.name}</h3>
                  <span>{area.lights} Lights</span>
                </div>
                <strong>{area.health}% Health</strong>
              </div>
              <div className="area-metrics">
                <span>{area.online} Online</span>
                <span>{area.faults} Faults</span>
                <span>{area.brightness} Brightness</span>
              </div>
              <div className="health-meter" aria-label={`${area.health}% health`}>
                <span />
              </div>
              <p className="area-status">
                <i aria-hidden="true" />
                {area.status}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default NetworkOverview;
