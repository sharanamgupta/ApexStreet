import React from 'react';

function AutomationControl({ automation }) {
  return (
    <section className="dashboard-section automation-section" aria-labelledby="automation-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Automation</p>
          <h2 id="automation-title">Automation Control Center</h2>
        </div>
        <div className="automation-status">
          <span>Automation Status</span>
          <strong>{automation.status}</strong>
        </div>
      </div>

      <div className="automation-grid">
        <div className="automation-summary">
          <div>
            <span>Current Mode</span>
            <strong>{automation.currentMode}</strong>
          </div>
          <div>
            <span>Current Phase</span>
            <strong>{automation.currentPhase}</strong>
          </div>
          <div>
            <span>Current Brightness</span>
            <strong>{automation.currentBrightness}</strong>
          </div>
        </div>

        <div className="automation-timeline" aria-label="Daily automation schedule">
          {automation.schedule.map((item) => (
            <article className={`timeline-step is-${item.state}`} key={`${item.time}-${item.action}`}>
              <div className="timeline-node" aria-hidden="true" />
              <span>{item.time}</span>
              <strong>{item.action}</strong>
              <em>{item.brightness}</em>
            </article>
          ))}
        </div>
      </div>

      <p className="next-transition">Next transition in {automation.nextTransition}</p>
    </section>
  );
}

export default AutomationControl;
