import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Database, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle,
  Download,
  UserCheck
} from 'lucide-react';

export default function MasterRollDump({
  masterDump = [],
  records = [],
  onSaveMasterDump,
  onDeleteMasterEntry,
  onClearAllMasterDump,
  onLoadSampleMasterData,
  showToast
}) {
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'file' | 'manual'
  const [rawText, setRawText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'matched' | 'unmatched'

  // Single entry form state
  const [singleEntry, setSingleEntry] = useState({
    rollNumber: '',
    fullName: '',
    college: '',
    department: '',
    passoutYear: '2026',
    workshopName: ''
  });

  // Calculate matched registrations mapping
  const matchedMap = useMemo(() => {
    const map = new Map();
    records.forEach(rec => {
      if (rec.rollNumber) {
        map.set(rec.rollNumber.trim().toUpperCase(), rec);
      }
    });
    return map;
  }, [records]);

  // Statistics
  const stats = useMemo(() => {
    const total = masterDump.length;
    let matchedCount = 0;
    masterDump.forEach(item => {
      if (item.rollNumber && matchedMap.has(item.rollNumber.trim().toUpperCase())) {
        matchedCount++;
      }
    });
    const pendingCount = total - matchedCount;
    return { total, matchedCount, pendingCount };
  }, [masterDump, matchedMap]);

  // Parse bulk text (CSV or comma/tab separated text lines)
  const parsedPreview = useMemo(() => {
    if (!rawText.trim()) return [];
    const lines = rawText.split('\n');
    const items = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      // Split by comma, tab, or pipe
      const parts = trimmed.split(/[,;\t|]+/).map(p => p.trim());
      if (parts.length >= 2) {
        const rollNumber = parts[0].toUpperCase();
        const fullName = parts[1];
        const college = parts[2] || '';
        const department = parts[3] || '';
        const workshopName = parts[4] || '';

        if (rollNumber && fullName) {
          items.push({
            id: 'DUMP-' + Math.floor(100000 + Math.random() * 900000),
            rollNumber,
            fullName,
            college,
            department,
            workshopName,
            addedAt: new Date().toLocaleString()
          });
        }
      } else if (parts.length === 1 && parts[0].length >= 3) {
        // Just roll number line
        items.push({
          id: 'DUMP-' + Math.floor(100000 + Math.random() * 900000),
          rollNumber: parts[0].toUpperCase(),
          fullName: 'Student (' + parts[0].toUpperCase() + ')',
          college: '',
          department: '',
          workshopName: '',
          addedAt: new Date().toLocaleString()
        });
      }
    });

    return items;
  }, [rawText]);

  // Handle Bulk Paste Submit
  const handleBulkSubmit = (e) => {
    e.preventDefault();
    if (parsedPreview.length === 0) {
      if (showToast) showToast('⚠️ No valid Roll Numbers and Names found in input text!');
      return;
    }

    onSaveMasterDump(parsedPreview);
    setRawText('');
    if (showToast) showToast(`Successfully dumped ${parsedPreview.length} roll number & name record(s)!`);
  };

  // Handle Single Entry Submit
  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (!singleEntry.rollNumber.trim() || !singleEntry.fullName.trim()) {
      if (showToast) showToast('⚠️ Please enter both Roll Number and Full Name!');
      return;
    }

    const newEntry = {
      id: 'DUMP-' + Math.floor(100000 + Math.random() * 900000),
      rollNumber: singleEntry.rollNumber.trim().toUpperCase(),
      fullName: singleEntry.fullName.trim(),
      college: singleEntry.college.trim(),
      department: singleEntry.department.trim(),
      passoutYear: singleEntry.passoutYear.trim(),
      workshopName: singleEntry.workshopName.trim(),
      addedAt: new Date().toLocaleString()
    };

    onSaveMasterDump([newEntry]);
    setSingleEntry({
      rollNumber: '',
      fullName: '',
      college: '',
      department: '',
      passoutYear: '2026',
      workshopName: ''
    });
    if (showToast) showToast(`Added master dump for ${newEntry.fullName} (${newEntry.rollNumber})`);
  };

  // Handle CSV/TXT File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setRawText(content);
      setActiveInputTab('paste');
      if (showToast) showToast(`Loaded file content from ${file.name}`);
    };
    reader.readAsText(file);
  };

  // Export Master Data CSV
  const handleExportCsv = () => {
    if (masterDump.length === 0) {
      if (showToast) showToast('⚠️ No dumped data to export');
      return;
    }

    const headers = ['ID', 'Roll Number', 'Full Name', 'College', 'Department', 'Workshop', 'Matched Student', 'Added At'];
    const rows = masterDump.map(m => {
      const matched = matchedMap.get(m.rollNumber.trim().toUpperCase());
      return [
        m.id,
        `"${(m.rollNumber || '').replace(/"/g, '""')}"`,
        `"${(m.fullName || '').replace(/"/g, '""')}"`,
        `"${(m.college || '').replace(/"/g, '""')}"`,
        `"${(m.department || '').replace(/"/g, '""')}"`,
        `"${(m.workshopName || '').replace(/"/g, '""')}"`,
        matched ? `"${matched.fullName} (${matched.id})"` : 'Not Registered Yet',
        m.addedAt
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RANBIDGE_Master_Roll_Dump_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('📊 Master Roll Dump exported to CSV!');
  };

  // Filtered Master Dump items
  const filteredMasterDump = useMemo(() => {
    return masterDump.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const rollKey = item.rollNumber ? item.rollNumber.trim().toUpperCase() : '';
      const isMatched = matchedMap.has(rollKey);

      if (filterStatus === 'matched' && !isMatched) return false;
      if (filterStatus === 'unmatched' && isMatched) return false;

      if (!q) return true;
      return (
        (item.rollNumber && item.rollNumber.toLowerCase().includes(q)) ||
        (item.fullName && item.fullName.toLowerCase().includes(q)) ||
        (item.college && item.college.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.workshopName && item.workshopName.toLowerCase().includes(q))
      );
    });
  }, [masterDump, searchQuery, filterStatus, matchedMap]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Master Stats Summary Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="admin-stat-card">
          <div className="stat-icon primary">
            <Database />
          </div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Master Dump Entries</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon success">
            <ShieldCheck />
          </div>
          <div>
            <div className="stat-value">{stats.matchedCount}</div>
            <div className="stat-label">Verified & Registered Students</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon accent">
            <Clock />
          </div>
          <div>
            <div className="stat-value">{stats.pendingCount}</div>
            <div className="stat-label">Awaiting Form Registration</div>
          </div>
        </div>
      </div>

      {/* Input Section Container */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={20} color="var(--primary)" />
              Dump Master Roll Numbers & Student Names
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Pre-load student roll numbers and names to automatically verify form submissions.
            </p>
          </div>

          {/* Sub Navigation Tabs for Input */}
          <div className="nav-tabs" style={{ background: 'var(--bg-secondary)', padding: '0.2rem' }}>
            <button
              className={`nav-tab ${activeInputTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveInputTab('paste')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <FileText size={14} /> Bulk Paste Text
            </button>
            <button
              className={`nav-tab ${activeInputTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveInputTab('file')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Upload size={14} /> Upload CSV File
            </button>
            <button
              className={`nav-tab ${activeInputTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveInputTab('manual')}
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Plus size={14} /> Single Entry
            </button>
          </div>
        </div>

        {/* TAB 1: BULK PASTE TEXT / CSV */}
        {activeInputTab === 'paste' && (
          <form onSubmit={handleBulkSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Paste Roll Numbers & Names (One per line: <code>RollNumber, Student Name, College</code>)
              </label>
              <textarea
                className="form-input"
                style={{
                  height: '140px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  padding: '0.75rem',
                  resize: 'vertical'
                }}
                placeholder={`Example Format:\n21CS1084, Aarav Sharma, IIT Madras\n22ECE042, Priya Ananth, Anna University\n20ME091, Vikram Reddy, NIT Trichy\n23471A4245, R. Gopinathreddy, JNTUH`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {parsedPreview.length > 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={16} /> Ready to dump {parsedPreview.length} valid record(s)
                  </span>
                ) : (
                  <span>Tip: Separate values using comma (,), tab, or semicolon (;).</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {onLoadSampleMasterData && (
                  <button type="button" className="btn-secondary btn-sm" onClick={onLoadSampleMasterData}>
                    <Database size={14} /> Load Demo Master Data
                  </button>
                )}
                <button type="submit" className="btn-primary btn-sm" disabled={parsedPreview.length === 0}>
                  <Upload size={14} /> Process & Save Dump ({parsedPreview.length})
                </button>
              </div>
            </div>
          </form>
        )}

        {/* TAB 2: UPLOAD CSV / TXT FILE */}
        {activeInputTab === 'file' && (
          <div>
            <div style={{
              border: '2px dashed #93c5fd',
              background: '#eff6ff',
              borderRadius: 'var(--radius-md)',
              padding: '2rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
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
              <Upload size={36} color="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Click or Drop CSV / Text File Here
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Supports <code>.csv</code> and <code>.txt</code> files containing Roll Numbers and Names.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: SINGLE ENTRY FORM */}
        {activeInputTab === 'manual' && (
          <form onSubmit={handleSingleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.85rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  <span>Roll Number</span> <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  placeholder="e.g. 21CS1084"
                  value={singleEntry.rollNumber}
                  onChange={(e) => setSingleEntry({ ...singleEntry, rollNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  <span>Full Name</span> <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  placeholder="e.g. Aarav Sharma"
                  value={singleEntry.fullName}
                  onChange={(e) => setSingleEntry({ ...singleEntry, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  <span>College / Institution</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  placeholder="e.g. IIT Madras"
                  value={singleEntry.college}
                  onChange={(e) => setSingleEntry({ ...singleEntry, college: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  <span>Department</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}
                  placeholder="e.g. Computer Science"
                  value={singleEntry.department}
                  onChange={(e) => setSingleEntry({ ...singleEntry, department: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary btn-sm">
                <Plus size={14} /> Add Master Entry
              </button>
            </div>
          </form>
        )}

      </div>

      {/* MASTER DUMP DATABASE TABLE */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        
        {/* Table Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="admin-search-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search master dump by roll number, name, college..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Filter Pill Selectors */}
            <div className="nav-tabs" style={{ padding: '0.2rem' }}>
              <button
                className={`nav-tab ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                All ({masterDump.length})
              </button>
              <button
                className={`nav-tab ${filterStatus === 'matched' ? 'active' : ''}`}
                onClick={() => setFilterStatus('matched')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                Verified ({stats.matchedCount})
              </button>
              <button
                className={`nav-tab ${filterStatus === 'unmatched' ? 'active' : ''}`}
                onClick={() => setFilterStatus('unmatched')}
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              >
                Pending ({stats.pendingCount})
              </button>
            </div>

            <button className="btn-secondary btn-sm" onClick={handleExportCsv} title="Export CSV">
              <Download size={14} /> Export CSV
            </button>

            {masterDump.length > 0 && (
              <button
                className="btn-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear ALL dumped Roll Numbers and Names?')) {
                    onClearAllMasterDump();
                  }
                }}
                title="Clear all master dump records"
              >
                <Trash2 size={14} /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Master Dump Data Table */}
        <div className="admin-table-wrapper">
          {filteredMasterDump.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Roll Number</th>
                  <th>Student Name</th>
                  <th>College / Department</th>
                  <th>Registration Verification Status</th>
                  <th>Added Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMasterDump.map((item, index) => {
                  const rollKey = item.rollNumber ? item.rollNumber.trim().toUpperCase() : '';
                  const matchedStudent = matchedMap.get(rollKey);

                  return (
                    <tr key={item.id || index}>
                      <td><strong>{index + 1}</strong></td>
                      <td>
                        <code style={{ background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          {item.rollNumber}
                        </code>
                      </td>
                      <td><strong>{item.fullName}</strong></td>
                      <td>
                        {item.college ? item.college : <span style={{ color: 'var(--text-light)' }}>-</span>}
                        {item.department ? ` (${item.department})` : ''}
                      </td>
                      <td>
                        {matchedStudent ? (
                          <span style={{
                            background: 'var(--success-light)',
                            color: 'var(--success)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            border: '1px solid #bbf7d0'
                          }} title={`Matched user registration ID: ${matchedStudent.id}`}>
                            <ShieldCheck size={14} /> Registered & Verified ({matchedStudent.fullName})
                          </span>
                        ) : (
                          <span style={{
                            background: 'var(--warning-light)',
                            color: 'var(--warning)',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            border: '1px solid #fde68a'
                          }}>
                            <Clock size={14} /> Awaiting Form Registration
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.addedAt || 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn-action-del"
                          onClick={() => onDeleteMasterEntry(item.id)}
                          title="Delete Master Entry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="admin-empty-state" style={{ padding: '3rem 1.5rem' }}>
              <Database size={48} color="var(--primary)" />
              <h3 style={{ marginTop: '0.5rem' }}>No Master Roll Number Dump Records Found</h3>
              <p>Paste roll numbers & names above or click "Load Demo Master Data" to pre-load verification records.</p>
              {onLoadSampleMasterData && (
                <button className="btn-primary btn-sm" style={{ marginTop: '1rem' }} onClick={onLoadSampleMasterData}>
                  <Database size={15} /> Load Sample Master Roll Data
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
