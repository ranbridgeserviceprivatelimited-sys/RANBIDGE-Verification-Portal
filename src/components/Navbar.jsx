import React, { useRef } from 'react';
import { FormInput, Search } from 'lucide-react';
import logoImg from '../../assets/logo.jpg';

export default function Navbar({ activeTab, setActiveTab, onOpenPinModal, isAdminUnlocked, onOpenAdminPortal, showToast }) {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef(null);

  const handleBrandClick = (e) => {
    e.preventDefault();
    clickCountRef.current += 1;

    clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      showToast('🔒 Secret Admin Gesture Triggered!');
      if (isAdminUnlocked) {
        onOpenAdminPortal();
      } else {
        onOpenPinModal();
      }
      return;
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1200);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <button 
          className="brand" 
          onClick={handleBrandClick} 
          title="RANBIDGE Solutions (Triple click logo for Secret Admin Access)"
        >
          <img src={logoImg} alt="RANBIDGE Solutions Logo" className="brand-logo" />
          <div>
            <div className="brand-title">RANBIDGE</div>
            <div className="brand-subtitle">Verification Portal</div>
          </div>
        </button>

        <div className="nav-controls">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              <FormInput size={17} />
              <span>Registration</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              <Search size={17} />
              <span>Verify Record</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
