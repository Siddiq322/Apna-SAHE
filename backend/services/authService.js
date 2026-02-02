import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

/**
 * Authentication service for Apna SAHE portal
 * Handles email validation, role management, and user creation
 */
export class AuthService {
  
  /**
   * Validates if email belongs to VRSEC domain
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  static validateEmail(email) {
    const allowedDomain = '@vrsec.ac.in';
    return email.toLowerCase().endsWith(allowedDomain);
  }

  /**
   * Creates a new student account
   * @param {Object} userData - User data object
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User full name
   * @param {string} userData.branch - User branch (CSE, ECE, etc.)
   * @param {string} userData.semester - User semester
   * @returns {Promise<Object>} - User credentials and data
   */
  static async signUpStudent({ email, password, name, branch, semester }) {
    try {
      // Validate email domain
      if (!this.validateEmail(email)) {
        throw new Error('Only VRSEC students with @vrsec.ac.in email can register');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        name: name,
        email: email.toLowerCase(),
        role: 'student',
        branch: branch.toUpperCase(),
        semester: semester,
        points: 0,
        notesUploaded: 0,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      return {
        user: user,
        userData: userData
      };
    } catch (error) {
      console.error('Error during student signup:', error);
      throw error;
    }
  }

  /**
   * Creates an admin account (manual process)
   * @param {Object} adminData - Admin data object
   * @param {string} adminData.email - Admin email
   * @param {string} adminData.password - Admin password
   * @param {string} adminData.name - Admin full name
   * @returns {Promise<Object>} - Admin credentials and data
   */
  static async createAdmin({ email, password, name }) {
    try {
      // Validate email domain
      if (!this.validateEmail(email)) {
        throw new Error('Only VRSEC email addresses are allowed');
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Create admin document in Firestore
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

      await setDoc(doc(db, 'users', user.uid), adminData);

      return {
        user: user,
        userData: adminData
      };
    } catch (error) {
      console.error('Error during admin creation:', error);
      throw error;
    }
  }

  /**
   * Signs in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User credentials and data
   */
  static async signIn(email, password) {
    try {
      // Validate email domain
      if (!this.validateEmail(email)) {
        throw new Error('Only VRSEC email addresses are allowed');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found in database');
      }

      return {
        user: user,
        userData: userDoc.data()
      };
    } catch (error) {
      console.error('Error during sign in:', error);
      throw error;
    }
  }

  /**
   * Signs out the current user
   * @returns {Promise<void>}
   */
  static async signOutUser() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  }

  /**
   * Gets current user data from Firestore
   * @param {string} uid - User ID
   * @returns {Promise<Object>} - User data
   */
  static async getCurrentUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      return userDoc.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Updates user profile information
   * @param {string} uid - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateUserProfile(uid, updateData) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Adds points to a user (for notes upload)
   * @param {string} uid - User ID
   * @param {number} points - Points to add
   * @returns {Promise<void>}
   */
  static async addUserPoints(uid, points = 10) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentData = userDoc.data();
        await updateDoc(userRef, {
          points: (currentData.points || 0) + points,
          notesUploaded: (currentData.notesUploaded || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error adding user points:', error);
      throw error;
    }
  }

  /**
   * Sets up auth state listener
   * @param {Function} callback - Callback function for auth state changes
   * @returns {Function} - Unsubscribe function
   */
  static onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Checks if user has admin role
   * @param {Object} userData - User data from Firestore
   * @returns {boolean} - True if admin, false otherwise
   */
  static isAdmin(userData) {
    return userData && userData.role === 'admin';
  }

  /**
   * Checks if user has student role
   * @param {Object} userData - User data from Firestore
   * @returns {boolean} - True if student, false otherwise
   */
  static isStudent(userData) {
    return userData && userData.role === 'student';
  }
}