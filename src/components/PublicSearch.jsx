import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, FileCheck } from 'lucide-react';
import VerificationCard from './VerificationCard';
import CertificateDownloadBox from './CertificateDownloadBox';

export default function PublicSearch({ records = [], certificates = [], latestRecord, onNewRegistration, showToast }) {
  const initialTargetRecord = latestRecord || (records.length > 0 ? records[0] : null);
  const [searchQuery, setSearchQuery] = useState(initialTargetRecord ? (initialTargetRecord.rollNumber || initialTargetRecord.fullName || '') : '');
  const [selectedRecord, setSelectedRecord] = useState(initialTargetRecord);
  const [searchedQueryStr, setSearchedQueryStr] = useState(initialTargetRecord ? (initialTargetRecord.rollNumber || initialTargetRecord.fullName || '') : '');
  const [hasSearched, setHasSearched] = useState(Boolean(initialTargetRecord));

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      if (showToast) showToast('Please enter a participant name, roll number, or ID');
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
      if (showToast) showToast(`Record found for ${match.fullName}`);
    } else {
      setSelectedRecord(null);
      if (showToast) showToast('Search completed');
    }
  };

  const standaloneCertificates = certificates.filter(c => {
    const query = searchedQueryStr.toLowerCase().trim();
    if (!query) return false;
    const certRoll = (c.rollNumber || '').toLowerCase();
    const certName = (c.studentName || c.fullName || '').toLowerCase();
    const certFile = (c.fileName || '').toLowerCase();

    return (
      certRoll.includes(query) ||
      certName.includes(query) ||
      certFile.includes(query)
    );
  });

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="form-container-wrapper" style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '0.4rem 1rem',
            borderRadius: '50px',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '0.75rem'
          }}>
            <UserCheck size={16} /> Credential & Certificate Search Portal
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Search Registration & Download Certificate
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Enter Participant Name, Roll Number, or Verification ID below.
          </p>
        </div>

        <form onSubmit={handleSearch}>
          <div className="admin-search-wrapper" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search className="search-icon" style={{ left: '1.2rem' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.8rem' }}
                placeholder="e.g. Aarav Sharma or 21CS1084 or REG-102938"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.75rem' }}>
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {selectedRecord && (
        <VerificationCard
          record={selectedRecord}
          certificates={certificates}
          onNewRegistration={() => {
            setSelectedRecord(null);
            onNewRegistration();
          }}
          showToast={showToast}
        />
      )}



      {hasSearched && !selectedRecord && standaloneCertificates.length === 0 && (
        <div className="submission-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            background: 'var(--danger-light)',
            color: 'var(--danger)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <AlertCircle size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
            No Registration or Certificate Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
            We could not find any registration record or uploaded certificate matching "{searchedQueryStr}". Please check your details or submit a registration.
          </p>
          <button className="btn-primary" onClick={onNewRegistration}>
            <FileCheck size={18} /> Register Now
          </button>
        </div>
      )}
    </div>
  );
}
