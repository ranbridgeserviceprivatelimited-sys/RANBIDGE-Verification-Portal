import React from 'react';
import { Award, ShieldCheck, FileCheck2, ArrowRight } from 'lucide-react';

export default function HeroSection({ onStartRegistration, onStartVerify }) {
  return (
    <div className="hero-section">
      <div>
        <span className="hero-badge">
          <ShieldCheck size={16} /> Official Workshop & Certification Portal
        </span>
        <h1 className="hero-title">RANBIDGE Solutions Private Limited</h1>
        <p className="hero-subtitle">
          Verify participant credentials, submit academic workshop attendance, and generate official verified participant cards instantly.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onStartRegistration}>
            <span>Register New Participant</span>
            <ArrowRight size={18} />
          </button>
          <button className="btn-secondary" onClick={onStartVerify}>
            <FileCheck2 size={18} />
            <span>Search & Verify Card</span>
          </button>
        </div>
      </div>

      <div className="features-grid" style={{ marginTop: '2.5rem' }}>
        <div className="feature-card">
          <div className="feature-icon">
            <Award />
          </div>
          <h3 className="feature-title">Instant Card Generation</h3>
          <p className="feature-desc">
            Automatically issues digital verification cards with unique Registration IDs upon registration.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <ShieldCheck />
          </div>
          <h3 className="feature-title">Secure Credentials</h3>
          <p className="feature-desc">
            Authenticated administrative record keeping with double-lock security PIN control.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <FileCheck2 />
          </div>
          <h3 className="feature-title">Export & Report Ready</h3>
          <p className="feature-desc">
            Export all participant records to CSV formats or print individual verification cards formatted for official records.
          </p>
        </div>
      </div>
    </div>
  );
}
