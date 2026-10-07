import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  Award, 
  LayoutGrid, 
  List, 
  Download, 
  X
} from 'lucide-react';

export default function CertificateDumpUpload({ certificates, onSaveCertificates, onDeleteCertificate, showToast }) {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedPreviewCert, setSelectedPreviewCert] = useState(null);

  // Keyboard Escape key handler to close preview modal
  useEffect(() => {
    if (!selectedPreviewCert) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPreviewCert(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPreviewCert]);

  // Auto-detect Roll Number & Student Name from file name
  const parseFilenameMeta = (filename) => {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const parts = nameWithoutExt.split(/[-_]/);

    let rollNumber = '';
    let studentName = '';

    if (parts.length >= 1 && /^[A-Z0-9]+$/i.test(parts[0])) {
      rollNumber = parts[0].toUpperCase();
      studentName = parts.slice(1).join(' ').replace(/\s+/g, ' ').trim();
    } else {
      studentName = nameWithoutExt.replace(/[-_]/g, ' ').trim();
    }

    return { rollNumber, studentName };
  };

  const getFileType = (fileName) => {
    const ext = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (['.pdf'].includes(ext)) return 'pdf';
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) return 'image';
    if (['.ppt', '.pptx'].includes(ext)) return 'ppt';
    return 'document';
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const meta = parseFilenameMeta(file.name);
          const rawData = event.target.result;
          const fileType = getFileType(file.name);

          if (fileType === 'image') {
            // Compress large image files to crisp ~200-300 KB base64 for fast loading & reliable storage
            const img = new Image();
            img.src = rawData;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1600;
              const MAX_HEIGHT = 1600;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              const compressedData = canvas.toDataURL('image/jpeg', 0.85);

              resolve({
                id: 'CERT-' + Math.floor(100000 + Math.random() * 900000),
                fileName: file.name,
                fileType: fileType,
                fileData: compressedData,
                rollNumber: meta.rollNumber,
                studentName: meta.studentName,
                uploadedAt: new Date().toLocaleString()
              });
            };
            img.onerror = () => {
              resolve({
                id: 'CERT-' + Math.floor(100000 + Math.random() * 900000),
                fileName: file.name,
                fileType: fileType,
                fileData: rawData,
                rollNumber: meta.rollNumber,
                studentName: meta.studentName,
                uploadedAt: new Date().toLocaleString()
              });
            };
          } else {
            resolve({
              id: 'CERT-' + Math.floor(100000 + Math.random() * 900000),
              fileName: file.name,
              fileType: fileType,
              fileData: rawData,
              rollNumber: meta.rollNumber,
              studentName: meta.studentName,
              uploadedAt: new Date().toLocaleString()
            });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newStaged => {
      setStagedFiles(prev => [...prev, ...newStaged]);
      showToast(`Selected ${newStaged.length} certificate file(s)`);
    });
  };

  const handleStageMetaChange = (index, field, value) => {
    setStagedFiles(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleRemoveStaged = (index) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveStagedCertificates = () => {
    if (stagedFiles.length === 0) return;

    onSaveCertificates(stagedFiles);
    showToast(`Successfully saved ${stagedFiles.length} certificate(s)!`);
    setStagedFiles([]);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Upload Zone */}
      <div style={{
        border: '2px dashed #93c5fd',
        background: '#eff6ff',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative'
      }}>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.ppt,.pptx"
          onChange={handleFileSelect}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer'
          }}
        />
        <div style={{
          width: '56px',
          height: '56px',
          background: '#ffffff',
          color: 'var(--primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <UploadCloud size={30} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Dump & Upload Batch Certificates
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Select multiple Certificate files in <strong>PDF (.pdf)</strong>, <strong>Image (.jpg, .png)</strong>, or <strong>Presentation (.ppt, .pptx)</strong> formats.
        </p>
      </div>

      {/* Staged Upload Items */}
      {stagedFiles.length > 0 && (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Staged Certificates ({stagedFiles.length})
            </h4>
            <button className="btn-primary btn-sm" onClick={handleSaveStagedCertificates}>
              <CheckCircle2 size={16} />
              <span>Save & Publish All</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {stagedFiles.map((item, idx) => (
              <div key={item.id} style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 40px',
                gap: '0.75rem',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {item.fileName}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {item.fileType}
                  </span>
                </div>

                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Roll Number (e.g. 21CS1084)"
                  value={item.rollNumber}
                  onChange={(e) => handleStageMetaChange(idx, 'rollNumber', e.target.value.toUpperCase())}
                />

                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Student Name"
                  value={item.studentName}
                  onChange={(e) => handleStageMetaChange(idx, 'studentName', e.target.value)}
                />

                <button className="btn-action-del" onClick={() => handleRemoveStaged(idx)} title="Remove file">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dumped / Published Certificates List & Grid View */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Published Certificate Documents ({certificates.length})
          </h4>

          {/* View Toggle Buttons */}
          <div className="nav-tabs" style={{ padding: '0.2rem' }}>
            <button
              className={`nav-tab ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <LayoutGrid size={14} />
              <span>Grid View</span>
            </button>
            <button
              className={`nav-tab ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
            >
              <List size={14} />
              <span>Table View</span>
            </button>
          </div>
        </div>

        {certificates.length > 0 ? (
          viewMode === 'grid' ? (
            /* Interactive Grid View */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.25rem',
              maxHeight: '480px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {certificates.map((cert, index) => {
                const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');
                const isPdf = cert.fileType === 'pdf' || /\.pdf$/i.test(cert.fileName || '');
                const isPpt = cert.fileType === 'ppt' || /\.(ppt|pptx)$/i.test(cert.fileName || '');

                return (
                  <div
                    key={cert.id || index}
                    onClick={() => setSelectedPreviewCert(cert)}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}
                    className="cert-grid-card"
                  >
                    {/* Thumbnail Header */}
                    <div style={{
                      height: '140px',
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {isImage && cert.fileData ? (
                        <img
                          src={cert.fileData}
                          alt={cert.fileName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : isPdf ? (
                        <div style={{ textAlign: 'center', color: '#dc2626' }}>
                          <FileText size={48} />
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>PDF DOCUMENT</div>
                        </div>
                      ) : isPpt ? (
                        <div style={{ textAlign: 'center', color: '#d97706' }}>
                          <FileSpreadsheet size={48} />
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>POWERPOINT</div>
                        </div>
                      ) : (
                        <Award size={48} color="var(--primary)" />
                      )}

                      {/* Format Badge */}
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: isPdf ? '#fee2e2' : isImage ? '#dbeafe' : '#fef3c7',
                        color: isPdf ? '#dc2626' : isImage ? '#1d4ed8' : '#b45309',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.55rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {cert.fileType}
                      </span>
                    </div>

                    {/* Meta Card Body */}
                    <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }} title={cert.fileName}>
                          {cert.fileName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {cert.studentName || 'Participant'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <code style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {cert.rollNumber || 'N/A'}
                        </code>

                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            className="btn-action-del"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCertificate(cert.id);
                            }}
                            title="Delete Certificate"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="admin-table-wrapper" style={{ maxHeight: '350px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Format</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Uploaded At</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((cert, index) => (
                    <tr
                      key={cert.id || index}
                      onClick={() => setSelectedPreviewCert(cert)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td><strong>{index + 1}</strong></td>
                      <td><strong>{cert.fileName}</strong></td>
                      <td>
                        <span style={{
                          background: cert.fileType === 'pdf' ? '#fee2e2' : cert.fileType === 'image' ? '#dbeafe' : '#fef3c7',
                          color: cert.fileType === 'pdf' ? '#dc2626' : cert.fileType === 'image' ? '#1d4ed8' : '#b45309',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {cert.fileType}
                        </span>
                      </td>
                      <td><code>{cert.rollNumber || 'N/A'}</code></td>
                      <td>{cert.studentName || 'N/A'}</td>
                      <td>{cert.uploadedAt || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-action-del"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteCertificate(cert.id);
                          }}
                          title="Delete Certificate"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Award size={40} color="var(--text-light)" style={{ display: 'block', margin: '0 auto 0.5rem' }} />
            <p>No certificates dumped yet. Select files above to publish certificate downloads for students.</p>
          </div>
        )}
      </div>

      {/* Certificate Full-Screen Lightbox Preview Modal */}
      {selectedPreviewCert && (
        <div className="admin-modal-overlay" style={{ zIndex: 1200 }} onClick={() => setSelectedPreviewCert(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '750px', width: '90%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedPreviewCert(null)} title="Close Preview (Esc)">
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
                  {selectedPreviewCert.fileType} Certificate
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Roll No: <strong>{selectedPreviewCert.rollNumber}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedPreviewCert.fileName}
              </h3>
              {selectedPreviewCert.studentName && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Student: <strong>{selectedPreviewCert.studentName}</strong>
                </p>
              )}
            </div>

            {/* Certificate Preview Body */}
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
              {selectedPreviewCert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(selectedPreviewCert.fileName || '') ? (
                <img
                  src={selectedPreviewCert.fileData}
                  alt={selectedPreviewCert.fileName}
                  style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : selectedPreviewCert.fileType === 'pdf' || /\.pdf$/i.test(selectedPreviewCert.fileName || '') ? (
                <iframe
                  src={selectedPreviewCert.fileData}
                  title="PDF Preview"
                  style={{ width: '100%', height: '380px', border: 'none', borderRadius: '4px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <FileSpreadsheet size={56} color="#d97706" style={{ margin: '0 auto 0.75rem' }} />
                  <h4>PowerPoint Presentation File</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Click Download to open this .PPT / .PPTX file on your computer.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Icon-Only Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button
                className="btn-danger"
                onClick={() => {
                  onDeleteCertificate(selectedPreviewCert.id);
                  setSelectedPreviewCert(null);
                }}
                title="Delete Certificate"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={20} />
              </button>
              <button
                className="btn-primary"
                onClick={() => handleDownload(selectedPreviewCert)}
                title="Download File"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={20} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
