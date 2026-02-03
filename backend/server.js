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
      console.log('🔍 Firebase JSON length:', json.length);
      console.log('🔍 First 100 chars:', json.substring(0, 100));
      console.log('🔍 Last 100 chars:', json.substring(json.length - 100));
      
      // Try parsing as-is first (for properly escaped JSON)
      let serviceAccount;
      try {
        serviceAccount = JSON.parse(json);
      } catch (firstError) {
        console.log('🔄 First parse failed, trying with newline normalization');
        // If that fails, try normalizing newlines
        const normalizedJson = json.replace(/\\n/g, '\n');
        serviceAccount = JSON.parse(normalizedJson);
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account');
      return;
    } catch (err) {
      console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
      console.error('❌ Error details:', err);
      console.error('❌ JSON preview (chars 150-170):', json.substring(150, 170));
      
      // Try without any JSON parsing - use raw object construction
      try {
        console.log('🔄 Attempting alternative parsing...');
        const serviceAccount = {
          type: "service_account",
          project_id: "apna-sahe",
          private_key_id: "2534b2c759f82a3933b048f67ff7b3e9dd0c2269",
          private_key: "-----BEGIN PRIVATE KEY-----\\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCzI/iZi+ZeO97R\\ns4Izz0soRLJCu6iCbknVVgkjJt2i7KC8lBAtsb7tW2qDQCzbtLrfb2l+C6XtInr5\\nDFp7EFxsDaKuT9/yPUiJ+wsSKh8ypMaW9Z4lFprHXi/P7F1kIa7D1TdkImdt2SBq\\nY4Nvtk2BQBFEqfZq0LjCImO1h2LS23bcvNX44G/L6v8n/8HP9eccctf6cDuc849B\\nAYliE9aH5iLJpehdoDd/rdbp76x8YxttTvXjI3JJZfJtPbO/RIB8pH89z6wxTrXG\\n6hzEBHugrDCG+1jRCUKXMVn+NTpupaDwGDWOkSxPXhfuWJXfkKVhERI862ubeS34\\n3ozxmKF7AgMBAAECggEAJqyC3H9H7hslyQbkepPriVd/VonV4Ma3mN94nIak/anx\\nL5UVgw/nBK4iKhC+PnZfi6ItV6FjInU5sC+bDwtisI8nClPDKLRTRzqT0smWL6RE\\nHU4MZLxjENyEHPLN3LKq3KtYyHzm8F+aMG2ocAMe62Lt93Fr+fZylLLA7O08CAIt\\nI9MT0fClYVbXru1mNQ99CR6zg8JTqdiVcyBJ2azF2I0sICCOF6n1cstelRyVNTo6\\nhONGWeeUsd8fNmqIQKAAsjcEglQMh4Mw5y24Pvu6oWw0goc+TKNBaZdagbANSxOg\\nQuZI3bmFA3kK35Wf0LVq+EEBjwqcIhcydEg6tFYTAQKBgQDxB9RSlWl4z9l0O1SR\\nUPWqSbuaTgI+mmG7VTXJwhk1Y/chbmBXW59s11Vbv3JCGIv41Il8Gu7DnNKaQDrN\\n4OJ0vJaechRUyhtNpOHDi/MD7I2PetJP9wT4THfHxu9EuHxcaXUHO1J8KG0+ryyE\\nrwy6XzPuTq8CttbwrQsgVkNXAQKBgQC+RCUbUmAwHbW7/79DFpP/sPdxvTk6bSDo\\nfWthpXyBnXgii063ybQNx+5/vCj3USHuL50vgPjFoIBTiwpShzGFhsrkDjUUOpPZ\\nI9uc7BxnOfiwCLMlyScAkk7jbdx23NsyJrZdV3sbpcAIy4HzfdgNB5BV6fHXkbaF\\nknzkFDHUewKBgDKCt4YO9alxtVpcTJ6fXrwu83ekvWetJqoBc2IyoOHFbza8UMg9\\n1S0T+zlc527eggbFU4KEimDH7oKQz0HxzMM1+kJ+GbCjIhGlagJ2w5ig7BGTZZuI\\nYqw+KiPdlqrKFpWvK+02C1Uli69FOokbvgkYhmN8bcSd2HFbcid2rGoBAoGAAVyR\\ne2mSgKWlyEujPcKqmnjUvH6jKzTeuGs1WoSJqI/M7Upb7NrHrBWTMlzRWju9Z2v1\\nzwI4RYnJgU+MalzHUPJO/2TOom9s4W/tQWk7Js32ZqQZTBrtaYaig+QkYMFh3DEE\\nuxRGMEN2ZVm3e1uaMTWtpb+/2FAVo00SEbvHQ4MCgYArZ+edX5nibjPsLy4xvCrh\\nHWgd0NMEaDg922/rLiK+AWZYw/f6+9HbsSegnq8nD6xVPAK4d759rkmTGBigpfw6\\nPoj7oVtfU+yNzpaeZWZVXLeuHTkXB9zw1lK+b5X495jDUN0xD4E5ZyzCl8PNKmRW\\nQvNMwycUecGG80MientWyw==\\n-----END PRIVATE KEY-----\\n".replace(/\\\\n/g, '\n'),
          client_email: "firebase-adminsdk-fbsvc@apna-sahe.iam.gserviceaccount.com",
          client_id: "103866156688562013726",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40apna-sahe.iam.gserviceaccount.com",
          universe_domain: "googleapis.com"
        };
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized with fallback credentials');
        return;
      } catch (fallbackError) {
        console.error('❌ Fallback initialization also failed:', fallbackError.message);
        throw new Error('Invalid Firebase service account JSON and fallback failed');
      }
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
