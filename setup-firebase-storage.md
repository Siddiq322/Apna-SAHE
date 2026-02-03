# Firebase Storage Setup Guide

## Issue
Firebase Storage was not properly enabled, causing PDF upload/download failures.

## Steps to Fix

### 1. Enable Firebase Storage in Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/apna-sahe/storage)
2. Click "Get Started" to enable Firebase Storage
3. Choose "Start in production mode"
4. Select your preferred location (same as Firestore if possible)

### 2. Update Storage Rules
After enabling Firebase Storage, deploy the updated rules:

```bash
cd backend
firebase deploy --only storage
```

### 3. Test Upload
After Firebase Storage is enabled:
1. Try uploading a new PDF note
2. Check if the URL starts with `https://firebasestorage.googleapis.com`
3. Test viewing and downloading

### 4. Migration Notice
⚠️ **Important**: Existing notes with Cloudinary URLs will show a warning message. These need to be re-uploaded to work with Firebase Storage.

## Current Status
- ✅ Firebase Storage rules updated (authentication-based access)
- ✅ Upload logic implemented for Firebase Storage  
- ✅ View/download methods updated with error handling
- ❌ Firebase Storage not yet enabled in console
- ❌ Legacy Cloudinary notes will show warnings

## Next Steps
1. Enable Firebase Storage in the console
2. Deploy storage rules
3. Test with new uploads
4. Consider migration script for existing notes