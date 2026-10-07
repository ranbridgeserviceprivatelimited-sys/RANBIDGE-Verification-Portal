import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import VerificationCard from './components/VerificationCard';
import PublicSearch from './components/PublicSearch';
import AdminPinModal from './components/AdminPinModal';
import AdminPortalModal from './components/AdminPortalModal';
import Footer from './components/Footer';
import { CheckCircle2, Info } from 'lucide-react';

const STORAGE_KEY = 'ranbidge_registrations';

export default function App() {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error reading localStorage:', err);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('register');
  const [latestRecord, setLatestRecord] = useState(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Sync state to localStorage whenever records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Error writing to localStorage:', err);
    }
  }, [records]);

  // Toast message helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Submission handler
  const handleRegistrationSubmit = (newRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setLatestRecord(newRecord);
    showToast(`Registration completed for ${newRecord.fullName}!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewRegistration = () => {
    setLatestRecord(null);
    setActiveTab('register');
  };

  // Delete record handler
  const handleDeleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('Record deleted successfully');
  };

  // Clear all handler
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL registration records? This action cannot be undone.')) {
      setRecords([]);
      showToast('All registration records have been cleared');
    }
  };

  // Load sample demo data
  const handleLoadSampleData = () => {
    const sampleRecords = [
      {
        id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
        fullName: 'Aarav Sharma',
        college: 'IIT Madras',
        rollNumber: '21CS1084',
        passoutYear: '2026',
        department: 'Computer Science Engineering',
        workshopName: 'AI & Machine Learning Systems',
        workshopDate: '2026-10-15',
        submittedAt: new Date().toLocaleString()
      },
      {
        id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
        fullName: 'Priya Ananth',
        college: 'Anna University',
        rollNumber: '22ECE042',
        passoutYear: '2027',
        department: 'Electronics & Communication',
        workshopName: 'IoT & Embedded Robotics',
        workshopDate: '2026-10-18',
        submittedAt: new Date().toLocaleString()
      },
      {
        id: 'REG-' + Math.floor(100000 + Math.random() * 900000),
        fullName: 'Vikram Reddy',
        college: 'NIT Trichy',
        rollNumber: '20ME091',
        passoutYear: '2025',
        department: 'Mechanical Engineering',
        workshopName: 'Cloud Infrastructure & DevOps',
        workshopDate: '2026-10-20',
        submittedAt: new Date().toLocaleString()
      }
    ];

    setRecords(prev => [...sampleRecords, ...prev]);
    showToast('Loaded 3 demo registration records!');
  };

  return (
    <div className="app-layout">
      {/* Toast Notification Overlay */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setLatestRecord(null);
        }}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        showToast={showToast}
      />

      {/* Main Body */}
      <main className="main-content">
        {activeTab === 'register' && (
          <div className="page-view">
            <div id="registrationFormSection">
              {latestRecord ? (
                <VerificationCard
                  record={latestRecord}
                  onNewRegistration={handleNewRegistration}
                  showToast={showToast}
                />
              ) : (
                <RegistrationForm
                  onSubmitSuccess={handleRegistrationSubmit}
                  showToast={showToast}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'verify' && (
          <div className="page-view">
            <PublicSearch
              records={records}
              onNewRegistration={() => setActiveTab('register')}
              showToast={showToast}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Admin Security PIN Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsAdminUnlocked(true);
          setIsPinModalOpen(false);
          setIsAdminPortalOpen(true);
        }}
        showToast={showToast}
      />

      {/* Secret Admin Portal Modal */}
      <AdminPortalModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
        records={records}
        onDeleteRecord={handleDeleteRecord}
        onClearAllRecords={handleClearAll}
        onLoadSampleData={handleLoadSampleData}
        showToast={showToast}
      />
    </div>
  );
}
