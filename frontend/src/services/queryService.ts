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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Query {
  id?: string;
  userId: string;
  studentName: string;
  subject: string;
  message: string;
  status: 'pending' | 'completed';
  createdAt: any;
  updatedAt?: any;
}

/**
 * Query/Request service for managing student queries in Firestore
 */
export class QueryService {
  
  /**
   * Creates a new query/request
   */
  static async createQuery(queryData: Omit<Query, 'id' | 'status' | 'createdAt'>): Promise<string> {
    try {
      const queryDoc = {
        userId: queryData.userId,
        studentName: queryData.studentName,
        subject: queryData.subject,
        message: queryData.message,
        status: 'pending' as const,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'queries'), queryDoc);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating query:', error);
      throw error;
    }
  }

  /**
   * Gets all queries
   */
  static async getAllQueries(): Promise<Query[]> {
    try {
      const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Query));
    } catch (error: any) {
      console.error('Error fetching all queries:', error);
      throw error;
    }
  }

  /**
   * Gets queries by user ID
   */
  static async getQueriesByUser(userId: string): Promise<Query[]> {
    try {
      const q = query(
        collection(db, 'queries'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Query));
    } catch (error: any) {
      console.error('Error fetching queries by user:', error);
      throw error;
    }
  }

  /**
   * Gets queries by status
   */
  static async getQueriesByStatus(status: 'pending' | 'completed'): Promise<Query[]> {
    try {
      const q = query(
        collection(db, 'queries'),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Query));
    } catch (error: any) {
      console.error('Error fetching queries by status:', error);
      throw error;
    }
  }

  /**
   * Gets pending queries (for admin dashboard)
   */
  static async getPendingQueries(): Promise<Query[]> {
    try {
      return await this.getQueriesByStatus('pending');
    } catch (error: any) {
      console.error('Error fetching pending queries:', error);
      throw error;
    }
  }

  /**
   * Gets query by ID
   */
  static async getQueryById(queryId: string): Promise<Query> {
    try {
      const queryDoc = await getDoc(doc(db, 'queries', queryId));
      if (queryDoc.exists()) {
        return {
          id: queryDoc.id,
          ...queryDoc.data()
        } as Query;
      } else {
        throw new Error('Query not found');
      }
    } catch (error: any) {
      console.error('Error fetching query by ID:', error);
      throw error;
    }
  }

  /**
   * Updates query status (typically by admin)
   */
  static async updateQueryStatus(queryId: string, status: 'pending' | 'completed'): Promise<void> {
    try {
      const queryRef = doc(db, 'queries', queryId);
      await updateDoc(queryRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating query status:', error);
      throw error;
    }
  }

  /**
   * Marks query as completed
   */
  static async markQueryCompleted(queryId: string): Promise<void> {
    try {
      await this.updateQueryStatus(queryId, 'completed');
    } catch (error: any) {
      console.error('Error marking query as completed:', error);
      throw error;
    }
  }

  /**
   * Updates a query
   */
  static async updateQuery(queryId: string, updateData: Partial<Query>): Promise<void> {
    try {
      const queryRef = doc(db, 'queries', queryId);
      await updateDoc(queryRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating query:', error);
      throw error;
    }
  }

  /**
   * Deletes a query
   */
  static async deleteQuery(queryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'queries', queryId));
    } catch (error: any) {
      console.error('Error deleting query:', error);
      throw error;
    }
  }
}