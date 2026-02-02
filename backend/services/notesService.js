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
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase.js';
import { AuthService } from './authService.js';

/**
 * Notes service for managing PDF notes with Firebase Storage and Firestore
 */
export class NotesService {
  
  /**
   * Uploads a PDF note with metadata and updates user points
   * @param {Object} noteData - Note data object
   * @param {File} noteData.file - PDF file to upload
   * @param {string} noteData.title - Note title
   * @param {string} noteData.subject - Subject name
   * @param {string} noteData.branch - Branch name
   * @param {string} noteData.semester - Semester
   * @param {string} noteData.uploaderId - User ID of uploader
   * @param {string} noteData.uploaderName - Name of uploader
   * @param {string} noteData.uploaderRole - Role of uploader (student/admin)
   * @returns {Promise<string>} - Document ID of created note
   */
  static async uploadNote(noteData) {
    try {
      const { file, title, subject, branch, semester, uploaderId, uploaderName, uploaderRole } = noteData;

      // Validate file type
      if (!file.type.includes('pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size should not exceed 10MB');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${branch}_${semester}_${subject}_${timestamp}.pdf`;
      const filePath = `notes/${branch}/${semester}/${fileName}`;

      // Upload file to Firebase Storage
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Create note metadata in Firestore and update user points in a transaction
      const noteDoc = await runTransaction(db, async (transaction) => {
        // Create note document
        const note = {
          title: title,
          subject: subject,
          branch: branch.toUpperCase(),
          semester: semester,
          pdfUrl: downloadURL,
          uploadedByName: uploaderName,
          uploadedByRole: uploaderRole,
          uploaderId: uploaderId,
          uploadedAt: serverTimestamp(),
          filePath: filePath, // Store for deletion purposes
          fileSize: file.size,
          fileName: fileName
        };

        const notesCollection = collection(db, 'notes');
        const docRef = await addDoc(notesCollection, note);

        // Update user points and notes count (only for students)
        if (uploaderRole === 'student') {
          const userRef = doc(db, 'users', uploaderId);
          const userDoc = await transaction.get(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            transaction.update(userRef, {
              points: (userData.points || 0) + 10,
              notesUploaded: (userData.notesUploaded || 0) + 1
            });
          }
        }

        return docRef.id;
      });

      console.log('Note uploaded successfully with ID:', noteDoc);
      return noteDoc;

    } catch (error) {
      console.error('Error uploading note:', error);
      throw error;
    }
  }

  /**
   * Gets all notes
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getAllNotes() {
    try {
      const q = query(collection(db, 'notes'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching all notes:', error);
      throw error;
    }
  }

  /**
   * Gets notes by branch
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getNotesByBranch(branch) {
    try {
      const q = query(
        collection(db, 'notes'),
        where('branch', '==', branch.toUpperCase()),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notes by branch:', error);
      throw error;
    }
  }

  /**
   * Gets notes by semester
   * @param {string} semester - Semester
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getNotesBySemester(semester) {
    try {
      const q = query(
        collection(db, 'notes'),
        where('semester', '==', semester),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notes by semester:', error);
      throw error;
    }
  }

  /**
   * Gets notes by subject
   * @param {string} subject - Subject name
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getNotesBySubject(subject) {
    try {
      const q = query(
        collection(db, 'notes'),
        where('subject', '==', subject),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notes by subject:', error);
      throw error;
    }
  }

  /**
   * Gets notes by branch and semester
   * @param {string} branch - Branch name
   * @param {string} semester - Semester
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getNotesByBranchAndSemester(branch, semester) {
    try {
      const q = query(
        collection(db, 'notes'),
        where('branch', '==', branch.toUpperCase()),
        where('semester', '==', semester),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notes by branch and semester:', error);
      throw error;
    }
  }

  /**
   * Gets notes uploaded by a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of note documents
   */
  static async getNotesByUser(userId) {
    try {
      const q = query(
        collection(db, 'notes'),
        where('uploaderId', '==', userId),
        orderBy('uploadedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching notes by user:', error);
      throw error;
    }
  }

  /**
   * Gets note by ID
   * @param {string} noteId - Note ID
   * @returns {Promise<Object>} - Note document
   */
  static async getNoteById(noteId) {
    try {
      const noteDoc = await getDoc(doc(db, 'notes', noteId));
      if (noteDoc.exists()) {
        return {
          id: noteDoc.id,
          ...noteDoc.data()
        };
      } else {
        throw new Error('Note not found');
      }
    } catch (error) {
      console.error('Error fetching note by ID:', error);
      throw error;
    }
  }

  /**
   * Updates note metadata
   * @param {string} noteId - Note ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  static async updateNote(noteId, updateData) {
    try {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  /**
   * Deletes a note (including file from storage)
   * @param {string} noteId - Note ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<void>}
   */
  static async deleteNote(noteId, userId) {
    try {
      // Get note document first
      const noteDoc = await this.getNoteById(noteId);
      
      // Check if user is authorized to delete (owner or admin)
      const userData = await AuthService.getCurrentUserData(userId);
      const isAuthorized = noteDoc.uploaderId === userId || userData.role === 'admin';
      
      if (!isAuthorized) {
        throw new Error('You are not authorized to delete this note');
      }

      await runTransaction(db, async (transaction) => {
        // Delete file from storage
        if (noteDoc.filePath) {
          const fileRef = ref(storage, noteDoc.filePath);
          await deleteObject(fileRef);
        }

        // Delete note document
        const noteRef = doc(db, 'notes', noteId);
        transaction.delete(noteRef);

        // Update user points (subtract points if student uploaded)
        if (noteDoc.uploaderRole === 'student') {
          const userRef = doc(db, 'users', noteDoc.uploaderId);
          const userDoc = await transaction.get(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            transaction.update(userRef, {
              points: Math.max(0, (userData.points || 0) - 10),
              notesUploaded: Math.max(0, (userData.notesUploaded || 0) - 1)
            });
          }
        }
      });

    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Searches notes by title or subject
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching note documents
   */
  static async searchNotes(searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simple implementation that fetches all and filters
      // For better search, consider using Algolia or similar service
      const notes = await this.getAllNotes();
      return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }

  /**
   * Gets notes statistics
   * @returns {Promise<Object>} - Statistics object
   */
  static async getNotesStats() {
    try {
      const notes = await this.getAllNotes();
      const totalNotes = notes.length;
      
      const branchStats = {};
      const subjectStats = {};
      
      notes.forEach(note => {
        // Count by branch
        branchStats[note.branch] = (branchStats[note.branch] || 0) + 1;
        
        // Count by subject
        subjectStats[note.subject] = (subjectStats[note.subject] || 0) + 1;
      });

      return {
        totalNotes,
        branchStats,
        subjectStats,
        recentNotes: notes.slice(0, 5) // Get 5 most recent notes
      };
    } catch (error) {
      console.error('Error fetching notes statistics:', error);
      throw error;
    }
  }
}