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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { AuthService } from './authService';

export interface Note {
  id?: string;
  title: string;
  subject: string;
  branch: string;
  semester: string;
  pdfUrl: string;
  storagePath?: string; // Firebase Storage path for deletion
  fileName: string;
  fileSize: number;
  uploadedByName: string;
  uploadedByRole: 'student' | 'admin';
  uploaderId: string;
  uploadedAt: any;
}

export interface UploadNoteData {
  file: File;
  title: string;
  subject: string;
  branch: string;
  semester: string;
  uploaderId: string;
  uploaderName: string;
  uploaderRole: 'student' | 'admin';
}

/**
 * Notes service for managing PDF notes with Firebase Storage and Firestore
 * Uses Firebase Storage for reliable file storage and management
 */
export class NotesService {

  /**
   * Uploads a PDF note with metadata and updates user points
   * Uses Firebase Storage for reliable file storage
   */
  static async uploadNote(noteData: UploadNoteData): Promise<string> {
    try {
      const { file, title, subject, branch, semester, uploaderId, uploaderName, uploaderRole } = noteData;

      console.log('🔍 Starting PDF upload to Firebase Storage...');
      console.log('📋 Upload data:', { title, subject, branch, semester, fileName: file.name, fileSize: file.size });

      // Validate PDF file
      if (!file.type.includes('pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (limit to 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        throw new Error('File size should not exceed 10MB');
      }

      console.log('✅ File validation passed');

      // Generate unique filename and path
      const timestamp = Date.now();
      const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${branch}_${semester}_${subject}_${sanitizedTitle}_${timestamp}.pdf`;
      const filePath = `notes/${branch}/${semester}/${fileName}`;

      console.log('📤 Uploading to Firebase Storage...');
      console.log('📁 Storage path:', filePath);

      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ PDF uploaded to Firebase Storage successfully');
      console.log('🔗 Download URL:', downloadURL);

      // Create note metadata in Firestore and update user points in a transaction
      const noteDocId = await runTransaction(db, async (transaction) => {
        // Create note document with Firebase Storage data
        const note = {
          title: title,
          subject: subject,
          branch: branch.toUpperCase(),
          semester: semester,
          pdfUrl: downloadURL, // Firebase Storage download URL
          storagePath: filePath, // Store path for deletion
          fileName: file.name,
          fileSize: file.size,
          uploadedByName: uploaderName,
          uploadedByRole: uploaderRole,
          uploaderId: uploaderId,
          uploadedAt: serverTimestamp()
        };

        console.log('🔍 Note object before saving:', note);

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
            console.log('✅ User points updated: +10 points');
          }
        }

        return docRef.id;
      });

      console.log('✅ Note uploaded successfully with ID:', noteDocId);
      return noteDocId;

    } catch (error: any) {
      console.error('❌ Error uploading note:', error);
      throw error;
    }
  }

  /**
   * Gets all notes
   */
  static async getAllNotes(): Promise<Note[]> {
    try {
      const q = query(collection(db, 'notes'), orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note));
    } catch (error: any) {
      console.error('Error fetching all notes:', error);
      throw error;
    }
  }

  /**
   * Gets notes by branch and semester
   */
  static async getNotesByBranchAndSemester(branch: string, semester: string): Promise<Note[]> {
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
      } as Note));
    } catch (error: any) {
      console.error('Error fetching notes by branch and semester:', error);
      throw error;
    }
  }

  /**
   * Gets notes uploaded by a specific user
   */
  static async getNotesByUser(userId: string): Promise<Note[]> {
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
      } as Note));
    } catch (error: any) {
      console.error('Error fetching notes by user:', error);
      throw error;
    }
  }

  /**
   * Gets note by ID
   */
  static async getNoteById(noteId: string): Promise<Note> {
    try {
      const noteDoc = await getDoc(doc(db, 'notes', noteId));
      if (noteDoc.exists()) {
        return {
          id: noteDoc.id,
          ...noteDoc.data()
        } as Note;
      } else {
        throw new Error('Note not found');
      }
    } catch (error: any) {
      console.error('Error fetching note by ID:', error);
      throw error;
    }
  }

  /**
   * Downloads PDF note from Firebase Storage
   */
  static downloadNote(note: Note): void {
    try {
      console.log('📥 Attempting to download PDF:', note.fileName);
      console.log('📥 Download URL:', note.pdfUrl);
      console.log('📥 Note data:', note);
      
      if (!note.pdfUrl) {
        alert('PDF URL is missing from note data. This note may be corrupted.');
        throw new Error('PDF URL is missing from note data');
      }
      
      // Handle different URL types
      if (note.pdfUrl.includes('cloudinary.com')) {
        alert('⚠️ This note uses old Cloudinary storage and may not be accessible.\nPlease contact admin to re-upload this file.');
        console.warn('⚠️ Attempting to access legacy Cloudinary URL:', note.pdfUrl);
      }
      
      // Try direct download first
      const link = document.createElement('a');
      link.href = note.pdfUrl;
      link.download = note.fileName;
      link.target = '_blank'; // Open in new tab if download fails
      
      // Add error handling for the link
      link.onerror = () => {
        console.error('❌ Direct download failed');
        alert(`Download failed. The PDF may no longer be available.\nURL: ${note.pdfUrl}`);
      };
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ PDF download initiated:', note.fileName);
      
    } catch (error: any) {
      console.error('❌ Error downloading PDF:', error);
      alert(`Download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Opens PDF in new tab for viewing
   */
  static viewNote(note: Note): void {
    try {
      console.log('👁️ Attempting to view PDF:', note.fileName);
      console.log('👁️ PDF URL:', note.pdfUrl);
      console.log('👁️ Note data:', note);
      
      if (!note.pdfUrl) {
        alert('PDF URL is missing from note data. This note may be corrupted.');
        throw new Error('PDF URL is missing from note data');
      }
      
      // Handle different URL types
      if (note.pdfUrl.includes('cloudinary.com')) {
        alert('⚠️ This note uses old Cloudinary storage and may not be accessible.\nTrying to open anyway...');
        console.warn('⚠️ Attempting to access legacy Cloudinary URL:', note.pdfUrl);
      }
      
      // Simple approach: just open the URL directly
      const newWindow = window.open(note.pdfUrl, '_blank');
      
      if (!newWindow) {
        // Popup blocked, try alternative
        alert('Popup blocked. Trying alternative method...');
        window.location.href = note.pdfUrl;
      }
      
      console.log('✅ PDF viewer opened for:', note.fileName);
      
    } catch (error: any) {
      console.error('❌ Error viewing PDF:', error);
      alert(`View failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deletes a note
   */
  static async deleteNote(noteId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ DeleteNote called with:', { noteId, userId });
      
      if (!noteId) {
        throw new Error('Note ID is required for deletion');
      }
      
      if (!userId) {
        throw new Error('User ID is required for deletion');
      }
      
      // Get note document first
      const noteDoc = await this.getNoteById(noteId);
      console.log('📄 Note found:', noteDoc.title);
      
      // Get current auth user for admin check
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User must be logged in to delete notes');
      }
      
      console.log('👤 Current user:', currentUser.email);
      
      // Check if user is authorized to delete (owner or admin)
      const isOwner = noteDoc.uploaderId === userId;
      const isAdmin = currentUser.email && currentUser.email.toLowerCase() === 'siddiqshaik613@gmail.com';
      
      console.log('🔐 Authorization check:', { 
        isOwner, 
        isAdmin, 
        noteUploaderId: noteDoc.uploaderId, 
        currentUserId: userId,
        noteTitle: noteDoc.title,
        noteUploadedBy: noteDoc.uploadedByName
      });
      
      // CRITICAL: Students can ONLY delete their own notes
      if (!isAdmin && !isOwner) {
        const errorMsg = isOwner ? 
          'You are not authorized to delete this note' : 
          `Access Denied: You can only delete your own notes. This note belongs to ${noteDoc.uploadedByName}`;
        console.error('🚫 Unauthorized deletion attempt blocked:', {
          currentUser: currentUser.email,
          noteOwner: noteDoc.uploadedByName,
          noteTitle: noteDoc.title
        });
        throw new Error(errorMsg);
      }
      
      console.log('✅ Authorization granted for note deletion');

      // Delete the actual PDF file from Firebase Storage first (so we truly free space)
      if (noteDoc.storagePath) {
        try {
          const fileRef = ref(storage, noteDoc.storagePath);
          await deleteObject(fileRef);
          console.log('🗑️ PDF file deleted from Firebase Storage successfully');
        } catch (storageError: any) {
          console.error('❌ Failed to delete PDF from Firebase Storage:', storageError);
          // Continue with database deletion even if file deletion fails
          console.warn('⚠️ Continuing with database deletion despite storage error');
        }
      } else {
        // Try to extract storage path from URL if storagePath is not available
        try {
          if (noteDoc.pdfUrl && noteDoc.pdfUrl.includes('firebase')) {
            const urlParts = noteDoc.pdfUrl.split('/o/')[1];
            if (urlParts) {
              const storagePath = decodeURIComponent(urlParts.split('?')[0]);
              console.log('📁 Storage path extracted from URL:', storagePath);
              const fileRef = ref(storage, storagePath);
              await deleteObject(fileRef);
              console.log('🗑️ PDF file deleted from Firebase Storage (extracted path)');
            }
          }
        } catch (pathError: any) {
          console.warn('⚠️ Could not delete file from storage:', pathError.message);
        }
      }

      await runTransaction(db, async (transaction) => {
        // IMPORTANT: All reads must happen BEFORE any writes in Firebase transactions
        
        // First, do ALL reads
        const noteRef = doc(db, 'notes', noteId);
        let userRef;
        let userDoc;
        
        if (noteDoc.uploadedByRole === 'student') {
          userRef = doc(db, 'users', noteDoc.uploaderId);
          userDoc = await transaction.get(userRef);
        }
        
        // Then, do ALL writes
        // 1. Delete the note document
        transaction.delete(noteRef);

        // 2. Update user points (subtract points if student uploaded)
        if (noteDoc.uploadedByRole === 'student' && userRef && userDoc?.exists()) {
          const userData = userDoc.data();
          transaction.update(userRef, {
            points: Math.max(0, (userData.points || 0) - 10),
            notesUploaded: Math.max(0, (userData.notesUploaded || 0) - 1)
          });
          console.log('📉 User points will be reduced by 10');
        }
      });

      console.log('✅ Note deleted successfully');
    } catch (error: any) {
      console.error('❌ Error deleting note:', error);
      throw error;
    }
  }

  /**
   * Searches notes by title or subject
   */
  static async searchNotes(searchTerm: string): Promise<Note[]> {
    try {
      const notes = await this.getAllNotes();
      return notes.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error: any) {
      console.error('Error searching notes:', error);
      throw error;
    }
  }
}