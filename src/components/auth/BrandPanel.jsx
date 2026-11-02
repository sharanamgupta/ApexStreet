import React from 'react';

function ApexLogo() {
  return (
    <div className="apex-logo" aria-hidden="true">
      <svg viewBox="0 0 72 72" role="img">
        <path className="logo-grid" d="M11 56h50M17 47h38M23 38h26" />
        <path className="logo-pole" d="M36 57V21" />
        <path className="logo-arm" d="M36 21c9 0 15 4 18 10" />
        <path className="logo-lamp" d="M50 31h13l-4 9h-8z" />
        <circle className="logo-node" cx="18" cy="47" r="3" />
        <circle className="logo-node" cx="54" cy="47" r="3" />
        <circle className="logo-glow" cx="57" cy="42" r="5" />
      </svg>
    </div>
  );
}

function SmartCityVisual() {
  return (
    <div className="city-visual" aria-hidden="true">
      <div className="city-line city-line-one" />
      <div className="city-line city-line-two" />
      <div className="city-line city-line-three" />
      <div className="light-tower tower-one">
        <span />
      </div>
      <div className="light-tower tower-two">
        <span />
      </div>
      <div className="light-tower tower-three">
        <span />
      </div>
      <div className="data-node node-one" />
      <div className="data-node node-two" />
      <div className="data-node node-three" />
    </div>
  );
}

function BrandPanel() {
  return (
    <section className="brand-panel" aria-labelledby="brand-title">
      <div className="brand-ambient brand-ambient-one" />
      <div className="brand-ambient brand-ambient-two" />
      <div className="brand-content">
        <ApexLogo />
        <p className="brand-eyebrow">Smart City Control Platform</p>
        <h1 id="brand-title">ApexStreet</h1>
        <p className="brand-tagline">Smarter Streets. Better Cities.</p>
        <p className="brand-description">
          Intelligent street-light monitoring, automation, and energy
          optimization for modern city operations.
        </p>
      </div>
      <SmartCityVisual />
    </section>
  );
}

export default BrandPanel;
