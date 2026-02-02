// Run this script in the browser console when logged out to create admin user
// 1. Go to your website
// 2. Make sure you're logged out
// 3. Open browser console (F12)
// 4. Copy and paste this entire script and press Enter

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Import Firebase functions (assuming they're available globally)
    const { createUserWithEmailAndPassword, updateProfile } = window.firebase.auth;
    const { doc, setDoc, serverTimestamp } = window.firebase.firestore;
    
    const email = 'siddiqshaik613@gmail.com';
    const password = 'Si@260805';
    const name = 'Admin';

    console.log('Creating Firebase auth user...');
    const userCredential = await createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    console.log('Updating profile...');
    await updateProfile(user, { displayName: name });

    console.log('Creating Firestore document...');
    const adminData = {
      uid: user.uid,
      name: name,
      email: email.toLowerCase(),
      role: 'admin',
      branch: 'ALL',
      semester: 'N/A',
      points: 0,
      notesUploaded: 0,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(window.firebase.db, 'users', user.uid), adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    
    // Sign out the newly created admin user
    await window.firebase.auth.signOut();
    console.log('✅ Signed out - you can now login with admin credentials');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.log('🔍 Admin user already exists, trying to sign in...');
      try {
        await window.firebase.auth.signInWithEmailAndPassword('siddiqshaik613@gmail.com', 'Si@260805');
        await window.firebase.auth.signOut();
        console.log('✅ Admin login verified - credentials are working');
      } catch (loginError) {
        console.error('❌ Admin login failed:', loginError);
      }
    }
  }
}

// Run the function
createAdminUser();