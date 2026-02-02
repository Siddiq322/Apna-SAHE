import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Facility {
  id?: string;
  name: string;
  description: string;
  timings: string;
  mapUrl: string;
  createdAt: any;
  updatedAt?: any;
}

/**
 * Infrastructure service for managing facilities in Firestore
 */
export class InfrastructureService {
  
  /**
   * Creates a new facility
   */
  static async createFacility(facilityData: Omit<Facility, 'id' | 'createdAt'>): Promise<string> {
    try {
      const facility = {
        name: facilityData.name,
        description: facilityData.description,
        timings: facilityData.timings,
        mapUrl: facilityData.mapUrl,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'facilities'), facility);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating facility:', error);
      throw error;
    }
  }

  /**
   * Gets all facilities
   */
  static async getAllFacilities(): Promise<Facility[]> {
    try {
      const q = query(collection(db, 'facilities'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Facility));
    } catch (error: any) {
      console.error('Error fetching all facilities:', error);
      throw error;
    }
  }

  /**
   * Gets facility by ID
   */
  static async getFacilityById(facilityId: string): Promise<Facility> {
    try {
      const facilityDoc = await getDoc(doc(db, 'facilities', facilityId));
      if (facilityDoc.exists()) {
        return {
          id: facilityDoc.id,
          ...facilityDoc.data()
        } as Facility;
      } else {
        throw new Error('Facility not found');
      }
    } catch (error: any) {
      console.error('Error fetching facility by ID:', error);
      throw error;
    }
  }

  /**
   * Updates a facility
   */
  static async updateFacility(facilityId: string, updateData: Partial<Facility>): Promise<void> {
    try {
      const facilityRef = doc(db, 'facilities', facilityId);
      await updateDoc(facilityRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error updating facility:', error);
      throw error;
    }
  }

  /**
   * Deletes a facility
   */
  static async deleteFacility(facilityId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'facilities', facilityId));
    } catch (error: any) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }

  /**
   * Searches facilities by name
   */
  static async searchFacilities(searchTerm: string): Promise<Facility[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation that fetches all and filters
      // For better search, consider using Algolia or similar service
      const facilities = await this.getAllFacilities();
      return facilities.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error: any) {
      console.error('Error searching facilities:', error);
      throw error;
    }
  }
}