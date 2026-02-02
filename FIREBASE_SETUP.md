# Apna SAHE Firebase Setup Guide

## Quick Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "Apna SAHE"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. In Firebase Console, go to Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Save changes

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Start in production mode
4. Choose location (preferably closest to your users)

#### Storage
1. Go to Storage
2. Click "Get started"
3. Start in production mode
4. Same location as Firestore

### 3. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web
4. Register app name: "Apna SAHE"
5. Copy the Firebase SDK configuration

### 4. Update Environment Variables
1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Add your Firebase config to `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### 5. Deploy Security Rules
1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in backend directory:
   ```bash
   cd backend
   firebase init
   ```
   - Select: Firestore, Storage, Hosting
   - Choose existing project
   - Use existing files

4. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   firebase deploy --only firestore:indexes
   ```

### 6. Test the Setup
1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try creating an admin user first (use browser console):
   ```javascript
   import { AuthService } from './src/services/authService';
   
   await AuthService.createAdmin({
     email: 'admin@vrsec.ac.in',
     password: 'admin123',
     name: 'System Administrator'
   });
   ```

3. Test student registration with @vrsec.ac.in email

## Available Services

### Authentication (authService.ts)
- Student registration (@vrsec.ac.in only)
- Admin creation
- Login/logout
- Role-based access

### Notes (notesService.ts)
- PDF upload to Firebase Storage
- Metadata storage in Firestore
- Automatic points system (+10 per upload)
- Search and filtering

### Events (eventService.ts)
- Create/manage events
- Branch-wise filtering
- Admin-only management

### Queries (queryService.ts)
- Student note requests
- Admin status management
- Pending query tracking

### Users (userService.ts)
- User management
- Leaderboard (points-based)
- Statistics

### Infrastructure (infrastructureService.ts)
- Facilities management
- Location info

## Components Available

### NotesUpload Component
Already created and ready to use:
```jsx
import NotesUpload from './src/components/NotesUpload';

// Use in your pages
<NotesUpload />
```

### Updated AuthContext
Your existing AuthContext has been updated to work with Firebase.
All your existing components should work with these additional features:
- `loading` state
- `error` state
- `signUp` method
- `isAdmin` and `isStudent` helpers

## Security Features

✅ Email validation (@vrsec.ac.in only)
✅ Role-based access control
✅ File type validation (PDF only)
✅ File size limits (10MB max)
✅ Firestore security rules
✅ Storage security rules

## Next Steps

1. Deploy security rules to Firebase
2. Create your first admin user
3. Test student registration
4. Start building your React components

Your Firebase backend is fully ready! 🚀