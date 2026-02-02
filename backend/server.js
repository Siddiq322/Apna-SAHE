import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5050;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'siddiqshaik613@gmail.com').toLowerCase();

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      // Normalize newlines in private_key for proper JSON parsing
      const normalizedJson = json.replace(/\\n/g, '\n');
      const serviceAccount = JSON.parse(normalizedJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account');
      return;
    } catch (err) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
      throw new Error('Invalid Firebase service account JSON');
    }
  }

  // Fallback: uses GOOGLE_APPLICATION_CREDENTIALS if provided
  try {
    admin.initializeApp();
    console.log('✅ Firebase Admin initialized with default credentials');
  } catch (err) {
    console.error('❌ Firebase Admin init failed:', err.message);
    throw err;
  }
}

function initCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.error('❌ Missing Cloudinary environment variables');
    throw new Error('CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  
  console.log('✅ Cloudinary configured with cloud:', CLOUDINARY_CLOUD_NAME);
}

try {
  initFirebaseAdmin();
  initCloudinary();
  console.log('✅ All services initialized successfully');
} catch (err) {
  console.error('❌ Startup failed:', err.message);
  process.exit(1);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/cloudinary/delete-note-file', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      return res.status(401).json({ error: 'Missing Authorization Bearer token' });
    }

    const idToken = match[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    const noteId = req.body?.noteId;
    if (!noteId) {
      return res.status(400).json({ error: 'noteId is required' });
    }

    const noteSnap = await admin.firestore().collection('notes').doc(noteId).get();
    if (!noteSnap.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const note = noteSnap.data();
    const uploaderId = note?.uploaderId;
    const publicId = note?.cloudinaryPublicId;

    if (!publicId) {
      return res.status(400).json({ error: 'Note has no cloudinaryPublicId' });
    }

    const isAdmin = (decoded.email || '').toLowerCase() === ADMIN_EMAIL;
    const isOwner = decoded.uid && uploaderId && decoded.uid === uploaderId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    if (result?.result !== 'ok' && result?.result !== 'not found') {
      return res.status(500).json({ error: `Cloudinary destroy failed: ${result?.result || 'unknown'}` });
    }

    return res.json({ ok: true, result: result?.result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err?.message || 'Internal error' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
