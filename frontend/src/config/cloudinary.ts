/**
 * Cloudinary Configuration for PDF File Storage
 * Replace Firebase Storage with Cloudinary for better performance and more storage
 */

export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dhvnt156n', // Your actual cloud name
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '846746144382878', // Your actual API key
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pdf_notes_preset', // Your upload preset
  folder: 'apna-sahe/notes', // Folder structure in Cloudinary
  resourceType: 'auto' as const,
  allowedFormats: ['pdf'],
  maxFileSize: 10000000, // 10MB in bytes
  maxResults: 30
};

// Debug logging for production
console.log('🔧 Cloudinary Config Loaded:', {
  cloudName: CLOUDINARY_CONFIG.cloudName,
  uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
  hasApiKey: !!CLOUDINARY_CONFIG.apiKey,
  environment: import.meta.env.MODE,
  rawEnvVars: {
    VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    VITE_CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
    VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  }
});

// Add a global debug function for production debugging
if (typeof window !== 'undefined') {
  (window as any).debugCloudinary = () => {
    console.log('🔍 Cloudinary Debug Info:', {
      config: CLOUDINARY_CONFIG,
      urls: CLOUDINARY_URLS,
      environment: {
        NODE_ENV: import.meta.env.NODE_ENV || 'development',
        MODE: import.meta.env.MODE || 'development',
        DEV: import.meta.env.DEV || false,
        PROD: import.meta.env.PROD || false,
        BASE_URL: import.meta.env.BASE_URL || '/'
      },
      envVars: {
        VITE_CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        VITE_CLOUDINARY_API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY,
        VITE_CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      }
    });
    return 'Debug info logged to console';
  };
}

export const CLOUDINARY_URLS = {
  base: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}`,
  upload: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`,
  image: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
  raw: `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/raw/upload`
};

/**
 * Generate file path for organized storage
 */
export const generateCloudinaryPath = (
  branch: string, 
  semester: string, 
  subject: string, 
  fileName: string
): string => {
  const timestamp = Date.now();
  return `${CLOUDINARY_CONFIG.folder}/${branch}/${semester}/${subject}/${timestamp}_${fileName}`;
};

/**
 * Transform Cloudinary URL for optimized delivery
 */
export const optimizeCloudinaryUrl = (publicId: string): string => {
  return `${CLOUDINARY_URLS.image}/f_auto,q_auto,fl_progressive/${publicId}`;
};