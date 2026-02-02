import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * User service for managing user data in Firestore
 */
export class UserService {
  
  /**
   * Gets all users
   * @returns {Promise<Array>} - Array of user documents
   */
  static async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Gets users by role
   * @param {string} role - User role (student/admin)
   * @returns {Promise<Array>} - Array of user documents
   */
  static async getUsersByRole(role) {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Gets users by branch
   * @param {string} branch - User branch
   * @returns {Promise<Array>} - Array of user documents
   */
  static async getUsersByBranch(branch) {
    try {
      const q = query(collection(db, 'users'), where('branch', '==', branch.toUpperCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching users by branch:', error);
      throw error;
    }
  }

  /**
   * Gets top users for leaderboard (ordered by points)
   * @param {number} limitCount - Number of users to fetch (default: 10)
   * @returns {Promise<Array>} - Array of top user documents
   */
  static async getLeaderboard(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        orderBy('points', 'desc'),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Gets user by ID
   * @param {string} uid - User ID
   * @returns {Promise<Object>} - User document
   */
  static async getUserById(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Updates user data
   * @param {string} uid - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateUser(uid, updateData) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deletes a user
   * @param {string} uid - User ID
   * @returns {Promise<void>}
   */
  static async deleteUser(uid) {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}