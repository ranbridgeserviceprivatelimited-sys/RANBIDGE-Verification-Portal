import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import RegistrationForm from './components/RegistrationForm';
import VerificationCard from './components/VerificationCard';
import PublicSearch from './components/PublicSearch';
import StudentCertificatePortal from './components/StudentCertificatePortal';
import AdminPinModal from './components/AdminPinModal';
import AdminPortalModal from './components/AdminPortalModal';
import RegistrationSuccessModal from './components/RegistrationSuccessModal';
import Footer from './components/Footer';
import { CheckCircle2 } from 'lucide-react';

// Firebase Imports
import { db, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, getDocs } from './firebase';

// IndexedDB Persistence Import for large binary certificate files
import { 
  saveCertificatesToIDB, 
  getCertificatesFromIDB, 
  deleteCertificateFromIDB 
} from './utils/indexedDB';

const STORAGE_KEY = 'ranbidge_registrations';
const CERTS_STORAGE_KEY = 'ranbidge_certificates';
const MASTER_DUMP_STORAGE_KEY = 'ranbidge_master_dump';

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

  const [masterDump, setMasterDump] = useState(() => {
    try {
      const saved = localStorage.getItem(MASTER_DUMP_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error reading master dump localStorage:', err);
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const saved = localStorage.getItem('ranbidge_active_tab');
      if (saved && ['register', 'check-certs', 'verify'].includes(saved)) {
        return saved;
      }
      return 'register';
    } catch (err) {
      return 'register';
    }
  });
  const [latestRecord, setLatestRecord] = useState(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(() => {
    try {
      const unlocked = sessionStorage.getItem('ranbidge_admin_unlocked') === 'true';
      const portalOpen = sessionStorage.getItem('ranbidge_admin_portal_open') === 'true';
      return unlocked || portalOpen;
    } catch (err) {
      return false;
    }
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(() => {
    try {
      return sessionStorage.getItem('ranbidge_admin_portal_open') === 'true';
    } catch (err) {
      return false;
    }
  });
  const [registeredRecord, setRegisteredRecord] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Portal Settings (Dynamic Colleges, Workshops, & Departments options managed by Admin)
  const [portalSettings, setPortalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('ranbidge_portal_settings');
      return saved ? JSON.parse(saved) : {
        colleges: [
          "Narasaraopeta Engineering College",
          "Tirumala Engineering College",
          "AM Reddy College"
        ],
        workshops: [
          "Idea to MVP - Entrepreneurship & Startups"
        ],
        departments: [
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
        ]
      };
    } catch (e) {
      return {
        colleges: ["Narasaraopeta Engineering College", "Tirumala Engineering College", "AM Reddy College"],
        workshops: ["Idea to MVP - Entrepreneurship & Startups"],
        departments: [
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
        ]
      };
    }
  });

  const handleSavePortalSettings = (newSettings) => {
    setPortalSettings(newSettings);
    try {
      localStorage.setItem('ranbidge_portal_settings', JSON.stringify(newSettings));
    } catch (e) {}
  };

  // Persist Active Tab to localStorage across browser refresh
  useEffect(() => {
    try {
      localStorage.setItem('ranbidge_active_tab', activeTab);
    } catch (err) {}
  }, [activeTab]);

  // Persist Admin Unlocked status to sessionStorage across browser refresh
  useEffect(() => {
    try {
      sessionStorage.setItem('ranbidge_admin_unlocked', isAdminUnlocked ? 'true' : 'false');
    } catch (err) {}
  }, [isAdminUnlocked]);

  // Persist Admin Portal Modal state to sessionStorage across browser refresh
  useEffect(() => {
    try {
      sessionStorage.setItem('ranbidge_admin_portal_open', isAdminPortalOpen ? 'true' : 'false');
    } catch (err) {}
  }, [isAdminPortalOpen]);

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
        const fetched = snapshot.docs.map(d => ({
          firestoreId: d.id,
          ...d.data()
        }));
        fetched.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setRecords(fetched);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fetched));
        } catch (e) {}
      }, (err) => {
        console.warn('Firestore registrations fallback:', err);
      });
    } catch (err) {
      console.warn('Firebase init fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  // 3. Listen to Firestore certificates updates & sync with IndexedDB / local state
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const colRef = collection(db, 'certificates');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({
          firestoreId: d.id,
          ...d.data()
        }));

        setCertificates(prev => {
          if (snapshot.empty) {
            saveCertificatesToIDB([]);
            try {
              localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify([]));
            } catch (e) {}
            return [];
          }

          const fetchedFirestoreIds = new Set(fetched.map(f => f.firestoreId).filter(Boolean));
          const filteredPrev = prev.filter(c => {
            if (c.firestoreId && !fetchedFirestoreIds.has(c.firestoreId)) {
              return false;
            }
            return true;
          });

          const map = new Map();
          filteredPrev.forEach(c => map.set(c.id, c));
          fetched.forEach(c => map.set(c.id, { ...map.get(c.id), ...c }));
          const merged = Array.from(map.values());

          saveCertificatesToIDB(merged);
          try {
            localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
      }, (err) => {
        console.warn('Firestore certs fallback:', err);
      });
    } catch (err) {
      console.warn('Firebase certs fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  // 4. Listen to Firestore master_dump updates & merge state
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const colRef = collection(db, 'master_dump');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetched = snapshot.docs.map(d => ({
          firestoreId: d.id,
          ...d.data()
        }));
        setMasterDump(fetched);
        try {
          localStorage.setItem(MASTER_DUMP_STORAGE_KEY, JSON.stringify(fetched));
        } catch (e) {}
      }, (err) => {
        console.warn('Firestore master_dump fallback:', err);
      });
    } catch (err) {
      console.warn('Firebase master_dump fallback:', err);
    }
    return () => unsubscribe();
  }, []);

  // 5. Dynamic Auto-Verification Sync: Auto-verify records when matched with master dump
  useEffect(() => {
    if (masterDump.length === 0) return;

    const masterSet = new Set(masterDump.map(m => m.rollNumber ? m.rollNumber.trim().toUpperCase() : ''));

    setRecords(prevRecords => {
      if (!prevRecords || prevRecords.length === 0) return prevRecords;
      let hasChanges = false;
      const updatedRecords = prevRecords.map(rec => {
        const rollKey = rec.rollNumber ? rec.rollNumber.trim().toUpperCase() : '';
        if (masterSet.has(rollKey) && rec.verificationStatus !== 'verified') {
          hasChanges = true;
          return {
            ...rec,
            verificationStatus: 'verified',
            verifiedAt: rec.verifiedAt || new Date().toLocaleString()
          };
        }
        return rec;
      });
      return hasChanges ? updatedRecords : prevRecords;
    });
  }, [masterDump]);

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

  // Sync master dump state to localStorage
  useEffect(() => {
    if (masterDump.length > 0) {
      try {
        localStorage.setItem(MASTER_DUMP_STORAGE_KEY, JSON.stringify(masterDump));
      } catch (err) {}
    }
  }, [masterDump]);

  // Master Dump Handlers
  const handleSaveMasterDump = async (newEntries) => {
    const existingRolls = new Set(masterDump.map(m => m.rollNumber ? m.rollNumber.trim().toUpperCase() : ''));
    const filteredNew = newEntries.filter(e => e.rollNumber && !existingRolls.has(e.rollNumber.trim().toUpperCase()));

    if (filteredNew.length === 0) {
      showToast('ℹ️ All entered roll numbers are already present in the master dump!');
      return;
    }

    const updated = [...filteredNew, ...masterDump];
    setMasterDump(updated);
    try {
      localStorage.setItem(MASTER_DUMP_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    try {
      const colRef = collection(db, 'master_dump');
      for (const entry of filteredNew) {
        await addDoc(colRef, entry);
      }
    } catch (err) {
      console.warn('Error saving master dump to Firebase:', err);
    }

    showToast(`Dumped ${filteredNew.length} master roll number & name record(s)!`);
  };

  const handleDeleteMasterEntry = async (id) => {
    const target = masterDump.find(m => m.id === id || m.firestoreId === id);
    const updated = masterDump.filter(m => m.id !== id && m.firestoreId !== id);
    setMasterDump(updated);
    try {
      localStorage.setItem(MASTER_DUMP_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}

    if (target && target.firestoreId) {
      try {
        await deleteDoc(doc(db, 'master_dump', target.firestoreId));
      } catch (err) {
        console.error('Error deleting master dump entry from Firestore:', err);
      }
    }
    showToast('Master dump entry deleted');
  };

  const handleClearAllMasterDump = async () => {
    setMasterDump([]);
    try {
      localStorage.removeItem(MASTER_DUMP_STORAGE_KEY);
    } catch (e) {}

    try {
      const colRef = collection(db, 'master_dump');
      const snapshot = await getDocs(colRef);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'master_dump', d.id)));
      await Promise.all(deletePromises);
    } catch (err) {
      console.error('Error clearing Firestore master_dump:', err);
    }

    showToast('All master roll numbers & names dump records cleared');
  };

  const handleLoadSampleMasterData = async () => {
    const sampleMaster = [
      {
        id: 'DUMP-21CS1084',
        rollNumber: '21CS1084',
        fullName: 'Aarav Sharma',
        college: 'IIT Madras',
        department: 'Computer Science Engineering',
        passoutYear: '2026',
        workshopName: 'AI & Machine Learning Systems',
        addedAt: new Date().toLocaleString()
      },
      {
        id: 'DUMP-22ECE042',
        rollNumber: '22ECE042',
        fullName: 'Priya Ananth',
        college: 'Anna University',
        department: 'Electronics & Communication',
        passoutYear: '2027',
        workshopName: 'IoT & Embedded Robotics',
        addedAt: new Date().toLocaleString()
      },
      {
        id: 'DUMP-20ME091',
        rollNumber: '20ME091',
        fullName: 'Vikram Reddy',
        college: 'NIT Trichy',
        department: 'Mechanical Engineering',
        passoutYear: '2025',
        workshopName: 'Cloud Infrastructure & DevOps',
        addedAt: new Date().toLocaleString()
      },
      {
        id: 'DUMP-23471A4245',
        rollNumber: '23471A4245',
        fullName: 'R. Gopinathreddy',
        college: 'JNTUH College of Engineering',
        department: 'Artificial Intelligence & Data Science',
        passoutYear: '2026',
        workshopName: 'Full Stack Web & AI Systems',
        addedAt: new Date().toLocaleString()
      }
    ];

    await handleSaveMasterDump(sampleMaster);
  };

  // Toast message helper - keeps only 1 active popup on screen in a single line
  const showToast = (message) => {
    const id = Date.now();
    setToasts([{ id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Registration Submission handler
  const handleRegistrationSubmit = async (newRecord) => {
    const recordWithTime = {
      ...newRecord,
      timestamp: Date.now()
    };

    setRecords(prev => [recordWithTime, ...prev]);
    setRegisteredRecord(recordWithTime);
    setLatestRecord(recordWithTime);
    setIsSuccessModalOpen(true);
    showToast(`Registration completed for ${newRecord.fullName}!`);

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

  // Verify & Accept Registration Handler (Auto generates official certificate)
  const handleVerifyRecord = async (id) => {
    let targetRecord = null;
    const updatedRecords = records.map(r => {
      if (r.id === id || r.firestoreId === id) {
        targetRecord = {
          ...r,
          verificationStatus: 'verified',
          verifiedAt: new Date().toLocaleString()
        };
        return targetRecord;
      }
      return r;
    });

    if (!targetRecord) return;

    setRecords(updatedRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));
    } catch (e) {}

    // Update in Firestore if present
    if (targetRecord.firestoreId) {
      try {
        await updateDoc(doc(db, 'registrations', targetRecord.firestoreId), {
          verificationStatus: 'verified',
          verifiedAt: targetRecord.verifiedAt
        });
      } catch (err) {
        console.error('Error updating Firestore registration status:', err);
      }
    }

    // Auto-generate official certificate if not already created
    const rollKey = targetRecord.rollNumber ? targetRecord.rollNumber.trim().toUpperCase() : '';
    const certExists = certificates.some(c => 
      c.rollNumber && c.rollNumber.trim().toUpperCase() === rollKey
    );

    if (!certExists) {
      const newCert = {
        id: 'CERT-' + (targetRecord.rollNumber || targetRecord.id),
        fileName: `${targetRecord.fullName || 'Student'}_Certificate.pdf`,
        rollNumber: targetRecord.rollNumber || '',
        studentName: targetRecord.fullName || '',
        college: targetRecord.college || '',
        workshopName: targetRecord.workshopName || 'RANBIDGE Verification',
        issueDate: new Date().toISOString().split('T')[0],
        downloadUrl: '#',
        fileSize: '245 KB',
        verificationStatus: 'verified',
        uploadedAt: new Date().toLocaleString()
      };
      await handleSaveCertificates([newCert]);
    }

    showToast(`✅ Registration accepted & certificate generated for ${targetRecord.fullName}!`);
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

  // Refresh & Re-sync Data with Firebase & IndexedDB
  const handleRefreshData = async () => {
    let registrationCount = 0;
    let certCount = 0;
    let masterCount = 0;

    try {
      // 1. Re-query Registrations from Firestore
      const regCol = collection(db, 'registrations');
      const regSnapshot = await getDocs(regCol);
      const fetchedRegs = regSnapshot.docs.map(d => ({
        firestoreId: d.id,
        ...d.data()
      }));
      fetchedRegs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRecords(fetchedRegs);
      registrationCount = fetchedRegs.length;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedRegs));
      } catch (e) {}

      // 2. Re-query Certificates from Firestore
      const certCol = collection(db, 'certificates');
      const certSnapshot = await getDocs(certCol);
      const fetchedCerts = certSnapshot.docs.map(d => ({
        firestoreId: d.id,
        ...d.data()
      }));
      setCertificates(fetchedCerts);
      certCount = fetchedCerts.length;
      await saveCertificatesToIDB(fetchedCerts);
      try {
        localStorage.setItem(CERTS_STORAGE_KEY, JSON.stringify(fetchedCerts));
      } catch (e) {}

      // 3. Re-query Master Dump from Firestore
      const masterCol = collection(db, 'master_dump');
      const masterSnapshot = await getDocs(masterCol);
      const fetchedMaster = masterSnapshot.docs.map(d => ({
        firestoreId: d.id,
        ...d.data()
      }));
      setMasterDump(fetchedMaster);
      masterCount = fetchedMaster.length;
      try {
        localStorage.setItem(MASTER_DUMP_STORAGE_KEY, JSON.stringify(fetchedMaster));
      } catch (e) {}

      showToast(`⚡ Synced & Refreshed! ${registrationCount} record(s), ${certCount} cert(s), ${masterCount} master entry(s).`);
    } catch (err) {
      console.warn('Refresh notice:', err);
      showToast('⚡ Local database refreshed!');
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
        onRefreshData={handleRefreshData}
        onOpenPinModal={() => setIsPinModalOpen(true)}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminPortal={() => setIsAdminPortalOpen(true)}
        showToast={showToast}
      />

      {/* Main Body */}
      {(() => {
        const validTab = ['register', 'check-certs', 'verify'].includes(activeTab) ? activeTab : 'register';
        return (
          <main className="main-content">
            {validTab === 'register' && (
              <div className="page-view">
                <div id="registrationFormSection">
                  <RegistrationForm
                    onSubmitSuccess={handleRegistrationSubmit}
                    masterDump={masterDump}
                    records={records}
                    certificates={certificates}
                    portalSettings={portalSettings}
                    showToast={showToast}
                  />
                </div>
              </div>
            )}

            {validTab === 'check-certs' && (
              <div className="page-view">
                <StudentCertificatePortal
                  records={records}
                  certificates={certificates}
                  masterDump={masterDump}
                  initialSearchQuery={latestRecord ? (latestRecord.rollNumber || latestRecord.fullName) : ''}
                  onNewRegistration={() => setActiveTab('register')}
                  showToast={showToast}
                />
              </div>
            )}

            {validTab === 'verify' && (
              <div className="page-view">
                <PublicSearch
                  records={records}
                  certificates={certificates}
                  latestRecord={latestRecord || registeredRecord}
                  onNewRegistration={() => setActiveTab('register')}
                  showToast={showToast}
                />
              </div>
            )}
          </main>
        );
      })()}

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
        masterDump={masterDump}
        portalSettings={portalSettings}
        onSavePortalSettings={handleSavePortalSettings}
        onDeleteRecord={handleDeleteRecord}
        onVerifyRecord={handleVerifyRecord}
        onAddRecord={handleRegistrationSubmit}
        onClearAllRecords={handleClearAll}
        onLoadSampleData={handleLoadSampleData}
        onSaveCertificates={handleSaveCertificates}
        onDeleteCertificate={handleDeleteCertificate}
        onSaveMasterDump={handleSaveMasterDump}
        onDeleteMasterEntry={handleDeleteMasterEntry}
        onClearAllMasterDump={handleClearAllMasterDump}
        onLoadSampleMasterData={handleLoadSampleMasterData}
        showToast={showToast}
      />

      {/* Registration Success Animated Popup Modal */}
      <RegistrationSuccessModal
        isOpen={isSuccessModalOpen}
        record={registeredRecord}
        onClose={() => setIsSuccessModalOpen(false)}
        onGoToCertificates={() => {
          setIsSuccessModalOpen(false);
          setLatestRecord(registeredRecord);
          setActiveTab('verify');
        }}
        showToast={showToast}
      />
    </div>
  );
}
