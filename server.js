const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists (safely guarded for serverless read-only environment)
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Uploads dir initialization notice:', e.message);
}

// Data file paths
const FILES = {
  projects: path.join(__dirname, 'js', 'admin-projects.json'),
  reviews: path.join(__dirname, 'js', 'admin-reviews.json'),
  inquiries: path.join(__dirname, 'js', 'admin-inquiries.json'),
  settings: path.join(__dirname, 'js', 'admin-settings.json'),
};

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

const crypto = require('crypto');
const os = require('os');

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
  const sessionToken = cookies.vk_admin_session;
  const session = verifySession(sessionToken);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session expired or invalid' });
  }
  req.user = session;
  next();
}

// In-memory persistence store for serverless / read-only environments
const MEMORY_STORE = {};

function getTmpPath(key) {
  return path.join(os.tmpdir(), `vk_admin_${key}.json`);
}

function mergeLists(baseList, newList) {
  if (!Array.isArray(baseList)) baseList = [];
  if (!Array.isArray(newList)) newList = [];
  const map = new Map();
  baseList.forEach(item => { if (item && item.id) map.set(item.id, item); });
  newList.forEach(item => {
    if (item && item.id) {
      const existing = map.get(item.id);
      map.set(item.id, existing ? { ...existing, ...item } : item);
    }
  });
  return Array.from(map.values());
}

// Helper: Read JSON safely (merges in-memory, /tmp writable directory, and static file)
function readData(key) {
  if (MEMORY_STORE[key]) {
    return MEMORY_STORE[key];
  }

  const filePath = FILES[key];
  const tmpPath = getTmpPath(key);
  let baseData = key === 'settings' ? DEFAULT_SETTINGS : [];

  // 1. Read baseline file from project root
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim()) {
        const fileData = JSON.parse(content);
        if (key === 'settings' && typeof fileData === 'object' && fileData !== null) {
          baseData = {
            ...DEFAULT_SETTINGS,
            ...fileData,
            studio: { ...DEFAULT_SETTINGS.studio, ...(fileData.studio || {}) },
            notifications: { ...DEFAULT_SETTINGS.notifications, ...(fileData.notifications || {}) },
            credentials: { ...DEFAULT_SETTINGS.credentials, ...(fileData.credentials || {}) }
          };
        } else {
          baseData = fileData;
        }
      }
    }
  } catch (err) {}

  // 2. Merge with writable /tmp directory if available
  try {
    if (fs.existsSync(tmpPath)) {
      const tmpContent = fs.readFileSync(tmpPath, 'utf8');
      if (tmpContent.trim()) {
        const tmpData = JSON.parse(tmpContent);
        if (key === 'settings' && typeof tmpData === 'object') {
          baseData = { ...baseData, ...tmpData };
        } else if (Array.isArray(tmpData)) {
          baseData = mergeLists(baseData, tmpData);
        }
      }
    }
  } catch (err) {}

  if (key === 'settings' && (!baseData || typeof baseData !== 'object')) {
    baseData = DEFAULT_SETTINGS;
  } else if (key !== 'settings' && !Array.isArray(baseData)) {
    baseData = [];
  }

  MEMORY_STORE[key] = baseData;
  return baseData;
}

// Helper: Write JSON safely (writes to in-memory + /tmp + project file)
function writeData(key, data) {
  MEMORY_STORE[key] = data;
  const filePath = FILES[key];
  const tmpPath = getTmpPath(key);

  // 1. Write to /tmp directory (writable in Vercel serverless lambdas)
  try {
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn(`Could not write /tmp for ${key}:`, e.message);
  }

  // 2. Try writing to project file (works on localhost dev)
  try {
    const fileTmp = filePath + '.tmp';
    fs.writeFileSync(fileTmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(fileTmp, filePath);
  } catch (err) {
    // Read-only filesystem on Vercel is expected — /tmp and MEMORY_STORE succeeded
  }

  return true;
}

// Ensure files exist on startup (safely guarded)
try {
  ['projects', 'reviews', 'inquiries', 'settings'].forEach(key => {
    readData(key);
  });
} catch (e) {
  console.warn('Startup sync notice:', e.message);
}

// SSE Clients Registry
let sseClients = [];

// API responses must never be cached by browsers or proxies — they are live data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function broadcastEvent(type, data = {}) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch (e) {
      // client disconnected
    }
  });
}

// ── SSE Endpoint ─────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = Date.now() + Math.random().toString(36).slice(2, 7);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send immediate welcome ping
  res.write(`data: ${JSON.stringify({ type: 'connected', id: clientId, timestamp: Date.now() })}\n\n`);

  // Periodic heartbeat to prevent browser/proxy timeouts
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients = sseClients.filter(c => c.id !== clientId);
  });
});

// ── API Routes ───────────────────────────────────────────────────

// Projects
app.get('/api/projects', (req, res) => {
  const projects = readData('projects');
  res.json(projects);
});

app.post('/api/projects', (req, res) => {
  let projects = readData('projects');
  const project = req.body;

  if (!project) {
    return res.status(400).json({ error: 'No payload provided' });
  }

  if (Array.isArray(project)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!project.id) project.id = 'proj-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  project.createdAt = project.createdAt || new Date().toISOString();
  project.updatedAt = new Date().toISOString();

  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = { ...projects[existingIndex], ...project };
  } else {
    projects.unshift(project);
  }

  writeData('projects', projects);
  broadcastEvent('projects-updated', projects);
  res.json({ success: true, projects, project });
});

app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let projects = readData('projects');
  const index = projects.findIndex(p => p.id === id);

  if (index < 0) {
    const newP = { id, ...updates, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    projects.unshift(newP);
    writeData('projects', projects);
    broadcastEvent('projects-updated', projects);
    return res.json({ success: true, project: newP });
  }

  projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
  writeData('projects', projects);
  broadcastEvent('projects-updated', projects);
  res.json({ success: true, project: projects[index] });
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  let projects = readData('projects');
  projects = projects.filter(p => p.id !== id);
  writeData('projects', projects);
  broadcastEvent('projects-updated', projects);
  res.json({ success: true, id });
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  const reviews = readData('reviews');
  res.json(reviews);
});

app.get('/api/reviews/public', (req, res) => {
  const reviews = readData('reviews');
  const approved = (Array.isArray(reviews) ? reviews : []).filter(r => r && r.status === 'approved');
  res.json(approved);
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

app.post('/api/reviews', (req, res) => {
  let reviews = readData('reviews');
  const review = req.body;

  if (!review) {
    return res.status(400).json({ success: false, error: 'No review data provided' });
  }

  if (Array.isArray(review)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!validateReview(review, false)) {
    return res.status(400).json({ success: false, error: 'Invalid review: name, rating (1-5) and review text are required' });
  }

  // FORCE status to pending for all public submissions
  review.status = 'pending';

  if (!review.id) {
    review.id = 'rev-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  review.createdAt = review.createdAt || new Date().toISOString();
  review.updatedAt = new Date().toISOString();

  const existingIndex = reviews.findIndex(r => r && r.id === review.id);
  if (existingIndex >= 0) {
    reviews[existingIndex] = { ...reviews[existingIndex], ...review };
  } else {
    reviews.unshift(review);
  }

  if (!writeData('reviews', reviews)) {
    return res.status(500).json({ success: false, error: 'Failed to persist review to database' });
  }
  broadcastEvent('reviews-updated', reviews);
  res.status(201).json({ success: true, reviews, review });
});

const updateReviewHandler = (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!validateReview(updates, true)) {
    return res.status(400).json({ success: false, error: 'Invalid review update payload' });
  }

  let reviews = readData('reviews');
  const index = reviews.findIndex(r => r && r.id === id);

  if (index < 0) {
    const newR = { id, status: 'pending', ...updates, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    reviews.unshift(newR);
    if (!writeData('reviews', reviews)) {
      return res.status(500).json({ success: false, error: 'Failed to persist review to database' });
    }
    broadcastEvent('reviews-updated', reviews);
    return res.json({ success: true, review: newR });
  }

  reviews[index] = { ...reviews[index], ...updates, updatedAt: new Date().toISOString() };
  if (!writeData('reviews', reviews)) {
    return res.status(500).json({ success: false, error: 'Failed to persist review to database' });
  }
  broadcastEvent('reviews-updated', reviews);
  res.json({ success: true, review: reviews[index] });
};

app.put('/api/reviews/:id', updateReviewHandler);
app.post('/api/reviews/:id', updateReviewHandler);

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  let reviews = readData('reviews');
  reviews = reviews.filter(r => r && r.id !== id);
  if (!writeData('reviews', reviews)) {
    return res.status(500).json({ success: false, error: 'Failed to persist deletion to database' });
  }
  broadcastEvent('reviews-updated', reviews);
  res.json({ success: true, id });
});

// Inquiries
app.get('/api/inquiries', (req, res) => {
  const inquiries = readData('inquiries');
  res.json(inquiries);
});

app.post('/api/inquiries', (req, res) => {
  let inquiries = readData('inquiries');
  const inquiry = req.body;

  if (Array.isArray(inquiry)) {
    return res.status(400).json({ success: false, error: 'Array payloads are not allowed' });
  }

  if (!inquiry.id) inquiry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  inquiry.createdAt = inquiry.createdAt || new Date().toISOString();
  inquiry.status = inquiry.status || 'new';

  const existingIndex = inquiries.findIndex(i => i.id === inquiry.id);
  if (existingIndex >= 0) {
    inquiries[existingIndex] = { ...inquiries[existingIndex], ...inquiry };
  } else {
    inquiries.unshift(inquiry);
  }

  writeData('inquiries', inquiries);
  broadcastEvent('inquiries-updated', inquiries);
  res.json({ success: true, inquiries, inquiry });
});

app.put('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let inquiries = readData('inquiries');
  const index = inquiries.findIndex(i => i.id === id);

  if (index < 0) {
    const newI = { id, status: 'new', ...updates, createdAt: new Date().toISOString() };
    inquiries.unshift(newI);
    writeData('inquiries', inquiries);
    broadcastEvent('inquiries-updated', inquiries);
    return res.json({ success: true, inquiry: newI });
  }

  inquiries[index] = { ...inquiries[index], ...updates };
  writeData('inquiries', inquiries);
  broadcastEvent('inquiries-updated', inquiries);
  res.json({ success: true, inquiry: inquiries[index] });
});

app.delete('/api/inquiries/:id', (req, res) => {
  const { id } = req.params;
  let inquiries = readData('inquiries');
  inquiries = inquiries.filter(i => i.id !== id);
  writeData('inquiries', inquiries);
  broadcastEvent('inquiries-updated', inquiries);
  res.json({ success: true, id });
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
    return res.json({ success: true, email: SERVER_ADMIN_EMAIL, name: 'Admin' });
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

app.post('/api/github-sync', requireAuth, async (req, res) => {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || req.body?.token;
  if (!token) {
    return res.status(400).json({ success: false, error: 'No GitHub PAT token configured on server or request body.' });
  }

  const repo = 'MuhammadDhanish/VKREATE';
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'VKREATE-Server-Sync'
  };

  const files = [
    { path: 'js/admin-reviews.json', data: readData('reviews') },
    { path: 'js/admin-projects.json', data: readData('projects') },
    { path: 'js/admin-inquiries.json', data: readData('inquiries') },
    { path: 'js/admin-settings.json', data: readData('settings') }
  ];

  const results = [];
  for (const f of files) {
    try {
      let sha = null;
      const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${f.path}`, { headers });
      if (getRes.ok) {
        const getJson = await getRes.json();
        sha = getJson.sha;
      }

      const body = {
        message: `Server sync: ${f.path} [${new Date().toISOString()}]`,
        content: Buffer.from(JSON.stringify(f.data, null, 2)).toString('base64'),
        ...(sha ? { sha } : {})
      };

      const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${f.path}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      results.push({ path: f.path, status: putRes.status, ok: putRes.ok });
    } catch (e) {
      results.push({ path: f.path, status: 500, ok: false, error: e.message });
    }
  }

  const allOk = results.every(r => r.ok);
  res.json({ success: allOk, results });
});

// Settings
app.get('/api/settings', (req, res) => {
  const settings = { ...readData('settings') };
  delete settings.credentials;
  res.json(settings);
});

app.put('/api/settings', requireAuth, (req, res) => {
  const updates = { ...(req.body || {}) };
  delete updates.credentials;
  const current = { ...readData('settings') };
  delete current.credentials;
  const updated = { ...current, ...updates };
  writeData('settings', updated);
  broadcastEvent('settings-updated', updated);
  res.json({ success: true, settings: updated });
});

app.post('/api/settings', requireAuth, (req, res) => {
  const updates = { ...(req.body || {}) };
  delete updates.credentials;
  const current = { ...readData('settings') };
  delete current.credentials;
  const updated = { ...current, ...updates };
  writeData('settings', updated);
  broadcastEvent('settings-updated', updated);
  res.json({ success: true, settings: updated });
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

// Static Files middleware with optimal caching headers
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

// Explicit routes for all HTML pages (needed in Vercel serverless environment)
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

// Catch-all: serve index.html ONLY for HTML page routes, NOT for static assets
// This prevents CSS/JS/image requests from being incorrectly served index.html
app.use((req, res, next) => {
  const ext = path.extname(req.path);
  const isStaticAsset = ext && ext !== '.html';
  if (isStaticAsset) {
    // Don't intercept CSS, JS, images — let them 404 naturally
    return res.status(404).send('Not found');
  }
  // Serve index.html for all HTML navigation routes
  res.sendFile(path.join(__dirname, 'index.html'));
});




if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`⚡ VKREATE Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use — another copy of this server is still running.`);
      console.error('   Fix: close the old terminal running the server (or run `taskkill /IM node.exe /F`), then start again.');
      console.error(`   Or start on another port: set PORT=3001 && npm start\n`);
    } else {
      console.error('Server failed to start:', err);
    }
    process.exit(1);
  });
}

module.exports = app;
