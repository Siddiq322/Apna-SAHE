# Firebase Setup Instructions for Apna SAHE

## Prerequisites
1. Node.js installed on your system
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Firebase project created in Firebase Console

## Step-by-Step Setup

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "Apna SAHE"
3. Enable Authentication with Email/Password provider
4. Create Firestore database in production mode
5. Enable Firebase Storage

### 2. Get Firebase Configuration

1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web
4. Register your app with name "Apna SAHE"
5. Copy the Firebase config object

### 3. Environment Setup

1. Copy `.env.example` to `.env.local` in your frontend directory:
   \`\`\`bash
   cp backend/.env.example frontend/.env.local
   \`\`\`

2. Fill in your Firebase config values in `.env.local`:
   \`\`\`
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   \`\`\`

### 4. Firebase CLI Setup

1. Login to Firebase CLI:
   \`\`\`bash
   firebase login
   \`\`\`

2. Initialize Firebase in your backend directory:
   \`\`\`bash
   cd backend
   firebase init
   \`\`\`

3. Select the following options:
   - Firestore: Configure security rules and indexes
   - Storage: Configure security rules
   - Hosting: Configure for static website
   - Choose existing project (select your Apna SAHE project)

### 5. Deploy Security Rules

1. Deploy Firestore rules:
   \`\`\`bash
   firebase deploy --only firestore:rules
   \`\`\`

2. Deploy Storage rules:
   \`\`\`bash
   firebase deploy --only storage
   \`\`\`

3. Deploy Firestore indexes:
   \`\`\`bash
   firebase deploy --only firestore:indexes
   \`\`\`

### 6. Install Dependencies

1. In your frontend directory:
   \`\`\`bash
   npm install firebase
   \`\`\`

### 7. Copy Services to Frontend

Copy the service files from backend to your frontend src directory:

\`\`\`bash
# Create services directory in frontend
mkdir -p frontend/src/services
mkdir -p frontend/src/config

# Copy files
cp backend/config/firebase.js frontend/src/config/
cp backend/services/*.js frontend/src/services/
\`\`\`

### 8. Create Sample Data (Optional)

You can use the Firebase Admin SDK to create sample data:

\`\`\`javascript
// Create first admin user manually
import { AuthService } from './services/authService.js';

await AuthService.createAdmin({
  email: 'admin@vrsec.ac.in',
  password: 'admin123',
  name: 'System Admin'
});
\`\`\`

### 9. Testing

1. Start the Firebase emulators for local testing:
   \`\`\`bash
   firebase emulators:start
   \`\`\`

2. Update your Firebase config for emulator mode in development:
   \`\`\`javascript
   if (import.meta.env.DEV) {
     import { connectAuthEmulator, getAuth } from 'firebase/auth';
     import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
     import { connectStorageEmulator, getStorage } from 'firebase/storage';
     
     const auth = getAuth();
     const db = getFirestore();
     const storage = getStorage();
     
     connectAuthEmulator(auth, 'http://localhost:9099');
     connectFirestoreEmulator(db, 'localhost', 8080);
     connectStorageEmulator(storage, 'localhost', 9199);
   }
   \`\`\`

## Usage in React Components

### Import and Use Services

\`\`\`javascript
import { AuthService } from '../services/authService';
import { NotesService } from '../services/notesService';
import { UserService } from '../services/userService';

// In your components
const handleLogin = async (email, password) => {
  try {
    const result = await AuthService.signIn(email, password);
    console.log('Logged in:', result);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
\`\`\`

### Auth State Management

\`\`\`javascript
import { useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
        setUser({ ...firebaseUser, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}
\`\`\`

## Security Notes

1. **Email Validation**: Only @vrsec.ac.in emails are allowed
2. **Role-Based Access**: Students and admins have different permissions
3. **File Upload Limits**: PDFs only, 10MB maximum size
4. **Firestore Rules**: Comprehensive security rules prevent unauthorized access
5. **Storage Rules**: File type and size validation at storage level

## Deployment

For production deployment:

\`\`\`bash
# Build your React app
npm run build

# Deploy to Firebase Hosting
firebase deploy
\`\`\`

## Support

Refer to the usage examples in \`backend/examples/usage.js\` for detailed implementation examples.