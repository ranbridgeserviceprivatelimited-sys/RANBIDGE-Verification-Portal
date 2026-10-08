import React, { useEffect } from 'react';
import { CheckCircle2, Award, Plus, X, Building2, User, Hash, Laptop, BookOpen, Calendar, Copy, Check, ShieldCheck, Clock } from 'lucide-react';

export default function RegistrationSuccessModal({ isOpen, record, onClose, onGoToCertificates, showToast }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  const isVerified = record.verificationStatus === 'verified';

  const handleCopyId = () => {
    if (record?.id) {
      navigator.clipboard.writeText(record.id);
      setCopied(true);
      if (showToast) showToast('Registration ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="registration-success-overlay" onClick={onClose}>
      <div className="registration-success-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="success-close-btn" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        {/* Animated Checkmark Badge Header */}
        <div className="success-animation-wrapper">
          <div className="success-pulse-ring"></div>
          <div className="success-icon-badge">
            <CheckCircle2 size={36} className="success-check-icon" />
          </div>
          <div className="success-confetti-sparkle sparkle-1">✦</div>
          <div className="success-confetti-sparkle sparkle-2">★</div>
          <div className="success-confetti-sparkle sparkle-3">✦</div>
        </div>

        {/* Modal Title & Branding */}
        <div className="success-header-text">
          <h2 className="success-title">Registration Successful!</h2>
          <p className="success-subtitle">
            Your registration has been submitted and stored in the RANBIDGE database.
          </p>

          {/* Verification Status Badge */}
          <div style={{ marginTop: '0.65rem', display: 'flex', justifyContent: 'center' }}>
            {isVerified ? (
              <span style={{
                background: 'var(--success-light)',
                color: 'var(--success)',
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid #bbf7d0'
              }}>
                <ShieldCheck size={16} /> VERIFIED WITH ADMIN PORTAL DATA
              </span>
            ) : (
              <span style={{
                background: 'var(--warning-light)',
                color: 'var(--warning)',
                padding: '0.4rem 1rem',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                border: '1px solid #fde68a'
              }}>
                <Clock size={16} /> PENDING ADMIN VERIFICATION
              </span>
            )}
          </div>
        </div>

        {/* Registration Summary Card */}
        <div className="success-summary-box">
          <div className="success-summary-header">
            <span className="summary-reg-id">
              <strong>ID:</strong> {record.id}
            </span>
            <button className="copy-id-btn" onClick={handleCopyId} title="Copy Registration ID">
              {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          <div className="success-details-grid">
            <div className="detail-item">
              <User className="detail-icon" size={15} />
              <div>
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{record.fullName}</span>
              </div>
            </div>

            <div className="detail-item">
              <Hash className="detail-icon" size={15} />
              <div>
                <span className="detail-label">Roll Number</span>
                <span className="detail-value highlight-roll">{record.rollNumber}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar className="detail-icon" size={15} />
              <div>
                <span className="detail-label">Passout Year</span>
                <span className="detail-value">{record.passoutYear}</span>
              </div>
            </div>

            <div className="detail-item">
              <Laptop className="detail-icon" size={15} />
              <div>
                <span className="detail-label">Department</span>
                <span className="detail-value">{record.department || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item span-2">
              <Building2 className="detail-icon" size={15} />
              <div>
                <span className="detail-label">College / Institution</span>
                <span className="detail-value">{record.college}</span>
              </div>
            </div>

            <div className="detail-item full-row">
              <BookOpen className="detail-icon" size={15} />
              <div>
                <span className="detail-label">Workshop / Program</span>
                <span className="detail-value">{record.workshopName || 'RANBIDGE Verification'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Information Callout */}
        <div className="success-info-banner">
          <Award size={20} color="#1e40af" style={{ flexShrink: 0 }} />
          <div>
            <strong>Certificate Information:</strong>
            <p>
              Your certificate can be checked and downloaded anytime from the <strong>Download Certificate</strong> tab using your Roll Number (<strong>{record.rollNumber}</strong>).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="success-actions">
          <button className="btn-secondary" onClick={onClose}>
            <Plus size={18} />
            <span>Register Another</span>
          </button>

          <button className="btn-primary" onClick={() => onGoToCertificates(record.rollNumber)}>
            <Award size={18} />
            <span>Download Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
}
