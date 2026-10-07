import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, FileCheck } from 'lucide-react';
import VerificationCard from './VerificationCard';

export default function PublicSearch({ records, onNewRegistration, showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      showToast('Please enter a name, roll number, or ID');
      return;
    }

    const match = records.find(r => 
      (r.id && r.id.toLowerCase() === query) ||
      (r.rollNumber && r.rollNumber.toLowerCase() === query) ||
      (r.fullName && r.fullName.toLowerCase().includes(query))
    );

    setHasSearched(true);
    if (match) {
      setSelectedRecord(match);
      showToast(`Record found for ${match.fullName}`);
    } else {
      setSelectedRecord(null);
      showToast('No matching registration found');
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div className="form-container-wrapper" style={{ marginBottom: '2rem' }}>
        <div style={{ textAlignment: 'center', marginBottom: '1.5rem' }}>
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
            <UserCheck size={16} /> Credential Search Portal
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Verify Workshop Registration Status
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Enter your Roll Number, Verification ID (e.g. REG-123456), or Full Name below.
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
                placeholder="e.g. 21CS0104 or Aarav Sharma or REG-102938"
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
          onNewRegistration={() => {
            setSelectedRecord(null);
            onNewRegistration();
          }}
          showToast={showToast}
        />
      )}

      {hasSearched && !selectedRecord && (
        <div className="submission-card" style={{ textAlignment: 'center', padding: '3rem 2rem' }}>
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
            No Verification Record Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
            We could not find any active workshop registration matching "{searchQuery}". Please check your details or submit a new registration.
          </p>
          <button className="btn-primary" onClick={onNewRegistration}>
            <FileCheck size={18} /> Register Now
          </button>
        </div>
      )}
    </div>
  );
}
