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
import { db } from '../config/firebase';
import { UserData } from './authService';

/**
 * User service for managing user data in Firestore
 */
export class UserService {
  
  /**
   * Gets all users
   */
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as UserData));
    } catch (error: any) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  /**
   * Gets users by role
   */
  static async getUsersByRole(role: 'student' | 'admin'): Promise<UserData[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as UserData));
    } catch (error: any) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  /**
   * Gets users by branch
   */
  static async getUsersByBranch(branch: string): Promise<UserData[]> {
    try {
      const q = query(collection(db, 'users'), where('branch', '==', branch.toUpperCase()));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as unknown as UserData));
    } catch (error: any) {
      console.error('Error fetching users by branch:', error);
      throw error;
    }
  }

  /**
   * Gets top users for leaderboard (ordered by points)
   */
  static async getLeaderboard(limitCount: number = 10): Promise<UserData[]> {
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
      } as unknown as UserData & { rank: number }));
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Gets user by ID
   */
  static async getUserById(uid: string): Promise<UserData> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data()
        } as unknown as UserData;
      } else {
        throw new Error('User not found');
      }
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  /**
   * Updates user data
   */
  static async updateUser(uid: string, updateData: Partial<UserData>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, updateData);
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Deletes a user
   */
  static async deleteUser(uid: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}