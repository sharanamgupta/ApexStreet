import React from 'react';

function getDistributionGradient(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;

  return items
    .map((item) => {
      const start = (cursor / total) * 360;
      cursor += item.value;
      const end = (cursor / total) * 360;
      return `${item.color} ${start}deg ${end}deg`;
    })
    .join(', ');
}

function LightStatus({ statuses }) {
  const total = statuses.reduce((sum, status) => sum + status.value, 0);
  const active = statuses.find((status) => status.label === 'On')?.value || 0;
  const activePercent = Math.round((active / total) * 100);

  return (
    <section className="dashboard-section compact-section" aria-labelledby="distribution-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Distribution</p>
          <h2 id="distribution-title">Light Status</h2>
        </div>
      </div>

      <div className="status-distribution">
        <div
          className="donut-chart"
          style={{ background: `conic-gradient(${getDistributionGradient(statuses)})` }}
          aria-label={`${activePercent}% lights active`}
        >
          <div>
            <strong>{activePercent}%</strong>
            <span>Lights Active</span>
          </div>
        </div>
        <div className="distribution-legend">
          {statuses.map((status) => (
            <div key={status.label}>
              <i style={{ backgroundColor: status.color }} aria-hidden="true" />
              <span>{status.label}</span>
              <strong>{status.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LightStatus;
