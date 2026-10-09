import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, FileSpreadsheet, Award, Eye, X, CheckCircle2 } from 'lucide-react';

export default function CertificateDownloadBox({ certificates, rollNumber, fullName, workshopName }) {
  const [selectedPreview, setSelectedPreview] = useState(null);

  if (!certificates || certificates.length === 0) return null;

  // Multi-attribute matching engine: Roll Number, Participant Name, Workshop / Event Name
  const matchedCerts = certificates.filter(cert => {
    const certRoll = (cert.rollNumber || '').toLowerCase().trim();
    const certName = (cert.studentName || cert.fullName || '').toLowerCase().trim();
    const certFile = (cert.fileName || '').toLowerCase().trim();
    const certWorkshop = (cert.workshopName || cert.eventName || '').toLowerCase().trim();

    const queryRoll = (rollNumber || '').toLowerCase().trim();
    const queryName = (fullName || '').toLowerCase().trim();
    const queryWorkshop = (workshopName || '').toLowerCase().trim();

    if (!queryRoll && !queryName && !queryWorkshop) return false;

    // 1. Match by Roll Number
    const isRollMatch = queryRoll && (
      (certRoll && (certRoll === queryRoll || certRoll.includes(queryRoll))) ||
      (certFile && certFile.includes(queryRoll))
    );
    
    // 2. Match by Participant Name
    const isNameMatch = queryName && (
      (certName && (certName.includes(queryName) || queryName.includes(certName))) ||
      (certFile && certFile.includes(queryName))
    );

    // 3. Match by Workshop / Event Name
    const isWorkshopMatch = queryWorkshop && (
      (certWorkshop && (certWorkshop.includes(queryWorkshop) || queryWorkshop.includes(certWorkshop))) ||
      (certFile && certFile.includes(queryWorkshop))
    );

    return isRollMatch || isNameMatch || isWorkshopMatch;
  });

  const displayCerts = matchedCerts;

  if (!displayCerts || displayCerts.length === 0) return null;

  const getFileIcon = (fileType, fileName) => {
    const name = (fileName || '').toLowerCase();
    if (fileType === 'pdf' || name.endsWith('.pdf')) return <FileText size={28} color="#dc2626" />;
    if (fileType === 'image' || name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) return <ImageIcon size={28} color="#2563eb" />;
    if (fileType === 'ppt' || name.endsWith('.ppt') || name.endsWith('.pptx')) return <FileSpreadsheet size={28} color="#d97706" />;
    return <Award size={28} color="#16a34a" />;
  };

  const getFileTypeLabel = (fileType, fileName) => {
    const name = (fileName || '').toLowerCase();
    if (fileType === 'pdf' || name.endsWith('.pdf')) return 'PDF Document';
    if (fileType === 'image' || name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) return 'Image Certificate';
    if (fileType === 'ppt' || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'PowerPoint Presentation';
    return 'Official Certificate Dump';
  };

  const handleDownload = (cert) => {
    const link = document.createElement('a');
    link.href = cert.fileData;
    link.download = cert.fileName || `${cert.rollNumber || 'RANBIDGE_Certificate'}.${cert.fileType || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="certificate-box-container" style={{
        marginTop: '1.75rem',
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
        border: '1.5px solid #bfdbfe',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={24} color="#1e40af" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
              Dumped Official Certificate Files
            </h3>
          </div>
          <span style={{
            background: 'var(--primary)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            padding: '0.2rem 0.75rem',
            borderRadius: '50px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem'
          }}>
            <CheckCircle2 size={13} /> {displayCerts.length} Certificate File(s) Available
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Official dumped certificate files verified by event name, roll number, and participant credentials:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayCerts.map((cert, index) => {
            const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');

            return (
              <div key={cert.id || index} style={{
                background: '#ffffff',
                border: '1.5px solid #dbeafe',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                  <div 
                    onClick={() => setSelectedPreview(cert)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-md)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                    title="Click to preview file"
                  >
                    {isImage && cert.fileData ? (
                      <img src={cert.fileData} alt="Certificate Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getFileIcon(cert.fileType, cert.fileName)
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                      {cert.fileName || `Certificate_${cert.rollNumber}`}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {getFileTypeLabel(cert.fileType, cert.fileName)}
                      </span>
                      {cert.studentName && (
                        <span style={{ fontSize: '0.78rem', color: '#0f172a', fontWeight: 700 }}>
                          • {cert.studentName}
                        </span>
                      )}
                      {cert.rollNumber && (
                        <span style={{ fontSize: '0.72rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.55rem', borderRadius: '4px', fontWeight: 800 }}>
                          Roll: {cert.rollNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn-secondary"
                    onClick={() => setSelectedPreview(cert)}
                    style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
                    title="Preview File"
                  >
                    <Eye size={15} />
                    <span>Preview</span>
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => handleDownload(cert)}
                    style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
                    title="Download Certificate File"
                  >
                    <Download size={15} />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox File Preview Modal */}
      {selectedPreview && (
        <div className="admin-modal-overlay" style={{ zIndex: 1300 }} onClick={() => setSelectedPreview(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '750px', width: '90%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedPreview(null)} title="Close Preview">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {selectedPreview.fileType} File
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Roll No: <strong>{selectedPreview.rollNumber || 'N/A'}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedPreview.fileName}
              </h3>
            </div>

            {/* Preview Box */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              maxHeight: '420px',
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              {selectedPreview.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedPreview.fileName || '') ? (
                <img
                  src={selectedPreview.fileData}
                  alt={selectedPreview.fileName}
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : selectedPreview.fileType === 'pdf' || /\.pdf$/i.test(selectedPreview.fileName || '') ? (
                <iframe
                  src={selectedPreview.fileData}
                  title="PDF Preview"
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <FileSpreadsheet size={56} color="#d97706" style={{ margin: '0 auto 0.75rem' }} />
                  <h4>Document File</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Click Download to open this file on your device.
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                onClick={() => handleDownload(selectedPreview)}
                style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={18} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
