// Firebase v9 modular SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using working values directly
const firebaseConfig = {
  apiKey: "AIzaSyCyIGj3_TBDOIZSCJXfyYHMRY3L3qJf7Ko",
  authDomain: "apna-sahe.firebaseapp.com",
  projectId: "apna-sahe",
  storageBucket: "apna-sahe.firebasestorage.app",
  messagingSenderId: "866717994154",
  appId: "1:866717994154:web:bd65f39b92d6ff1ff68297"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;