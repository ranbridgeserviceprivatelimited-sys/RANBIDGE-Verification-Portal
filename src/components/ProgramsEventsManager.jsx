import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calendar, 
  Briefcase, 
  Award, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Filter, 
  Users, 
  BookOpen, 
  Clock, 
  Layers, 
  Tag, 
  GraduationCap, 
  Copy, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  Eye,
  Download,
  RefreshCw,
  FileCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import CertificateGenerator from './CertificateGenerator';
import referenceCertImg from '../assets/reference_certificate.png';

export const DURATION_PRESETS = [
  '1 Day',
  '2 Days',
  '3 Days',
  '1 Week',
  '2 Weeks',
  '1 Month',
  '2 Months',
  '3 Months',
  '6 Months',
  '24 Hours',
  '48 Hours'
];

export const getDefaultDurationForType = (type) => {
  switch (type) {
    case 'Internship': return '2 Months';
    case 'Workshop': return '3 Days';
    case 'Event': return '1 Day';
    case 'Hackathon': return '48 Hours';
    case 'Bootcamp': return '1 Month';
    case 'Course': return '4 Weeks';
    default: return '3 Days';
  }
};

export const PROGRAM_TYPES = [
  { id: 'Workshop', label: 'Workshop', icon: Award, color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe' },
  { id: 'Internship', label: 'Internship', icon: Briefcase, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
  { id: 'Event', label: 'Event', icon: Calendar, color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
  { id: 'Bootcamp', label: 'Bootcamp / Training', icon: Sparkles, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { id: 'Hackathon', label: 'Hackathon', icon: Layers, color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  { id: 'Course', label: 'Certification Course', icon: BookOpen, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { id: 'Other', label: 'Other Program', icon: Tag, color: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' }
];

export const DEFAULT_PROGRAMS = [
  {
    id: 'prog-1',
    title: 'Full Stack Web Development Internship',
    type: 'Internship',
    duration: '2 Months',
    date: '2026',
    department: 'CSE / IT / ECE',
    description: 'Hands-on enterprise industry internship covering modern React, Node.js, Cloud Firestore, and real-time APIs.',
    certificateTemplate: null,
    certificateTemplateName: ''
  },
  {
    id: 'prog-2',
    title: 'IDEA TO MVP – ENTREPRENEURSHIP & STARTUPS',
    type: 'Workshop',
    duration: '3 Days',
    date: '2026',
    department: 'All Engineering Branches',
    description: 'Practical innovation workshop transforming student ideas into real validated products, MVPs, and venture pitches.',
    certificateTemplate: null,
    certificateTemplateName: ''
  },
  {
    id: 'prog-3',
    title: 'Artificial Intelligence & Machine Learning Bootcamp',
    type: 'Bootcamp',
    duration: '1 Month',
    date: '2026',
    department: 'CSE / AI & ML / Data Science',
    description: 'Deep dive into computer vision, NLP, generative models, and industry AI pipelines.',
    certificateTemplate: null,
    certificateTemplateName: ''
  },
  {
    id: 'prog-4',
    title: 'National Student Innovation Hackathon 2026',
    type: 'Hackathon',
    duration: '48 Hours',
    date: '2026',
    department: 'All Branches',
    description: 'Collaborative coding competition solving real-world challenges with industry jury evaluation.',
    certificateTemplate: null,
    certificateTemplateName: ''
  }
];

// Helper to compress uploaded certificate image to crisp base64
const compressCertificateImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please upload an image file (PNG, JPG, WebP)'));
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1414;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width / height > MAX_WIDTH / MAX_HEIGHT) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88);
        resolve({
          dataUrl,
          fileName: file.name,
          fileSize: `${Math.round(dataUrl.length * 0.75 / 1024)} KB`
        });
      };
      img.onerror = () => reject(new Error('Could not process image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
};

export default function ProgramsEventsManager({
  portalSettings = {},
  onSavePortalSettings,
  records = [],
  certificates = [],
  onVerifyRecord,
  onSaveCertificates,
  onSelectProgramFilter,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [isAddFormExpanded, setIsAddFormExpanded] = useState(true);

  // Form State for Adding New Program
  const [newProgram, setNewProgram] = useState({
    title: '',
    type: 'Workshop',
    duration: '3 Days',
    department: 'All Branches',
    description: '',
    certificateTemplate: null,
    certificateTemplateName: ''
  });

  // Edit Modal State
  const [editingProgram, setEditingProgram] = useState(null);

  // Batch Certificate Generator Modal State
  const [batchModalProgram, setBatchModalProgram] = useState(null);
  const [previewStudentCert, setPreviewStudentCert] = useState(null);
  const [previewTemplateProgram, setPreviewTemplateProgram] = useState(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // Keyboard Escape Handler for All Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewStudentCert) {
          setPreviewStudentCert(null);
        } else if (previewTemplateProgram) {
          setPreviewTemplateProgram(null);
        } else if (batchModalProgram) {
          setBatchModalProgram(null);
        } else if (editingProgram) {
          setEditingProgram(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewStudentCert, previewTemplateProgram, batchModalProgram, editingProgram]);

  // Normalize current programs list from portalSettings
  const programsList = useMemo(() => {
    let list = [];
    if (Array.isArray(portalSettings?.programs) && portalSettings.programs.length > 0) {
      list = portalSettings.programs.filter(Boolean).map((p, idx) => {
        if (typeof p === 'string') {
          return {
            id: `prog-${idx}-${p.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            title: p,
            type: 'Workshop',
            duration: '3 Days',
            department: 'All Branches',
            description: '',
            certificateTemplate: null,
            certificateTemplateName: ''
          };
        }
        return {
          id: p?.id || `prog-${idx}-${(p?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          title: p?.title || 'Untitled Program',
          type: p?.type || 'Workshop',
          duration: (p?.duration && p.duration !== '2026') ? p.duration : getDefaultDurationForType(p?.type || 'Workshop'),
          department: p?.department || 'All Branches',
          description: p?.description || '',
          certificateTemplate: p?.certificateTemplate || null,
          certificateTemplateName: p?.certificateTemplateName || ''
        };
      });
    } else if (Array.isArray(portalSettings?.workshops) && portalSettings.workshops.length > 0) {
      list = portalSettings.workshops.filter(Boolean).map((w, idx) => ({
        id: `prog-${idx}-${(typeof w === 'string' ? w : w?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        title: typeof w === 'string' ? w : w?.title || 'Untitled Workshop',
        type: (typeof w === 'object' && w?.type) ? w.type : 'Workshop',
        duration: (typeof w === 'object' && w?.duration && w.duration !== '2026') ? w.duration : '3 Days',
        department: 'All Branches',
        description: '',
        certificateTemplate: null,
        certificateTemplateName: ''
      }));
    } else {
      list = DEFAULT_PROGRAMS;
    }
    return list;
  }, [portalSettings?.programs, portalSettings?.workshops]);

  // Synchronize update back to parent / persistence
  const saveProgramsList = (updated) => {
    const titles = updated.map(p => p.title.trim()).filter(Boolean);
    if (onSavePortalSettings) {
      onSavePortalSettings({
        ...portalSettings,
        programs: updated,
        workshops: titles
      });
    }
  };

  // Add Handler
  const handleAddProgram = (e) => {
    if (e) e.preventDefault();
    const cleanTitle = newProgram.title.trim();
    if (!cleanTitle) {
      if (showToast) showToast('⚠️ Please enter a title for the program / event / workshop!', 'error');
      return;
    }

    if (programsList.some(p => p.title.toLowerCase() === cleanTitle.toLowerCase())) {
      if (showToast) showToast(`⚠️ "${cleanTitle}" already exists in the programs list!`, 'info');
      return;
    }

    const createdItem = {
      id: 'prog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: cleanTitle,
      type: newProgram.type || 'Workshop',
      duration: newProgram.duration.trim() || getDefaultDurationForType(newProgram.type),
      department: newProgram.department.trim() || 'All Branches',
      description: newProgram.description.trim(),
      certificateTemplate: newProgram.certificateTemplate || null,
      certificateTemplateName: newProgram.certificateTemplateName || ''
    };

    const updated = [createdItem, ...programsList];
    saveProgramsList(updated);

    setNewProgram({
      title: '',
      type: newProgram.type, // keep last selected type for fast entry
      duration: getDefaultDurationForType(newProgram.type),
      department: 'All Branches',
      description: '',
      certificateTemplate: null,
      certificateTemplateName: ''
    });

    if (showToast) {
      showToast(`✅ Added new ${createdItem.type}: "${createdItem.title}"!`, 'success');
    }
  };

  // Upload certificate template for new program being drafted
  const handleUploadNewProgramTemplate = async (file) => {
    if (!file) return;
    try {
      if (showToast) showToast('⏳ Processing certificate image...', 'info');
      const res = await compressCertificateImage(file);
      setNewProgram(prev => ({
        ...prev,
        certificateTemplate: res.dataUrl,
        certificateTemplateName: res.fileName
      }));
      if (showToast) showToast(`✅ Uploaded certificate template "${res.fileName}"!`, 'success');
    } catch (err) {
      if (showToast) showToast(`❌ ${err.message}`, 'error');
    }
  };

  // Upload/change certificate template for an existing program
  const handleUploadFileForProgram = async (programId, file) => {
    if (!file) return;
    try {
      if (showToast) showToast('⏳ Processing certificate image...', 'info');
      const res = await compressCertificateImage(file);
      const updated = programsList.map(p => {
        if (p.id === programId) {
          return {
            ...p,
            certificateTemplate: res.dataUrl,
            certificateTemplateName: res.fileName
          };
        }
        return p;
      });
      saveProgramsList(updated);

      if (batchModalProgram && batchModalProgram.id === programId) {
        setBatchModalProgram(prev => ({
          ...prev,
          certificateTemplate: res.dataUrl,
          certificateTemplateName: res.fileName
        }));
      }

      if (showToast) showToast(`✅ Updated certificate template for this event!`, 'success');
    } catch (err) {
      if (showToast) showToast(`❌ ${err.message}`, 'error');
    }
  };

  // Remove certificate template from an existing program
  const handleRemoveTemplateFromProgram = (programId) => {
    const updated = programsList.map(p => {
      if (p.id === programId) {
        return {
          ...p,
          certificateTemplate: null,
          certificateTemplateName: ''
        };
      }
      return p;
    });
    saveProgramsList(updated);

    if (batchModalProgram && batchModalProgram.id === programId) {
      setBatchModalProgram(prev => ({
        ...prev,
        certificateTemplate: null,
        certificateTemplateName: ''
      }));
    }

    if (showToast) showToast('🗑️ Removed custom certificate template.', 'info');
  };

  // Delete Handler
  const handleDeleteProgram = (prog) => {
    if (window.confirm(`Are you sure you want to delete "${prog.title}" from the portal programs?`)) {
      const updated = programsList.filter(p => p.id !== prog.id && p.title.toLowerCase() !== prog.title.toLowerCase());
      saveProgramsList(updated);
      if (showToast) showToast(`🗑️ Removed "${prog.title}"`, 'info');
    }
  };

  // Edit Save Handler
  const handleSaveEdit = (e) => {
    if (e) e.preventDefault();
    if (!editingProgram || !editingProgram.title.trim()) return;

    const updated = programsList.map(p => {
      if (p.id === editingProgram.id) {
        return {
          ...editingProgram,
          title: editingProgram.title.trim(),
          type: editingProgram.type,
          duration: editingProgram.duration.trim() || '3 Days',
          department: editingProgram.department.trim(),
          description: editingProgram.description.trim(),
          certificateTemplate: editingProgram.certificateTemplate || null,
          certificateTemplateName: editingProgram.certificateTemplateName || ''
        };
      }
      return p;
    });

    saveProgramsList(updated);
    setEditingProgram(null);
    if (showToast) showToast('✅ Program details updated successfully!', 'success');
  };

  // Copy Title Helper
  const handleCopyTitle = (title) => {
    navigator.clipboard?.writeText(title);
    if (showToast) showToast(`📋 Copied "${title}" to clipboard!`, 'info');
  };

  // Reset / Load Defaults
  const handleLoadDefaults = () => {
    saveProgramsList(DEFAULT_PROGRAMS);
    if (showToast) showToast('🔄 Loaded default recommended programs list!', 'success');
  };

  // Calculate registrations & cert counts per program
  const programStatsMap = useMemo(() => {
    const map = {};
    (programsList || []).forEach(p => {
      if (!p) return;
      const t = (p.title || '').toLowerCase().trim();
      const recCount = (records || []).filter(r => {
        if (!r) return false;
        const rw = (r.workshopName || r.workshop || '').toLowerCase().trim();
        return rw === t || rw.includes(t) || t.includes(rw);
      }).length;
      const certCount = (certificates || []).filter(c => {
        if (!c) return false;
        const cw = (c.workshopName || c.eventName || '').toLowerCase().trim();
        return cw === t || cw.includes(t) || t.includes(cw);
      }).length;
      map[p.id] = { recCount, certCount };
    });
    return map;
  }, [programsList, records, certificates]);

  // Counts by type
  const typeCounts = useMemo(() => {
    const counts = { ALL: (programsList || []).length };
    PROGRAM_TYPES.forEach(t => {
      counts[t.id] = (programsList || []).filter(p => p && p.type === t.id).length;
    });
    return counts;
  }, [programsList]);

  // Filtered List
  const filteredPrograms = useMemo(() => {
    return (programsList || []).filter(p => {
      if (!p) return false;
      const matchType = selectedTypeFilter === 'ALL' || p.type === selectedTypeFilter;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchQuery = !q || 
        ((p.title || '').toLowerCase().includes(q)) || 
        ((p.type || '').toLowerCase().includes(q)) || 
        ((p.duration || '').toLowerCase().includes(q)) || 
        ((p.department || '').toLowerCase().includes(q)) ||
        ((p.description || '').toLowerCase().includes(q));
      return matchType && matchQuery;
    });
  }, [programsList, selectedTypeFilter, searchQuery]);

  // Find all registered students for the batch modal program
  const batchCandidates = useMemo(() => {
    if (!batchModalProgram) return [];
    const pt = (batchModalProgram.title || '').toLowerCase().trim();
    return (records || []).filter(r => {
      if (!r) return false;
      const rw = (r.workshopName || r.workshop || '').toLowerCase().trim();
      return rw === pt || rw.includes(pt) || pt.includes(rw);
    });
  }, [batchModalProgram, records]);

  // Execute Batch Certificate Generation & Verification for all candidates of the program
  const handleGenerateAllForProgram = async (program) => {
    const matchingStudents = records.filter(r => {
      const rw = (r.workshopName || r.workshop || '').toLowerCase().trim();
      const pt = (program.title || '').toLowerCase().trim();
      return rw === pt || rw.includes(pt) || pt.includes(rw);
    });

    if (matchingStudents.length === 0) {
      if (showToast) showToast('⚠️ No registered candidates found for this event yet.', 'info');
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: matchingStudents.length });

    // 1. Verify unverified registrations
    for (let i = 0; i < matchingStudents.length; i++) {
      const s = matchingStudents[i];
      if (s.verificationStatus !== 'verified' && onVerifyRecord) {
        try {
          await onVerifyRecord(s.id || s.firestoreId);
        } catch (err) {
          console.error('Error verifying record:', err);
        }
      }
      setGenerationProgress({ current: i + 1, total: matchingStudents.length });
    }

    // 2. Add or update official certificates list
    if (onSaveCertificates) {
      const newCerts = matchingStudents.map(s => ({
        id: 'CERT-' + (s.rollNumber || s.id),
        fileName: `${s.fullName || 'Student'}_Certificate.png`,
        rollNumber: s.rollNumber || '',
        studentName: s.fullName || '',
        college: s.college || '',
        workshopName: program.title,
        workshopDuration: program.duration,
        certificateTemplate: program.certificateTemplate || null,
        issueDate: new Date().toISOString().split('T')[0],
        downloadUrl: '#',
        fileSize: '320 KB',
        verificationStatus: 'verified',
        uploadedAt: new Date().toLocaleString()
      }));
      await onSaveCertificates(newCerts);
    }

    setIsGeneratingAll(false);
    if (showToast) {
      showToast(`🎉 Generated official certificates for all ${matchingStudents.length} registered candidates of "${program.title}"!`, 'success');
    }
  };

  // Render & download single student certificate PNG using program's template
  const handleDownloadSingleStudentCert = async (student, program) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1414;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    const templateSrc = program?.certificateTemplate;
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
      img.src = templateSrc || referenceCertImg;
    });

    if (img.naturalWidth > 0) {
      ctx.drawImage(img, 0, 0, 1414, 1000);
    }

    const recipientName = student.fullName || student.name || 'Participant Name';
    const collegeName = student.college || 'Engineering Institution';
    const rollNumber = student.rollNumber || 'REG-2026';
    const rawDate = student.workshopDate || student.date || 'October 7, 2026';
    const workshopDate = (typeof rawDate === 'string' && !rawDate.includes('[object')) ? rawDate : 'October 7, 2026';
    const centerX = 1414 / 2;

    if (!templateSrc) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(240, 455, 934, 75);
      ctx.fillRect(140, 545, 1134, 98);
      ctx.fillRect(160, 652, 1094, 60);
    }

    // Name
    ctx.textAlign = 'center';
    ctx.font = 'bold italic 44px "Georgia", serif';
    ctx.fillStyle = '#0c2340';
    ctx.fillText(recipientName, centerX, 502);

    // Accent underline
    const nameWidth = ctx.measureText(recipientName).width;
    const uWidth = Math.max(380, nameWidth + 50);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(centerX - uWidth / 2, 522);
    ctx.lineTo(centerX + uWidth / 2, 522);
    ctx.stroke();

    if (!templateSrc) {
      ctx.font = '500 22px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(`for successfully participating in the ${program?.duration || '3-Day'} Workshop on`, centerX, 576);
      ctx.font = '900 34px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#0c2340';
      ctx.fillText((program?.title || 'WORKSHOP').toUpperCase(), centerX, 628);
      ctx.font = '700 21px "Georgia", serif';
      ctx.fillStyle = '#1b365d';
      ctx.fillText(`📅  ${workshopDate}     📍  ${collegeName}`, centerX, 690);
    } else {
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${collegeName} • Roll: ${rollNumber}`, centerX, 570);
      ctx.font = '500 18px "Georgia", serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Issued on ${workshopDate} | Verification ID: ${rollNumber}`, centerX, 610);
    }

    const link = document.createElement('a');
    link.download = `Certificate_${recipientName.replace(/\s+/g, '_')}_${rollNumber}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all registered candidates' certificates in batch
  const handleDownloadAllCertificates = async (students, program) => {
    if (students.length === 0) {
      if (showToast) showToast('No candidates available to download.', 'warning');
      return;
    }
    if (showToast) showToast(`⏳ Starting batch download for ${students.length} certificates...`, 'info');
    for (let i = 0; i < students.length; i++) {
      await handleDownloadSingleStudentCert(students[i], program);
      await new Promise(r => setTimeout(r, 220));
    }
    if (showToast) showToast(`✅ Successfully downloaded all ${students.length} certificates!`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '1.65rem 2rem',
        boxShadow: '0 8px 24px -4px rgba(49, 46, 129, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.15)', 
                color: '#e0e7ff', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                padding: '0.2rem 0.55rem', 
                borderRadius: '50px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                <Sparkles size={11} /> Admin Control
              </span>
              <span style={{ 
                background: 'rgba(16, 185, 129, 0.25)', 
                color: '#6ee7b7', 
                fontSize: '0.72rem', 
                fontWeight: 700, 
                padding: '0.2rem 0.55rem', 
                borderRadius: '50px' 
              }}>
                Live Synchronization
              </span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 0.4rem 0', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Events, Workshops & Internships Manager
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#c7d2fe', margin: 0, lineHeight: 1.5 }}>
              Upload event certificate designs, configure program durations, and automatically generate official certificates for all registered participants with one click.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddFormExpanded(!isAddFormExpanded)}
            style={{
              background: isAddFormExpanded ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
              color: isAddFormExpanded ? '#312e81' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.55rem 1rem',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            {isAddFormExpanded ? (
              <><X size={15} /> Hide Add Form</>
            ) : (
              <><Plus size={15} /> Add New Program / Event</>
            )}
          </button>
        </div>
      </div>

      {/* 2. Expandable Add Program Form */}
      {isAddFormExpanded && (
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.35rem 1.6rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: '#e0e7ff', 
                color: '#4338ca', 
                borderRadius: '6px', 
                padding: '0.25rem 0.35rem', 
                display: 'inline-flex' 
              }}>
                <Plus size={16} />
              </span>
              Add New Event, Workshop or Internship
            </h4>

            {/* Quick Type Selection Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.2rem' }}>
                Category:
              </span>
              {PROGRAM_TYPES.map(t => {
                const isSelected = newProgram.type === t.id;
                const IconComp = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewProgram(prev => ({ 
                      ...prev, 
                      type: t.id,
                      duration: (!prev.duration || prev.duration === '2026') 
                        ? getDefaultDurationForType(t.id) 
                        : prev.duration 
                    }))}
                    style={{
                      border: `1px solid ${isSelected ? t.color : 'var(--border-color, #e2e8f0)'}`,
                      background: isSelected ? t.bg : '#ffffff',
                      color: isSelected ? t.color : 'var(--text-main)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.78rem',
                      padding: '0.28rem 0.65rem',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <IconComp size={12} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAddProgram}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {/* Program Title */}
              <div style={{ gridColumn: 'span 1' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Program / Event / Workshop Title</span> <span className="required" style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Full Stack Web Development Internship, AI Workshop..."
                    value={newProgram.title}
                    onChange={e => setNewProgram(prev => ({ ...prev, title: e.target.value }))}
                    style={{ fontSize: '0.9rem', padding: '0.55rem 0.8rem' }}
                    required
                  />
                </div>
              </div>

              {/* Category / Type Selector */}
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Program Type</span>
                </label>
                <select
                  className="form-input"
                  value={newProgram.type}
                  onChange={e => {
                    const val = e.target.value;
                    setNewProgram(prev => ({
                      ...prev,
                      type: val,
                      duration: (!prev.duration || prev.duration === '2026')
                        ? getDefaultDurationForType(val)
                        : prev.duration
                    }));
                  }}
                  style={{ fontSize: '0.9rem', padding: '0.55rem 0.8rem' }}
                >
                  {PROGRAM_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Duration or Schedule */}
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Event / Program Duration</span> <span className="required" style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="input-wrapper">
                  <Clock className="input-icon" size={15} style={{ color: '#6366f1' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter duration manually (e.g. 3 Days, 2 Months, 1 Week, 48 Hours...)"
                    value={newProgram.duration}
                    onChange={e => setNewProgram(prev => ({ ...prev, duration: e.target.value }))}
                    style={{ fontSize: '0.9rem', padding: '0.55rem 0.8rem 0.55rem 2.2rem' }}
                    required
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                  Type as days, months, weeks, or hours manually (e.g. <strong>3 Days</strong>, <strong>1 Month</strong>, <strong>6 Months</strong>, <strong>2 Weeks</strong>)
                </span>
              </div>

              {/* Eligible Department */}
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  <span>Target Branches / Departments</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. All Branches, CSE & ECE..."
                    value={newProgram.department}
                    onChange={e => setNewProgram(prev => ({ ...prev, department: e.target.value }))}
                    style={{ fontSize: '0.9rem', padding: '0.55rem 0.8rem' }}
                  />
                </div>
              </div>
            </div>

            {/* EVENT CERTIFICATE TEMPLATE UPLOAD AREA */}
            <div style={{
              background: newProgram.certificateTemplate ? '#f0fdf4' : '#f8fafc',
              border: `1.5px dashed ${newProgram.certificateTemplate ? '#86efac' : '#cbd5e1'}`,
              borderRadius: '8px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px' }}>
                {newProgram.certificateTemplate ? (
                  <img
                    src={newProgram.certificateTemplate}
                    alt="Certificate preview"
                    style={{
                      width: '64px',
                      height: '46px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1.5px solid #86efac',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#3b82f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Award size={22} />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 700, color: newProgram.certificateTemplate ? '#15803d' : '#1e293b' }}>
                      {newProgram.certificateTemplate ? 'Event Certificate Template Attached' : 'Event Certificate Design / Template (Optional)'}
                    </span>
                    {newProgram.certificateTemplate && (
                      <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '50px' }}>
                        Ready for Batch Generation
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    {newProgram.certificateTemplate
                      ? `${newProgram.certificateTemplateName || 'Custom template'} • All registered candidates will receive certificates with this design`
                      : 'Upload the official certificate image (PNG, JPG). Certificates for all registered persons of this event will be generated based on this design.'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{
                  background: newProgram.certificateTemplate ? '#ffffff' : '#4f46e5',
                  color: newProgram.certificateTemplate ? '#334155' : '#ffffff',
                  border: newProgram.certificateTemplate ? '1px solid #cbd5e1' : 'none',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <UploadCloud size={14} />
                  <span>{newProgram.certificateTemplate ? 'Replace Certificate' : 'Upload Event Certificate'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={e => handleUploadNewProgramTemplate(e.target.files[0])}
                  />
                </label>

                {newProgram.certificateTemplate && (
                  <button
                    type="button"
                    onClick={() => setNewProgram(prev => ({ ...prev, certificateTemplate: null, certificateTemplateName: '' }))}
                    style={{
                      background: 'transparent',
                      border: '1px solid #fecdd3',
                      color: '#e11d48',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <span>Short Description / Overview (Optional)</span>
              </label>
              <textarea
                className="form-input"
                rows={2}
                placeholder="Briefly describe what this workshop/internship entails, certificates awarded, or highlights..."
                value={newProgram.description}
                onChange={e => setNewProgram(prev => ({ ...prev, description: e.target.value }))}
                style={{ fontSize: '0.86rem', padding: '0.5rem 0.8rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setNewProgram({ title: '', type: 'Workshop', duration: '3 Days', department: 'All Branches', description: '', certificateTemplate: null, certificateTemplateName: '' })}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '0.55rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#4f46e5',
                  borderColor: '#4338ca'
                }}
              >
                <Plus size={16} /> Save & Add Program
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Toolbar: Search & Category Filter Tabs */}
      <div style={{
        background: 'var(--card-bg, #ffffff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderRadius: 'var(--radius-lg)',
        padding: '0.85rem 1.15rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search programs by title, type, duration..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', fontSize: '0.86rem' }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('ALL')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '50px',
              border: '1px solid',
              borderColor: selectedTypeFilter === 'ALL' ? '#4f46e5' : 'var(--border-color, #e2e8f0)',
              background: selectedTypeFilter === 'ALL' ? '#4f46e5' : 'transparent',
              color: selectedTypeFilter === 'ALL' ? '#ffffff' : 'var(--text-main)',
              fontWeight: selectedTypeFilter === 'ALL' ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            All ({typeCounts.ALL || 0})
          </button>

          {PROGRAM_TYPES.map(t => {
            const isSel = selectedTypeFilter === t.id;
            const count = typeCounts[t.id] || 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTypeFilter(t.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '50px',
                  border: '1px solid',
                  borderColor: isSel ? t.color : 'var(--border-color, #e2e8f0)',
                  background: isSel ? t.bg : 'transparent',
                  color: isSel ? t.color : 'var(--text-muted)',
                  fontWeight: isSel ? 700 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  transition: 'all 0.15s'
                }}
              >
                <span>{t.label}</span>
                <span style={{ 
                  background: isSel ? t.color : '#e2e8f0', 
                  color: isSel ? '#ffffff' : '#475569',
                  borderRadius: '50px',
                  padding: '0.05rem 0.4rem',
                  fontSize: '0.7rem'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <div style={{
          background: 'var(--card-bg, #ffffff)',
          border: '2px dashed var(--border-color, #e2e8f0)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '54px', 
            height: '54px', 
            borderRadius: '50%', 
            background: '#f1f5f9', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '0.85rem'
          }}>
            <Calendar size={28} color="#94a3b8" />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
            No Programs Found
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
            {searchQuery 
              ? `No program matches "${searchQuery}". Try a different search term or filter.` 
              : `There are currently no programs configured for this category.`}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={handleLoadDefaults}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RotateCcw size={14} /> Load Recommended Programs
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
          gap: '1.15rem'
        }}>
          {filteredPrograms.map((prog) => {
            const typeConfig = PROGRAM_TYPES.find(t => t.id === prog.type) || PROGRAM_TYPES[0];
            const TypeIcon = typeConfig.icon;
            const stats = programStatsMap[prog.id] || { recCount: 0, certCount: 0 };

            return (
              <div
                key={prog.id}
                style={{
                  background: 'var(--card-bg, #ffffff)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                }}
              >
                <div>
                  {/* Card Header: Type Badge & Action Icons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{
                      background: typeConfig.bg,
                      color: typeConfig.color,
                      border: `1px solid ${typeConfig.border}`,
                      padding: '0.22rem 0.65rem',
                      borderRadius: '50px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <TypeIcon size={12} />
                      {typeConfig.label}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <button
                        type="button"
                        onClick={() => handleCopyTitle(prog.title)}
                        title="Copy program title"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          padding: '0.3rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingProgram({ ...prog })}
                        title="Edit program details"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#0284c7',
                          padding: '0.3rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProgram(prog)}
                        title="Delete program"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          padding: '0.3rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 style={{ 
                    fontSize: '1.02rem', 
                    fontWeight: 700, 
                    color: 'var(--text-main)', 
                    margin: '0 0 0.5rem 0',
                    lineHeight: 1.4 
                  }}>
                    {prog.title}
                  </h4>

                  {/* Meta Chips: Duration & Dept */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      background: '#eff6ff',
                      border: '1.5px solid #bfdbfe',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <Clock size={13} color="#2563eb" /> 
                      Duration: <strong>{prog.duration || '3 Days'}</strong>
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color, #e2e8f0)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <GraduationCap size={12} /> {prog.department || 'All Branches'}
                    </span>
                  </div>

                  {/* EVENT CERTIFICATE TEMPLATE BLOCK */}
                  <div style={{
                    margin: '0.75rem 0',
                    padding: '0.75rem 0.85rem',
                    background: prog.certificateTemplate ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px dashed ${prog.certificateTemplate ? '#86efac' : '#cbd5e1'}`,
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Award size={15} color={prog.certificateTemplate ? '#16a34a' : '#64748b'} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: prog.certificateTemplate ? '#15803d' : '#334155' }}>
                          {prog.certificateTemplate ? 'Certificate Template Attached' : 'Event Certificate Template'}
                        </span>
                      </div>

                      {prog.certificateTemplate ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewTemplateProgram(prog)}
                            style={{
                              background: '#ffffff',
                              border: '1px solid #bbf7d0',
                              color: '#16a34a',
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.45rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            <Eye size={11} /> View
                          </button>
                          <label style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.45rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <UploadCloud size={11} /> Replace
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              style={{ display: 'none' }}
                              onChange={(e) => handleUploadFileForProgram(prog.id, e.target.files[0])}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveTemplateFromProgram(prog.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#ef4444',
                              padding: '0.2rem',
                              cursor: 'pointer'
                            }}
                            title="Remove template"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ) : (
                        <label style={{
                          background: '#4f46e5',
                          color: '#ffffff',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.22rem 0.55rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          boxShadow: '0 1px 3px rgba(79,70,229,0.2)'
                        }}>
                          <UploadCloud size={12} /> Upload Certificate
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            style={{ display: 'none' }}
                            onChange={(e) => handleUploadFileForProgram(prog.id, e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>

                    {prog.certificateTemplate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <img
                          src={prog.certificateTemplate}
                          alt="Certificate preview"
                          style={{
                            width: '44px',
                            height: '30px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #86efac'
                          }}
                        />
                        <span style={{ fontSize: '0.71rem', color: '#166534', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prog.certificateTemplateName || 'custom_certificate_template.png'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* USER REQUEST BUTTON: GENERATE CERTIFICATES FOR REGISTERED PERSONS */}
                  <div style={{ margin: '0.65rem 0' }}>
                    <button
                      type="button"
                      onClick={() => setBatchModalProgram(prog)}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: stats.recCount > 0 ? '#4338ca' : '#cbd5e1',
                        background: stats.recCount > 0 
                          ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' 
                          : '#f1f5f9',
                        color: stats.recCount > 0 ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.81rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                        boxShadow: stats.recCount > 0 ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Sparkles size={14} />
                      <span>Generate Certificates for Registered ({stats.recCount})</span>
                    </button>
                  </div>

                  {/* Description */}
                  {prog.description && (
                    <p style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      margin: '0 0 0.85rem 0',
                      lineHeight: 1.45
                    }}>
                      {prog.description}
                    </p>
                  )}
                </div>

                {/* Card Footer: Live Registrations Stats */}
                <div style={{
                  borderTop: '1px solid var(--border-color, #e2e8f0)',
                  paddingTop: '0.75rem',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <span title="Students registered in this program" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, color: stats.recCount > 0 ? '#16a34a' : 'inherit' }}>
                      <Users size={12} /> {stats.recCount} Registered
                    </span>
                    <span title="Certificates dumped for this program" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Award size={12} /> {stats.certCount} Certs
                    </span>
                  </div>

                  {stats.recCount > 0 && onSelectProgramFilter && (
                    <button
                      type="button"
                      onClick={() => onSelectProgramFilter(prog.title)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#4f46e5',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '0.1rem 0.3rem',
                        fontSize: '0.74rem',
                        textDecoration: 'underline'
                      }}
                    >
                      View Registrations →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. EDIT PROGRAM MODAL */}
      {editingProgram && (
        <div 
          className="admin-modal-overlay" 
          style={{ zIndex: 1200 }}
          onClick={() => setEditingProgram(null)}
        >
          <div 
            className="admin-modal-container"
            style={{ maxWidth: '560px', padding: '1.75rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="#0284c7" /> Edit Program / Event
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setEditingProgram(null)}
                style={{ padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Program Title *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingProgram.title}
                    onChange={e => setEditingProgram({ ...editingProgram, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      Type / Category
                    </label>
                    <select
                      className="form-input"
                      value={editingProgram.type}
                      onChange={e => setEditingProgram({ ...editingProgram, type: e.target.value })}
                    >
                      {PROGRAM_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                      Event / Program Duration
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingProgram.duration}
                      onChange={e => setEditingProgram({ ...editingProgram, duration: e.target.value })}
                      placeholder="Enter duration manually (e.g. 3 Days, 2 Months, 1 Week, 48 Hours...)"
                    />
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'block' }}>
                      Type as days, months, weeks, or hours manually (e.g. <strong>3 Days</strong>, <strong>1 Month</strong>, <strong>6 Months</strong>, <strong>2 Weeks</strong>)
                    </span>
                  </div>
                </div>

                {/* Edit Certificate Template */}
                <div style={{
                  padding: '0.75rem',
                  background: editingProgram.certificateTemplate ? '#f0fdf4' : '#f8fafc',
                  border: `1.5px dashed ${editingProgram.certificateTemplate ? '#86efac' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Award size={18} color={editingProgram.certificateTemplate ? '#16a34a' : '#64748b'} />
                    <div>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: editingProgram.certificateTemplate ? '#15803d' : '#1e293b' }}>
                        {editingProgram.certificateTemplate ? 'Custom Template Attached' : 'Certificate Template (Optional)'}
                      </span>
                      <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {editingProgram.certificateTemplateName || 'Default official template'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <label style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <UploadCloud size={13} /> {editingProgram.certificateTemplate ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          try {
                            const res = await compressCertificateImage(file);
                            setEditingProgram(prev => ({
                              ...prev,
                              certificateTemplate: res.dataUrl,
                              certificateTemplateName: res.fileName
                            }));
                          } catch (err) {
                            if (showToast) showToast(err.message, 'error');
                          }
                        }}
                      />
                    </label>

                    {editingProgram.certificateTemplate && (
                      <button
                        type="button"
                        onClick={() => setEditingProgram(prev => ({ ...prev, certificateTemplate: null, certificateTemplateName: '' }))}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          padding: '0.35rem',
                          cursor: 'pointer'
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Target Department / Branches
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingProgram.department}
                    onChange={e => setEditingProgram({ ...editingProgram, department: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                    Description
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={editingProgram.description}
                    onChange={e => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingProgram(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. BATCH CERTIFICATE GENERATOR MODAL */}
      {batchModalProgram && (
        <div 
          className="admin-modal-overlay" 
          style={{ zIndex: 1250 }}
          onClick={() => setBatchModalProgram(null)}
        >
          <div 
            className="admin-modal-container"
            style={{ maxWidth: '900px', width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', padding: '1.75rem' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color, #e2e8f0)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ 
                    background: '#e0e7ff', 
                    color: '#4338ca', 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '50px',
                    textTransform: 'uppercase'
                  }}>
                    {batchModalProgram.type}
                  </span>
                  <span style={{ 
                    background: '#eff6ff', 
                    color: '#2563eb', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    padding: '0.2rem 0.55rem', 
                    borderRadius: '50px'
                  }}>
                    ⏱️ {batchModalProgram.duration}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  Batch Certificate Generator: {batchModalProgram.title}
                </h3>
                <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Generate and issue official certificates for all registered participants based on the attached event certificate design.
                </p>
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={() => setBatchModalProgram(null)}
                style={{ padding: '0.4rem' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Template & Status Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {batchModalProgram.certificateTemplate ? (
                  <img
                    src={batchModalProgram.certificateTemplate}
                    alt="Event certificate"
                    style={{
                      width: '85px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1.5px solid #86efac',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Award size={28} />
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {batchModalProgram.certificateTemplate ? 'Custom Event Certificate Active' : 'Official Reference Template Active'}
                    </h5>
                    <span style={{ 
                      background: batchModalProgram.certificateTemplate ? '#dcfce7' : '#f1f5f9', 
                      color: batchModalProgram.certificateTemplate ? '#15803d' : '#475569', 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '50px' 
                    }}>
                      {batchModalProgram.certificateTemplate ? 'Custom Template' : 'Default Template'}
                    </span>
                  </div>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {batchModalProgram.certificateTemplate 
                      ? `${batchModalProgram.certificateTemplateName || 'Event Certificate'} • Certificates for registered persons will be generated with this template`
                      : 'You can upload an event-specific certificate design, or use the official RANBIDGE reference template.'}
                  </p>
                </div>
              </div>

              {/* Template Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {batchModalProgram.certificateTemplate && (
                  <button
                    type="button"
                    onClick={() => setPreviewTemplateProgram(batchModalProgram)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#1e293b',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Eye size={13} /> View Design
                  </button>
                )}

                <label style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 1px 3px rgba(79,70,229,0.2)'
                }}>
                  <UploadCloud size={14} />
                  <span>{batchModalProgram.certificateTemplate ? 'Change Certificate' : 'Upload Event Certificate'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    style={{ display: 'none' }}
                    onChange={e => handleUploadFileForProgram(batchModalProgram.id, e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            {/* Action Bar & Candidate Stats */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Registered Candidates:
                </span>
                <span style={{ 
                  background: '#eff6ff', 
                  color: '#1d4ed8', 
                  fontSize: '0.85rem', 
                  fontWeight: 800, 
                  padding: '0.2rem 0.65rem', 
                  borderRadius: '50px',
                  border: '1px solid #bfdbfe'
                }}>
                  {batchCandidates.length} Persons
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  ({batchCandidates.filter(c => c.verificationStatus === 'verified').length} Verified, {batchCandidates.filter(c => c.verificationStatus !== 'verified').length} Pending)
                </span>
              </div>

              {/* Primary Batch Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                <button
                  type="button"
                  disabled={batchCandidates.length === 0 || isGeneratingAll}
                  onClick={() => handleDownloadAllCertificates(batchCandidates, batchModalProgram)}
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    color: '#334155',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '7px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: batchCandidates.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    opacity: batchCandidates.length === 0 ? 0.6 : 1
                  }}
                >
                  <Download size={14} /> Download All ({batchCandidates.length})
                </button>

                <button
                  type="button"
                  disabled={batchCandidates.length === 0 || isGeneratingAll}
                  onClick={() => handleGenerateAllForProgram(batchModalProgram)}
                  style={{
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.55rem 1.25rem',
                    borderRadius: '7px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: batchCandidates.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                    opacity: batchCandidates.length === 0 ? 0.6 : 1
                  }}
                >
                  <Sparkles size={15} />
                  <span>{isGeneratingAll ? `Generating (${generationProgress.current}/${generationProgress.total})...` : `⚡ Generate All Certificates Now`}</span>
                </button>
              </div>
            </div>

            {/* Candidates List / Table */}
            <div style={{
              flex: '1 1 auto',
              overflowY: 'auto',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '8px',
              minHeight: '220px',
              maxHeight: '440px'
            }}>
              {batchCandidates.length === 0 ? (
                <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                  <Users size={36} color="#94a3b8" style={{ marginBottom: '0.65rem' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.35rem 0', color: 'var(--text-main)' }}>
                    No Registered Candidates Found
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0 auto', maxWidth: '420px' }}>
                    There are currently no students registered under the program title <strong>"{batchModalProgram.title}"</strong>. When students register, they will appear here automatically.
                  </p>
                </div>
              ) : (
                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #e2e8f0' }}>
                    <tr>
                      <th style={{ padding: '0.7rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Candidate Name</th>
                      <th style={{ padding: '0.7rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Roll Number</th>
                      <th style={{ padding: '0.7rem 0.85rem', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Institution / College</th>
                      <th style={{ padding: '0.7rem 0.85rem', textAlign: 'center', fontWeight: 700, color: '#475569' }}>Status</th>
                      <th style={{ padding: '0.7rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchCandidates.map((student, idx) => {
                      const isVerified = student.verificationStatus === 'verified';
                      return (
                        <tr key={student.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.7rem 0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {student.fullName || student.name || 'Participant Name'}
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', fontFamily: 'monospace', fontWeight: 700, color: '#4338ca' }}>
                            {student.rollNumber || 'N/A'}
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', color: 'var(--text-muted)' }}>
                            {student.college || student.institution || 'N/A'}
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', textAlign: 'center' }}>
                            {isVerified ? (
                              <span style={{ 
                                background: '#dcfce7', 
                                color: '#15803d', 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '50px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <Check size={11} /> Certificate Ready
                              </span>
                            ) : (
                              <span style={{ 
                                background: '#fffbeb', 
                                color: '#b45309', 
                                fontSize: '0.72rem', 
                                fontWeight: 700, 
                                padding: '0.2rem 0.55rem', 
                                borderRadius: '50px' 
                              }}>
                                Pending Approval
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.7rem 0.85rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              {!isVerified && onVerifyRecord && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    await onVerifyRecord(student.id || student.firestoreId);
                                    if (showToast) showToast(`✅ Verified & generated certificate for ${student.fullName}!`, 'success');
                                  }}
                                  style={{
                                    background: '#16a34a',
                                    border: 'none',
                                    color: '#ffffff',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '0.25rem 0.55rem',
                                    borderRadius: '5px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Verify
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setPreviewStudentCert(student)}
                                style={{
                                  background: '#eff6ff',
                                  border: '1px solid #bfdbfe',
                                  color: '#1d4ed8',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Eye size={12} /> Preview
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadSingleStudentCert(student, batchModalProgram)}
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.25rem 0.55rem',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                              >
                                <Download size={12} /> PNG
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setBatchModalProgram(null)}
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. INDIVIDUAL STUDENT CERTIFICATE PREVIEW MODAL */}
      {previewStudentCert && (
        <div 
          className="admin-modal-overlay" 
          style={{ zIndex: 1300 }}
          onClick={() => setPreviewStudentCert(null)}
        >
          <div 
            className="admin-modal-container"
            style={{ maxWidth: '980px', width: '95%', maxHeight: '95vh', overflowY: 'auto', padding: '1.75rem' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} color="#4f46e5" />
                  Certificate Preview: {previewStudentCert.fullName}
                </h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Generated using {batchModalProgram?.certificateTemplate ? 'custom uploaded event certificate template' : 'official reference certificate template'}.
                </p>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setPreviewStudentCert(null)}
                style={{ padding: '0.35rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1rem', display: 'flex', justifyContent: 'center' }}>
              <CertificateGenerator
                record={{
                  ...previewStudentCert,
                  workshopName: batchModalProgram?.title || previewStudentCert.workshopName,
                  workshopDuration: batchModalProgram?.duration || previewStudentCert.workshopDuration,
                  certificateTemplate: batchModalProgram?.certificateTemplate || previewStudentCert.certificateTemplate
                }}
                showActions={true}
                showToast={showToast}
                customTemplateUrl={batchModalProgram?.certificateTemplate}
                portalSettings={portalSettings}
              />
            </div>
          </div>
        </div>
      )}

      {/* 8. TEMPLATE IMAGE FULL PREVIEW MODAL */}
      {previewTemplateProgram && (
        <div 
          className="admin-modal-overlay" 
          style={{ zIndex: 1300 }}
          onClick={() => setPreviewTemplateProgram(null)}
        >
          <div 
            className="admin-modal-container"
            style={{ maxWidth: '850px', width: '95%', maxHeight: '90vh', padding: '1.5rem', textAlign: 'center' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Event Certificate Template: {previewTemplateProgram.title}
              </h4>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setPreviewTemplateProgram(null)}
              >
                <X size={18} />
              </button>
            </div>
            {previewTemplateProgram.certificateTemplate ? (
              <img
                src={previewTemplateProgram.certificateTemplate}
                alt="Full template"
                style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
            ) : (
              <p>No custom certificate attached.</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
