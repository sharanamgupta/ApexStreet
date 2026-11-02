import React from 'react';

function EnergyOverview({ energy }) {
  const maxValue = Math.max(...energy.week.map((item) => item.value));

  return (
    <section className="dashboard-section energy-section" aria-labelledby="energy-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Energy Intelligence</p>
          <h2 id="energy-title">Energy Intelligence</h2>
        </div>
        <span className="simulated-pill">{energy.label}</span>
      </div>

      <div className="energy-metrics">
        <div>
          <span>Today&apos;s Consumption</span>
          <strong>{energy.todayConsumption}</strong>
        </div>
        <div>
          <span>Estimated Energy Saved</span>
          <strong>{energy.estimatedSaved}</strong>
        </div>
        <div>
          <span>Estimated Savings</span>
          <strong>{energy.estimatedSavings}</strong>
        </div>
      </div>

      <div className="energy-chart" aria-label="Seven day estimated energy consumption">
        {energy.week.map((item) => (
          <div className="energy-bar-item" key={item.day}>
            <div className="energy-bar-track">
              <span style={{ height: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <strong>{item.value}</strong>
            <span>{item.shortDay}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EnergyOverview;
