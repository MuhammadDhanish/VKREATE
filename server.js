const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ghRead, ghWrite, ensureDataBranch } = require('./lib/github-store');

const app = express();
const PORT = process.env.PORT || 3000;

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
    notifEmail: 'admin@vkreate.com',
  }
};

// Server-side Admin Auth state (defaults to env vars)
let SERVER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@vkreate.com';
let SERVER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'vkreate_secret_key_change_me_in_production_2026';

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
  let sessionToken = cookies.vk_admin_session;

  if (!sessionToken && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.slice(7).trim();
    }
  }
  if (!sessionToken && req.headers['x-admin-session']) {
    sessionToken = req.headers['x-admin-session'];
  }

  const session = verifySession(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session expired or invalid' });
  }
  req.user = session;
  next();
}

// Ensure dedicated data branch exists on startup
ensureDataBranch();

// API responses must never be cached by browsers or proxies
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// ── Projects API ────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
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
  item.createdAt = item.createdAt || new Date().toISOString();
  item.updatedAt = new Date().toISOString();

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
  const data = await ghRead('js/admin-reviews.json');
  const deleted = new Set(data.deletedIds || []);
  const active = (data.items || []).filter(item => item && item.id && !deleted.has(item.id));
  res.json(active);
});

app.get('/api/reviews/public', async (req, res) => {
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
    clientRole: (review.clientRole || review.role || '').trim(),
    clientEmail: (review.clientEmail || '').trim().toLowerCase(),
    projectId: review.projectId || 'general',
    rating: parseInt(review.rating, 10) || 5,
    reviewText: (review.reviewText || review.text || '').trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

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

  let updatedItem = null;
  let notFound = false;
  const result = await ghWrite('js/admin-reviews.json', (doc) => {
    const items = doc.items || [];
    const idx = items.findIndex(r => r && r.id === id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
      updatedItem = items[idx];
    } else {
      notFound = true;
      return doc;
    }
    doc.items = items;
    doc.deletedIds = (doc.deletedIds || []).filter(dId => dId !== id);
    return doc;
  });

  if (notFound) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }
  res.json({ success: true, review: updatedItem });
};

app.put('/api/reviews/:id', requireAuth, updateReviewHandler);
app.post('/api/reviews/:id', requireAuth, updateReviewHandler);

app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
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

// ── Settings API ────────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  const data = await ghRead('js/admin-settings.json');
  const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  delete settings.credentials;
  res.json(settings);
});

app.put('/api/settings', requireAuth, async (req, res) => {
  const updates = { ...(req.body || {}) };
  delete updates.credentials;

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

// ── Authentication API ───────────────────────────────────────────
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  if (email.trim().toLowerCase() === SERVER_ADMIN_EMAIL.toLowerCase() && password === SERVER_ADMIN_PASSWORD) {
    const token = signSession(SERVER_ADMIN_EMAIL);
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    const cookieHeader = `vk_admin_session=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', cookieHeader);
    return res.json({ success: true, token, email: SERVER_ADMIN_EMAIL, name: 'Admin' });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
});

app.post('/api/logout', (req, res) => {
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `vk_admin_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${isSecure ? '; Secure' : ''}`);
  res.json({ success: true });
});

app.put('/api/admin-credentials', requireAuth, (req, res) => {
  const { email, currentPw, newPw } = req.body || {};
  if (currentPw !== SERVER_ADMIN_PASSWORD) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
  }
  if (email && typeof email === 'string' && email.trim()) {
    SERVER_ADMIN_EMAIL = email.trim();
  }
  if (newPw && typeof newPw === 'string' && newPw.length >= 8) {
    SERVER_ADMIN_PASSWORD = newPw;
  }
  res.json({ success: true, message: 'Credentials updated successfully' });
});

// Image Upload
app.post('/api/upload', (req, res) => {
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
    const savePath = path.join(UPLOADS_DIR, cleanFilename);
    const buffer = Buffer.from(matches[2], 'base64');

    fs.writeFileSync(savePath, buffer);
    const publicUrl = `assets/uploads/${cleanFilename}`;
    res.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to save uploaded image' });
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
