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
 * Event service for managing events in Firestore
 */
export class EventService {
  
  /**
   * Creates a new event
   * @param {Object} eventData - Event data object
   * @param {string} eventData.title - Event title
   * @param {string} eventData.branch - Target branch
   * @param {string} eventData.type - Event type
   * @param {string} eventData.date - Event date
   * @param {string} eventData.venue - Event venue
   * @param {string} eventData.description - Event description
   * @param {string} eventData.registerLink - Registration link
   * @param {string} eventData.organizerName - Organizer name
   * @param {string} eventData.organizerPhone - Organizer phone
   * @returns {Promise<string>} - Document ID of created event
   */
  static async createEvent(eventData) {
    try {
      const event = {
        ...eventData,
        branch: eventData.branch.toUpperCase(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'events'), event);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Gets all events
   * @returns {Promise<Array>} - Array of event documents
   */
  static async getAllEvents() {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }

  /**
   * Gets events by branch
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} - Array of event documents
   */
  static async getEventsByBranch(branch) {
    try {
      const q = query(
        collection(db, 'events'),
        where('branch', 'in', [branch.toUpperCase(), 'ALL']),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching events by branch:', error);
      throw error;
    }
  }

  /**
   * Gets events by type
   * @param {string} type - Event type
   * @returns {Promise<Array>} - Array of event documents
   */
  static async getEventsByType(type) {
    try {
      const q = query(
        collection(db, 'events'),
        where('type', '==', type),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching events by type:', error);
      throw error;
    }
  }

  /**
   * Gets upcoming events (after today's date)
   * @returns {Promise<Array>} - Array of upcoming event documents
   */
  static async getUpcomingEvents() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const q = query(
        collection(db, 'events'),
        where('date', '>=', today),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Gets event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object>} - Event document
   */
  static async getEventById(eventId) {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return {
          id: eventDoc.id,
          ...eventDoc.data()
        };
      } else {
        throw new Error('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  /**
   * Updates an event
   * @param {string} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateEvent(eventId, updateData) {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Deletes an event
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  static async deleteEvent(eventId) {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}