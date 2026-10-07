// IndexedDB Utility for RANBIDGE Verification Portal
// Provides persistent storage for large binary/base64 certificate files without localStorage quota limits.

const DB_NAME = 'RANBIDGE_Portal_DB';
const DB_VERSION = 1;
const STORE_CERTS = 'certificates';
const STORE_RECORDS = 'registrations';

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_CERTS)) {
        db.createObjectStore(STORE_CERTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_RECORDS)) {
        db.createObjectStore(STORE_RECORDS, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save all certificates to IndexedDB
export async function saveCertificatesToIDB(certificates) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CERTS, 'readwrite');
    const store = tx.objectStore(STORE_CERTS);

    // Clear existing & rewrite
    await new Promise((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = resolve;
      clearReq.onerror = reject;
    });

    for (const cert of certificates) {
      if (cert && cert.id) {
        store.put(cert);
      }
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('IndexedDB saveCertificates error:', err);
  }
}

// Load all certificates from IndexedDB
export async function getCertificatesFromIDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CERTS, 'readonly');
    const store = tx.objectStore(STORE_CERTS);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB getCertificates error:', err);
    return [];
  }
}

// Delete single certificate from IndexedDB
export async function deleteCertificateFromIDB(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CERTS, 'readwrite');
    const store = tx.objectStore(STORE_CERTS);
    store.delete(id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = reject;
    });
  } catch (err) {
    console.warn('IndexedDB deleteCertificate error:', err);
  }
}

// Clear all certificates from IndexedDB
export async function clearCertificatesFromIDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_CERTS, 'readwrite');
    const store = tx.objectStore(STORE_CERTS);
    store.clear();
  } catch (err) {
    console.warn('IndexedDB clearCertificates error:', err);
  }
}
