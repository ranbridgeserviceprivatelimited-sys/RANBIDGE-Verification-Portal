import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Award, 
  UserCheck, 
  AlertCircle, 
  FileCheck, 
  CheckCircle2, 
  Download, 
  Printer, 
  Eye, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  User,
  Hash,
  Laptop,
  BookOpen,
  RotateCcw,
  Clock
} from 'lucide-react';
import CertificateGenerator from './CertificateGenerator';
import CertificateDownloadBox from './CertificateDownloadBox';
import logoImg from '../../assets/logo.jpg';

export default function StudentCertificatePortal({ records = [], certificates = [], initialSearchQuery = '', onNewRegistration, showToast }) {
  // Form Details State: Name, College, Department/Branch, Roll Number, Event/Workshop
  const [filterForm, setFilterForm] = useState({
    fullName: initialSearchQuery || '',
    college: '',
    department: '',
    rollNumber: initialSearchQuery || '',
    workshopName: ''
  });

  const [hasSearched, setHasSearched] = useState(Boolean(initialSearchQuery));
  const [matchedRecords, setMatchedRecords] = useState(() => {
    if (!initialSearchQuery) return [];
    const q = initialSearchQuery.trim().toLowerCase();
    return records.filter(r => 
      (r.id && r.id.toLowerCase() === q) ||
      (r.rollNumber && r.rollNumber.toLowerCase().includes(q)) ||
      (r.fullName && r.fullName.toLowerCase().includes(q))
    );
  });

  // Unique College Options
  const collegeOptions = useMemo(() => {
    const set = new Set([
      "Narasaraopeta Engineering College",
      "Narasaraopeta engineering college",
      "Vasireddy Venkatadri Institute of Technology",
      "RVR & JC College of Engineering",
      "JNTUK College of Engineering",
      "JNTUH College of Engineering",
      "IIT Madras",
      "NIT Trichy",
      "Anna University"
    ]);
    records.forEach(r => { if (r.college) set.add(r.college.trim()); });
    certificates.forEach(c => { if (c.college) set.add(c.college.trim()); });
    return Array.from(set).sort();
  }, [records, certificates]);

  // Unique Branch / Department Options
  const departmentOptions = useMemo(() => {
    const set = new Set([
      "Computer Science Engineering",
      "Computer Science and Engineering",
      "Computer Science and Technology",
      "Information Technology",
      "Electronics and Communication Engineering",
      "Electrical and Electronics Engineering",
      "Artificial Intelligence & Data Science",
      "Artificial Intelligence & Machine Learning",
      "Mechanical Engineering",
      "Civil Engineering"
    ]);
    records.forEach(r => { if (r.department) set.add(r.department.trim()); });
    certificates.forEach(c => { if (c.department) set.add(c.department.trim()); });
    return Array.from(set).sort();
  }, [records, certificates]);

  // Unique Event / Workshop Options
  const workshopOptions = useMemo(() => {
    const set = new Set([
      "Idea to MVP",
      "Full Stack Web & AI Systems",
      "AI & Machine Learning Systems",
      "IoT & Embedded Robotics",
      "Cloud Infrastructure & DevOps",
      "Cyber Security & Ethical Hacking",
      "Python & Data Science Bootcamp"
    ]);
    records.forEach(r => { if (r.workshopName) set.add(r.workshopName.trim()); });
    certificates.forEach(c => { if (c.workshopName) set.add(c.workshopName.trim()); });
    return Array.from(set).sort();
  }, [records, certificates]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const fName = filterForm.fullName.trim().toLowerCase();
    const rNum = filterForm.rollNumber.trim().toLowerCase();
    const col = filterForm.college.trim().toLowerCase();
    const dept = filterForm.department.trim().toLowerCase();
    const wk = filterForm.workshopName.trim().toLowerCase();

    if (!fName && !rNum && !col && !dept && !wk) {
      if (showToast) showToast('⚠️ Please fill in at least one detail to search your certificate!');
      return;
    }

    const matches = records.filter(r => {
      const matchName = !fName || (r.fullName && r.fullName.toLowerCase().includes(fName));
      const matchRoll = !rNum || (r.rollNumber && r.rollNumber.toLowerCase().includes(rNum)) || (r.id && r.id.toLowerCase().includes(rNum));
      const matchCol = !col || (r.college && r.college.toLowerCase().trim() === col);
      const matchDept = !dept || (r.department && r.department.toLowerCase().trim() === dept);
      const matchWk = !wk || (r.workshopName && r.workshopName.toLowerCase().trim() === wk);

      return matchName && matchRoll && matchCol && matchDept && matchWk;
    });

    setMatchedRecords(matches);
    setHasSearched(true);

    if (matches.length > 0) {
      if (showToast) showToast(`Found ${matches.length} record(s) matching your details!`);
    } else {
      if (showToast) showToast('No matching student certificate records found.');
    }
  };

  const handleResetForm = () => {
    setFilterForm({
      fullName: '',
      college: '',
      department: '',
      rollNumber: '',
      workshopName: ''
    });
    setMatchedRecords([]);
    setHasSearched(false);
    if (showToast) showToast('Search form reset');
  };

  // Standalone certificates matching query
  const standaloneCerts = useMemo(() => {
    if (!hasSearched) return [];
    const fName = filterForm.fullName.trim().toLowerCase();
    const rNum = filterForm.rollNumber.trim().toLowerCase();
    const col = filterForm.college.trim().toLowerCase();
    const dept = filterForm.department.trim().toLowerCase();
    const wk = filterForm.workshopName.trim().toLowerCase();

    return certificates.filter(c => {
      const cName = (c.studentName || c.fullName || '').toLowerCase();
      const cRoll = (c.rollNumber || '').toLowerCase();
      const cCol = (c.college || '').toLowerCase();
      const cDept = (c.department || '').toLowerCase();
      const cWk = (c.workshopName || c.eventName || '').toLowerCase();

      const matchName = !fName || cName.includes(fName);
      const matchRoll = !rNum || cRoll.includes(rNum);
      const matchCol = !col || cCol.includes(col);
      const matchDept = !dept || cDept.includes(dept);
      const matchWk = !wk || cWk.includes(wk);

      return matchName && matchRoll && matchCol && matchDept && matchWk;
    });
  }, [certificates, filterForm, hasSearched]);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Search Header & Multi-field Form */}
      <div className="form-container-wrapper" style={{ background: '#ffffff', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: '2rem' }}>
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
            <Award size={18} /> Student Certificate Download Portal
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Check & Download Your Certificate
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '640px', margin: '0.35rem auto 0' }}>
            Fill in your details below (<strong>Name</strong>, <strong>College</strong>, <strong>Branch</strong>, <strong>Roll Number</strong>, <strong>Event</strong>) to check and download your verified RANBIDGE certificate.
          </p>
        </div>

        {/* Multi-Field Form */}
        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.15rem' }}>
          
          {/* 1. Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Participant Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                placeholder="e.g. Aasmitha Tommandru"
                value={filterForm.fullName}
                onChange={(e) => setFilterForm(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>
          </div>

          {/* 2. Select College */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Select College
            </label>
            <div style={{ position: 'relative' }}>
              <Building2 size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem', appearance: 'auto' }}
                value={filterForm.college}
                onChange={(e) => setFilterForm(prev => ({ ...prev, college: e.target.value }))}
              >
                <option value="">-- All Colleges --</option>
                {collegeOptions.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Select Branch / Department */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Select Branch / Department
            </label>
            <div style={{ position: 'relative' }}>
              <Laptop size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem', appearance: 'auto' }}
                value={filterForm.department}
                onChange={(e) => setFilterForm(prev => ({ ...prev, department: e.target.value }))}
              >
                <option value="">-- All Branches --</option>
                {departmentOptions.map((d, i) => (
                  <option key={i} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Enter Roll Number */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Enter Roll Number
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                placeholder="e.g. 24471A05M4"
                value={filterForm.rollNumber}
                onChange={(e) => setFilterForm(prev => ({ ...prev, rollNumber: e.target.value }))}
              />
            </div>
          </div>

          {/* 5. Select Event / Workshop */}
          <div style={{ gridColumn: 'span 1' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Select Event / Workshop
            </label>
            <div style={{ position: 'relative' }}>
              <BookOpen size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <select
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.9rem', appearance: 'auto' }}
                value={filterForm.workshopName}
                onChange={(e) => setFilterForm(prev => ({ ...prev, workshopName: e.target.value }))}
              >
                <option value="">-- All Events / Workshops --</option>
                {workshopOptions.map((w, i) => (
                  <option key={i} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetForm}
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}
            >
              <RotateCcw size={16} /> Reset Form
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '0.75rem 2rem', fontSize: '0.95rem' }}
            >
              <Award size={18} />
              <span>Check & Download Certificate</span>
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH RESULTS DISPLAY SECTION */}
      {hasSearched && matchedRecords.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {matchedRecords.map((record, index) => {
            const isVerified = record.verificationStatus === 'verified' || !record.verificationStatus || record.verificationStatus !== 'rejected';

            return (
              <div key={record.id || index} className="submission-card" style={{ animation: 'fadeIn 0.35s ease' }}>
                
                {/* Header Verification Ribbon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--primary)" />
                    {record.fullName}
                  </h3>

                  {isVerified ? (
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
                  ) : (
                    <span style={{
                      background: '#fef3c7',
                      color: '#b45309',
                      padding: '0.4rem 1rem',
                      borderRadius: '50px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      border: '1px solid #fde68a'
                    }}>
                      <Clock size={16} /> PENDING ADMIN APPROVAL
                    </span>
                  )}
                </div>

                {/* Student Profile Info Grid */}
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
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {record.college}
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Department: <strong>{record.department || 'N/A'}</strong> &bull; Roll: <strong style={{ color: 'var(--primary)' }}>{record.rollNumber}</strong>
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 800, fontFamily: 'monospace' }}>
                      ID: {record.id}
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 600 }}>
                      {record.workshopName} ({record.workshopDate || '2026'})
                    </div>
                  </div>
                </div>

                {/* VERIFIED: DYNAMIC CERTIFICATE GENERATOR WITH DOWNLOAD BUTTON */}
                {isVerified ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={22} color="var(--primary)" />
                      Official Certificate of Participation
                    </h4>
                    <CertificateGenerator record={record} showActions={true} />
                  </div>
                ) : (
                  /* PENDING APPROVAL NOTICE */
                  <div style={{
                    background: '#fffbeb',
                    border: '1.5px solid #fde68a',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    <Clock size={32} color="#d97706" style={{ margin: '0 auto 0.75rem' }} />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e' }}>
                      Certificate Pending Admin Approval
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: '#b45309', marginTop: '0.35rem', maxWidth: '560px', margin: '0.35rem auto 0' }}>
                      Your registration details match our database. Once the Admin approves and sends your certificate from the portal, it will immediately become available for download right here!
                    </p>
                  </div>
                )}


              </div>
            );
          })}
        </div>
      )}



      {/* NO MATCH FOUND STATE */}
      {hasSearched && matchedRecords.length === 0 && standaloneCerts.length === 0 && (
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
            No Certificate Found Matching Details
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '0.5rem auto 1.75rem' }}>
            We could not find any registration record or issued certificate matching your submitted Name, College, Branch, Roll Number, or Event details.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={handleResetForm} style={{ padding: '0.85rem 1.75rem' }}>
              <RotateCcw size={16} /> Clear Filters & Try Again
            </button>
            <button className="btn-primary" onClick={onNewRegistration} style={{ padding: '0.85rem 1.75rem' }}>
              <FileCheck size={18} />
              <span>Go to Registration Form</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

