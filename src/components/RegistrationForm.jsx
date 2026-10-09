import React, { useState, useMemo } from 'react';
import { User, Building2, Hash, Calendar, Laptop, BookOpen, CalendarCheck, RotateCcw, Send, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export default function RegistrationForm({ onSubmitSuccess, masterDump = [], records = [], certificates = [], portalSettings = {}, showToast }) {
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    fullName: '',
    college: '',
    rollNumber: '',
    passoutYear: '2026',
    department: '',
    workshopName: '',
    workshopDate: getTodayDateStr()
  });

  const [isCustomCollege, setIsCustomCollege] = useState(false);
  const [isCustomWorkshop, setIsCustomWorkshop] = useState(false);
  const [isCustomDept, setIsCustomDept] = useState(false);

  const matchedMasterEntry = useMemo(() => {
    if (!formData.rollNumber.trim()) return null;
    const roll = formData.rollNumber.trim().toUpperCase();
    return masterDump.find(m => m.rollNumber && m.rollNumber.trim().toUpperCase() === roll);
  }, [formData.rollNumber, masterDump]);

  // Dynamic College Dropdown options derived from Admin Portal Settings, Master Dump, Records, Certificates
  const collegeSuggestions = useMemo(() => {
    return [
      "Narasaraopeta Engineering College",
      "Tirumala Engineering College",
      "AM Reddy College"
    ];
  }, []);

  const departmentSuggestions = useMemo(() => {
    return [
      "Computer Science & Engineering",
      "Computer Science (Artificial Intelligence & Machine Learning)",
      "Computer Science (Artificial Intelligence)",
      "Computer Science (Cyber Security)",
      "Computer Science (Data Science)",
      "Civil Engineering",
      "Electronics & Communication Engineering (ECE)",
      "Electrical & Electronics Engineering (EEE)",
      "Mechanical Engineering",
      "Pharmacy"
    ];
  }, []);

  const workshopSuggestions = useMemo(() => {
    return [
      "Idea to MVP - Entrepreneurship & Startups"
    ];
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      college: '',
      rollNumber: '',
      passoutYear: '2026',
      department: '',
      workshopName: '',
      workshopDate: getTodayDateStr()
    });
    if (showToast) showToast('Form fields reset');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.college.trim() || !formData.rollNumber.trim()) {
      showToast('⚠️ Please fill in all required fields!');
      return;
    }

    const isVerified = Boolean(matchedMasterEntry || masterDump.some(m => 
      (m.rollNumber && m.rollNumber.trim().toUpperCase() === formData.rollNumber.trim().toUpperCase()) ||
      (m.fullName && m.fullName.trim().toLowerCase() === formData.fullName.trim().toLowerCase())
    ));

    const newRecord = {
      id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
      fullName: formData.fullName.trim(),
      college: formData.college.trim(),
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      passoutYear: formData.passoutYear.trim(),
      department: formData.department.trim(),
      workshopName: formData.workshopName.trim(),
      workshopDate: formData.workshopDate,
      verificationStatus: isVerified ? 'verified' : 'pending',
      verifiedAt: isVerified ? new Date().toLocaleString() : null,
      matchedAdminData: matchedMasterEntry || null,
      submittedAt: new Date().toLocaleString()
    };

    onSubmitSuccess(newRecord);
    setFormData({
      fullName: '',
      college: '',
      rollNumber: '',
      passoutYear: '2026',
      department: '',
      workshopName: '',
      workshopDate: getTodayDateStr()
    });
  };

  return (
    <div className="form-container-wrapper">
      <div className="form-header">
        <div>
          <h2 className="form-title">Registration Form</h2>
          <p className="form-subtitle">Please enter your academic details below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          {/* Live Admin Master Data Verification Callout */}
          {matchedMasterEntry ? (
            <div style={{
              gridColumn: '1 / -1',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '1.5px solid #86efac',
              borderRadius: 'var(--radius-md)',
              padding: '0.9rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '0.5rem',
              animation: 'fadeIn 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={22} color="#16a34a" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.92rem', color: '#14532d', fontWeight: 800 }}>
                    Verified with Admin Master Portal Data!
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.1rem' }}>
                    Matched Roll Number: <strong>{matchedMasterEntry.rollNumber}</strong> ({matchedMasterEntry.fullName})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    fullName: matchedMasterEntry.fullName || prev.fullName,
                    college: matchedMasterEntry.college || prev.college,
                    department: matchedMasterEntry.department || prev.department,
                    workshopName: matchedMasterEntry.workshopName || prev.workshopName
                  }));
                  if (showToast) showToast('Auto-filled student details from Admin Master Data!');
                }}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', background: '#ffffff', color: '#15803d', borderColor: '#86efac', fontWeight: 700 }}
              >
                Auto-Fill Details
              </button>
            </div>
          ) : formData.rollNumber.trim().length >= 4 && masterDump.length > 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              fontSize: '0.82rem',
              color: '#92400e'
            }}>
              <Clock size={16} color="#d97706" style={{ flexShrink: 0 }} />
              <span>
                Roll Number <strong>{formData.rollNumber}</strong> is not listed in Admin pre-dumped list yet. Submitting will flag registration as <strong>Pending Admin Verification</strong>.
              </span>
            </div>
          ) : null}
          
          {/* 1. Full Name */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="fullName">
              <span>Full Name</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="e.g. Aarav Sharma"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 2. College / Institution */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="college">
              <span>College / Institution</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Building2 className="input-icon" />
              <select
                id="college"
                className="form-input"
                value={isCustomCollege ? 'OTHER' : (formData.college || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'OTHER') {
                    setIsCustomCollege(true);
                    setFormData(prev => ({ ...prev, college: '' }));
                  } else {
                    setIsCustomCollege(false);
                    setFormData(prev => ({ ...prev, college: val }));
                  }
                }}
                required
              >
                <option value="" disabled>-- Select College / Institution --</option>
                {collegeSuggestions.map((col, idx) => (
                  <option key={idx} value={col}>{col}</option>
                ))}
                <option value="OTHER">✏️ + Enter Other College Name...</option>
              </select>
            </div>
            {isCustomCollege && (
              <div className="input-wrapper" style={{ marginTop: '0.45rem' }}>
                <input
                  type="text"
                  name="college"
                  className="form-input"
                  placeholder="Type your College / Institution Name..."
                  value={formData.college}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 3. Roll Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="rollNumber">
              <span>Roll Number</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Hash className="input-icon" />
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                className="form-input"
                placeholder="e.g. 21CS0104"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 4. Passout Year */}
          <div className="form-group">
            <label className="form-label" htmlFor="passoutYear">
              <span>Passout Year</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Calendar className="input-icon" />
              <input
                type="number"
                id="passoutYear"
                name="passoutYear"
                className="form-input"
                min="1990"
                max="2035"
                placeholder="e.g. 2026"
                value={formData.passoutYear}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* 5. Department */}
          <div className="form-group">
            <label className="form-label" htmlFor="department">
              <span>Department</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <Laptop className="input-icon" />
              <select
                id="department"
                className="form-input"
                value={isCustomDept ? 'OTHER' : (formData.department || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'OTHER') {
                    setIsCustomDept(true);
                    setFormData(prev => ({ ...prev, department: '' }));
                  } else {
                    setIsCustomDept(false);
                    setFormData(prev => ({ ...prev, department: val }));
                  }
                }}
                required
              >
                <option value="" disabled>-- Select Department / Branch --</option>
                {departmentSuggestions.map((dept, idx) => (
                  <option key={idx} value={dept}>{dept}</option>
                ))}
                <option value="OTHER">✏️ + Enter Other Department...</option>
              </select>
            </div>
            {isCustomDept && (
              <div className="input-wrapper" style={{ marginTop: '0.45rem' }}>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="Type your Department / Branch..."
                  value={formData.department}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 6. Workshop Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="workshopName">
              <span>Workshop Name</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <BookOpen className="input-icon" />
              <select
                id="workshopName"
                className="form-input"
                value={isCustomWorkshop ? 'OTHER' : (formData.workshopName || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'OTHER') {
                    setIsCustomWorkshop(true);
                    setFormData(prev => ({ ...prev, workshopName: '' }));
                  } else {
                    setIsCustomWorkshop(false);
                    setFormData(prev => ({ ...prev, workshopName: val }));
                  }
                }}
                required
              >
                <option value="" disabled>-- Select Event / Workshop Title --</option>
                {workshopSuggestions.map((ws, idx) => (
                  <option key={idx} value={ws}>{ws}</option>
                ))}
                <option value="OTHER">✏️ + Enter Other Workshop Title...</option>
              </select>
            </div>
            {isCustomWorkshop && (
              <div className="input-wrapper" style={{ marginTop: '0.45rem' }}>
                <input
                  type="text"
                  name="workshopName"
                  className="form-input"
                  placeholder="Type your Workshop / Event Title..."
                  value={formData.workshopName}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* 7. Date */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="workshopDate">
              <span>Date</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <CalendarCheck className="input-icon" />
              <input
                type="date"
                id="workshopDate"
                name="workshopDate"
                className="form-input"
                value={formData.workshopDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <RotateCcw size={17} /> Reset
            </button>
            <button type="submit" className="btn-primary">
              <span>Submit Details</span>
              <Send size={17} />
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
