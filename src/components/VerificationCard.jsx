import React, { useState } from 'react';
import { Award, Download, Eye, Plus, ShieldCheck, FileText, Image as ImageIcon, FileSpreadsheet, Clock, X, CheckCircle2 } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import CertificateGenerator from './CertificateGenerator';
import CertificateDownloadBox from './CertificateDownloadBox';

export default function VerificationCard({ record, certificates = [], onNewRegistration, showToast }) {
  const [selectedPreview, setSelectedPreview] = useState(null);

  const isVerified = record.verificationStatus === 'verified' || !record.verificationStatus;

  return (
    <div className="submission-card">
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {isVerified ? (
          <span style={{
            background: 'var(--success-light)',
            color: 'var(--success)',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: '1px solid #bbf7d0'
          }}>
            <ShieldCheck size={15} /> VERIFIED WITH ADMIN PORTAL DATA
          </span>
        ) : (
          <span style={{
            background: 'var(--warning-light)',
            color: 'var(--warning)',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            border: '1px solid #fde68a'
          }}>
            <Clock size={15} /> PENDING ADMIN VERIFICATION
          </span>
        )}
      </div>

      {/* Instant Download Alert Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1.5px solid #86efac',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CheckCircle2 size={24} color="#16a34a" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#14532d' }}>
              Registration Verified & Submitted!
            </div>
            <div style={{ fontSize: '0.82rem', color: '#166534', marginTop: '0.1rem' }}>
              Official RANBIDGE Verification Credential generated below. You can download or print your certificate now.
            </div>
          </div>
        </div>
      </div>

      {/* Participant Summary Ribbon */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {record.fullName}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {record.college} &bull; Roll: <strong>{record.rollNumber}</strong>
          </p>
        </div>
        <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.65rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace' }}>
          ID: {record.id}
        </span>
      </div>

      {/* OFFICIAL DYNAMIC RANBIDGE CERTIFICATE GENERATED FROM REFERENCE TEMPLATE */}
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} color="var(--primary)" />
          Official RANBIDGE Certificate of Participation
        </h4>
        <CertificateGenerator record={record} showActions={true} />
      </div>

      {/* DUMPED CERTIFICATES DISPLAY SECTION (IF ADMIN DUMPED FILES) */}
      <CertificateDownloadBox
        certificates={certificates}
        rollNumber={record.rollNumber}
        fullName={record.fullName}
        workshopName={record.workshopName}
      />

      {/* Action Footer */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={onNewRegistration}>
          <Plus size={17} /> Submit Another Response
        </button>
      </div>

      {/* Lightbox Preview Modal */}
      {selectedPreview && (
        <div className="admin-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setSelectedPreview(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '800px', width: '92%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedPreview(null)} title="Close Preview">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedPreview.fileName}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Participant: <strong>{selectedPreview.studentName || record.fullName}</strong> ({record.rollNumber})
              </p>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '480px',
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              {selectedPreview.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedPreview.fileName || '') ? (
                <img src={selectedPreview.fileData} alt={selectedPreview.fileName} style={{ maxWidth: '100%', maxHeight: '440px', objectFit: 'contain' }} />
              ) : selectedPreview.fileType === 'pdf' || /\.pdf$/i.test(selectedPreview.fileName || '') ? (
                <iframe src={selectedPreview.fileData} title="PDF Preview" style={{ width: '100%', height: '440px', border: 'none' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <FileSpreadsheet size={56} color="#d97706" style={{ margin: '0 auto 0.75rem' }} />
                  <h4>Document Presentation File</h4>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => handleDownload(selectedPreview)}>
                <Download size={18} /> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
