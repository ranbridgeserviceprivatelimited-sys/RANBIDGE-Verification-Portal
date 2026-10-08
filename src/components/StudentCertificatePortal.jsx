import React, { useState } from 'react';
import { Search, Award, UserCheck, AlertCircle, FileCheck, CheckCircle2, Download, Printer, Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import CertificateGenerator from './CertificateGenerator';
import CertificateDownloadBox from './CertificateDownloadBox';
import logoImg from '../../assets/logo.jpg';

export default function StudentCertificatePortal({ records = [], certificates = [], initialSearchQuery = '', onNewRegistration, showToast }) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchedQueryStr, setSearchedQueryStr] = useState(initialSearchQuery);
  const [selectedRecord, setSelectedRecord] = useState(() => {
    if (!initialSearchQuery) return null;
    const q = initialSearchQuery.trim().toLowerCase();
    return records.find(r => 
      (r.id && r.id.toLowerCase() === q) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
      (r.fullName && r.fullName.toLowerCase().includes(q))
    ) || null;
  });
  const [hasSearched, setHasSearched] = useState(Boolean(initialSearchQuery));

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      if (showToast) showToast('Please enter your Roll Number, Participant Name, or ID');
      return;
    }

    setSearchedQueryStr(searchQuery.trim());
    const match = records.find(r => 
      (r.id && r.id.toLowerCase() === query) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(query)) ||
      (r.fullName && r.fullName.toLowerCase().includes(query))
    );

    setHasSearched(true);
    if (match) {
      setSelectedRecord(match);
      if (showToast) showToast(`Found certificate for ${match.fullName}`);
    } else {
      setSelectedRecord(null);
      if (showToast) showToast('Search completed');
    }
  };

  // Find standalone dumped certificates matching query
  const standaloneCerts = certificates.filter(c => {
    const q = searchedQueryStr.toLowerCase().trim();
    if (!q) return false;
    const certRoll = (c.rollNumber || '').toLowerCase();
    const certName = (c.studentName || c.fullName || '').toLowerCase();
    const certFile = (c.fileName || '').toLowerCase();
    const certWorkshop = (c.workshopName || c.eventName || '').toLowerCase();

    return certRoll.includes(q) || certName.includes(q) || certFile.includes(q) || certWorkshop.includes(q);
  });

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Header Banner */}
      <div className="form-container-wrapper" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '0.45rem 1.25rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 800,
            marginBottom: '0.85rem'
          }}>
            <Award size={18} /> Student Certificate Check Portal
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Check & Download Your Certificate
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '600px', margin: '0.35rem auto 0' }}>
            Enter your <strong>Roll Number</strong>, <strong>Full Name</strong>, or <strong>Verification ID</strong> to generate and download your official RANBIDGE certificate.
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="admin-search-wrapper" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search className="search-icon" style={{ left: '1.2rem' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem', fontSize: '1rem' }}
                placeholder="e.g. 23471A4245 or R. Gopinathreddy or REG-798799"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '0.98rem' }}>
              <Award size={18} />
              <span>Check Certificate</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH RESULT: MATCHED REGISTRATION RECORD & OFFICIAL CERTIFICATE */}
      {selectedRecord && (
        <div className="submission-card" style={{ animation: 'fadeIn 0.35s ease' }}>
          
          {/* Header Ribbon */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{
              background: 'var(--success-light)',
              color: 'var(--success)',
              padding: '0.4rem 1rem',
              borderRadius: '50px',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              border: '1px solid #bbf7d0'
            }}>
              <ShieldCheck size={16} /> OFFICIAL VERIFIED CERTIFICATE
            </span>
          </div>

          {/* Student Profile Overview Ribbon */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {selectedRecord.fullName}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                {selectedRecord.college} &bull; Roll: <strong style={{ color: 'var(--primary)' }}>{selectedRecord.rollNumber}</strong>
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'monospace' }}>
                ID: {selectedRecord.id}
              </span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {selectedRecord.workshopName} ({selectedRecord.workshopDate || '2026'})
              </div>
            </div>
          </div>

          {/* OFFICIAL DYNAMIC RANBIDGE CERTIFICATE GENERATOR */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={22} color="var(--primary)" />
              Official RANBIDGE Certificate of Participation
            </h4>
            <CertificateGenerator record={selectedRecord} showActions={true} />
          </div>

          {/* DUMPED CERTIFICATES DISPLAY SECTION */}
          <CertificateDownloadBox
            certificates={certificates}
            rollNumber={selectedRecord.rollNumber}
            fullName={selectedRecord.fullName}
            workshopName={selectedRecord.workshopName}
          />
        </div>
      )}

      {/* STANDALONE DUMPED CERTIFICATES RESULT (If no exact registration record, but certificate dump exists) */}
      {!selectedRecord && hasSearched && standaloneCerts.length > 0 && (
        <div className="submission-card">
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} color="var(--primary)" />
            Issued Certificate Document(s) Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Found official certificate file(s) matching "{searchedQueryStr}":
          </p>

          <CertificateDownloadBox
            certificates={certificates}
            rollNumber={searchedQueryStr}
            fullName={searchedQueryStr}
            workshopName={searchedQueryStr}
          />
        </div>
      )}

      {/* NO RESULT FOUND STATE */}
      {hasSearched && !selectedRecord && standaloneCerts.length === 0 && (
        <div className="submission-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <AlertCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
            No Certificate Found for "{searchedQueryStr}"
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0.5rem auto 1.75rem' }}>
            We could not find any registration record or uploaded certificate matching your search. Please verify your Roll Number or submit a new registration.
          </p>
          <button className="btn-primary" onClick={onNewRegistration} style={{ padding: '0.85rem 2rem' }}>
            <FileCheck size={18} />
            <span>Go to Registration Form</span>
          </button>
        </div>
      )}

    </div>
  );
}
