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
   * Uses Firebase Storage for reliable file storage, with base64 fallback
   */
  static async uploadNote(noteData: UploadNoteData): Promise<string> {
    try {
      const { file, title, subject, branch, semester, uploaderId, uploaderName, uploaderRole } = noteData;

      console.log('🔍 Starting PDF upload...');
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

      let pdfUrl: string;
      let storagePath: string | undefined;

      // Try Firebase Storage first, fallback to base64
      try {
        console.log('📤 Attempting Firebase Storage upload...');
        
        // Generate unique filename and path
        const timestamp = Date.now();
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${branch}_${semester}_${subject}_${sanitizedTitle}_${timestamp}.pdf`;
        const filePath = `notes/${branch}/${semester}/${fileName}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, filePath);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('✅ Firebase Storage upload successful');
        pdfUrl = downloadURL;
        storagePath = filePath;
        
      } catch (storageError: any) {
        console.warn('⚠️ Firebase Storage failed:', storageError.message);
        console.warn('🔄 Error details:', storageError);
        console.log('📄 Falling back to base64 storage...');
        
        // Check file size before base64 conversion
        const maxBase64Size = 1024 * 1024; // 1MB limit for base64
        if (file.size > maxBase64Size) {
          throw new Error(`File too large for base64 storage (${Math.round(file.size / 1024 / 1024)}MB). Enable Firebase Storage or reduce file size to under 1MB.`);
        }
        
        // Fallback to base64 storage
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        pdfUrl = `data:application/pdf;base64,${base64}`;
        storagePath = undefined;
        
        console.log('✅ Base64 conversion successful');
        console.log('📊 Base64 size:', Math.round(base64.length / 1024), 'KB');
        alert('⚠️ Using temporary base64 storage due to Firebase Storage not being enabled.\n\nFor better performance and larger file support, enable Firebase Storage in your console.');
      }

      console.log('🔗 Final PDF URL type:', pdfUrl.includes('firebase') ? 'Firebase Storage' : 'Base64');

      // Create note metadata in Firestore and update user points in a transaction
      const noteDocId = await runTransaction(db, async (transaction) => {
        // Create note document with appropriate storage data
        const note = {
          title: title,
          subject: subject,
          branch: branch.toUpperCase(),
          semester: semester,
          pdfUrl: pdfUrl, // Either Firebase Storage URL or base64 data
          storagePath: storagePath, // Only present for Firebase Storage files
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
   * Downloads PDF note from Firebase Storage or base64 data
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
        this.createDownloadLink(note.pdfUrl, note.fileName);
      } else if (note.pdfUrl.startsWith('data:application/pdf;base64,')) {
        // Handle base64 PDF data
        console.log('📄 Downloading base64 PDF');
        this.downloadBase64Pdf(note.pdfUrl, note.fileName);
      } else if (note.pdfUrl.includes('firebasestorage.googleapis.com')) {
        // Handle Firebase Storage URLs
        this.downloadFirebaseStorageFile(note);
      } else {
        // Unknown format, try direct download
        this.createDownloadLink(note.pdfUrl, note.fileName);
      }
      
    } catch (error: any) {
      console.error('❌ Error downloading PDF:', error);
      alert(`Download failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download base64 PDF data
   */
  private static downloadBase64Pdf(base64Data: string, fileName: string): void {
    try {
      console.log('📥 Starting base64 PDF download');
      
      // Extract base64 data from data URL
      const base64String = base64Data.split(',')[1];
      if (!base64String) {
        throw new Error('Invalid base64 data URL format');
      }
      
      // Convert base64 to binary data  
      const binaryString = atob(base64String);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and download URL
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.pdf';
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      console.log('✅ Base64 PDF download initiated:', fileName);
    } catch (error: any) {
      console.error('❌ Failed to download base64 PDF:', error);
      alert(`Failed to download PDF: ${error.message}\n\nThe PDF data may be corrupted.`);
    }
  }

  /**
   * Handle Firebase Storage file downloads with multiple URL formats
   */
  private static downloadFirebaseStorageFile(note: Note): void {
    // Try different URL formats for Firebase Storage
    const originalUrl = note.pdfUrl;
    
    // Convert to public URL if token is present
    let publicUrl = originalUrl;
    if (originalUrl.includes('token=')) {
      // Remove the token parameter to make it publicly accessible
      publicUrl = originalUrl.split('&token=')[0].split('?token=')[0];
      console.log('🔗 Trying public URL without token:', publicUrl);
    }
    
    // Try the public URL first, fallback to original
    const urlsToTry = [publicUrl, originalUrl];
    
    console.log('🔄 Trying multiple URL formats:', urlsToTry);
    
    // Try each URL format
    this.tryDownloadUrls(urlsToTry, note.fileName);
  }
  
  /**
   * Try downloading from multiple URLs
   */
  private static tryDownloadUrls(urls: string[], fileName: string): void {
    const tryNextUrl = (index: number) => {
      if (index >= urls.length) {
        alert('All download attempts failed. The file may no longer be accessible.');
        return;
      }
      
      const url = urls[index];
      console.log(`🔄 Trying download URL ${index + 1}:`, url);
      
      // Test URL accessibility first
      fetch(url, { method: 'HEAD', mode: 'no-cors' })
        .then(() => {
          console.log('✅ URL accessible, attempting download');
          this.createDownloadLink(url, fileName);
        })
        .catch((error) => {
          console.warn(`❌ URL ${index + 1} failed:`, error.message);
          
          if (index === 0) {
            // First attempt failed, try next
            tryNextUrl(index + 1);
          } else {
            // All attempts failed, just try the direct download anyway
            console.log('🔄 All URL tests failed, trying direct download anyway');
            this.createDownloadLink(url, fileName);
          }
        });
    };
    
    tryNextUrl(0);
  }
  
  /**
   * Create and trigger download link
   */
  private static createDownloadLink(url: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    
    // Add error handling
    link.onerror = () => {
      console.error('❌ Direct download failed');
      alert(`Download failed. Trying to open in new tab instead.\nURL: ${url}`);
      window.open(url, '_blank');
    };
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ PDF download initiated:', fileName);
  }

  /**
   * Opens PDF in new tab for viewing
   */
  static viewNote(note: Note): void {
    try {
      console.log('👁️ Attempting to view PDF:', note.fileName);
      console.log('👁️ PDF URL type check:', {
        isBase64: note.pdfUrl.startsWith('data:application/pdf;base64,'),
        isFirebase: note.pdfUrl.includes('firebasestorage.googleapis.com'),
        isCloudinary: note.pdfUrl.includes('cloudinary.com'),
        urlLength: note.pdfUrl.length,
        urlStart: note.pdfUrl.substring(0, 50)
      });
      
      if (!note.pdfUrl) {
        alert('PDF URL is missing from note data. This note may be corrupted.');
        throw new Error('PDF URL is missing from note data');
      }
      
      // Detect storage type and handle accordingly
      if (note.pdfUrl.startsWith('data:application/pdf;base64,')) {
        console.log('📄 Detected base64 PDF, using blob viewer');
        this.viewBase64Pdf(note);
      } else if (note.pdfUrl.includes('firebasestorage.googleapis.com')) {
        console.log('☁️ Detected Firebase Storage PDF');
        this.viewFirebaseStorageFile(note);
      } else if (note.pdfUrl.includes('cloudinary.com')) {
        console.log('⚠️ Detected legacy Cloudinary PDF');
        alert('⚠️ This note uses old Cloudinary storage and may not be accessible.\nTrying to open anyway...');
        window.open(note.pdfUrl, '_blank');
      } else {
        console.log('🔗 Unknown URL format, trying direct open');
        window.open(note.pdfUrl, '_blank');
      }
      
      console.log('✅ PDF viewer initiated for:', note.fileName);
      
    } catch (error: any) {
      console.error('❌ Error viewing PDF:', error);
      alert(`View failed: ${error.message}\n\nDetected URL type: ${note.pdfUrl.substring(0, 50)}...`);
      
      // Last resort: try to download instead
      console.log('🔄 Attempting download as fallback...');
      try {
        this.downloadNote(note);
      } catch (downloadError) {
        console.error('❌ Fallback download also failed:', downloadError);
      }
    }
  }

  /**
   * View base64 PDF in new window
   */
  private static viewBase64Pdf(note: Note): void {
    try {
      console.log('📄 Creating blob URL for base64 PDF');
      
      // Extract base64 data from data URL
      const base64Data = note.pdfUrl.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid base64 data URL format');
      }
      
      // Convert base64 to binary data
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob and URL
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      
      console.log('📄 Blob URL created:', blobUrl);
      
      // Create a proper PDF viewer window
      const newWindow = window.open('', '_blank');
      if (!newWindow) {
        alert('Popup blocked! Trying alternative download method...');
        this.downloadBase64Pdf(note.pdfUrl, note.fileName);
        return;
      }
      
      // Write HTML with embedded PDF viewer
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${note.title} - PDF Viewer</title>
            <style>
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              .header { background: #2c3e50; color: white; padding: 15px; text-align: center; }
              .viewer-container { height: calc(100vh - 70px); width: 100%; }
              iframe { width: 100%; height: 100%; border: none; }
              .controls { background: #34495e; padding: 10px; text-align: center; }
              button { background: #3498db; color: white; border: none; padding: 8px 16px; margin: 5px; border-radius: 4px; cursor: pointer; }
              button:hover { background: #2980b9; }
              .error { color: #e74c3c; padding: 20px; text-align: center; }
              .loading { color: #3498db; padding: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h3>${note.title}</h3>
              <small>Subject: ${note.subject} | Branch: ${note.branch} | Semester: ${note.semester}</small>
            </div>
            <div class="controls">
              <button onclick="downloadPdf()">📥 Download PDF</button>
              <button onclick="window.print()">🖨️ Print</button>
              <button onclick="window.close()">❌ Close</button>
            </div>
            <div class="viewer-container">
              <div class="loading" id="loading">Loading PDF...</div>
              <iframe id="pdfViewer" src="${blobUrl}" style="display:none;" 
                onload="hideLoading()"
                onerror="showError()">
              </iframe>
              <div class="error" id="error" style="display:none;">
                <h3>Failed to load PDF</h3>
                <p>This browser may not support embedded PDF viewing.</p>
                <button onclick="downloadPdf()">Download PDF Instead</button>
              </div>
            </div>
            
            <script>
              function hideLoading() {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('pdfViewer').style.display = 'block';
                console.log('PDF loaded successfully');
              }
              
              function showError() {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'block';
                console.error('PDF failed to load in iframe');
              }
              
              function downloadPdf() {
                const link = document.createElement('a');
                link.href = '${blobUrl}';
                link.download = '${note.fileName}';
                link.click();
              }
              
              // Fallback timeout
              setTimeout(() => {
                const loading = document.getElementById('loading');
                if (loading && loading.style.display !== 'none') {
                  showError();
                }
              }, 10000);
              
              // Clean up blob URL when window closes
              window.addEventListener('beforeunload', () => {
                URL.revokeObjectURL('${blobUrl}');
              });
            </script>
          </body>
        </html>
      `);
      
      newWindow.document.close();
      
      // Clean up blob URL after 5 minutes
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log('Blob URL cleaned up');
      }, 300000);
      
    } catch (error: any) {
      console.error('❌ Failed to view base64 PDF:', error);
      alert(`Failed to view PDF: ${error.message}\nTrying download instead...`);
      this.downloadBase64Pdf(note.pdfUrl, note.fileName);
    }
  }

  /**
   * View Firebase Storage PDF
   */
  private static viewFirebaseStorageFile(note: Note): void {
    let urlToOpen = note.pdfUrl;
    
    // For Firebase Storage URLs, try to use public access
    if (note.pdfUrl.includes('token=')) {
      const publicUrl = note.pdfUrl.split('&token=')[0].split('?token=')[0];
      console.log('🔓 Trying public URL:', publicUrl);
      urlToOpen = publicUrl;
    }
    
    console.log('🌐 Opening Firebase Storage URL:', urlToOpen);
    const newWindow = window.open(urlToOpen, '_blank');
    
    if (!newWindow) {
      alert('Popup blocked! Copy this URL to view the PDF:\\n\\n' + urlToOpen);
      
      // Try to copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(urlToOpen).then(() => {
          console.log('📋 URL copied to clipboard');
        });
      }
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