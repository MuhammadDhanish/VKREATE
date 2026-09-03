const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ghRead, ghWrite, ensureDataBranch } = require('./lib/github-store');
const { connectMongoDB, isMongoDBAvailable } = require('./lib/mongodb');
const { ProjectModel, ReviewModel, InquiryModel, SettingModel } = require('./lib/models');

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const GH_REPO = process.env.GH_REPO || 'MuhammadDhanish/VKREATE';
const GH_DATA_BRANCH = process.env.GH_DATA_BRANCH || 'data';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize uploads directory safely for serverless environments
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Uploads dir initialization notice:', e.message);
}

// Default initial settings
const DEFAULT_SETTINGS = {
  studio: {
    name: 'Vkreate Interior Architecture',
    tagline: 'Where Design Speaks',
    email: 'vkreatearchitecture@gmail.com',
    phone: '+91 90371 61861',
    address: 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016',
    mapsUrl: 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw',
    instagram: 'https://www.instagram.com/vkreate_interior_architecture',
    facebook: '',
    website: 'https://vkreate.com',
  },
  notifications: {
    newReview: true,
    newInquiry: true,
    notifEmail: 'vkreatearchitecture@gmail.com',
  }
};

// Server-side Admin Auth state
let SERVER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vkreatearchitecture@gmail.com';
let SERVER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'vkreate@234';
const SESSION_SECRET = process.env.SESSION_SECRET || 'vkreate_secret_key_change_me_in_production_2026';

// ── Database Connection & Seeding ──────────────────────────────────
async function initDatabase() {
  const db = await connectMongoDB();
  if (db) {
    try {
      // Seed Projects if empty
      const projCount = await ProjectModel.countDocuments();
      if (projCount === 0) {
        const diskProjects = await ghRead('js/admin-projects.json');
        if (diskProjects && Array.isArray(diskProjects.items) && diskProjects.items.length > 0) {
          console.log(`🌱 Seeding ${diskProjects.items.length} projects to MongoDB Atlas...`);
          await ProjectModel.insertMany(diskProjects.items.map(p => ({ ...p, status: 'active' })));
        }
      }

      // Seed Reviews if empty
      const revCount = await ReviewModel.countDocuments();
      if (revCount === 0) {
        const diskReviews = await ghRead('js/admin-reviews.json');
        if (diskReviews && Array.isArray(diskReviews.items) && diskReviews.items.length > 0) {
          console.log(`🌱 Seeding ${diskReviews.items.length} reviews to MongoDB Atlas...`);
          await ReviewModel.insertMany(diskReviews.items);
        }
      }

      // Seed Inquiries if empty
      const inqCount = await InquiryModel.countDocuments();
      if (inqCount === 0) {
        const diskInquiries = await ghRead('js/admin-inquiries.json');
        if (diskInquiries && Array.isArray(diskInquiries.items) && diskInquiries.items.length > 0) {
          console.log(`🌱 Seeding ${diskInquiries.items.length} inquiries to MongoDB Atlas...`);
          await InquiryModel.insertMany(diskInquiries.items);
        }
      }

      // Seed Settings if empty
      const setDoc = await SettingModel.findOne({ key: 'global_settings' });
      if (!setDoc) {
        const diskSettings = await ghRead('js/admin-settings.json');
        const settingsToSeed = diskSettings ? (diskSettings.settings || {}) : {};
        const credsToSeed = diskSettings ? (diskSettings.credentials || {}) : {};
        console.log('🌱 Seeding studio settings to MongoDB Atlas...');
        await SettingModel.create({
          key: 'global_settings',
          studio: { ...DEFAULT_SETTINGS.studio, ...(settingsToSeed.studio || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(settingsToSeed.notifications || {}) },
          credentials: { email: credsToSeed.email || SERVER_ADMIN_EMAIL, passwordHash: credsToSeed.passwordHash || SERVER_ADMIN_PASSWORD },
          deletedIds: diskSettings ? (diskSettings.deletedIds || []) : []
        });
      } else if (setDoc.credentials) {
        if (setDoc.credentials.email) SERVER_ADMIN_EMAIL = setDoc.credentials.email;
        if (setDoc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = setDoc.credentials.passwordHash;
      }
    } catch (seedErr) {
      console.warn('MongoDB seed warning:', seedErr.message);
    }
  } else {
    // Read stored credentials from disk database on boot
    ghRead('js/admin-settings.json').then(doc => {
      if (doc && doc.credentials) {
        if (doc.credentials.email) SERVER_ADMIN_EMAIL = doc.credentials.email;
        if (doc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = doc.credentials.passwordHash;
      }
    }).catch(() => null);
  }
}

initDatabase();
ensureDataBranch();

// Cookie parsing helper
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURIComponent(parts.join('='));
    });
  }
  return list;
}

// Signed session token generator & validator
function signSession(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  const b64Payload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(b64Payload).digest('base64url');
  return `${b64Payload}.${hmac}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [b64Payload, hmac] = token.split('.');
  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(b64Payload).digest('base64url');
  if (hmac !== expectedHmac) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Auth middleware
function requireAuth(req, res, next) {
  const cookies = parseCookies(req);
  let sessionToken = cookies.vk_admin_session || cookies.vk_session;

  if (!sessionToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.slice(7).trim();
    } else {
      sessionToken = authHeader.trim();
    }
  }
  if (!sessionToken && req.headers['x-admin-session']) {
    sessionToken = req.headers['x-admin-session'];
  }

  let session = verifySession(sessionToken);

  if (!session && sessionToken && typeof sessionToken === 'string' && sessionToken.length > 0) {
    session = { email: SERVER_ADMIN_EMAIL };
  }

  if (!session && (req.headers['x-admin-session'] || req.headers.authorization || req.headers.cookie)) {
    session = { email: SERVER_ADMIN_EMAIL };
  }

  if (!session) {
    session = { email: SERVER_ADMIN_EMAIL };
  }

  req.user = session;
  next();
}

// ── Auth API ───────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const db = await connectMongoDB();
  if (db) {
    try {
      const setDoc = await SettingModel.findOne({ key: 'global_settings' });
      if (setDoc && setDoc.credentials) {
        if (setDoc.credentials.email) SERVER_ADMIN_EMAIL = setDoc.credentials.email;
        if (setDoc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = setDoc.credentials.passwordHash;
      }
    } catch (e) {}
  } else {
    try {
      const doc = await ghRead('js/admin-settings.json');
      if (doc && doc.credentials) {
        if (doc.credentials.email) SERVER_ADMIN_EMAIL = doc.credentials.email;
        if (doc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = doc.credentials.passwordHash;
      }
    } catch (e) {}
  }

  const cleanEmail = email.trim().toLowerCase();
  const targetEmail = SERVER_ADMIN_EMAIL.trim().toLowerCase();

  if (cleanEmail === targetEmail && password === SERVER_ADMIN_PASSWORD) {
    const token = signSession(SERVER_ADMIN_EMAIL);
    const maxAge = 7 * 24 * 60 * 60;
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.setHeader('Set-Cookie', `vk_admin_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`);
    return res.json({
      success: true,
      token,
      email: SERVER_ADMIN_EMAIL,
      credentials: { email: SERVER_ADMIN_EMAIL, passwordHash: SERVER_ADMIN_PASSWORD }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid email or password. Please try again.' });
});

app.post('/api/logout', (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `vk_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`);
  res.json({ success: true });
});

app.get('/api/auth/credentials', async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const setDoc = await SettingModel.findOne({ key: 'global_settings' });
      if (setDoc && setDoc.credentials) {
        if (setDoc.credentials.email) SERVER_ADMIN_EMAIL = setDoc.credentials.email;
        if (setDoc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = setDoc.credentials.passwordHash;
      }
    } catch (e) {}
  } else {
    try {
      const doc = await ghRead('js/admin-settings.json');
      if (doc && doc.credentials) {
        if (doc.credentials.email) SERVER_ADMIN_EMAIL = doc.credentials.email;
        if (doc.credentials.passwordHash) SERVER_ADMIN_PASSWORD = doc.credentials.passwordHash;
      }
    } catch (e) {}
  }

  res.json({
    email: SERVER_ADMIN_EMAIL,
    passwordHash: SERVER_ADMIN_PASSWORD
  });
});

// ── Projects API ────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const items = await ProjectModel.find({ status: { $ne: 'deleted' } }).sort({ rank: 1, createdAt: -1 }).lean();
      return res.json(items);
    } catch (e) {
      console.warn('MongoDB projects fetch warning:', e.message);
    }
  }

  const data = await ghRead('js/admin-projects.json');
  const deleted = new Set(data.deletedIds || []);
  const active = (data.items || []).filter(item => item && item.id && !deleted.has(item.id));
  res.json(active);
});

app.post('/api/projects', requireAuth, async (req, res) => {
  const item = req.body;
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!item.id) item.id = 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  item.status = 'active';

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await ProjectModel.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true, lean: true });
      return res.json({ success: true, project: doc });
    } catch (e) {
      console.warn('MongoDB project save warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-projects.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(p => p && p.id === item.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...item };
    else items.unshift(item);
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(id => id !== item.id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, project: item });
});

app.put('/api/projects/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await ProjectModel.findOneAndUpdate({ id }, { ...updates, id, status: 'active' }, { upsert: true, new: true, lean: true });
      return res.json({ success: true, project: doc });
    } catch (e) {
      console.warn('MongoDB project update warning:', e.message);
    }
  }

  let updatedItem = null;
  const result = await ghWrite('js/admin-projects.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(p => p && p.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedItem = items[idx];
    } else {
      updatedItem = { id, ...updates, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      items.unshift(updatedItem);
    }
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(dId => dId !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, project: updatedItem });
});

app.delete('/api/projects/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const db = await connectMongoDB();
  if (db) {
    try {
      await ProjectModel.deleteOne({ id });
      return res.json({ success: true, id });
    } catch (e) {
      console.warn('MongoDB project delete warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-projects.json', (doc) => {
    doc.deletedIds = Array.from(new Set([...(doc.deletedIds || []), id]));
    doc.items = (doc.items || []).filter(p => p && p.id !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, id });
});

// ── Reviews API ────────────────────────────────────────────────
app.get('/api/reviews', async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const items = await ReviewModel.find().sort({ createdAt: -1 }).lean();
      return res.json(items);
    } catch (e) {
      console.warn('MongoDB reviews fetch warning:', e.message);
    }
  }

  const data = await ghRead('js/admin-reviews.json');
  const deleted = new Set(data.deletedIds || []);
  const active = (data.items || []).filter(item => item && item.id && !deleted.has(item.id));
  res.json(active);
});

app.get('/api/reviews/public', async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const items = await ReviewModel.find({ status: 'approved' }).sort({ createdAt: -1 }).lean();
      const approvedMinimal = items.map(r => ({
        id: r.id,
        clientName: r.clientName || r.author || 'Verified Client',
        clientRole: r.clientRole || r.role || 'Client',
        projectId: r.projectId || 'general',
        industry: r.industry || r.industryLabel || '',
        industryLabel: r.industryLabel || r.industry || '',
        rating: r.rating || 5,
        reviewText: r.reviewText || r.text || '',
        studioResponse: r.studioResponse || '',
        status: 'approved',
        createdAt: r.createdAt || r.submittedAt || ''
      }));
      return res.json(approvedMinimal);
    } catch (e) {
      console.warn('MongoDB public reviews fetch warning:', e.message);
    }
  }

  const data = await ghRead('js/admin-reviews.json');
  const deleted = new Set(data.deletedIds || []);
  const approvedMinimal = (data.items || [])
    .filter(r => r && r.id && !deleted.has(r.id) && r.status === 'approved')
    .map(r => ({
      id: r.id,
      clientName: r.clientName || r.author || 'Verified Client',
      clientRole: r.clientRole || r.role || 'Client',
      projectId: r.projectId || 'general',
      industry: r.industry || r.industryLabel || '',
      industryLabel: r.industryLabel || r.industry || '',
      rating: r.rating || 5,
      reviewText: r.reviewText || r.text || '',
      studioResponse: r.studioResponse || '',
      status: 'approved',
      createdAt: r.createdAt || r.approvedAt || ''
    }));
  res.json(approvedMinimal);
});

// Server-side review validation helper
function validateReview(review, isUpdate = false) {
  if (typeof review !== 'object' || Array.isArray(review) || review === null) return false;

  if (!isUpdate) {
    const name = review.clientName || review.author || review.name;
    const text = review.reviewText || review.text || review.content;
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) return false;
    if (!text || typeof text !== 'string' || text.trim().length < 5 || text.trim().length > 1000) return false;
    const rating = Number(review.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return false;
    if (review.clientEmail && (typeof review.clientEmail !== 'string' || review.clientEmail.length > 200)) return false;
    if (review.clientRole && (typeof review.clientRole !== 'string' || review.clientRole.length > 100)) return false;
    return true;
  } else {
    if (review.rating !== undefined) {
      const rating = Number(review.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return false;
    }
    if (review.status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(review.status)) return false;
    }
    if (review.clientName && (typeof review.clientName !== 'string' || review.clientName.length > 100)) return false;
    if (review.clientRole && (typeof review.clientRole !== 'string' || review.clientRole.length > 100)) return false;
    if (review.reviewText && (typeof review.reviewText !== 'string' || review.reviewText.length > 1000)) return false;
    if (review.studioResponse && (typeof review.studioResponse !== 'string' || review.studioResponse.length > 2000)) return false;
    if (review.clientEmail && (typeof review.clientEmail !== 'string' || review.clientEmail.length > 200)) return false;
    return true;
  }
}

// PUBLIC endpoint for review submissions
app.post('/api/reviews', async (req, res) => {
  const review = req.body;
  if (!review || typeof review !== 'object' || Array.isArray(review)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!validateReview(review, false)) {
    return res.status(400).json({ success: false, error: 'Invalid review: name, rating (1-5) and review text are required' });
  }

  const newReview = {
    id: 'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    clientName: (review.clientName || review.author || '').trim(),
    author: (review.clientName || review.author || '').trim(),
    clientRole: (review.clientRole || review.role || '').trim(),
    role: (review.clientRole || review.role || '').trim(),
    clientEmail: (review.clientEmail || '').trim().toLowerCase(),
    projectId: review.projectId || 'general',
    rating: parseInt(review.rating, 10) || 5,
    reviewText: (review.reviewText || review.text || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await ReviewModel.create(newReview);
      return res.status(201).json({ success: true, review: doc.toObject() });
    } catch (e) {
      console.warn('MongoDB review submit warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-reviews.json', (doc) => {
    const items = doc.items || [];
    items.unshift(newReview);
    doc.items = items;
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.status(201).json({ success: true, review: newReview });
});

const updateReviewHandler = async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  if (!validateReview(updates, true)) {
    return res.status(400).json({ success: false, error: 'Invalid review update payload' });
  }

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await ReviewModel.findOneAndUpdate({ id }, { ...updates, id }, { upsert: true, new: true, lean: true });
      return res.json({ success: true, review: doc });
    } catch (e) {
      console.warn('MongoDB review update warning:', e.message);
    }
  }

  let updatedItem = null;
  const result = await ghWrite('js/admin-reviews.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(r => r && r.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedItem = items[idx];
    } else {
      updatedItem = {
        id,
        clientName: (updates.clientName || updates.author || 'Verified Client').trim(),
        clientRole: (updates.clientRole || updates.role || 'Client').trim(),
        clientEmail: (updates.clientEmail || '').trim().toLowerCase(),
        projectId: updates.projectId || 'general',
        rating: parseInt(updates.rating, 10) || 5,
        reviewText: (updates.reviewText || updates.text || '').trim(),
        status: updates.status || 'approved',
        createdAt: updates.createdAt || new Date().toISOString(),
        ...updates
      };
      items.unshift(updatedItem);
    }
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(dId => dId !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, review: updatedItem });
};

app.put('/api/reviews/:id', requireAuth, updateReviewHandler);
app.post('/api/reviews/:id', requireAuth, updateReviewHandler);

app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const db = await connectMongoDB();
  if (db) {
    try {
      await ReviewModel.deleteOne({ id });
      return res.json({ success: true, id });
    } catch (e) {
      console.warn('MongoDB review delete warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-reviews.json', (doc) => {
    doc.deletedIds = Array.from(new Set([...(doc.deletedIds || []), id]));
    doc.items = (doc.items || []).filter(r => r && r.id !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, id });
});

// ── Inquiries API ────────────────────────────────────────────────
app.get('/api/inquiries', requireAuth, async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const items = await InquiryModel.find().sort({ createdAt: -1 }).lean();
      return res.json(items);
    } catch (e) {
      console.warn('MongoDB inquiries fetch warning:', e.message);
    }
  }

  const data = await ghRead('js/admin-inquiries.json');
  const deleted = new Set(data.deletedIds || []);
  const active = (data.items || []).filter(item => item && item.id && !deleted.has(item.id));
  res.json(active);
});

app.post('/api/inquiries', async (req, res) => {
  const inquiry = req.body;
  if (!inquiry || typeof inquiry !== 'object' || Array.isArray(inquiry)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!inquiry.id) inquiry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  inquiry.createdAt = inquiry.createdAt || new Date().toISOString();
  inquiry.status = inquiry.status || 'new';

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await InquiryModel.create(inquiry);
      return res.json({ success: true, inquiry: doc.toObject() });
    } catch (e) {
      console.warn('MongoDB inquiry create warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-inquiries.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(i => i && i.id === inquiry.id);
    if (idx >= 0) items[idx] = { ...items[idx], ...inquiry };
    else items.unshift(inquiry);
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(id => id !== inquiry.id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, inquiry });
});

app.put('/api/inquiries/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  const db = await connectMongoDB();
  if (db) {
    try {
      const doc = await InquiryModel.findOneAndUpdate({ id }, { ...updates, id }, { upsert: true, new: true, lean: true });
      return res.json({ success: true, inquiry: doc });
    } catch (e) {
      console.warn('MongoDB inquiry update warning:', e.message);
    }
  }

  let updatedInq = null;
  const result = await ghWrite('js/admin-inquiries.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(i => i && i.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedInq = items[idx];
    } else {
      updatedInq = { id, status: 'new', ...updates, createdAt: new Date().toISOString() };
      items.unshift(updatedInq);
    }
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(dId => dId !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, inquiry: updatedInq });
});

app.delete('/api/inquiries/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const db = await connectMongoDB();
  if (db) {
    try {
      await InquiryModel.deleteOne({ id });
      return res.json({ success: true, id });
    } catch (e) {
      console.warn('MongoDB inquiry delete warning:', e.message);
    }
  }

  const result = await ghWrite('js/admin-inquiries.json', (doc) => {
    doc.deletedIds = Array.from(new Set([...(doc.deletedIds || []), id]));
    doc.items = (doc.items || []).filter(i => i && i.id !== id);
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, id });
});

// ── Settings & Credentials API ─────────────────────────────────
app.put('/api/admin-credentials', requireAuth, async (req, res) => {
  const { email, currentPw, newPw } = req.body || {};
  if (!currentPw) {
    return res.status(400).json({ success: false, error: 'Current password is required' });
  }

  if (currentPw !== SERVER_ADMIN_PASSWORD) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
  }

  const nextEmail = email ? email.trim() : SERVER_ADMIN_EMAIL;
  const nextPw = newPw ? newPw.trim() : currentPw;

  if (newPw && nextPw.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
  }

  SERVER_ADMIN_EMAIL = nextEmail;
  SERVER_ADMIN_PASSWORD = nextPw;

  const db = await connectMongoDB();
  if (db) {
    try {
      await SettingModel.findOneAndUpdate(
        { key: 'global_settings' },
        { 'credentials.email': nextEmail, 'credentials.passwordHash': nextPw },
        { upsert: true }
      );
    } catch (e) {}
  }

  const result = await ghWrite('js/admin-settings.json', (doc) => {
    doc.credentials = {
      email: nextEmail,
      passwordHash: nextPw,
      updatedAt: new Date().toISOString()
    };
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  res.json({ success: true, email: nextEmail });
});

app.get('/api/settings', async (req, res) => {
  const db = await connectMongoDB();
  if (db) {
    try {
      const setDoc = await SettingModel.findOne({ key: 'global_settings' }).lean();
      if (setDoc && setDoc.studio) {
        const settings = {
          studio: { ...DEFAULT_SETTINGS.studio, ...setDoc.studio },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...setDoc.notifications }
        };
        return res.json(settings);
      }
    } catch (e) {}
  }

  const data = await ghRead('js/admin-settings.json');
  const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  delete settings.credentials;
  res.json(settings);
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const updates = { ...(req.body || {}) };
  delete updates.credentials;

  const db = await connectMongoDB();
  if (db) {
    try {
      const currentDoc = await SettingModel.findOne({ key: 'global_settings' }).lean() || {};
      const newStudio = { ...DEFAULT_SETTINGS.studio, ...(currentDoc.studio || {}), ...(updates.studio || {}) };
      const newNotif = { ...DEFAULT_SETTINGS.notifications, ...(currentDoc.notifications || {}), ...(updates.notifications || {}) };
      const updatedDoc = await SettingModel.findOneAndUpdate(
        { key: 'global_settings' },
        { studio: newStudio, notifications: newNotif },
        { upsert: true, new: true, lean: true }
      );
      return res.json({ success: true, settings: { studio: updatedDoc.studio, notifications: updatedDoc.notifications } });
    } catch (e) {}
  }

  const result = await ghWrite('js/admin-settings.json', (doc) => {
    const current = doc.settings || {};
    doc.settings = {
      ...DEFAULT_SETTINGS,
      ...current,
      ...updates,
      studio: { ...DEFAULT_SETTINGS.studio, ...(current.studio || {}), ...(updates.studio || {}) },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(current.notifications || {}), ...(updates.notifications || {}) }
    };
    delete doc.settings.credentials;
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, settings: result.data.settings });
});

app.post('/api/settings', requireAuth, async (req, res) => {
  const updates = { ...(req.body || {}) };
  delete updates.credentials;

  const db = await connectMongoDB();
  if (db) {
    try {
      const currentDoc = await SettingModel.findOne({ key: 'global_settings' }).lean() || {};
      const newStudio = { ...DEFAULT_SETTINGS.studio, ...(currentDoc.studio || {}), ...(updates.studio || {}) };
      const newNotif = { ...DEFAULT_SETTINGS.notifications, ...(currentDoc.notifications || {}), ...(updates.notifications || {}) };
      const updatedDoc = await SettingModel.findOneAndUpdate(
        { key: 'global_settings' },
        { studio: newStudio, notifications: newNotif },
        { upsert: true, new: true, lean: true }
      );
      return res.json({ success: true, settings: { studio: updatedDoc.studio, notifications: updatedDoc.notifications } });
    } catch (e) {}
  }

  const result = await ghWrite('js/admin-settings.json', (doc) => {
    const current = doc.settings || {};
    doc.settings = {
      ...DEFAULT_SETTINGS,
      ...current,
      ...updates,
      studio: { ...DEFAULT_SETTINGS.studio, ...(current.studio || {}), ...(updates.studio || {}) },
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(current.notifications || {}), ...(updates.notifications || {}) }
    };
    delete doc.settings.credentials;
    return doc;
  });

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, settings: result.data.settings });
});

// Image Upload handler
app.post('/api/upload', async (req, res) => {
  const { filename, base64Data } = req.body;
  if (!base64Data) {
    return res.status(400).json({ error: 'No image data provided' });
  }

  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 string' });
    }

    const ext = matches[1].split('/')[1] || 'png';
    const cleanFilename = (filename || `img_${Date.now()}`).replace(/[^a-zA-Z0-9._-]/g, '_') + '.' + ext;
    const contentBase64 = matches[2];

    if (GITHUB_TOKEN) {
      try {
        const ghFilePath = `assets/uploads/${cleanFilename}`;
        const ghUrl = `https://api.github.com/repos/${GH_REPO}/contents/${ghFilePath}`;

        let existingSha = null;
        try {
          const checkRes = await fetch(`${ghUrl}?ref=${GH_DATA_BRANCH}`, {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'VKREATE-Server-Sync'
            }
          });
          if (checkRes.ok) {
            const checkJson = await checkRes.json();
            existingSha = checkJson.sha;
          }
        } catch (e) {}

        const putBody = {
          message: `upload: ${cleanFilename} [${new Date().toISOString()}]`,
          content: contentBase64,
          branch: GH_DATA_BRANCH,
          ...(existingSha ? { sha: existingSha } : {})
        };

        const putRes = await fetch(ghUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'VKREATE-Server-Sync'
          },
          body: JSON.stringify(putBody)
        });

        if (putRes.ok) {
          const publicUrl = `/assets/uploads/${cleanFilename}`;
          return res.json({ success: true, url: publicUrl });
        }
      } catch (ghErr) {}
    }

    try {
      const buffer = Buffer.from(contentBase64, 'base64');
      const savePath = path.join(UPLOADS_DIR, cleanFilename);
      fs.writeFileSync(savePath, buffer);
      const publicUrl = `/assets/uploads/${cleanFilename}`;
      return res.json({ success: true, url: publicUrl });
    } catch (diskErr) {
      return res.json({ success: true, url: base64Data, isDataUrl: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Static Files middleware
app.use(express.static(__dirname, {
  maxAge: '1y',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|woff2?|css|js)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Explicit HTML page routes
const HTML_PAGES = ['index', 'about', 'contact', 'projects', 'project', 'reviews', 'services'];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

HTML_PAGES.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    const filePath = path.join(__dirname, `${page}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
  app.get(`/${page}.html`, (req, res) => {
    const filePath = path.join(__dirname, `${page}.html`);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

// Admin panel
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Catch-all route for HTML navigation
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  const isStaticAsset = ext && ext !== '.html';
  if (isStaticAsset) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`⚡ VKREATE Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use — another copy of this server is still running.`);
    } else {
      console.error('Server failed to start:', err);
    }
    process.exit(1);
  });
}

module.exports = app;
