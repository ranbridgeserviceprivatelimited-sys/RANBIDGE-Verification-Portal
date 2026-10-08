import React, { useState, useMemo } from 'react';
import { User, Building2, Hash, Calendar, Laptop, BookOpen, CalendarCheck, RotateCcw, Send, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export default function RegistrationForm({ onSubmitSuccess, masterDump = [], records = [], certificates = [], showToast }) {
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

  const matchedMasterEntry = useMemo(() => {
    if (!formData.rollNumber.trim()) return null;
    const roll = formData.rollNumber.trim().toUpperCase();
    return masterDump.find(m => m.rollNumber && m.rollNumber.trim().toUpperCase() === roll);
  }, [formData.rollNumber, masterDump]);

  // Dynamic Auto-complete Suggestions derived from Master Dump, Admin Records, Certificates, & Pre-seeded Folders
  const collegeSuggestions = useMemo(() => {
    const set = new Set([
      "National Institute of Technology",
      "Indian Institute of Technology, Madras",
      "Anna University, Chennai",
      "SRM Institute of Science and Technology",
      "Vellore Institute of Technology (VIT)",
      "PSG College of Technology",
      "SSN College of Engineering",
      "Sathyabama Institute of Science and Technology",
      "St. Joseph's College of Engineering",
      "Rajalakshmi Engineering College",
      "Saveetha Engineering College",
      "Sri Sairam Engineering College",
      "Hindusthan College of Engineering and Technology",
      "KPR Institute of Engineering and Technology",
      "Vel Tech Rangarajan Dr. Sagunthala R&D Institute",
      "B.S. Abdur Rahman Crescent Institute of Science and Technology",
      "Kongu Engineering College",
      "Bannari Amman Institute of Technology",
      "Coimbatore Institute of Technology",
      "Kumaraguru College of Technology"
    ]);

    (masterDump || []).forEach(m => {
      const val = m.college || m.collegeName || m.institution;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (records || []).forEach(r => {
      const val = r.college || r.institution;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (certificates || []).forEach(c => {
      const val = c.college || c.collegeName || c.institution;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    return Array.from(set).sort();
  }, [masterDump, records, certificates]);

  const departmentSuggestions = useMemo(() => {
    const set = new Set([
      "Computer Science & Engineering",
      "Information Technology",
      "Artificial Intelligence & Data Science",
      "Artificial Intelligence & Machine Learning",
      "Electronics & Communication Engineering",
      "Electrical & Electronics Engineering",
      "Mechanical Engineering",
      "Civil Engineering",
      "Cyber Security",
      "Data Science",
      "Robotics & Automation",
      "Biomedical Engineering",
      "Chemical Engineering",
      "Aeronautical Engineering",
      "Mechatronics Engineering"
    ]);

    (masterDump || []).forEach(m => {
      const val = m.department || m.dept;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (records || []).forEach(r => {
      const val = r.department || r.dept;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (certificates || []).forEach(c => {
      const val = c.department || c.dept;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    return Array.from(set).sort();
  }, [masterDump, records, certificates]);

  const workshopSuggestions = useMemo(() => {
    const set = new Set([
      "AI & Cloud Architecture",
      "Full Stack Web Development",
      "Cyber Security & Ethical Hacking",
      "Data Science & Machine Learning",
      "Embedded Systems & IoT",
      "DevOps & Cloud Computing",
      "VLSI Design & Microcontrollers",
      "Blockchain Technology & Smart Contracts",
      "Python Programming & Automation",
      "React.js & Modern Web Frameworks",
      "Mobile App Development with Flutter",
      "UI/UX Design & System Architecture"
    ]);

    (masterDump || []).forEach(m => {
      const val = m.workshopName || m.title || m.course;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (records || []).forEach(r => {
      const val = r.workshopName || r.title || r.course;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    (certificates || []).forEach(c => {
      const val = c.workshopName || c.title || c.course;
      if (val && typeof val === 'string' && val.trim()) set.add(val.trim());
    });

    return Array.from(set).sort();
  }, [masterDump, records, certificates]);

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
    showToast('Form fields reset');
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
      verificationStatus: 'verified',
      verifiedAt: new Date().toLocaleString(),
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
              <input
                type="text"
                id="college"
                name="college"
                list="college-suggestions"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                autoComplete="on"
                required
              />
              <datalist id="college-suggestions">
                {collegeSuggestions.map((col, idx) => (
                  <option key={idx} value={col} />
                ))}
              </datalist>
            </div>
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
              <input
                type="text"
                id="department"
                name="department"
                list="department-suggestions"
                className="form-input"
                placeholder="e.g. Computer Science Engineering"
                value={formData.department}
                onChange={handleChange}
                autoComplete="on"
                required
              />
              <datalist id="department-suggestions">
                {departmentSuggestions.map((dept, idx) => (
                  <option key={idx} value={dept} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 6. Workshop Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="workshopName">
              <span>Workshop Name</span>
              <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <BookOpen className="input-icon" />
              <input
                type="text"
                id="workshopName"
                name="workshopName"
                list="workshop-suggestions"
                className="form-input"
                placeholder="e.g. AI & Cloud Architecture"
                value={formData.workshopName}
                onChange={handleChange}
                autoComplete="on"
                required
              />
              <datalist id="workshop-suggestions">
                {workshopSuggestions.map((ws, idx) => (
                  <option key={idx} value={ws} />
                ))}
              </datalist>
            </div>
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
