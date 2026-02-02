# Cloudinary Setup Guide for Apna SAHE

This guide will help you set up Cloudinary to replace Firebase Storage for better PDF storage capacity (25GB free vs 5GB).

## Why Cloudinary?

| Feature | Firebase Storage | Cloudinary |
|---------|------------------|------------|
| **Free Storage** | 5 GB | 25 GB (5x more!) |
| **Free Bandwidth** | 1 GB/day | 25 GB/month |
| **Pricing** | $0.026/GB/month | $0.018/GB/month |
| **CDN** | Yes | Global CDN |
| **File Optimization** | No | Built-in optimization |

## Step 1: Create Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click **"Sign Up for Free"**
3. Choose **"Developer"** plan (free)
4. Verify your email

## Step 2: Get Your Credentials

1. After login, go to **Dashboard**
2. Copy these values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (keep this secure!)

## Step 3: Create Upload Preset

1. Go to **Settings** → **Upload**
2. Click **"Add upload preset"**
3. Configure:
   - **Preset name**: `pdf_notes_preset`
   - **Signing mode**: `Unsigned`
   - **Folder**: `apna-sahe/notes`
   - **Resource type**: `Auto`
   - **Allowed formats**: `pdf`
   - **Max file size**: `10MB`
4. Click **"Save"**

## Step 4: Update Configuration

Replace the values in `src/config/cloudinary.ts`:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: 'your-cloud-name', // Replace with your cloud name
  apiKey: 'your-api-key', // Replace with your API key  
  uploadPreset: 'pdf_notes_preset', // The preset you created
  folder: 'apna-sahe/notes',
  resourceType: 'auto' as const,
  allowedFormats: ['pdf'],
  maxFileSize: 10000000, // 10MB
  maxResults: 30
};
```

## Step 5: Environment Variables (Optional)

For production, create `.env` file:

```bash
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_API_KEY=your-api-key
VITE_CLOUDINARY_UPLOAD_PRESET=pdf_notes_preset
```

Then update `cloudinary.ts`:

```typescript
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'pdf_notes_preset',
  // ... rest of config
};
```

## Step 6: Test the Setup

1. Run your app: `npm run dev`
2. Login to your app
3. Try uploading a PDF
4. Check your Cloudinary dashboard to see the uploaded file

## Benefits After Setup

✅ **5x more storage**: 25GB instead of 5GB  
✅ **Better performance**: Global CDN delivery  
✅ **Lower costs**: Cheaper pricing for paid plans  
✅ **File organization**: Automatic folder structure  
✅ **Optimization**: Built-in PDF optimization  

## File Organization

Your PDFs will be organized like this:
```
apna-sahe/
└── notes/
    └── CSE/
        └── 4/
            └── Data Structures/
                └── 1738123456_dsa-notes.pdf
```

## Migration Notes

- **Existing files**: Old base64 and Firebase Storage files will continue to work
- **New uploads**: All new uploads will use Cloudinary
- **Gradual migration**: No immediate action needed for existing files

## Troubleshooting

### Upload Fails
- Check your cloud name, API key, and upload preset
- Ensure upload preset is set to "Unsigned"
- Verify file size is under 10MB

### Files Not Showing
- Check Cloudinary dashboard for uploaded files
- Verify the folder structure in your preset

### Quota Exceeded
- Check your usage in Cloudinary dashboard
- Upgrade to paid plan if needed

Your app now has 5x more storage capacity! 🚀