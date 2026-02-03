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

      // Create form data for upload - use minimal parameters
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      
      // Let Cloudinary handle the public_id and resource_type automatically
      // Add basic tags for organization
      formData.append('tags', `apna-sahe,${metadata.branch},${metadata.semester},${metadata.subject}`);
      formData.append('context', `title=${metadata.title}`);
      
      console.log('📤 Using minimal upload parameters to work with preset constraints');

      console.log('🌐 CloudinaryService: Making API call to:', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`);

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
      
      // Extract public ID from the secure_url since that's the actual working format
      let extractedPublicId = result.public_id;
      if (!extractedPublicId && result.secure_url) {
        extractedPublicId = CloudinaryService.extractPublicId(result.secure_url);
      }
      
      return {
        public_id: extractedPublicId || result.public_id,
        secure_url: result.secure_url, // Use this directly - it's the working URL
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
   * Get optimized URL for PDF delivery based on actual Cloudinary behavior
   * @param publicId - Public ID of the file
   * @returns Working URL based on test results
   */
  static getOptimizedUrl(publicId: string): string {
    // From our test: Cloudinary stores PDFs in image/upload with version
    // Use the secure_url directly since that's what actually works
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;
  }

  /**
   * Get download URL for PDF
   * @param publicId - Public ID of the file  
   * @param filename - Original filename for download
   * @returns Download URL
   */
  static getDownloadUrl(publicId: string, filename?: string): string {
    // Use the same format as optimized URL since that's what works
    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
    if (filename) {
      return `${baseUrl}/fl_attachment:${encodeURIComponent(filename)}/${publicId}`;
    }
    return `${baseUrl}/${publicId}`;
  }

  /**
   * Extract public ID from Cloudinary URLs
   * @param url - Full Cloudinary URL
   * @returns Extracted public ID
   */
  static extractPublicId(url: string): string | null {
    // Handle the format we see in test: /image/upload/v1770095305/test_1770095302516.pdf
    const patterns = [
      /\/image\/upload\/v\d+\/([^/]+?)(?:\.pdf)?$/,
      /\/image\/upload\/([^/]+?)(?:\.pdf)?$/,
      /\/raw\/upload\/v\d+\/([^/]+?)(?:\.pdf)?$/,
      /\/raw\/upload\/([^/]+?)(?:\.pdf)?$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Get direct URL for PDF viewing (fallback method)
   * @param publicId - Public ID of the file
   * @returns Direct URL
   */
  static getDirectUrl(publicId: string): string {
    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${publicId}`;
  }

  /**
   * Test URL accessibility 
   */
  static async testUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
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