// Firebase v9 modular SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration - using correct values directly
const firebaseConfig = {
  apiKey: "AIzaSyBZiQorEJLXr5Blr715vq1THS0sejxZsy0",
  authDomain: "apna-sahe.firebaseapp.com",
  projectId: "apna-sahe",
  storageBucket: "apna-sahe.firebasestorage.app",
  messagingSenderId: "466480302565",
  appId: "1:466480302565:web:e3c4082453a320957e470c",
  measurementId: "G-W72QTJENL1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;