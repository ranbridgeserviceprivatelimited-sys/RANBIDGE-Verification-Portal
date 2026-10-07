import React from 'react';
import { Check, Printer, Plus, ShieldCheck, Award } from 'lucide-react';
import CertificateDownloadBox from './CertificateDownloadBox';
import CertificateGenerator from './CertificateGenerator';
import logoImg from '../../assets/logo.jpg';

export default function VerificationCard({ record, certificates = [], onNewRegistration, showToast }) {
  if (!record) return null;

  const handlePrint = () => {
    window.print();
    if (showToast) showToast('Opening browser print dialog...');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="submission-card">
      <div className="submission-header">
        <div className="success-badge">
          <Check size={32} />
        </div>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: 800 }}>
          Registration Verified & Submitted!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
          Official RANBIDGE Verification Credential generated below.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <img src={logoImg} alt="RANBIDGE Solutions Logo" style={{ height: '48px', objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: '1px solid #bbf7d0'
          }}>
            <ShieldCheck size={15} /> VERIFIED PARTICIPANT
          </span>
        </div>
      </div>

      <div className="details-grid">
        <div className="detail-item">
          <span className="detail-label">Verification ID</span>
          <span className="detail-value" style={{ color: 'var(--primary)', fontFamily: 'monospace', fontWeight: 700 }}>
            {record.id}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Participant Name</span>
          <span className="detail-value">{record.fullName}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">College / Institution</span>
          <span className="detail-value">{record.college}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Roll Number</span>
          <span className="detail-value">{record.rollNumber}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Passout Year</span>
          <span className="detail-value">{record.passoutYear}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Department</span>
          <span className="detail-value">{record.department}</span>
        </div>

        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
          <span className="detail-label">Workshop Name</span>
          <span className="detail-value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            {record.workshopName}
          </span>
        </div>

        <div className="detail-item" style={{ gridColumn: 'span 2' }}>
          <span className="detail-label">Workshop Date</span>
          <span className="detail-value">{formatDate(record.workshopDate)}</span>
        </div>
      </div>

      {/* Auto-Generated Official RANBIDGE Certificate */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={22} color="var(--primary)" />
          Official RANBIDGE Certificate of Participation
        </h3>
        <CertificateGenerator record={record} showActions={true} />
      </div>

      {/* Download Box for Uploaded Certificates matching this Roll Number / Name */}
      <CertificateDownloadBox
        certificates={certificates}
        rollNumber={record.rollNumber}
        fullName={record.fullName}
      />

      <div className="card-barcode-mock">
        <div className="barcode-stripes"></div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
          * {record.id} - RANBIDGE OFFICIAL AUTH *
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={onNewRegistration}>
          <Plus size={17} /> Submit Another Response
        </button>
        <button className="btn-primary" onClick={handlePrint}>
          <Printer size={17} /> Print Verification Card
        </button>
      </div>
    </div>
  );
}
