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
import { db } from '../config/firebase.js';

/**
 * Query/Request service for managing student queries in Firestore
 */
export class QueryService {
  
  /**
   * Creates a new query/request
   * @param {Object} queryData - Query data object
   * @param {string} queryData.userId - Student user ID
   * @param {string} queryData.studentName - Student name
   * @param {string} queryData.subject - Subject for which notes are requested
   * @param {string} queryData.message - Additional message/details
   * @returns {Promise<string>} - Document ID of created query
   */
  static async createQuery(queryData) {
    try {
      const query = {
        userId: queryData.userId,
        studentName: queryData.studentName,
        subject: queryData.subject,
        message: queryData.message,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'queries'), query);
      return docRef.id;
    } catch (error) {
      console.error('Error creating query:', error);
      throw error;
    }
  }

  /**
   * Gets all queries
   * @returns {Promise<Array>} - Array of query documents
   */
  static async getAllQueries() {
    try {
      const q = query(collection(db, 'queries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all queries:', error);
      throw error;
    }
  }

  /**
   * Gets queries by user ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of query documents
   */
  static async getQueriesByUser(userId) {
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
      }));
    } catch (error) {
      console.error('Error fetching queries by user:', error);
      throw error;
    }
  }

  /**
   * Gets queries by status
   * @param {string} status - Query status (pending/completed)
   * @returns {Promise<Array>} - Array of query documents
   */
  static async getQueriesByStatus(status) {
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
      }));
    } catch (error) {
      console.error('Error fetching queries by status:', error);
      throw error;
    }
  }

  /**
   * Gets pending queries (for admin dashboard)
   * @returns {Promise<Array>} - Array of pending query documents
   */
  static async getPendingQueries() {
    try {
      return await this.getQueriesByStatus('pending');
    } catch (error) {
      console.error('Error fetching pending queries:', error);
      throw error;
    }
  }

  /**
   * Gets query by ID
   * @param {string} queryId - Query ID
   * @returns {Promise<Object>} - Query document
   */
  static async getQueryById(queryId) {
    try {
      const queryDoc = await getDoc(doc(db, 'queries', queryId));
      if (queryDoc.exists()) {
        return {
          id: queryDoc.id,
          ...queryDoc.data()
        };
      } else {
        throw new Error('Query not found');
      }
    } catch (error) {
      console.error('Error fetching query by ID:', error);
      throw error;
    }
  }

  /**
   * Updates query status (typically by admin)
   * @param {string} queryId - Query ID
   * @param {string} status - New status (pending/completed)
   * @returns {Promise<void>}
   */
  static async updateQueryStatus(queryId, status) {
    try {
      const queryRef = doc(db, 'queries', queryId);
      await updateDoc(queryRef, {
        status: status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating query status:', error);
      throw error;
    }
  }

  /**
   * Updates a query
   * @param {string} queryId - Query ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateQuery(queryId, updateData) {
    try {
      const queryRef = doc(db, 'queries', queryId);
      await updateDoc(queryRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating query:', error);
      throw error;
    }
  }

  /**
   * Deletes a query
   * @param {string} queryId - Query ID
   * @returns {Promise<void>}
   */
  static async deleteQuery(queryId) {
    try {
      await deleteDoc(doc(db, 'queries', queryId));
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  }

  /**
   * Marks query as completed
   * @param {string} queryId - Query ID
   * @returns {Promise<void>}
   */
  static async markQueryCompleted(queryId) {
    try {
      await this.updateQueryStatus(queryId, 'completed');
    } catch (error) {
      console.error('Error marking query as completed:', error);
      throw error;
    }
  }
}