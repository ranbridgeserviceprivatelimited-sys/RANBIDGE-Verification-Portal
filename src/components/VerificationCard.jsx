import React, { useState } from 'react';
import { Award, Download, Eye, Plus, ShieldCheck, FileText, Image as ImageIcon, FileSpreadsheet, Clock, X } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';
import CertificateGenerator from './CertificateGenerator';

export default function VerificationCard({ record, certificates = [], onNewRegistration, showToast }) {
  const [selectedPreview, setSelectedPreview] = useState(null);

  if (!record) return null;

  // Filter dumped certificates matching this record by rollNumber, fullName, or workshopName
  const matchedCerts = certificates.filter(cert => {
    const certRoll = (cert.rollNumber || '').toLowerCase().trim();
    const certName = (cert.studentName || cert.fullName || '').toLowerCase().trim();
    const certFile = (cert.fileName || '').toLowerCase().trim();
    const certWorkshop = (cert.workshopName || cert.eventName || '').toLowerCase().trim();

    const queryRoll = (record.rollNumber || '').toLowerCase().trim();
    const queryName = (record.fullName || '').toLowerCase().trim();
    const queryWorkshop = (record.workshopName || '').toLowerCase().trim();

    if (!queryRoll && !queryName && !queryWorkshop) return false;

    const isRollMatch = queryRoll && ((certRoll && certRoll.includes(queryRoll)) || certFile.includes(queryRoll));
    const isNameMatch = queryName && ((certName && (certName.includes(queryName) || queryName.includes(certName))) || certFile.includes(queryName));
    const isWorkshopMatch = queryWorkshop && ((certWorkshop && certWorkshop.includes(queryWorkshop)) || certFile.includes(queryWorkshop));

    return isRollMatch || isNameMatch || isWorkshopMatch;
  });

  const handleDownload = (cert) => {
    const link = document.createElement('a');
    link.href = cert.fileData;
    link.download = cert.fileName || `${record.rollNumber || 'RANBIDGE_Certificate'}.${cert.fileType || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="submission-card">
      {/* Header Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <img src={logoImg} alt="RANBIDGE Solutions Logo" style={{ height: '45px', objectFit: 'contain' }} />
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
          <ShieldCheck size={15} /> VERIFIED & PUBLISHED
        </span>
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
      {matchedCerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px dashed var(--border-color)' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} color="var(--success)" />
            Additional Dumped Certificate Documents ({matchedCerts.length})
          </h4>

          {matchedCerts.map((cert, index) => {
            const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');
            const isPdf = cert.fileType === 'pdf' || /\.pdf$/i.test(cert.fileName || '');

            return (
              <div key={cert.id || index} style={{
                background: '#ffffff',
                border: '1.5px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
              }}>
                <div 
                  onClick={() => setSelectedPreview(cert)}
                  style={{
                    height: '240px',
                    background: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  title="Click to expand full screen preview"
                >
                  {isImage && cert.fileData ? (
                    <img src={cert.fileData} alt={cert.fileName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : isPdf && cert.fileData ? (
                    <iframe src={cert.fileData} title="PDF Certificate" style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
                      <Award size={56} />
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.4rem' }}>{cert.fileName}</div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {cert.fileName}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Issued to <strong>{cert.studentName || record.fullName}</strong> &bull; {record.workshopName}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn-secondary"
                      onClick={() => setSelectedPreview(cert)}
                      style={{ padding: '0.7rem 1.25rem', fontSize: '0.88rem' }}
                    >
                      <Eye size={16} /> Preview
                    </button>
                    <button
                      className="btn-primary"
                      onClick={() => handleDownload(cert)}
                      style={{ padding: '0.7rem 1.5rem', fontSize: '0.88rem' }}
                    >
                      <Download size={16} /> Download Certificate
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
