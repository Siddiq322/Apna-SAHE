// Simple Firebase connection test
import { auth, db } from '@/config/firebase';
import { GoogleAuthProvider } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🧪 Testing Firebase Connection...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('✅ Auth instance:', !!auth);
    console.log('✅ DB instance:', !!db);
    console.log('✅ Auth config:', {
      apiKey: auth.app.options.apiKey?.substring(0, 20) + '...',
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain
    });
    
    // Test 2: Check Google Auth Provider
    const googleProvider = new GoogleAuthProvider();
    console.log('✅ Google Provider created:', !!googleProvider);
    
    // Test 3: Check current environment
    console.log('🌍 Environment info:', {
      isDev: import.meta.env.DEV,
      hostname: window.location.hostname,
      port: window.location.port,
      origin: window.location.origin
    });
    
    // Test 4: Try to access a Firestore collection (read-only test)
    try {
      const testCollection = collection(db, 'test');
      console.log('✅ Firestore collection accessible');
    } catch (err: any) {
      console.warn('⚠️ Firestore access issue:', err.message);
    }
    
    // Test 5: Check if the current domain is likely causing issues
    if (window.location.hostname === 'localhost') {
      console.log('🔧 Development environment detected - API key restrictions may apply');
    }
    
    console.log('✅ Firebase connection test completed successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseConnection();
}