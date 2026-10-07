import React, { useState, useMemo } from 'react';
import { Shield, X, Users, Building, Presentation, Search, Database, FileSpreadsheet, Trash2, FolderOpen, Trash } from 'lucide-react';

export default function AdminPortalModal({
  isOpen,
  onClose,
  records,
  onDeleteRecord,
  onClearAllRecords,
  onLoadSampleData,
  showToast
}) {
  const [searchQuery, setSearchQuery] = useState('');

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

  const stats = useMemo(() => {
    const total = records.length;
    const collegesCount = new Set(records.map(r => r.college ? r.college.toLowerCase().trim() : '')).size;
    const workshopsCount = new Set(records.map(r => r.workshopName ? r.workshopName.toLowerCase().trim() : '')).size;
    return { total, collegesCount, workshopsCount };
  }, [records]);

  if (!isOpen) return null;

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

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-container" onClick={(e) => e.stopPropagation()}>
        
        {/* Admin Modal Header */}
        <div className="admin-header">
          <div className="admin-header-title">
            <div className="admin-badge">
              <Shield size={14} /> Secret Admin Portal
            </div>
            <h2>RANBIDGE Verification Dashboard</h2>
            <p>Manage, inspect, filter, and export all workshop participant registrations.</p>
          </div>
          <button className="btn-icon-close" onClick={onClose} title="Close Admin Portal">
            <X size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon primary">
              <Users />
            </div>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Registrations</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon success">
              <Building />
            </div>
            <div>
              <div className="stat-value">{stats.collegesCount}</div>
              <div className="stat-label">Colleges Represented</div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon accent">
              <Presentation />
            </div>
            <div>
              <div className="stat-value">{stats.workshopsCount}</div>
              <div className="stat-label">Workshops Conducted</div>
            </div>
          </div>
        </div>

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
                      <button
                        className="btn-action-del"
                        onClick={() => onDeleteRecord(rec.id)}
                        title="Delete Record"
                      >
                        <Trash size={15} />
                      </button>
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

      </div>
    </div>
  );
}
