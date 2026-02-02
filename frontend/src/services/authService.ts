import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  branch: string;
  semester: string;
  points: number;
  notesUploaded: number;
  createdAt: any;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  branch: string;
  semester: string;
}

/**
 * Authentication service for Apna SAHE portal
 * Handles email validation, role management, and user creation
 */
export class AuthService {
  
  /**
   * Google Auth Provider instance
   */
  private static googleProvider = new GoogleAuthProvider();

  /**
   * Initialize Google Auth Provider with proper settings
   */
  private static initGoogleProvider() {
    try {
      // Configure Google provider with development-friendly settings
      const provider = new GoogleAuthProvider();
      
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Add required scopes
      provider.addScope('email');
      provider.addScope('profile');
      
      return provider;
    } catch (error) {
      console.error('Error initializing Google provider:', error);
      throw error;
    }
  }

  /**
   * Validates if email belongs to VRSEC domain
   */
  static validateEmail(email: string): boolean {
    if (!email) return false;
    const allowedDomain = '@vrsec.ac.in';
    return email.toLowerCase().endsWith(allowedDomain);
  }

  /**
   * Creates a new student account
   */
  static async signUpStudent(userData: SignUpData): Promise<{ user: User; userData: UserData }> {
    try {
      const { email, password, name, branch, semester } = userData;
      
      // Debug: Log the email being used
      console.log('🔍 Attempting signup with email:', email);
      console.log('🔍 Email length:', email.length);
      
      // Clean the email
      const cleanEmail = email.trim().toLowerCase();
      
      // Validate email domain
      if (!this.validateEmail(email)) {
        throw new Error('Only VRSEC students with @vrsec.ac.in email can register');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      const newUserData: UserData = {
        uid: user.uid,
        name: name,
        email: cleanEmail,
        role: cleanEmail === 'siddiqshaik613@gmail.com' ? 'admin' : 'student', // Auto-assign admin role
        branch: cleanEmail === 'siddiqshaik613@gmail.com' ? 'ALL' : branch.toUpperCase(),
        semester: cleanEmail === 'siddiqshaik613@gmail.com' ? 'N/A' : semester,
        points: 0,
        notesUploaded: 0,
        createdAt: serverTimestamp()
      };

      console.log('🔍 Creating user document:', newUserData);
      await setDoc(doc(db, 'users', user.uid), newUserData);
      console.log('✅ User document created successfully');

      return {
        user: user,
        userData: newUserData
      };
    } catch (error: any) {
      console.error('Error during student signup:', error);
      throw error;
    }
  }

  /**
   * Checks if email is authorized as admin
   */
  static isAuthorizedAdmin(email: string): boolean {
    if (!email) return false;
    const authorizedAdminEmail = 'siddiqshaik613@gmail.com';
    return email.toLowerCase() === authorizedAdminEmail.toLowerCase();
  }

  /**
   * Creates an admin account (manual process) - RESTRICTED
   */
  static async createAdmin({ email, password, name }: { email: string; password: string; name: string }): Promise<{ user: User; userData: UserData }> {
    try {
      // Check if email is authorized for admin access
      if (!this.isAuthorizedAdmin(email)) {
        throw new Error('Unauthorized: Only specific authorized email can be admin');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create admin document in Firestore
      const adminData: UserData = {
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

      await setDoc(doc(db, 'users', user.uid), adminData);

      return {
        user: user,
        userData: adminData
      };
    } catch (error: any) {
      console.error('Error during admin creation:', error);
      throw error;
    }
  }

  /**
   * Signs in a user
   */
  static async signIn(email: string, password: string): Promise<{ user: User; userData: UserData }> {
    try {
      // Debug: Log the email being used
      console.log('🔍 Attempting login with email:', email);
      console.log('🔍 Email length:', email.length);
      console.log('🔍 Email trimmed:', email.trim());
      
      // Clean the email
      const cleanEmail = email.trim().toLowerCase();

      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found in database');
      }

      const userData = userDoc.data() as UserData;

      // Additional admin authorization check
      if (userData.role === 'admin' && !this.isAuthorizedAdmin(userData.email)) {
        throw new Error('Unauthorized admin access');
      }

      return {
        user: user,
        userData: userData
      };
    } catch (error: any) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  static async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  /**
   * Signs in with Google for students
   */
  static async signInWithGoogle(): Promise<{ user: User; userData: UserData }> {
    try {
      console.log('🔍 Starting Google Sign-In...');
      
      // Initialize Google provider with proper settings
      const provider = this.initGoogleProvider();

      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log('🔍 Google Sign-In successful for:', user.email);

      if (!user.email) {
        throw new Error('No email found in Google account');
      }

      // Check if it's VRSEC email for students or authorized admin email
      const userEmail = user.email || '';
      const isVRSECEmail = this.validateEmail(userEmail);
      const isAuthorizedAdmin = this.isAuthorizedAdmin(userEmail);

      if (!isVRSECEmail && !isAuthorizedAdmin) {
        // Sign out the user since they're not authorized
        await signOut(auth);
        throw new Error('Only VRSEC students (@vrsec.ac.in) or authorized admin can register');
      }

      // Check if user document exists
      let userData: UserData;
      try {
        userData = await this.getCurrentUserData(user.uid);
        console.log('🔍 Existing user found:', userData.email);
      } catch (error) {
        // User doesn't exist in Firestore, need additional info
        console.log('🔍 New Google user, need additional info for:', user.email);
        
        if (isAuthorizedAdmin) {
          // Create admin account directly
          userData = {
            uid: user.uid,
            name: user.displayName || 'Admin',
            email: user.email.toLowerCase(),
            role: 'admin',
            branch: 'ALL',
            semester: 'N/A',
            points: 0,
            notesUploaded: 0,
            createdAt: serverTimestamp()
          };
          
          await setDoc(doc(db, 'users', user.uid), userData);
          console.log('🔍 Admin account created successfully');
        } else {
          // Student needs additional info - throw special error with user data
          const signUpError = new Error('GOOGLE_SIGNUP_REQUIRED') as any;
          signUpError.tempUser = user;
          signUpError.userEmail = user.email;
          signUpError.userName = user.displayName || user.email.split('@')[0];
          throw signUpError;
        }
      }

      return { user, userData };
    } catch (error: any) {
      console.error('Error during Google sign-in:', error);
      
      // Handle specific Firebase Auth errors
      if (error.code === 'auth/api-key-not-valid') {
        throw new Error('Firebase configuration error. Please check the project setup.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up blocked by browser. Please allow pop-ups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In. Please contact support.');
      }
      
      throw error;
    }
  }

  /**
   * Complete Google Sign-up for students with additional info
   */
  static async completeGoogleSignUp(
    user: User, 
    additionalData: { name: string; branch: string; semester: string }
  ): Promise<{ user: User; userData: UserData }> {
    try {
      if (!user.email) {
        throw new Error('No email found in user account');
      }

      // Only allow VRSEC emails
      const isVRSECEmail = this.validateEmail(user.email);

      if (!isVRSECEmail) {
        throw new Error('Only VRSEC students (@vrsec.ac.in) can register');
      }

      const userData: UserData = {
        uid: user.uid,
        name: additionalData.name,
        email: user.email.toLowerCase(),
        role: 'student',
        branch: additionalData.branch,
        semester: additionalData.semester,
        points: 0,
        notesUploaded: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('🔍 Google sign-up completed successfully for:', user.email);

      return { user, userData };
    } catch (error: any) {
      console.error('Error completing Google sign-up:', error);
      throw error;
    }
  }

  /**
   * Gets current user data from Firestore
   */
  static async getCurrentUserData(uid: string): Promise<UserData> {
    try {
      if (!uid) {
        throw new Error('User ID is required');
      }
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        // Try to recover by getting current auth user
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          // Check if this is the authorized admin email
          if (currentUser.email && this.isAuthorizedAdmin(currentUser.email)) {
            console.log('🔧 Creating missing admin document for:', currentUser.email);
            // Create admin document
            const adminData: UserData = {
              uid: currentUser.uid,
              name: currentUser.displayName || 'Admin',
              email: currentUser.email?.toLowerCase() || '',
              role: 'admin',
              branch: 'ALL',
              semester: 'N/A',
              points: 0,
              notesUploaded: 0,
              createdAt: serverTimestamp()
            };
            
            await setDoc(doc(db, 'users', currentUser.uid), adminData);
            return adminData;
          }
        }
        
        throw new Error('User data not found');
      }

      return userDoc.data() as UserData;
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Updates user profile information
   */
  static async updateUserProfile(uid: string, updateData: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateData);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Adds points to a user (for notes upload)
   */
  static async addUserPoints(uid: string, points: number = 10): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentData = userDoc.data() as UserData;
        await updateDoc(userRef, {
          points: (currentData.points || 0) + points,
          notesUploaded: (currentData.notesUploaded || 0) + 1
        });
      }
    } catch (error: any) {
      console.error('Error adding user points:', error);
      throw error;
    }
  }

  /**
   * Sets up auth state listener
   */
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Checks if user has admin role
   */
  static isAdmin(userData: UserData): boolean {
    return userData && userData.role === 'admin';
  }

  /**
   * Checks if user has student role
   */
  static isStudent(userData: UserData): boolean {
    return userData && userData.role === 'student';
  }
}