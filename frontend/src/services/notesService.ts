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
import { ref, deleteObject } from 'firebase/storage';
import { db, auth, storage } from '../config/firebase';
import { AuthService } from './authService';
import { CloudinaryService } from './cloudinaryService';
import { CLOUDINARY_CONFIG } from '../config/cloudinary';

export interface Note {
  id?: string;
  title: string;
  subject: string;
  branch: string;
  semester: string;
  pdfUrl: string;
  cloudinaryPublicId?: string; // New field for Cloudinary
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
 * Notes service for managing PDF notes with Cloudinary and Firestore
 * Upgraded from base64 storage to Cloudinary for better performance and 25GB free storage
 */
export class NotesService {

  /**
   * Uploads a PDF note with metadata and updates user points
   * Now uses Cloudinary instead of base64 for better performance and more storage
   */
  static async uploadNote(noteData: UploadNoteData): Promise<string> {
    try {
      const { file, title, subject, branch, semester, uploaderId, uploaderName, uploaderRole } = noteData;

      console.log('🔍 Starting PDF upload to Cloudinary...');
      console.log('📋 Upload data:', { title, subject, branch, semester, fileName: file.name, fileSize: file.size });

      // Validate file using Cloudinary service
      CloudinaryService.validatePDF(file);
      console.log('✅ File validation passed');

      // Upload to Cloudinary
      console.log('☁️ Uploading to Cloudinary with config:', {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset
      });
      
      let cloudinaryResult;
      try {
        cloudinaryResult = await CloudinaryService.uploadPDF(file, {
          branch,
          semester,
          subject,
          title
        });
        console.log('✅ PDF uploaded to Cloudinary successfully:', cloudinaryResult);
        
        // Double-check that we got a proper URL and not base64 data
        if (!cloudinaryResult.secure_url || cloudinaryResult.secure_url.startsWith('data:')) {
          throw new Error('Invalid response from Cloudinary - got base64 instead of URL');
        }
        
      } catch (cloudinaryError: any) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError);
        throw new Error(`Cloudinary upload failed: ${cloudinaryError?.message || 'Unknown error'}. Please check your upload preset configuration.`);
      }
      console.log('🔍 Creating note metadata in Firestore...');
      console.log('🔍 pdfUrl that will be stored:', cloudinaryResult.secure_url);
      console.log('🔍 pdfUrl length:', cloudinaryResult.secure_url.length);

      // Create note metadata in Firestore and update user points in a transaction
      const noteDocId = await runTransaction(db, async (transaction) => {
        // Create note document with Cloudinary data
        const note = {
          title: title,
          subject: subject,
          branch: branch.toUpperCase(),
          semester: semester,
          pdfUrl: cloudinaryResult.secure_url, // Cloudinary URL instead of base64
          cloudinaryPublicId: cloudinaryResult.public_id, // Store for deletion if needed
          fileName: cloudinaryResult.original_filename || file.name,
          fileSize: cloudinaryResult.bytes || file.size,
          uploadedByName: uploaderName,
          uploadedByRole: uploaderRole,
          uploaderId: uploaderId,
          uploadedAt: serverTimestamp()
        };

        console.log('🔍 Note object before saving:', note);
        console.log('🔍 pdfUrl in note object:', note.pdfUrl);
        console.log('🔍 pdfUrl type:', typeof note.pdfUrl);

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
   * Downloads PDF note from Cloudinary with fallback URL handling
   */
  static downloadNote(note: Note): void {
    try {
      console.log('📥 Attempting to download PDF:', note.fileName);
      console.log('📥 Original pdfUrl:', note.pdfUrl);
      
      let downloadUrl = note.pdfUrl;
      
      // If we have cloudinaryPublicId, use proper raw delivery URL
      if (note.cloudinaryPublicId) {
        // Try different URL formats for download
        const downloadUrls = [
          CloudinaryService.getDownloadUrl(note.cloudinaryPublicId, note.fileName),
          CloudinaryService.getOptimizedUrl(note.cloudinaryPublicId),
          note.pdfUrl // Original secure_url as fallback
        ];
        
        downloadUrl = downloadUrls[0]; // Use the download URL first
        console.log('📥 Using download URL:', downloadUrl);
        console.log('📥 Available fallback URLs:', downloadUrls);
      }
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = note.fileName;
      link.target = '_blank'; // Open in new tab if download fails
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('✅ PDF download initiated:', note.fileName);
    } catch (error: any) {
      console.error('❌ Error downloading PDF:', error);
      throw error;
    }
  }

  /**
   * Opens PDF in new tab for viewing with multiple URL fallbacks
   */
  static viewNote(note: Note): void {
    try {
      console.log('👁️ Attempting to view PDF:', note.fileName);
      console.log('👁️ Original pdfUrl:', note.pdfUrl);
      
      // Create multiple URL options to try
      const urlsToTry = [];
      
      // If we have cloudinaryPublicId, generate proper URLs
      if (note.cloudinaryPublicId) {
        // Extract public ID from existing URL if needed
        let publicId = note.cloudinaryPublicId;
        
        // If the stored URL has the wrong format, extract the public ID
        if (note.pdfUrl && note.pdfUrl.includes('cloudinary.com')) {
          const urlMatch = note.pdfUrl.match(/\/(?:image|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.pdf)?$/);
          if (urlMatch && urlMatch[1]) {
            publicId = urlMatch[1];
            console.log('👁️ Extracted public ID from URL:', publicId);
          }
        }
        
        // Generate multiple URL formats to try
        urlsToTry.push(
          // Raw delivery (correct for PDFs)
          `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/${publicId}`,
          // Raw delivery with v1
          `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/v1/${publicId}`,
          // Original secure URL
          note.pdfUrl
        );
      } else {
        // Just use the original URL
        urlsToTry.push(note.pdfUrl);
      }
      
      console.log('👁️ URLs to try:', urlsToTry);
      
      // Use the first URL as primary, others as fallbacks
      const primaryUrl = urlsToTry[0];
      
      // Open PDF in new window with fallback handling
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${note.title}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; background: #f5f5f5; }
                .container { max-width: 100%; height: calc(100vh - 40px); background: white; border-radius: 8px; overflow: hidden; }
                iframe { width: 100%; height: 100%; border: none; }
                .error { color: #e74c3c; margin: 20px; text-align: center; }
                .loading { color: #3498db; margin: 20px; text-align: center; }
                .controls { padding: 10px; background: #34495e; color: white; text-align: center; }
                button { margin: 5px; padding: 10px 15px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #2980b9; }
                .url-info { font-size: 12px; color: #7f8c8d; margin-top: 10px; word-break: break-all; }
              </style>
            </head>
            <body>
              <div class="controls">
                <strong>${note.title}</strong>
                <div class="url-info">Loading: ${primaryUrl}</div>
              </div>
              <div class="container">
                <div class="loading" id="loading">Loading PDF...</div>
                <iframe id="pdfFrame" src="${primaryUrl}" style="display:none;" 
                  onload="document.getElementById('loading').style.display='none'; this.style.display='block';"
                  onerror="handlePdfError()">
                </iframe>
                <div class="error" id="error" style="display:none;">
                  <h3>Failed to load PDF</h3>
                  <p>Trying alternative URLs...</p>
                  <div id="fallbackLinks"></div>
                </div>
              </div>
              
              <script>
                const urlsToTry = ${JSON.stringify(urlsToTry)};
                let currentUrlIndex = 0;
                
                function handlePdfError() {
                  console.log('PDF load failed for URL:', urlsToTry[currentUrlIndex]);
                  currentUrlIndex++;
                  
                  if (currentUrlIndex < urlsToTry.length) {
                    console.log('Trying next URL:', urlsToTry[currentUrlIndex]);
                    document.querySelector('.url-info').textContent = 'Trying: ' + urlsToTry[currentUrlIndex];
                    document.getElementById('pdfFrame').src = urlsToTry[currentUrlIndex];
                  } else {
                    // All URLs failed, show error with download options
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('pdfFrame').style.display = 'none';
                    document.getElementById('error').style.display = 'block';
                    
                    const fallbackLinks = document.getElementById('fallbackLinks');
                    urlsToTry.forEach((url, index) => {
                      const link = document.createElement('button');
                      link.textContent = \`Try URL \${index + 1}\`;
                      link.onclick = () => window.open(url, '_blank');
                      fallbackLinks.appendChild(link);
                    });
                  }
                }
                
                // Set up error handling
                window.addEventListener('load', () => {
                  const frame = document.getElementById('pdfFrame');
                  frame.addEventListener('error', handlePdfError);
                  
                  // Fallback timeout
                  setTimeout(() => {
                    if (document.getElementById('loading').style.display !== 'none') {
                      handlePdfError();
                    }
                  }, 10000);
                });
              </script>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Fallback: direct navigation
        window.open(primaryUrl, '_blank');
      }
      
      console.log('✅ PDF viewer opened for:', note.fileName);
    } catch (error: any) {
      console.error('❌ Error viewing PDF:', error);
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

      // Extract file path from URL for storage deletion
      let storagePath = '';
      try {
        if (noteDoc.pdfUrl && noteDoc.pdfUrl.includes('firebase')) {
          // Extract the file path from Firebase Storage URL
          const urlParts = noteDoc.pdfUrl.split('/o/')[1];
          if (urlParts) {
            storagePath = decodeURIComponent(urlParts.split('?')[0]);
            console.log('📁 Storage path extracted:', storagePath);
          }
        }
      } catch (pathError) {
        console.warn('⚠️ Could not extract storage path:', pathError);
      }

      // 0. Delete the actual PDF file from Cloudinary first (so we truly free space)
      if (noteDoc.cloudinaryPublicId) {
        try {
          const idToken = await currentUser.getIdToken();
          await CloudinaryService.deleteNoteFile(noteId, idToken);
          console.log('🗑️ PDF file deleted from Cloudinary successfully');
        } catch (cloudinaryError: any) {
          console.error('❌ Failed to delete PDF from Cloudinary:', cloudinaryError);
          throw new Error(cloudinaryError?.message || 'Failed to delete file from Cloudinary');
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

      // 3. Legacy support for Firebase Storage files
      if (storagePath) {
        // Legacy support for Firebase Storage files
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
          console.log('🗑️ Legacy PDF file deleted from Firebase Storage:', storagePath);
        } catch (storageError: any) {
          console.warn('⚠️ Could not delete legacy file from storage:', storageError.message);
          // Don't throw error as the database deletion was successful
        }
      } else {
        console.warn('ℹ️ No storage file to delete (base64 or missing data)');
      }

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