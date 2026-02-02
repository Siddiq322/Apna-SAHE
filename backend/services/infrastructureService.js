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
 * Infrastructure service for managing facilities in Firestore
 */
export class InfrastructureService {
  
  /**
   * Creates a new facility
   * @param {Object} facilityData - Facility data object
   * @param {string} facilityData.name - Facility name
   * @param {string} facilityData.description - Facility description
   * @param {string} facilityData.timings - Operating timings
   * @param {string} facilityData.mapUrl - Google Maps URL or location
   * @returns {Promise<string>} - Document ID of created facility
   */
  static async createFacility(facilityData) {
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
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  }

  /**
   * Gets all facilities
   * @returns {Promise<Array>} - Array of facility documents
   */
  static async getAllFacilities() {
    try {
      const q = query(collection(db, 'facilities'), orderBy('name', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all facilities:', error);
      throw error;
    }
  }

  /**
   * Gets facility by ID
   * @param {string} facilityId - Facility ID
   * @returns {Promise<Object>} - Facility document
   */
  static async getFacilityById(facilityId) {
    try {
      const facilityDoc = await getDoc(doc(db, 'facilities', facilityId));
      if (facilityDoc.exists()) {
        return {
          id: facilityDoc.id,
          ...facilityDoc.data()
        };
      } else {
        throw new Error('Facility not found');
      }
    } catch (error) {
      console.error('Error fetching facility by ID:', error);
      throw error;
    }
  }

  /**
   * Updates a facility
   * @param {string} facilityId - Facility ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateFacility(facilityId, updateData) {
    try {
      const facilityRef = doc(db, 'facilities', facilityId);
      await updateDoc(facilityRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  }

  /**
   * Deletes a facility
   * @param {string} facilityId - Facility ID
   * @returns {Promise<void>}
   */
  static async deleteFacility(facilityId) {
    try {
      await deleteDoc(doc(db, 'facilities', facilityId));
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }

  /**
   * Searches facilities by name
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching facility documents
   */
  static async searchFacilities(searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation that fetches all and filters
      // For better search, consider using Algolia or similar service
      const facilities = await this.getAllFacilities();
      return facilities.filter(facility => 
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching facilities:', error);
      throw error;
    }
  }
}