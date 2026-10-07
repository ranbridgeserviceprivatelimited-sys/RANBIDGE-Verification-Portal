import React, { useState } from 'react';
import { User, Building2, Hash, Calendar, Laptop, BookOpen, CalendarCheck, RotateCcw, Send } from 'lucide-react';

export default function RegistrationForm({ onSubmitSuccess, showToast }) {
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

    const newRecord = {
      id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
      fullName: formData.fullName.trim(),
      college: formData.college.trim(),
      rollNumber: formData.rollNumber.trim().toUpperCase(),
      passoutYear: formData.passoutYear.trim(),
      department: formData.department.trim(),
      workshopName: formData.workshopName.trim(),
      workshopDate: formData.workshopDate,
      submittedAt: new Date().toLocaleString()
    };

    onSubmitSuccess(newRecord);
  };

  return (
    <div className="form-container-wrapper">
      <div className="form-header">
        <div>
          <h2 className="form-title">Registration Form</h2>
          <p className="form-subtitle">Please enter your academic details below.</p>
        </div>
        <img src="/assets/logo.jpg" alt="RANBIDGE Solutions Logo" style={{ height: '44px', objectFit: 'contain' }} />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
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
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                required
              />
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
                className="form-input"
                placeholder="e.g. Computer Science Engineering"
                value={formData.department}
                onChange={handleChange}
                required
              />
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
                className="form-input"
                placeholder="e.g. AI & Cloud Architecture"
                value={formData.workshopName}
                onChange={handleChange}
                required
              />
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
