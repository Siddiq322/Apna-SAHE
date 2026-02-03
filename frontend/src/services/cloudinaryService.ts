import { CLOUDINARY_CONFIG, generateCloudinaryPath } from '../config/cloudinary';

/**
 * Cloudinary service for handling PDF file uploads and management
 * Frontend version using fetch API for browser compatibility
 * Replaces Firebase Storage for better performance and storage limits
 */
export class CloudinaryService {
  
  /**
   * Upload PDF file to Cloudinary using unsigned upload preset
   * @param file - File object from input
   * @param metadata - Additional metadata for organized storage
   * @returns Promise with upload result
   */
  static async uploadPDF(
    file: File, 
    metadata: {
      branch: string;
      semester: string; 
      subject: string;
      title: string;
    }
  ): Promise<{
    public_id: string;
    secure_url: string;
    original_filename: string;
    bytes: number;
    format: string;
  }> {
    try {
      // Validate file first
      this.validatePDF(file);
      console.log('✅ CloudinaryService: File validation passed');

      console.log('📤 CloudinaryService: Starting upload with config:', {
        cloudName: CLOUDINARY_CONFIG.cloudName,
        uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
        folder: `${CLOUDINARY_CONFIG.folder}/${metadata.branch}/${metadata.semester}/${metadata.subject}`
      });

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${metadata.branch}/${metadata.semester}/${metadata.subject}`);
      formData.append('resource_type', 'raw'); // Important for PDF files
      
      // Add context metadata
      const context = `title=${metadata.title}|branch=${metadata.branch}|semester=${metadata.semester}|subject=${metadata.subject}`;
      formData.append('context', context);

      console.log('🌐 CloudinaryService: Making API call to:', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`);
      console.log('🛠️ CloudinaryService: Environment check:', {
        isDevelopment: (import.meta.env?.DEV ?? false),
        isProduction: (import.meta.env?.PROD ?? false), 
        mode: (import.meta.env?.MODE ?? 'development'),
        baseUrl: (import.meta.env?.BASE_URL ?? '/')
      });

      // Upload to Cloudinary
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`,
        {
          method: 'POST',
          body: formData,
          // Add headers for better compatibility
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      console.log('📡 CloudinaryService: Upload response status:', uploadResponse.status);
      console.log('📡 CloudinaryService: Response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        console.error('❌ CloudinaryService: Upload failed with response:', errorData);
        throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }

      const result = await uploadResponse.json();
      
      console.log('✅ CloudinaryService: Upload successful, result:', result);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        original_filename: result.original_filename || file.name,
        bytes: result.bytes,
        format: result.format || 'pdf'
      };

    } catch (error: any) {
      console.error('❌ CloudinaryService: Upload error details:', error);
      console.error('❌ CloudinaryService: Error stack:', error.stack);
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Deletes a Cloudinary file via backend (signed destroy).
   * Backend validates Firebase ID token + note ownership.
   */
  static async deleteNoteFile(noteId: string, idToken: string): Promise<void> {
    try {
      if (!noteId) throw new Error('noteId is required');
      if (!idToken) throw new Error('Firebase ID token is required');

      const base = (import.meta as any)?.env?.VITE_API_BASE_URL || '';
      const apiBase = String(base).replace(/\/$/, '');
      const url = `${apiBase}/api/cloudinary/delete-note-file`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ noteId })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Cloudinary deletion failed');
      }
    } catch (error: any) {
      console.error('❌ Cloudinary delete error:', error);
      throw error;
    }
  }

  /**
   * Get optimized URL for PDF delivery with public access
   * @param publicId - Public ID of the file
   * @returns Optimized public URL
   */
  static getOptimizedUrl(publicId: string): string {
    // Use public delivery URL format for unrestricted access
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload/${publicId}`;
  }

  /**
   * Get download URL for PDF with proper filename
   * @param publicId - Public ID of the file
   * @param filename - Original filename for download
   * @returns Download URL with attachment flag
   */
  static getDownloadUrl(publicId: string, filename?: string): string {
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload`;
    const attachmentFlag = filename ? `fl_attachment:${encodeURIComponent(filename)}` : 'fl_attachment';
    return `${baseUrl}/${attachmentFlag}/${publicId}`;
  }

  /**
   * Validate file before upload
   */
  static validatePDF(file: File): void {
    if (!file.type.includes('pdf')) {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > CLOUDINARY_CONFIG.maxFileSize) {
      throw new Error(`File size should not exceed ${CLOUDINARY_CONFIG.maxFileSize / 1024 / 1024}MB`);
    }
  }

  /**
   * Get file metadata from Cloudinary
   * @param publicId - Public ID of the file
   */
  static async getFileMetadata(publicId: string) {
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/resources/raw/${publicId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get file metadata');
      }

      return await response.json();
    } catch (error: any) {
      console.error('❌ Error getting file metadata:', error);
      throw error;
    }
  }
}