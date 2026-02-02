// Admin Creation Helper
// To create admin account manually:

// 1. Go to the landing page
// 2. Click "Register" 
// 3. Use these exact details:
//    Email: siddiqshaik613@gmail.com
//    Password: Si@260805
//    Name: Admin
//    Branch: CSE (any branch)
//    Semester: 1 (any semester)

// 4. After registration, run this script in browser console to convert to admin:

async function convertToAdmin() {
  try {
    // Import Firebase
    const { getAuth } = await import('firebase/auth');
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    
    const auth = getAuth();
    const db = getFirestore();
    
    const user = auth.currentUser;
    if (!user) {
      console.error('No user logged in');
      return;
    }
    
    if (user.email !== 'siddiqshaik613@gmail.com') {
      console.error('Only authorized email can be converted to admin');
      return;
    }
    
    console.log('Converting user to admin...');
    
    // Update user document to admin role
    await updateDoc(doc(db, 'users', user.uid), {
      role: 'admin',
      branch: 'ALL',
      semester: 'N/A'
    });
    
    console.log('✅ User converted to admin successfully!');
    console.log('Please refresh the page to see admin dashboard');
    
  } catch (error) {
    console.error('❌ Error converting to admin:', error);
  }
}

// Run this in browser console after registering:
// convertToAdmin();