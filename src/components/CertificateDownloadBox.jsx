import React from 'react';
import { Download, FileText, Image as ImageIcon, FileSpreadsheet, Award } from 'lucide-react';

export default function CertificateDownloadBox({ certificates, rollNumber, fullName }) {
  if (!certificates || certificates.length === 0) return null;

  // Filter matching certificates by roll number, student name, or file name
  const matchedCerts = certificates.filter(cert => {
    const certRoll = (cert.rollNumber || '').toLowerCase().trim();
    const certName = (cert.studentName || cert.fullName || '').toLowerCase().trim();
    const certFile = (cert.fileName || '').toLowerCase().trim();

    const queryRoll = (rollNumber || '').toLowerCase().trim();
    const queryName = (fullName || '').toLowerCase().trim();

    if (!queryRoll && !queryName) return false;

    return (
      (queryRoll && certRoll && (certRoll === queryRoll || certRoll.includes(queryRoll))) ||
      (queryName && certName && (certName.includes(queryName) || queryName.includes(certName))) ||
      (queryName && certFile && certFile.includes(queryName)) ||
      (queryRoll && certFile && certFile.includes(queryRoll))
    );
  });

  if (matchedCerts.length === 0) return null;

  const getFileIcon = (fileType, fileName) => {
    const name = (fileName || '').toLowerCase();
    if (fileType === 'pdf' || name.endsWith('.pdf')) return <FileText size={28} color="#ef4444" />;
    if (fileType === 'image' || name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) return <ImageIcon size={28} color="#3b82f6" />;
    if (fileType === 'ppt' || name.endsWith('.ppt') || name.endsWith('.pptx')) return <FileSpreadsheet size={28} color="#d97706" />;
    return <Award size={28} color="#16a34a" />;
  };

  const getFileTypeLabel = (fileType, fileName) => {
    const name = (fileName || '').toLowerCase();
    if (fileType === 'pdf' || name.endsWith('.pdf')) return 'PDF Document';
    if (fileType === 'image' || name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.jpeg')) return 'Image Certificate';
    if (fileType === 'ppt' || name.endsWith('.ppt') || name.endsWith('.pptx')) return 'PowerPoint Presentation';
    return 'Official Certificate Document';
  };

  const handleDownload = (cert) => {
    const link = document.createElement('a');
    link.href = cert.fileData;
    link.download = cert.fileName || `${cert.rollNumber || 'Certificate'}.${cert.fileType || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="certificate-box-container" style={{
      marginTop: '1.75rem',
      background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)',
      border: '1.5px solid #bfdbfe',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
        <Award size={24} color="#1e40af" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
          Issued Official Certificate File(s)
        </h3>
        <span style={{
          background: 'var(--primary)',
          color: '#ffffff',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '0.15rem 0.6rem',
          borderRadius: '50px'
        }}>
          {matchedCerts.length} Available
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {matchedCerts.map((cert, index) => {
          const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');

          return (
            <div key={cert.id || index} style={{
              background: '#ffffff',
              border: '1px solid #dbeafe',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '240px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {isImage && cert.fileData ? (
                    <img src={cert.fileData} alt="Certificate Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    getFileIcon(cert.fileType, cert.fileName)
                  )}
                </div>

                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {cert.fileName || `Certificate_${cert.rollNumber}`}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {getFileTypeLabel(cert.fileType, cert.fileName)}
                    </span>
                    {cert.studentName && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        • {cert.studentName}
                      </span>
                    )}
                    {cert.rollNumber && (
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '0.1rem 0.5rem', borderRadius: '4px', fontWeight: 700, color: 'var(--primary)' }}>
                        Roll: {cert.rollNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-primary"
                  onClick={() => handleDownload(cert)}
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
