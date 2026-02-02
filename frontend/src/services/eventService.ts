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

export interface Event {
  id?: string;
  title: string;
  branch: string;
  type: string;
  date: string;
  venue: string;
  description: string;
  registerLink: string;
  organizerName: string;
  organizerPhone: string;
  createdAt: any;
}

/**
 * Event service for managing events in Firestore
 */
export class EventService {
  
  /**
   * Creates a new event
   */
  static async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<string> {
    try {
      const event = {
        ...eventData,
        branch: eventData.branch.toUpperCase(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'events'), event);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Gets all events
   */
  static async getAllEvents(): Promise<Event[]> {
    try {
      const q = query(collection(db, 'events'), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error: any) {
      console.error('Error fetching all events:', error);
      throw error;
    }
  }

  /**
   * Gets events by branch
   */
  static async getEventsByBranch(branch: string): Promise<Event[]> {
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
      } as Event));
    } catch (error: any) {
      console.error('Error fetching events by branch:', error);
      throw error;
    }
  }

  /**
   * Gets upcoming events (after today's date)
   */
  static async getUpcomingEvents(): Promise<Event[]> {
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
      } as Event));
    } catch (error: any) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  }

  /**
   * Gets event by ID
   */
  static async getEventById(eventId: string): Promise<Event> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        return {
          id: eventDoc.id,
          ...eventDoc.data()
        } as Event;
      } else {
        throw new Error('Event not found');
      }
    } catch (error: any) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  /**
   * Updates an event
   */
  static async updateEvent(eventId: string, updateData: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, updateData);
    } catch (error: any) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Deletes an event
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error: any) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}