// Firebase v9 modular SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCyIGj3_TBDOIZSCJXfyYHMRY3L3qJf7Ko",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apna-sahe.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apna-sahe",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apna-sahe.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "866717994154",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:866717994154:web:bd65f39b92d6ff1ff68297"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;