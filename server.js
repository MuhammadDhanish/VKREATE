const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
  },
  credentials: {
    email: 'admin@vkreate.com',
    passwordHash: 'Admin@123',
  }
};

// Helper: Read JSON safely
function readData(key) {
  const filePath = FILES[key];
  try {
    if (!fs.existsSync(filePath)) {
      if (key === 'settings') return DEFAULT_SETTINGS;
      return [];
    }
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.trim()) {
      if (key === 'settings') return DEFAULT_SETTINGS;
      return [];
    }
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${key}:`, err);
    if (key === 'settings') return DEFAULT_SETTINGS;
    return [];
  }
}

// Helper: Write JSON safely
function writeData(key, data) {
  const filePath = FILES[key];
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${key}:`, err);
    return false;
  }
}

// Ensure files exist on startup
['projects', 'reviews', 'inquiries', 'settings'].forEach(key => {
  if (!fs.existsSync(FILES[key])) {
    writeData(key, key === 'settings' ? DEFAULT_SETTINGS : []);
  }
});

// SSE Clients Registry
let sseClients = [];

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
  res.flushHeaders();

  const clientId = Date.now() + Math.random().toString(36).slice(2, 7);
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send immediate heartbeat/welcome
  res.write(`data: ${JSON.stringify({ type: 'connected', id: clientId })}\n\n`);

  req.on('close', () => {
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

  if (Array.isArray(project)) {
    projects = project;
  } else {
    if (!project.id) project.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    project.createdAt = project.createdAt || new Date().toISOString();
    project.updatedAt = new Date().toISOString();

    const existingIndex = projects.findIndex(p => p.id === project.id);
    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...project };
    } else {
      projects.unshift(project);
    }
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
    // If not found, create it
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

// Reviews
app.get('/api/reviews', (req, res) => {
  const reviews = readData('reviews');
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  let reviews = readData('reviews');
  const review = req.body;

  if (Array.isArray(review)) {
    reviews = review;
  } else {
    if (!review.id) review.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    review.createdAt = review.createdAt || new Date().toISOString();
    review.updatedAt = new Date().toISOString();
    if (!review.status) review.status = 'pending';

    const existingIndex = reviews.findIndex(r => r.id === review.id);
    if (existingIndex >= 0) {
      reviews[existingIndex] = { ...reviews[existingIndex], ...review };
    } else {
      reviews.unshift(review);
    }
  }

  writeData('reviews', reviews);
  broadcastEvent('reviews-updated', reviews);
  res.json({ success: true, reviews, review });
});

app.put('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  let reviews = readData('reviews');
  const index = reviews.findIndex(r => r.id === id);

  if (index < 0) {
    const newR = { id, status: 'pending', ...updates, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    reviews.unshift(newR);
    writeData('reviews', reviews);
    broadcastEvent('reviews-updated', reviews);
    return res.json({ success: true, review: newR });
  }

  reviews[index] = { ...reviews[index], ...updates, updatedAt: new Date().toISOString() };
  writeData('reviews', reviews);
  broadcastEvent('reviews-updated', reviews);
  res.json({ success: true, review: reviews[index] });
});

app.delete('/api/reviews/:id', (req, res) => {
  const { id } = req.params;
  let reviews = readData('reviews');
  reviews = reviews.filter(r => r.id !== id);
  writeData('reviews', reviews);
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
    inquiries = inquiry;
  } else {
    if (!inquiry.id) inquiry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    inquiry.createdAt = inquiry.createdAt || new Date().toISOString();
    inquiry.status = inquiry.status || 'new';

    const existingIndex = inquiries.findIndex(i => i.id === inquiry.id);
    if (existingIndex >= 0) {
      inquiries[existingIndex] = { ...inquiries[existingIndex], ...inquiry };
    } else {
      inquiries.unshift(inquiry);
    }
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

// Settings
app.get('/api/settings', (req, res) => {
  const settings = readData('settings');
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  const updates = req.body;
  const current = readData('settings');
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

// Static Files middleware
app.use(express.static(__dirname));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`⚡ VKREATE Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
