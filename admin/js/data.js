/* ============================================================
   VKREATE Admin — Data Layer (Unified API, Sync Engine & Fallback)
   ============================================================ */

function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const h = window.location.hostname;
    const p = window.location.port;
    if ((h === 'localhost' || h === '127.0.0.1') && p !== '3000' && p !== '') {
      return 'http://localhost:3000';
    }
  }
  return '';
}

function getAuthHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  try {
    const raw = localStorage.getItem('vk_admin_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
        headers['X-Admin-Session'] = session.token;
      }
    }
  } catch (e) {}
  return headers;
}

// BroadcastChannel for instant cross-tab sync in same browser
const syncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('vk_sync') : null;

const DB = {

  // ── Keys ─────────────────────────────────────────────────
  KEYS: {
    projects:   'vk_admin_projects',
    reviews:    'vk_admin_reviews',
    inquiries:  'vk_admin_inquiries',
    settings:   'vk_admin_settings',
    session:    'vk_admin_session',
  },

  _lastLocalWrite: { reviews: 0, projects: 0, inquiries: 0, settings: 0 },

  afterMutation() {
    // Custom events and BroadcastChannel manage sync
  },

  // ── Helpers ───────────────────────────────────────────────
  _get(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
  },
  _set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      if (window.UI && UI.toast) UI.toast('Storage limit reached. Please use smaller image files.', 'error');
      console.warn('LocalStorage error:', e);
      return false;
    }
  },
  _id() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
  _defaultProjects() {
    return [
      {
        id: 'lilaa-restaurant',
        name: 'Lilaa — Malayali Cuisine',
        industry: 'restaurant',
        industryLabel: 'Restaurants & Cafes',
        location: 'Calicut, Kerala',
        area: '2,500 sq ft',
        duration: '4 months',
        completionDate: '2025-06-15',
        budgetRange: '₹25L – ₹35L',
        status: 'published',
        thumbnail: '../assets/images/project_lilaa_1.jpg',
        images: ['../assets/images/project_lilaa_1.jpg', '../assets/images/project_lilaa_2.png'],
        challenge: 'Transform an underutilized mall space into a premium dining destination.',
        solution: 'Multi-zone dining with arched niches, vertical ribbed wood panels, and warm cream palette.',
        result: '30% increase in table turns, 100% weekend reservation capacity.',
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        testimonial: null,
        metrics: { sqft: '2500', seatingCapacity: 85, timeline: '4 months' },
        tags: ['restaurant','dining','premium'],
        createdAt: '2025-06-15T10:00:00Z',
        updatedAt: '2025-07-01T08:30:00Z',
      },
      {
        id: 'luxury-salon',
        name: 'Wings Luxury Beauty & Wellness',
        industry: 'beauty',
        industryLabel: 'Beauty & Wellness',
        location: 'Kochi, Kerala',
        area: '2,200 sq ft',
        duration: '3.5 months',
        completionDate: '2025-04-10',
        budgetRange: '₹20L – ₹30L',
        status: 'published',
        thumbnail: '../assets/images/project_lilaa_2.png',
        images: ['../assets/images/project_lilaa_2.png'],
        challenge: 'Design a serene luxury salon with private VIP suites and acoustic isolation.',
        solution: 'Soft curved arches, warm brass accents, micro-cement walls, and indirect LED strip lighting.',
        result: 'Awarded Regional Wellness Interior of the Year 2025.',
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        testimonial: null,
        metrics: { sqft: '2200', seatingCapacity: 20, timeline: '3.5 months' },
        tags: ['beauty','salon','wellness'],
        createdAt: '2025-04-10T10:00:00Z',
        updatedAt: '2025-05-01T08:30:00Z',
      }
    ];
  },
  _defaultReviews() {
    return [
      {
        id: 'rev-priya-nair-wings',
        clientName: 'Dr. Priya Nair',
        clientRole: 'Managing Director, Wings Salon & Spa',
        clientEmail: 'priya@wingsbeauty.in',
        projectId: 'luxury-salon',
        industry: 'beauty',
        rating: 5,
        reviewText: 'Flawless execution from concept to completion. The layout optimization in our Kochi salon created a serene, high-end sanctuary that our VIP clients absolutely love. Highly recommend VKREATE for luxury wellness spaces.',
        status: 'approved',
        studioResponse: 'We are thrilled Dr. Priya! The curved glass arches and acoustic detailing in Wings remain one of our proudest accomplishments.',
        createdAt: '2025-07-10T09:00:00.000Z',
        approvedAt: '2025-07-10T10:00:00.000Z'
      }
    ];
  },

  // Initial local seed if storage is empty
  seed() {
    if (!this._get(this.KEYS.projects)) {
      this._set(this.KEYS.projects, this._defaultProjects());
    }
    if (!this._get(this.KEYS.reviews)) {
      this._set(this.KEYS.reviews, this._defaultReviews());
    }
    if (!this._get(this.KEYS.inquiries)) {
      this._set(this.KEYS.inquiries, [
        {
          id: 'inq-001',
          name: 'Anand Varma',
          email: 'anand@varmagroup.com',
          phone: '+91 98470 12345',
          company: 'Varma Group',
          projectType: 'restaurant',
          projectTypeLabel: 'Restaurant / Cafe',
          location: 'Kochi',
          estimatedArea: '3,000 sq ft',
          budgetRange: '₹35L – ₹50L',
          expectedStartDate: '2025-09-01',
          message: 'Looking for a complete interior design overhaul for our modern fusion restaurant.',
          status: 'won',
          notes: 'Contract signed on 10 July. Kickoff meeting scheduled for Aug 1.',
          createdAt: '2025-07-01T15:00:00Z',
          respondedAt: '2025-07-05T09:00:00Z',
        },
      ]);
    }
    if (!this._get(this.KEYS.settings)) {
      this._set(this.KEYS.settings, {
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
      });
    }
  },

  // ── Broadcast Event Helper ──────────────────────────────
  _broadcast(type, data) {
    if (syncChannel) {
      try { syncChannel.postMessage({ type, data, timestamp: Date.now() }); } catch (e) {}
    }
    window.dispatchEvent(new CustomEvent(`vkreate:${type}`));
  },

  // ── Image Upload Helper ─────────────────────────────────
  async uploadImage(fileOrBase64, filename = '') {
    try {
      let base64Data = fileOrBase64;
      if (fileOrBase64 instanceof File) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(fileOrBase64);
        });
      }

      const res = await fetch((getApiBaseUrl() || '') + '/api/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ filename, base64Data })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) return json.url;
      }
    } catch (e) {
      console.warn('Backend image upload fallback to local storage / IDB:', e);
    }

    if (typeof ImageDB !== 'undefined') {
      try {
        if (fileOrBase64 instanceof File) {
          const id = await ImageDB.save(fileOrBase64);
          return `idb:${id}`;
        }
      } catch (e) {}
    }

    return null;
  },

  // ── Projects CRUD ─────────────────────────────────────────
  projects: {
    all() {
      return DB._get(DB.KEYS.projects) || [];
    },
    get(id) {
      return this.all().find(p => p && p.id && (p.id === id || String(p.id) === String(id))) || null;
    },
    async add(p) {
      p.id = p.id || DB._id();
      p.createdAt = p.createdAt || new Date().toISOString();
      p.updatedAt = new Date().toISOString();
      if (!p.views) p.views = 0;
      if (!p.clicks) p.clicks = 0;
      if (!p.leads) p.leads = 0;

      const l = this.all();
      const existingIdx = l.findIndex(x => x && x.id === p.id);
      if (existingIdx >= 0) { l[existingIdx] = p; } else { l.unshift(p); }
      DB._lastLocalWrite.projects = Date.now();
      DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));
      DB._broadcast('projects-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + '/api/projects', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(p)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Project add error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return p;
    },
    async update(id, data) {
      const l = this.all();
      const i = l.findIndex(p => p && p.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      DB._lastLocalWrite.projects = Date.now();
      DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));
      DB._broadcast('projects-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/projects/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(l[i])
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Project update error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return l[i];
    },
    async delete(id) {
      const remaining = this.all().filter(p => p && p.id !== id);
      DB._lastLocalWrite.projects = Date.now();
      DB._set(DB.KEYS.projects, remaining);
      DB._broadcast('projects-updated', remaining);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/projects/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Project delete error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return false;
      }
      return true;
    },
    published() { return this.all().filter(p => p && p.status === 'published'); },
    drafts()    { return this.all().filter(p => p && p.status === 'draft'); },
    byIndustry(ind) { return this.all().filter(p => p && p.industry === ind); },
    stats() {
      const all = this.all();
      return {
        total: all.length,
        published: all.filter(p => p && p.status === 'published').length,
        draft: all.filter(p => p && p.status === 'draft').length,
        archived: all.filter(p => p && p.status === 'archived').length,
        totalViews: all.reduce((sum, p) => sum + (p.views || 0), 0),
        totalLeads: all.reduce((sum, p) => sum + (p.leads || 0), 0),
      };
    },
  },

  // ── Reviews CRUD ──────────────────────────────────────────
  reviews: {
    all() {
      return DB._get(DB.KEYS.reviews) || [];
    },
    get(id) {
      return this.all().find(r => r && r.id && (r.id === id || String(r.id) === String(id))) || null;
    },
    _syncPublicMirror(list) {
      try {
        const approvedOnly = list
          .filter(r => r && r.status === 'approved')
          .map(r => ({
            id: r.id,
            clientName: r.clientName || r.author || 'Verified Client',
            clientRole: r.clientRole || r.role || 'Client',
            projectId: r.projectId || 'general',
            industry: r.industry || r.industryLabel || '',
            industryLabel: r.industryLabel || r.industry || '',
            rating: Math.min(5, Math.max(1, parseInt(r.rating, 10) || 5)),
            reviewText: r.reviewText || r.text || '',
            studioResponse: r.studioResponse || '',
            status: 'approved',
            createdAt: r.createdAt || r.approvedAt || ''
          }));
        localStorage.setItem('vk_reviews', JSON.stringify({
          cachedAt: Date.now(),
          reviews: approvedOnly
        }));
      } catch (e) {}
    },

    async add(r) {
      r.id = r.id || DB._id();
      r.createdAt = r.createdAt || new Date().toISOString();
      r.updatedAt = new Date().toISOString();
      if (!r.status) r.status = 'pending';

      const l = this.all();
      const existingIdx = l.findIndex(x => x && x.id === r.id);
      if (existingIdx >= 0) { l[existingIdx] = r; } else { l.unshift(r); }

      DB._lastLocalWrite.reviews = Date.now();
      DB._set(DB.KEYS.reviews, JSON.parse(JSON.stringify(l)));
      this._syncPublicMirror(l);
      DB._broadcast('reviews-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + '/api/reviews', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(r)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Review submission error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return r;
    },

    async update(id, data) {
      const l = this.all();
      const i = l.findIndex(r => r && r.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };

      delete l[i].author;
      delete l[i].role;
      delete l[i].text;

      DB._lastLocalWrite.reviews = Date.now();
      DB._set(DB.KEYS.reviews, JSON.parse(JSON.stringify(l)));
      this._syncPublicMirror(l);
      DB._broadcast('reviews-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/reviews/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(l[i])
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Review update error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return l[i];
    },

    async delete(id) {
      if (!id) return false;
      const remaining = this.all().filter(r => r && r.id !== id);
      DB._lastLocalWrite.reviews = Date.now();
      DB._set(DB.KEYS.reviews, remaining);
      this._syncPublicMirror(remaining);
      DB._broadcast('reviews-updated', remaining);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/reviews/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Review delete error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return false;
      }
      return true;
    },

    async approve(id) { return await this.update(id, { status: 'approved', approvedAt: new Date().toISOString() }); },
    async reject(id)  { return await this.update(id, { status: 'rejected' }); },
    pending()   { return this.all().filter(r => r && r.status === 'pending'); },
    approved()  { return this.all().filter(r => r && r.status === 'approved'); },
    stats() {
      const all = this.all();
      const approvedList = all.filter(r => r && r.status === 'approved');
      return {
        total: all.length,
        pending: all.filter(r => r && r.status === 'pending').length,
        approved: approvedList.length,
        rejected: all.filter(r => r && r.status === 'rejected').length,
        avgRating: approvedList.length ? (approvedList.reduce((s,r) => s + (Number(r.rating) || 5), 0) / approvedList.length).toFixed(1) : '5.0',
      };
    },
  },

  // ── Inquiries CRUD ────────────────────────────────────────
  inquiries: {
    all() {
      return DB._get(DB.KEYS.inquiries) || [];
    },
    get(id) { return this.all().find(i => i && i.id && (i.id === id || String(i.id) === String(id))) || null; },
    async add(item) {
      item.id = item.id || DB._id();
      item.createdAt = item.createdAt || new Date().toISOString();
      item.status = item.status || 'new';

      const l = this.all();
      l.unshift(item);
      DB._set(DB.KEYS.inquiries, l);
      DB._broadcast('inquiries-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + '/api/inquiries', {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(item)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Inquiry submission error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return item;
    },
    async update(id, data) {
      const l = this.all();
      const i = l.findIndex(x => x && x.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data };
      DB._set(DB.KEYS.inquiries, l);
      DB._broadcast('inquiries-updated', l);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/inquiries/${id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(l[i])
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Inquiry update error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return null;
      }
      return l[i];
    },
    async delete(id) {
      const remaining = this.all().filter(i => i && i.id !== id);
      DB._set(DB.KEYS.inquiries, remaining);
      DB._broadcast('inquiries-updated', remaining);

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/inquiries/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Inquiry delete error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return false;
      }
      return true;
    },
    byStatus(s) { return this.all().filter(i => i.status === s); },
    stats() {
      const all = this.all();
      return {
        new:       all.filter(i => i && i.status === 'new').length,
        contacted: all.filter(i => i && i.status === 'contacted').length,
        quoted:    all.filter(i => i && i.status === 'quoted').length,
        won:       all.filter(i => i && i.status === 'won').length,
        lost:      all.filter(i => i && i.status === 'lost').length,
      };
    },
  },

  // ── Settings ─────────────────────────────────────────────
  settings: {
    get() { return DB._get(DB.KEYS.settings) || {}; },
    async save(data) {
      DB._set(DB.KEYS.settings, data);
      DB._broadcast('settings-updated', data);

      try {
        const res = await fetch((getApiBaseUrl() || '') + '/api/settings', {
          method: 'PUT',
          headers: getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(data)
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
      } catch (e) {
        if (window.UI && UI.toast) UI.toast(`❌ Settings save error: ${e.message}. Rolling back...`, 'error');
        await DB.loadRemoteData();
        return false;
      }
      return true;
    },
    update(key, val) {
      const s = this.get();
      s[key] = { ...s[key], ...val };
      return this.save(s);
    },
  },

  // ── Auth ─────────────────────────────────────────────────
  auth: {
    login(email, password) {
      const s = DB.settings.get();
      const targetEmail = s?.credentials?.email || 'admin@vkreate.com';
      const targetPw = s?.credentials?.passwordHash || 'Admin@123';
      return email.trim().toLowerCase() === targetEmail.toLowerCase() && password === targetPw;
    },
    session: {
      set(data)   { DB._set(DB.KEYS.session, { ...data, ts: Date.now() }); },
      get()       { return DB._get(DB.KEYS.session); },
      clear()     { localStorage.removeItem(DB.KEYS.session); },
      touch()     {
        const s = this.get();
        if (s) {
          s.ts = Date.now();
          DB._set(DB.KEYS.session, s);
        }
      },
      isValid()   {
        const s = this.get();
        if (!s) return false;
        const maxAge = s.remember ? (7 * 24 * 60 * 60 * 1000) : (8 * 60 * 60 * 1000);
        return (Date.now() - s.ts) < maxAge;
      }
    }
  },

  // ── Re-entrancy Guard for Remote Data Loading ───────────
  _isLoadingRemote: false,

  // Single Source of Truth Remote Data Loading
  async loadRemoteData(silent = false) {
    if (this._isLoadingRemote) return;
    this._isLoadingRemote = true;

    let reviewsUpdated = false;
    let projectsUpdated = false;
    let inquiriesUpdated = false;
    let settingsUpdated = false;

    try {
      const baseUrl = getApiBaseUrl() || '';
      const opts = { headers: getAuthHeaders(), credentials: 'include' };
      const [resProjects, resReviews, resInquiries, resSettings] = await Promise.all([
        fetch(baseUrl + '/api/projects?t=' + Date.now(), opts).catch(() => null),
        fetch(baseUrl + '/api/reviews?t=' + Date.now(), opts).catch(() => null),
        fetch(baseUrl + '/api/inquiries?t=' + Date.now(), opts).catch(() => null),
        fetch(baseUrl + '/api/settings?t=' + Date.now(), opts).catch(() => null),
      ]);

      if (resProjects && resProjects.ok) {
        const projects = await resProjects.json().catch(() => null);
        if (Array.isArray(projects)) {
          if (Date.now() - (DB._lastLocalWrite.projects || 0) < 15000) {
            const currentLocal = DB._get(DB.KEYS.projects) || [];
            const localIdSet = new Set(currentLocal.map(p => p && p.id));
            const newRemoteAdds = projects.filter(p => p && p.id && !localIdSet.has(p.id));
            if (newRemoteAdds.length > 0) {
              const merged = [...currentLocal, ...newRemoteAdds];
              DB._set(DB.KEYS.projects, merged);
              projectsUpdated = true;
            }
          } else {
            const prevJson = JSON.stringify(DB._get(DB.KEYS.projects) || []);
            const newJson = JSON.stringify(projects);
            if (prevJson !== newJson) {
              DB._set(DB.KEYS.projects, projects);
              projectsUpdated = true;
            }
          }
        }
      }

      if (resReviews && resReviews.ok) {
        const reviews = await resReviews.json().catch(() => null);
        if (Array.isArray(reviews)) {
          if (Date.now() - (DB._lastLocalWrite.reviews || 0) < 15000) {
            const currentLocal = DB._get(DB.KEYS.reviews) || [];
            const localIdSet = new Set(currentLocal.map(r => r && r.id));
            const newRemoteAdds = reviews.filter(r => r && r.id && !localIdSet.has(r.id));
            if (newRemoteAdds.length > 0) {
              const merged = [...currentLocal, ...newRemoteAdds];
              DB._set(DB.KEYS.reviews, merged);
              DB.reviews._syncPublicMirror(merged);
              reviewsUpdated = true;
            }
          } else {
            const prevJson = JSON.stringify(DB._get(DB.KEYS.reviews) || []);
            const newJson = JSON.stringify(reviews);
            if (prevJson !== newJson) {
              DB._set(DB.KEYS.reviews, reviews);
              DB.reviews._syncPublicMirror(reviews);
              reviewsUpdated = true;
            }
          }
        }
      }

      if (resInquiries && resInquiries.ok) {
        const inquiries = await resInquiries.json().catch(() => null);
        if (Array.isArray(inquiries)) {
          if (Date.now() - (DB._lastLocalWrite.inquiries || 0) < 15000) {
            const currentLocal = DB._get(DB.KEYS.inquiries) || [];
            const localIdSet = new Set(currentLocal.map(i => i && i.id));
            const newRemoteAdds = inquiries.filter(i => i && i.id && !localIdSet.has(i.id));
            if (newRemoteAdds.length > 0) {
              const merged = [...currentLocal, ...newRemoteAdds];
              DB._set(DB.KEYS.inquiries, merged);
              inquiriesUpdated = true;
            }
          } else {
            const prevJson = JSON.stringify(DB._get(DB.KEYS.inquiries) || []);
            const newJson = JSON.stringify(inquiries);
            if (prevJson !== newJson) {
              DB._set(DB.KEYS.inquiries, inquiries);
              inquiriesUpdated = true;
            }
          }
        }
      }

      if (resSettings && resSettings.ok) {
        const remoteSettings = await resSettings.json().catch(() => null);
        if (remoteSettings && typeof remoteSettings === 'object') {
          delete remoteSettings.credentials;
          const currentLocalSettings = DB._get(DB.KEYS.settings) || {};
          if (currentLocalSettings.credentials) {
            remoteSettings.credentials = currentLocalSettings.credentials;
          }
          const prevJson = JSON.stringify(currentLocalSettings);
          const newJson = JSON.stringify(remoteSettings);
          if (prevJson !== newJson) {
            DB._set(DB.KEYS.settings, remoteSettings);
            settingsUpdated = true;
          }
        }
      }
    } catch (e) {
      console.warn("loadRemoteData error:", e);
    } finally {
      this._isLoadingRemote = false;
    }

    if (!silent) {
      if (reviewsUpdated) window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      if (projectsUpdated) window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
      if (inquiriesUpdated) window.dispatchEvent(new CustomEvent('vkreate:inquiries-updated'));
      if (settingsUpdated) window.dispatchEvent(new CustomEvent('vkreate:settings-updated'));
    }
  },
};

// Seed DB locally if empty
DB.seed();

// Setup Real-time Sync Listeners
(function setupSyncListeners() {
  // 1. BroadcastChannel Listener (re-reads localStorage on message)
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type) {
        window.dispatchEvent(new CustomEvent(`vkreate:${event.data.type}`));
      }
    };
  }

  // 2. Storage event listener (cross-tab in same browser)
  window.addEventListener('storage', (e) => {
    if (!e.key || !e.key.startsWith('vk_')) return;
    if (e.key === 'vk_admin_reviews') window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
    if (e.key === 'vk_admin_projects') window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
    if (e.key === 'vk_admin_inquiries') window.dispatchEvent(new CustomEvent('vkreate:inquiries-updated'));
    if (e.key === 'vk_admin_settings') window.dispatchEvent(new CustomEvent('vkreate:settings-updated'));
  });

  // Initial load
  DB.loadRemoteData();

  // Debounced focus / visibility refetch
  let focusDebounceTimer = null;
  const handleFocus = () => {
    if (focusDebounceTimer) clearTimeout(focusDebounceTimer);
    focusDebounceTimer = setTimeout(async () => {
      await DB.loadRemoteData();
      if (typeof App !== 'undefined' && App.updateSidebar) {
        App.updateSidebar();
      }
    }, 200);
  };

  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleFocus();
  });
})();
