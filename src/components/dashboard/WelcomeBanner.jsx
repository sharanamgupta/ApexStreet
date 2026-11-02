import React from 'react';

function WelcomeBanner() {
  return (
    <section className="welcome-banner" aria-labelledby="welcome-title">
      <div className="banner-grid" aria-hidden="true" />
      <div className="banner-copy">
        <p className="section-kicker">Live Simulation</p>
        <h2 id="welcome-title">Good evening, Admin.</h2>
        <p>Here&apos;s the current status of your smart street-light network.</p>
      </div>
      <div className="system-status-card" aria-label="System status: all systems operational">
        <span>System Status</span>
        <strong>
          <i aria-hidden="true" />
          All Systems Operational
        </strong>
      </div>
    </section>
  );
}

export default WelcomeBanner;
