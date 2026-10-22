import React, { useState, useEffect, useMemo } from 'react';
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
  X,
  FolderPlus,
  Folder,
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Check
} from 'lucide-react';

export default function CertificateDumpUpload({ 
  certificates = [], 
  onSaveCertificates, 
  onDeleteCertificate, 
  portalSettings = {}, 
  customFolders = [], 
  onSaveFolders, 
  persistFolders, 
  deletedFolderNames = [], 
  showToast 
}) {
  const [stagedFiles, setStagedFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [selectedPreviewCert, setSelectedPreviewCert] = useState(null);

  // Available Program / Event Options from Portal Settings or sensible defaults
  const eventOptions = useMemo(() => {
    const list = new Set([
      "Idea to MVP - Entrepreneurship & Startups"
    ]);

    (portalSettings.programs || []).forEach(p => {
      const title = typeof p === 'string' ? p : p?.title;
      if (title && title.trim()) list.add(title.trim());
    });

    (portalSettings.workshops || []).forEach(w => {
      if (w && w.trim()) list.add(w.trim());
    });

    customFolders.forEach(f => {
      if (f && f.name) list.add(f.name.trim());
    });

    return Array.from(list);
  }, [portalSettings, customFolders]);

  // Available College Options
  const collegeOptions = useMemo(() => {
    const list = new Set(portalSettings.colleges || [
      "Narasaraopeta Engineering College",
      "Tirumala Engineering College",
      "AM Reddy College",
      "RANBIDGE Partnered Institution"
    ]);
    return Array.from(list);
  }, [portalSettings.colleges]);

  // Batch Configuration State
  const [batchEventName, setBatchEventName] = useState("Idea to MVP - Entrepreneurship & Startups");
  const [isCustomEvent, setIsCustomEvent] = useState(false);
  const [batchCollege, setBatchCollege] = useState("RANBIDGE Partnered Institution");
  const [autoCreateFolder, setAutoCreateFolder] = useState(true);

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

  // Smart Parser: Auto-detect Roll Number, Student Name, and Event from file name
  const parseFilenameMeta = (filename) => {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    const cleanStr = nameWithoutExt.replace(/[_\-]+/g, ' ').trim();

    // 1. Detect Roll Number (e.g. 21CS1084, 23471A4245, MVP-80, REG-123456)
    const rollMatch = filename.match(/\b([0-9]{2}[A-Za-z0-9]{6,10}|MVP-\d+|REG-\d+|CERT-\d+)\b/i) ||
                      nameWithoutExt.match(/\b[A-Za-z0-9]{8,12}\b/);
    const rollNumber = rollMatch ? rollMatch[0].toUpperCase() : '';

    // 2. Detect Student Name
    let studentName = cleanStr;
    if (rollNumber) {
      studentName = studentName.replace(new RegExp(rollNumber, 'gi'), '');
    }
    // Strip common certificate buzzwords
    studentName = studentName.replace(/\b(certificate|cert|pdf|jpg|png|jpeg|final|doc|mvp|ranbidge|verification)\b/gi, '');
    studentName = studentName.replace(/\s+/g, ' ').trim();

    if (!studentName || studentName.length < 2) {
      studentName = cleanStr || 'Participant';
    }

    return {
      rollNumber: rollNumber || '',
      studentName: studentName || 'Participant',
      workshopName: batchEventName || 'Idea to MVP - Entrepreneurship & Startups',
      college: batchCollege || 'RANBIDGE Partnered Institution'
    };
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
                workshopName: meta.workshopName,
                eventName: meta.workshopName,
                college: meta.college,
                folderName: meta.workshopName,
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
                workshopName: meta.workshopName,
                eventName: meta.workshopName,
                college: meta.college,
                folderName: meta.workshopName,
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
              workshopName: meta.workshopName,
              eventName: meta.workshopName,
              college: meta.college,
              folderName: meta.workshopName,
              uploadedAt: new Date().toLocaleString()
            });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newStaged => {
      setStagedFiles(prev => [...prev, ...newStaged]);
      if (showToast) showToast(`Selected ${newStaged.length} certificate file(s)`);
    });
  };

  const handleStageMetaChange = (index, field, value) => {
    setStagedFiles(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      if (field === 'workshopName') {
        updated[index].eventName = value;
        updated[index].folderName = value;
      }
      return updated;
    });
  };

  const handleApplyBatchToAllStaged = () => {
    if (stagedFiles.length === 0) return;
    setStagedFiles(prev => prev.map(item => ({
      ...item,
      workshopName: batchEventName,
      eventName: batchEventName,
      folderName: batchEventName,
      college: batchCollege
    })));
    if (showToast) showToast(`Applied Event & College to all ${stagedFiles.length} staged file(s)!`);
  };

  const handleRemoveStaged = (index) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveStagedCertificates = async () => {
    if (stagedFiles.length === 0) return;

    // 1. Identify distinct Event/Workshop Names
    const distinctEvents = Array.from(new Set(
      stagedFiles
        .map(f => (f.workshopName || batchEventName || '').trim())
        .filter(Boolean)
    ));

    // 2. Automatically create Event Folders in Dashboard Folders if autoCreateFolder is active
    if (autoCreateFolder && distinctEvents.length > 0) {
      const existingFolderNames = new Set((customFolders || []).map(f => f.name.toLowerCase().trim()));
      const newFolders = [];

      distinctEvents.forEach(evtName => {
        if (!existingFolderNames.has(evtName.toLowerCase().trim())) {
          newFolders.push({
            id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: evtName.trim(),
            parentId: null,
            parentName: null,
            createdAt: new Date().toLocaleString()
          });
          existingFolderNames.add(evtName.toLowerCase().trim());
        }
      });

      if (newFolders.length > 0) {
        const updatedCustom = [...(customFolders || []), ...newFolders];
        if (persistFolders) {
          persistFolders(updatedCustom, deletedFolderNames || []);
        } else if (onSaveFolders) {
          onSaveFolders(updatedCustom, deletedFolderNames || []);
        }
      }
    }

    // 3. Enforce proper tagging on all saved certificates
    const preparedCerts = stagedFiles.map(cert => {
      const eventNameStr = cert.workshopName?.trim() || batchEventName.trim() || 'General Event';
      return {
        ...cert,
        workshopName: eventNameStr,
        eventName: eventNameStr,
        folderName: eventNameStr,
        college: cert.college?.trim() || batchCollege.trim() || 'RANBIDGE Partnered Institution'
      };
    });

    onSaveCertificates(preparedCerts);
    if (showToast) {
      const folderCreatedMsg = autoCreateFolder ? ` & automatically organized into "${distinctEvents.join(', ')}" folder!` : '!';
      showToast(`🎉 Saved ${preparedCerts.length} certificate(s)${folderCreatedMsg}`);
    }
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
      
      {/* BATCH EVENT & FOLDER CONFIGURATION BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        border: '1.5px solid #bae6fd',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        boxShadow: '0 4px 15px -3px rgba(14, 165, 233, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>📁</span>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Event Folder & Certificate Batch Setup
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Certificates will be automatically grouped into a dedicated folder with this Event Name in the Dashboard.
              </p>
            </div>
          </div>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            border: '1.5px solid #86efac',
            padding: '0.35rem 0.85rem',
            borderRadius: '50px',
            fontSize: '0.82rem',
            fontWeight: 800,
            color: '#15803d',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoCreateFolder}
              onChange={(e) => setAutoCreateFolder(e.target.checked)}
              style={{ accentColor: '#16a34a', width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <span>📁 Auto-Create Event Folder in Dashboard</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Event / Workshop Name Input / Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} color="#0284c7" /> Event / Workshop Name
              </label>
              <button
                type="button"
                onClick={() => setIsCustomEvent(!isCustomEvent)}
                style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                {isCustomEvent ? 'Select Existing' : '+ Custom Event'}
              </button>
            </div>

            {isCustomEvent ? (
              <input
                type="text"
                className="form-input"
                placeholder="Type custom event name (e.g. AI & Robotics Bootcamp)"
                value={batchEventName}
                onChange={(e) => setBatchEventName(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              />
            ) : (
              <select
                className="form-select"
                value={batchEventName}
                onChange={(e) => setBatchEventName(e.target.value)}
                style={{ fontSize: '0.88rem' }}
              >
                {eventOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>

          {/* College Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              <Building2 size={14} color="#0284c7" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Target College / Institution
            </label>
            <select
              className="form-select"
              value={batchCollege}
              onChange={(e) => setBatchCollege(e.target.value)}
              style={{ fontSize: '0.88rem' }}
            >
              {collegeOptions.map((col, i) => (
                <option key={i} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Apply to Staged Button */}
          {stagedFiles.length > 0 && (
            <div>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleApplyBatchToAllStaged}
                style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                title="Update all staged files with current Event and College"
              >
                <Layers size={16} /> Apply to {stagedFiles.length} Staged Files
              </button>
            </div>
          )}
        </div>
      </div>

      {/* UPLOAD ZONE */}
      <div style={{
        border: '2px dashed #93c5fd',
        background: '#eff6ff',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease'
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
          background: 'var(--bg-primary)',
          color: 'var(--primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          boxShadow: 'var(--neu-raised-sm)'
        }}>
          <UploadCloud size={30} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
          Dump & Upload Batch Certificates
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '580px', margin: '0.35rem auto 0' }}>
          Select multiple Certificate files in <strong>PDF (.pdf)</strong>, <strong>Image (.jpg, .png)</strong>, or <strong>Presentation (.ppt, .pptx)</strong> formats.
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: '#ffffff',
          color: '#0284c7',
          padding: '0.35rem 0.95rem',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginTop: '0.85rem',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.12)'
        }}>
          <span>📁 Target Event Folder:</span>
          <strong>{batchEventName || 'Idea to MVP'}</strong>
        </div>
      </div>

      {/* STAGED UPLOAD ITEMS REVIEW */}
      {stagedFiles.length > 0 && (
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--neu-raised)',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>📁</span> Staged Certificates ({stagedFiles.length})
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                Review detected Roll Number, Student Name & Event Name before publishing.
              </p>
            </div>
            
            <button className="btn-primary" onClick={handleSaveStagedCertificates} style={{ padding: '0.65rem 1.5rem' }}>
              <CheckCircle2 size={18} />
              <span>Save & Publish All to Folder</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
            {stagedFiles.map((item, idx) => (
              <div key={item.id || idx} style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 1.5fr) minmax(130px, 1fr) minmax(150px, 1.2fr) minmax(160px, 1.2fr) 40px',
                gap: '0.75rem',
                alignItems: 'center',
                background: 'var(--bg-secondary)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
                    {item.fileName}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {item.fileType}
                  </span>
                </div>

                {/* Roll Number */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Roll Number
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="e.g. 21CS1084"
                    value={item.rollNumber}
                    onChange={(e) => handleStageMetaChange(idx, 'rollNumber', e.target.value.toUpperCase())}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>

                {/* Participant Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Participant Name
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Student Name"
                    value={item.studentName}
                    onChange={(e) => handleStageMetaChange(idx, 'studentName', e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>

                {/* Event Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Event / Folder
                  </label>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Event Name"
                    value={item.workshopName || ''}
                    onChange={(e) => handleStageMetaChange(idx, 'workshopName', e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className="btn-action-del" onClick={() => handleRemoveStaged(idx)} title="Remove file">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DUMPED / PUBLISHED CERTIFICATES LIST & GRID VIEW */}
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--neu-raised)',
        padding: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--primary)" />
              Published Certificate Documents ({certificates.length})
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Stored securely in database with Event Folder associations.
            </p>
          </div>

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
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.25rem',
              maxHeight: '480px',
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {certificates.map((cert, index) => {
                const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');
                const isPdf = cert.fileType === 'pdf' || /\.pdf$/i.test(cert.fileName || '');
                const isPpt = cert.fileType === 'ppt' || /\.(ppt|pptx)$/i.test(cert.fileName || '');
                const eventLabel = cert.workshopName || cert.eventName || cert.folderName || 'General';

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
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {cert.studentName || 'Participant'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span>📁</span> {eventLabel}
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
            <div className="admin-table-wrapper" style={{ maxHeight: '380px' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>File Name</th>
                    <th>Format</th>
                    <th>Roll Number</th>
                    <th>Student Name</th>
                    <th>Event / Folder</th>
                    <th>College</th>
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
                      <td><strong>{cert.studentName || 'N/A'}</strong></td>
                      <td><span style={{ color: '#0284c7', fontWeight: 700 }}>📁 {cert.workshopName || cert.eventName || cert.folderName || 'General'}</span></td>
                      <td>{cert.college || 'N/A'}</td>
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

      {/* CERTIFICATE FULL-SCREEN LIGHTBOX PREVIEW MODAL */}
      {selectedPreviewCert && (
        <div className="admin-modal-overlay" style={{ zIndex: 1200 }} onClick={() => setSelectedPreviewCert(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '750px', width: '90%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedPreviewCert(null)} title="Close Preview (Esc)">
              <X size={20} />
            </button>

            <div style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
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
                <span style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 700 }}>
                  📁 {selectedPreviewCert.workshopName || selectedPreviewCert.eventName || 'Event Folder'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', margin: '0.25rem 0' }}>
                {selectedPreviewCert.fileName}
              </h3>
              {selectedPreviewCert.studentName && (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                  Student: <strong>{selectedPreviewCert.studentName}</strong> &bull; College: <strong>{selectedPreviewCert.college || 'N/A'}</strong>
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
