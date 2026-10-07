import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCamG9GkhuEj_Rw8gYOJcFgDtK_k9k1emQ",
  authDomain: "ranbidge-verification-portal.firebaseapp.com",
  projectId: "ranbidge-verification-portal",
  storageBucket: "ranbidge-verification-portal.firebasestorage.app",
  messagingSenderId: "356445813965",
  appId: "1:356445813965:web:22637adcadd34c2e873d84",
  measurementId: "G-LVCM5NYTK7"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Analytics (safely check browser support)
export let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { 
  app, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  writeBatch 
};
