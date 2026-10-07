import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import VerificationCard from './components/VerificationCard';
import PublicSearch from './components/PublicSearch';
import AdminPinModal from './components/AdminPinModal';
import AdminPortalModal from './components/AdminPortalModal';
import Footer from './components/Footer';
import { CheckCircle2 } from 'lucide-react';

// Firebase Imports
import { db, collection, addDoc, onSnapshot, deleteDoc, doc, getDocs } from './firebase';

// IndexedDB Persistence Import for large binary certificate files
import { 
  saveCertificatesToIDB, 
  getCertificatesFromIDB, 
  deleteCertificateFromIDB 
} from './utils/indexedDB';

const STORAGE_KEY = 'ranbidge_registrations';
const CERTS_STORAGE_KEY = 'ranbidge_certificates';

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

  const [certificates, setCertificates] = useState(() => {
    try {
      const saved = localStorage.getItem(CERTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error reading certs localStorage:', err);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('register');
  const [latestRecord, setLatestRecord] = useState(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // 1. Initial Load: Retrieve certificates from IndexedDB to guarantee state persistence after page refresh
  useEffect(() => {
    getCertificatesFromIDB()
      .then(idbCerts => {
        if (idbCerts && idbCerts.length > 0) {
          setCertificates(prev => {
            const map = new Map();
            prev.forEach(c => map.set(c.id, c));
            idbCerts.forEach(c => map.set(c.id, c));
            return Array.from(map.values());
          });
        }
      })
      .catch(err => {
        console.warn('Error reading from IndexedDB:', err);
      });
  }, []);

  // 2. Listen to Firestore registrations updates
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const colRef = collection(db, 'registrations');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(d => ({
            firestoreId: d.id,
            ...d.data()
          }));
          fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          setRecords(fetched);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
          } catch (e) {}
        }
      }, (err) => {
        console.warn('Firestore registrations fallback:', err);
      });
    } catch (err) {
      console.warn('Firebase init fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  // 3. Listen to Firestore certificates updates & merge with local IndexedDB state
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const colRef = collection(db, 'certificates');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(d => ({
            firestoreId: d.id,
            ...d.data()
          }));

          setCertificates(prev => {
            const map = new Map();
            prev.forEach(c => map.set(c.id, c));
            fetched.forEach(c => map.set(c.id, { ...map.get(c.id), ...c }));
            const merged = Array.from(map.values());
            saveCertificatesToIDB(merged);
            try {
              localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      }, (err) => {
        console.warn('Firestore certs fallback:', err);
      });
    } catch (err) {
      console.warn('Firebase certs fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  // Sync registration records state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {}
  }, [records]);

  // Sync certificates state to both IndexedDB and localStorage
  useEffect(() => {
    if (certificates.length > 0) {
      saveCertificatesToIDB(certificates);
      try {
        localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(certificates));
      } catch (err) {
        console.warn('LocalStorage certs quota exceeded, safely saved to IndexedDB');
      }
    }
  }, [certificates]);

  // Toast message helper
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Registration Submission handler
  const handleRegistrationSubmit = async (newRecord) => {
    const recordWithTime = {
      ...newRecord,
      timestamp: Date.now()
    };

    setRecords(prev => [recordWithTime, ...prev]);
    setLatestRecord(recordWithTime);
    showToast(`Registration completed for ${newRecord.fullName}!`);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const colRef = collection(db, 'registrations');
      await addDoc(colRef, recordWithTime);
    } catch (err) {
      console.error('Error saving registration to Firebase:', err);
    }
  };

  const handleNewRegistration = () => {
    setLatestRecord(null);
    setActiveTab('register');
  };

  // Delete record handler
  const handleDeleteRecord = async (id) => {
    const target = records.find(r => r.id === id || r.firestoreId === id);
    setRecords(prev => prev.filter(r => r.id !== id && r.firestoreId !== id));
    showToast('Record deleted successfully');

    if (target && target.firestoreId) {
      try {
        await deleteDoc(doc(db, 'registrations', target.firestoreId));
      } catch (err) {
        console.error('Error deleting registration from Firestore:', err);
      }
    }
  };

  // Clear all registrations handler
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL registration records? This action cannot be undone.')) {
      setRecords([]);
      showToast('All registration records have been cleared');

      try {
        const colRef = collection(db, 'registrations');
        const snapshot = await getDocs(colRef);
        const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'registrations', d.id)));
        await Promise.all(deletePromises);
      } catch (err) {
        console.error('Error clearing Firestore registrations:', err);
      }
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

    sampleRecords.forEach(rec => handleRegistrationSubmit(rec));
  };

  // Save Dumped Certificates handler
  const handleSaveCertificates = async (newCerts) => {
    const updated = [...newCerts, ...certificates];
    setCertificates(updated);
    showToast(`Saved ${newCerts.length} certificate(s) persistently!`);

    // 1. Save directly to IndexedDB (unlimited binary/base64 storage)
    await saveCertificatesToIDB(updated);

    // 2. Backup to localStorage with safety check
    try {
      localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage backup skipped due to size, IndexedDB holds all certificates safely.');
    }

    // 3. Sync to Firebase Firestore
    try {
      const colRef = collection(db, 'certificates');
      for (const cert of newCerts) {
        const certStr = JSON.stringify(cert);
        if (certStr.length < 950000) {
          await addDoc(colRef, cert);
        } else {
          console.warn(`Certificate ${cert.fileName} exceeds 950KB Firestore doc limit, stored in IndexedDB.`);
        }
      }
    } catch (err) {
      console.error('Error saving certificates to Firebase:', err);
    }
  };

  // Delete Certificate handler
  const handleDeleteCertificate = async (id) => {
    const target = certificates.find(c => c.id === id || c.firestoreId === id);
    const updated = certificates.filter(c => c.id !== id && c.firestoreId !== id);
    setCertificates(updated);
    showToast('Certificate deleted');

    // Remove from IndexedDB & LocalStorage
    await deleteCertificateFromIDB(id);
    try {
      localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    // Remove from Firestore
    if (target && target.firestoreId) {
      try {
        await deleteDoc(doc(db, 'certificates', target.firestoreId));
      } catch (err) {
        console.error('Error deleting certificate from Firestore:', err);
      }
    }
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
                  certificates={certificates}
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
              certificates={certificates}
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
        certificates={certificates}
        onDeleteRecord={handleDeleteRecord}
        onClearAllRecords={handleClearAll}
        onLoadSampleData={handleLoadSampleData}
        onSaveCertificates={handleSaveCertificates}
        onDeleteCertificate={handleDeleteCertificate}
        showToast={showToast}
      />
    </div>
  );
}
