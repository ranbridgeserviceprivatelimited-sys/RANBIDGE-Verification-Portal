import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  X, 
  Users, 
  Building, 
  Search, 
  Database, 
  FileSpreadsheet, 
  Trash2, 
  FolderOpen, 
  Trash, 
  Award, 
  FileUp, 
  ArrowLeft, 
  Download, 
  FileText, 
  ChevronRight,
  Filter,
  UserCheck,
  User,
  GraduationCap,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import CertificateDumpUpload from './CertificateDumpUpload';
import CertificateGenerator from './CertificateGenerator';

export default function AdminPortalModal({
  isOpen,
  onClose,
  records,
  certificates,
  onDeleteRecord,
  onClearAllRecords,
  onLoadSampleData,
  onSaveCertificates,
  onDeleteCertificate,
  showToast
}) {
  const [adminTab, setAdminTab] = useState('registrations'); // 'registrations' | 'certificates'
  const [searchQuery, setSearchQuery] = useState('');

  // Colleges Grid Modal State
  const [isCollegesModalOpen, setIsCollegesModalOpen] = useState(false);
  const [selectedCollegeName, setSelectedCollegeName] = useState(null);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');

  // Users Directory Inspector Modal State
  const [isUsersDirectoryOpen, setIsUsersDirectoryOpen] = useState(false);
  const [userDirSearchQuery, setUserDirSearchQuery] = useState('');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('');

  const [selectedPreviewCert, setSelectedPreviewCert] = useState(null);
  const [selectedGeneratedCertRecord, setSelectedGeneratedCertRecord] = useState(null);

  // Keyboard Escape key handler to close modals in priority order
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedGeneratedCertRecord) {
          setSelectedGeneratedCertRecord(null);
        } else if (selectedPreviewCert) {
          setSelectedPreviewCert(null);
        } else if (isUsersDirectoryOpen) {
          setIsUsersDirectoryOpen(false);
        } else if (selectedCollegeName) {
          setSelectedCollegeName(null);
        } else if (isCollegesModalOpen) {
          setIsCollegesModalOpen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isCollegesModalOpen, selectedCollegeName, selectedPreviewCert, selectedGeneratedCertRecord, isUsersDirectoryOpen, onClose]);

  // College breakdown analysis from both records and dumped certificates
  const collegeBreakdown = useMemo(() => {
    const map = {};

    const getOrCreateCollege = (nameStr) => {
      const canonical = nameStr && nameStr.trim() ? nameStr.trim() : 'Unspecified College';
      const key = canonical.toLowerCase();
      if (!map[key]) {
        map[key] = {
          name: canonical,
          records: [],
          certificates: []
        };
      }
      return map[key];
    };

    // 1. Process Registrations
    records.forEach(rec => {
      const entry = getOrCreateCollege(rec.college);
      entry.records.push(rec);
    });

    // 2. Process Dumped Certificates
    certificates.forEach(cert => {
      let matchedCollege = cert.college ? cert.college.trim() : null;

      if (!matchedCollege && cert.rollNumber) {
        const found = records.find(r => r.rollNumber && r.rollNumber.trim().toUpperCase() === cert.rollNumber.trim().toUpperCase());
        if (found && found.college) {
          matchedCollege = found.college.trim();
        }
      }

      if (!matchedCollege && cert.studentName) {
        const found = records.find(r => r.fullName && r.fullName.trim().toLowerCase() === cert.studentName.trim().toLowerCase());
        if (found && found.college) {
          matchedCollege = found.college.trim();
        }
      }

      const entry = getOrCreateCollege(matchedCollege || 'Unspecified College');
      if (!entry.certificates.some(c => c.id === cert.id)) {
        entry.certificates.push(cert);
      }
    });

    return Object.values(map);
  }, [records, certificates]);

  const stats = useMemo(() => {
    const total = records.length;
    const validColleges = collegeBreakdown.filter(c => c.name !== 'Unspecified College' || c.records.length > 0 || c.certificates.length > 0);
    const collegesCount = validColleges.length;
    const certsCount = certificates.length;
    return { total, collegesCount, certsCount };
  }, [records, certificates, collegeBreakdown]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return records;
    return records.filter(r => 
      (r.fullName && r.fullName.toLowerCase().includes(q)) ||
      (r.college && r.college.toLowerCase().includes(q)) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
      (r.department && r.department.toLowerCase().includes(q)) ||
      (r.workshopName && r.workshopName.toLowerCase().includes(q)) ||
      (r.id && r.id.toLowerCase().includes(q))
    );
  }, [records, searchQuery]);

  // Filtered Users Directory List
  const filteredUsersDirectory = useMemo(() => {
    return records.filter(user => {
      const q = userDirSearchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (user.fullName && user.fullName.toLowerCase().includes(q)) ||
        (user.rollNumber && user.rollNumber.toLowerCase().includes(q)) ||
        (user.college && user.college.toLowerCase().includes(q)) ||
        (user.department && user.department.toLowerCase().includes(q)) ||
        (user.workshopName && user.workshopName.toLowerCase().includes(q)) ||
        (user.id && user.id.toLowerCase().includes(q))
      );

      const matchesCollege = !selectedCollegeFilter || user.college === selectedCollegeFilter;
      const matchesWorkshop = !selectedWorkshopFilter || user.workshopName === selectedWorkshopFilter;

      return matchesSearch && matchesCollege && matchesWorkshop;
    });
  }, [records, userDirSearchQuery, selectedCollegeFilter, selectedWorkshopFilter]);

  // Unique College and Workshop lists for dropdown filters
  const uniqueColleges = useMemo(() => {
    return Array.from(new Set(records.map(r => r.college).filter(Boolean))).sort();
  }, [records]);

  const uniqueWorkshops = useMemo(() => {
    return Array.from(new Set(records.map(r => r.workshopName).filter(Boolean))).sort();
  }, [records]);

  // Filtered list of colleges for the Colleges Grid Modal
  const filteredColleges = useMemo(() => {
    const q = collegeSearchQuery.toLowerCase().trim();
    if (!q) return collegeBreakdown;
    return collegeBreakdown.filter(col => 
      col.name.toLowerCase().includes(q) ||
      col.records.some(r => (r.fullName && r.fullName.toLowerCase().includes(q)) || (r.rollNumber && r.rollNumber.toLowerCase().includes(q))) ||
      col.certificates.some(c => (c.fileName && c.fileName.toLowerCase().includes(q)) || (c.rollNumber && c.rollNumber.toLowerCase().includes(q)) || (c.studentName && c.studentName.toLowerCase().includes(q)))
    );
  }, [collegeBreakdown, collegeSearchQuery]);

  const activeCollege = useMemo(() => {
    if (!selectedCollegeName) return null;
    return collegeBreakdown.find(c => c.name.toLowerCase() === selectedCollegeName.toLowerCase());
  }, [collegeBreakdown, selectedCollegeName]);

  const handleDownloadCert = (cert) => {
    const link = document.createElement('a');
    link.href = cert.fileData;
    link.download = cert.fileName || `${cert.rollNumber || 'Certificate'}.${cert.fileType || 'pdf'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      showToast('⚠️ No records to export');
      return;
    }

    const headers = ['ID', 'Full Name', 'College', 'Roll Number', 'Passout Year', 'Department', 'Workshop Name', 'Workshop Date', 'Submitted At'];
    const rows = records.map(r => [
      r.id,
      `"${(r.fullName || '').replace(/"/g, '""')}"`,
      `"${(r.college || '').replace(/"/g, '""')}"`,
      `"${(r.rollNumber || '').replace(/"/g, '""')}"`,
      r.passoutYear,
      `"${(r.department || '').replace(/"/g, '""')}"`,
      `"${(r.workshopName || '').replace(/"/g, '""')}"`,
      r.workshopDate,
      r.submittedAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RANBIDGE_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 CSV file exported successfully!');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Admin Modal Header */}
          <div className="admin-header">
            <div className="admin-header-title">
              <div className="admin-badge">
                <Shield size={14} /> Secret Admin Portal
              </div>
              <h2>RANBIDGE Verification Dashboard</h2>
              <p>Manage registrations, inspect user profiles, and dump certificate files for user downloads.</p>
            </div>
            <button className="btn-icon-close" onClick={onClose} title="Close Admin Portal (Esc)">
              <X size={20} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="admin-stats-grid">
            <div 
              className="admin-stat-card clickable" 
              onClick={() => setIsUsersDirectoryOpen(true)}
              title="Click to check all user registration profiles stored in Firebase"
            >
              <div className="stat-icon primary">
                <Users />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{stats.total}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 800 }}>
                    Check Users &rarr;
                  </span>
                </div>
                <div className="stat-label">Total Registered Users</div>
              </div>
            </div>

            {/* Clickable Colleges Count Stat Card Container */}
            <div 
              className="admin-stat-card clickable" 
              onClick={() => setIsCollegesModalOpen(true)}
              title="Click to open Colleges & Certificates Grid View"
            >
              <div className="stat-icon success">
                <Building />
              </div>
              <div style={{ flex: 1 }}>
                <div className="stat-value" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{stats.collegesCount}</span>
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.55rem', borderRadius: '50px', fontWeight: 800 }}>
                    View Grid &rarr;
                  </span>
                </div>
                <div className="stat-label">Colleges Represented</div>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="stat-icon accent">
                <Award />
              </div>
              <div>
                <div className="stat-value">{stats.certsCount}</div>
                <div className="stat-label">Dumped Certificates</div>
              </div>
            </div>
          </div>

          {/* Admin Section Tabs */}
          <div className="nav-tabs" style={{ marginBottom: '1.25rem', width: 'fit-content' }}>
            <button
              className={`nav-tab ${adminTab === 'registrations' ? 'active' : ''}`}
              onClick={() => setAdminTab('registrations')}
            >
              <Users size={16} />
              <span>Registration Records ({records.length})</span>
            </button>
            <button
              className={`nav-tab ${adminTab === 'certificates' ? 'active' : ''}`}
              onClick={() => setAdminTab('certificates')}
            >
              <FileUp size={16} />
              <span>Dump Certificates ({certificates.length})</span>
            </button>
          </div>

          {adminTab === 'registrations' ? (
            <>
              {/* Admin Toolbar */}
              <div className="admin-toolbar">
                <div className="admin-search-wrapper">
                  <Search className="search-icon" />
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search by name, college, roll number, department, workshop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="admin-actions">
                  <button 
                    className="btn-primary btn-sm" 
                    onClick={() => setIsUsersDirectoryOpen(true)}
                    title="Check all registered users data stored in Firebase"
                    style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  >
                    <UserCheck size={15} /> Check Users Data ({records.length})
                  </button>
                  <button className="btn-secondary btn-sm" onClick={onLoadSampleData} title="Load Demo Records">
                    <Database size={15} /> Load Demo Data
                  </button>
                  <button className="btn-primary btn-sm" onClick={handleExportCsv} title="Download CSV report">
                    <FileSpreadsheet size={15} /> Export CSV
                  </button>
                  <button className="btn-danger btn-sm" onClick={onClearAllRecords} title="Clear all registrations">
                    <Trash2 size={15} /> Clear All
                  </button>
                </div>
              </div>

              {/* Admin Data Table */}
              <div className="admin-table-wrapper">
                {filteredRecords.length > 0 ? (
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>ID</th>
                        <th>Participant Name</th>
                        <th>College</th>
                        <th>Roll Number</th>
                        <th>Passout</th>
                        <th>Department</th>
                        <th>Workshop</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((rec, index) => (
                        <tr key={rec.id || index}>
                          <td><strong>{index + 1}</strong></td>
                          <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{rec.id}</code></td>
                          <td><strong>{rec.fullName}</strong></td>
                          <td>{rec.college}</td>
                          <td><code>{rec.rollNumber}</code></td>
                          <td>{rec.passoutYear}</td>
                          <td>{rec.department}</td>
                          <td>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                              {rec.workshopName}
                            </span>
                          </td>
                          <td>{rec.workshopDate || 'N/A'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                              <button
                                className="btn-secondary btn-sm"
                                onClick={() => setSelectedGeneratedCertRecord(rec)}
                                title="View & Download Official Certificate"
                                style={{ padding: '0.35rem 0.55rem' }}
                              >
                                <Award size={15} color="var(--primary)" />
                              </button>
                              <button
                                className="btn-action-del"
                                onClick={() => onDeleteRecord(rec.id)}
                                title="Delete Record"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="admin-empty-state">
                    <FolderOpen size={48} />
                    <h3>No Registration Records Found</h3>
                    <p>Submit a registration form or click "Load Demo Data" to populate the Admin Portal.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <CertificateDumpUpload
              certificates={certificates}
              onSaveCertificates={onSaveCertificates}
              onDeleteCertificate={onDeleteCertificate}
              showToast={showToast}
            />
          )}

        </div>
      </div>

      {/* CHECK USERS DATA DIRECTORY MODAL */}
      {isUsersDirectoryOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1150 }} onClick={() => setIsUsersDirectoryOpen(false)}>
          <div 
            className="admin-modal-container" 
            style={{ maxWidth: '1150px', maxHeight: '90vh' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-header">
              <div className="admin-header-title">
                <div className="admin-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                  <UserCheck size={14} /> Firebase Live Registered Users Database
                </div>
                <h2>
                  Registered Users Directory ({filteredUsersDirectory.length} Students)
                </h2>
                <p>
                  Inspect student registration profiles, verify roll numbers, and view generated certificates stored in Firebase.
                </p>
              </div>
              <button 
                className="btn-icon-close" 
                onClick={() => setIsUsersDirectoryOpen(false)} 
                title="Close Users Directory (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar Filters */}
            <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div className="admin-search-wrapper" style={{ minWidth: '280px', flex: 1 }}>
                <Search className="search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search student name, roll number, college, department, workshop..."
                  value={userDirSearchQuery}
                  onChange={(e) => setUserDirSearchQuery(e.target.value)}
                />
              </div>

              {/* College Filter Dropdown */}
              <select
                className="admin-search-input"
                style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={selectedCollegeFilter}
                onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              >
                <option value="">All Colleges ({uniqueColleges.length})</option>
                {uniqueColleges.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>

              {/* Workshop Filter Dropdown */}
              <select
                className="admin-search-input"
                style={{ width: 'auto', minWidth: '180px', cursor: 'pointer' }}
                value={selectedWorkshopFilter}
                onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
              >
                <option value="">All Workshops ({uniqueWorkshops.length})</option>
                {uniqueWorkshops.map((w, i) => (
                  <option key={i} value={w}>{w}</option>
                ))}
              </select>

              {(selectedCollegeFilter || selectedWorkshopFilter || userDirSearchQuery) && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setUserDirSearchQuery('');
                    setSelectedCollegeFilter('');
                    setSelectedWorkshopFilter('');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* USERS DIRECTORY GRID CARDS VIEW */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredUsersDirectory.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                  gap: '1.25rem',
                  paddingRight: '4px'
                }}>
                  {filteredUsersDirectory.map((user, idx) => (
                    <div
                      key={user.id || idx}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition)'
                      }}
                      className="college-card"
                    >
                      <div>
                        {/* Header Profile Ribbon */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1.1rem'
                            }}>
                              <User size={22} />
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: '1.2' }}>
                                {user.fullName}
                              </h3>
                              <code style={{ fontSize: '0.75rem', background: '#f1f5f9', color: 'var(--primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                                {user.id}
                              </code>
                            </div>
                          </div>

                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: '#dcfce7',
                            color: '#15803d',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '50px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        </div>

                        {/* Details List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.85rem', background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Roll Number: </span>
                            <strong style={{ color: 'var(--primary)' }}>{user.rollNumber}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>College: </span>
                            <strong>{user.college}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Department: </span>
                            <span>{user.department} ({user.passoutYear})</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Workshop: </span>
                            <strong style={{ color: 'var(--text-main)' }}>{user.workshopName}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Date: </span>
                            <span>{user.workshopDate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => setSelectedGeneratedCertRecord(user)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        >
                          <Award size={14} /> View Certificate
                        </button>

                        <button
                          className="btn-action-del"
                          onClick={() => onDeleteRecord(user.id)}
                          title="Delete User Record"
                        >
                          <Trash size={15} />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <UserCheck size={48} />
                  <h3>No Users Found</h3>
                  <p>Try clearing filters or search query to view registered users.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* COLLEGES & CERTIFICATES INTERACTIVE GRID MODAL */}
      {isCollegesModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsCollegesModalOpen(false)}>
          <div 
            className="admin-modal-container" 
            style={{ maxWidth: '1100px', maxHeight: '90vh' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-header">
              <div className="admin-header-title">
                <div className="admin-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                  <Building size={14} /> Colleges Analytics & Certificate Dump
                </div>
                <h2>
                  {selectedCollegeName ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button 
                        className="btn-secondary btn-sm" 
                        onClick={() => setSelectedCollegeName(null)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                      >
                        <ArrowLeft size={14} /> Back to All Colleges
                      </button>
                      <span>{selectedCollegeName}</span>
                    </span>
                  ) : (
                    `Represented Colleges Grid (${stats.collegesCount})`
                  )}
                </h2>
                <p>
                  {selectedCollegeName 
                    ? `Inspecting certificates and registrations for ${selectedCollegeName}` 
                    : `Analyze all represented colleges and inspect dumped certificates available in the portal.`}
                </p>
              </div>
              <button 
                className="btn-icon-close" 
                onClick={() => {
                  if (selectedCollegeName) {
                    setSelectedCollegeName(null);
                  } else {
                    setIsCollegesModalOpen(false);
                  }
                }} 
                title="Close Colleges Modal (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Toolbar: Search & Analytics summary */}
            <div className="admin-toolbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div className="admin-search-wrapper" style={{ minWidth: '280px' }}>
                <Search className="search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder={selectedCollegeName ? "Search certificates in this college..." : "Search college name, student name, roll number..."}
                  value={collegeSearchQuery}
                  onChange={(e) => setCollegeSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <Award size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Total Dumped Certificates: <strong>{certificates.length}</strong>
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Total Registrations: <strong>{records.length}</strong>
                </span>
              </div>
            </div>

            {/* MODAL CONTENT VIEW */}
            {selectedCollegeName && activeCollege ? (
              /* VIEW: SPECIFIC COLLEGE CERTIFICATES & PARTICIPANTS GRID */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
                <div style={{
                  background: 'var(--bg-secondary)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {activeCollege.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {activeCollege.certificates.length} Certificate Document(s) Dumped &bull; {activeCollege.records.length} Student Registration(s)
                    </p>
                  </div>
                  <button className="btn-secondary btn-sm" onClick={() => setSelectedCollegeName(null)}>
                    <ArrowLeft size={14} /> Switch College
                  </button>
                </div>

                {/* College Dumped Certificates Section */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Award size={18} color="var(--primary)" />
                    Dumped Certificates Grid ({activeCollege.certificates.length})
                  </h4>

                  {activeCollege.certificates.length > 0 ? (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '1rem',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      paddingRight: '4px'
                    }}>
                      {activeCollege.certificates
                        .filter(cert => {
                          const q = collegeSearchQuery.toLowerCase().trim();
                          if (!q) return true;
                          return (
                            (cert.fileName && cert.fileName.toLowerCase().includes(q)) ||
                            (cert.studentName && cert.studentName.toLowerCase().includes(q)) ||
                            (cert.rollNumber && cert.rollNumber.toLowerCase().includes(q))
                          );
                        })
                        .map((cert, idx) => {
                          const isImage = cert.fileType === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(cert.fileName || '');
                          const isPdf = cert.fileType === 'pdf' || /\.pdf$/i.test(cert.fileName || '');
                          const isPpt = cert.fileType === 'ppt' || /\.(ppt|pptx)$/i.test(cert.fileName || '');

                          return (
                            <div
                              key={cert.id || idx}
                              onClick={() => setSelectedPreviewCert(cert)}
                              className="cert-grid-card"
                              style={{
                                background: '#ffffff',
                                border: '1.5px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                transition: 'all 0.25s ease',
                                display: 'flex',
                                flexDirection: 'column'
                              }}
                            >
                              {/* Preview Box Header */}
                              <div style={{
                                height: '130px',
                                background: 'var(--bg-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderBottom: '1px solid var(--border-color)',
                                position: 'relative'
                              }}>
                                {isImage && cert.fileData ? (
                                  <img src={cert.fileData} alt={cert.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : isPdf ? (
                                  <div style={{ textAlign: 'center', color: '#dc2626' }}>
                                    <FileText size={42} />
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '0.2rem' }}>PDF DOCUMENT</div>
                                  </div>
                                ) : (
                                  <Award size={42} color="var(--primary)" />
                                )}

                                <span style={{
                                  position: 'absolute',
                                  top: '6px',
                                  right: '6px',
                                  background: isPdf ? '#fee2e2' : isImage ? '#dbeafe' : '#fef3c7',
                                  color: isPdf ? '#dc2626' : isImage ? '#1d4ed8' : '#b45309',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '4px',
                                  textTransform: 'uppercase'
                                }}>
                                  {cert.fileType}
                                </span>
                              </div>

                              <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={cert.fileName}>
                                    {cert.fileName}
                                  </div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                    {cert.studentName || 'Participant'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                                  <code style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                                    {cert.rollNumber || 'N/A'}
                                  </code>
                                  <button
                                    className="btn-primary btn-sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadCert(cert);
                                    }}
                                    title="Download Certificate"
                                    style={{ padding: '0.35rem 0.5rem' }}
                                  >
                                    <Download size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Award size={36} color="var(--text-light)" style={{ display: 'block', margin: '0 auto 0.5rem' }} />
                      <p style={{ fontSize: '0.9rem' }}>No dumped certificates linked to this college yet.</p>
                    </div>
                  )}
                </div>

                {/* College Student Registrations List */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={18} color="var(--success)" />
                    Registered Students ({activeCollege.records.length})
                  </h4>

                  {activeCollege.records.length > 0 ? (
                    <div className="admin-table-wrapper" style={{ maxHeight: '240px' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Participant Name</th>
                            <th>Roll Number</th>
                            <th>Department</th>
                            <th>Passout</th>
                            <th>Workshop</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activeCollege.records.map((rec, i) => (
                            <tr key={rec.id || i}>
                              <td><strong>{i + 1}</strong></td>
                              <td><strong>{rec.fullName}</strong></td>
                              <td><code>{rec.rollNumber}</code></td>
                              <td>{rec.department}</td>
                              <td>{rec.passoutYear}</td>
                              <td><span style={{ color: 'var(--primary)', fontWeight: 600 }}>{rec.workshopName}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ background: '#f8fafc', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '0.88rem' }}>No registration records submitted from this college yet.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* VIEW: ALL COLLEGES GRID */
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredColleges.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.25rem',
                    paddingRight: '4px'
                  }}>
                    {filteredColleges.map((col, idx) => (
                      <div
                        key={idx}
                        className="college-card"
                        onClick={() => setSelectedCollegeName(col.name)}
                        title={`Click to view certificates for ${col.name}`}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--success-light)',
                              color: 'var(--success)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <Building size={22} />
                            </div>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: '#f1f5f9',
                              color: 'var(--text-muted)',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '50px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}>
                              Inspect <ChevronRight size={14} />
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                            {col.name}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                          <span style={{
                            background: col.certificates.length > 0 ? 'var(--primary-light)' : '#f1f5f9',
                            color: col.certificates.length > 0 ? 'var(--primary)' : 'var(--text-muted)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <Award size={14} /> {col.certificates.length} Certificate(s)
                          </span>

                          <span style={{
                            background: col.records.length > 0 ? 'var(--success-light)' : '#f1f5f9',
                            color: col.records.length > 0 ? 'var(--success)' : 'var(--text-muted)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            padding: '0.3rem 0.65rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}>
                            <Users size={14} /> {col.records.length} Student(s)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-empty-state">
                    <Building size={48} />
                    <h3>No Colleges Found</h3>
                    <p>Try searching for a different college name or roll number.</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* FULL SCREEN LIGHTBOX CERTIFICATE PREVIEW MODAL */}
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
                  Roll No: <strong>{selectedPreviewCert.rollNumber || 'N/A'}</strong>
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

            {/* Certificate Preview Box */}
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
                  <h4>PowerPoint / Document File</h4>
                  <p style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Click Download to view this file on your device.
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Delete & Download (Icon-Only buttons) */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              {onDeleteCertificate && (
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
              )}
              <button
                className="btn-primary"
                onClick={() => handleDownloadCert(selectedPreviewCert)}
                title="Download File"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Download size={20} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC OFFICIAL RANBIDGE CERTIFICATE GENERATOR MODAL */}
      {selectedGeneratedCertRecord && (
        <div className="admin-modal-overlay" style={{ zIndex: 1250 }} onClick={() => setSelectedGeneratedCertRecord(null)}>
          <div className="pin-modal-container" style={{ maxWidth: '900px', width: '92%', padding: '1.75rem' }} onClick={(e) => e.stopPropagation()}>
            <button className="btn-icon-close pin-close-pos" onClick={() => setSelectedGeneratedCertRecord(null)} title="Close Certificate (Esc)">
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
                  borderRadius: '4px'
                }}>
                  Official RANBIDGE Certificate Generator
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Roll No: <strong>{selectedGeneratedCertRecord.rollNumber}</strong>
                </span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedGeneratedCertRecord.fullName}
              </h3>
            </div>

            <CertificateGenerator record={selectedGeneratedCertRecord} showActions={true} />
          </div>
        </div>
      )}
    </>
  );
}
