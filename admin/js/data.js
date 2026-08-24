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
  let token = 'vk_admin_active_session';
  try {
    const raw = localStorage.getItem('vk_admin_session');
    if (raw) {
      const session = JSON.parse(raw);
      if (session && session.token && typeof session.token === 'string' && session.token.trim()) {
        token = session.token.trim();
      }
    }
  } catch (e) {}
  headers['Authorization'] = `Bearer ${token}`;
  headers['X-Admin-Session'] = token;
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
          notifEmail: 'vkreatearchitecture@gmail.com',
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
      const list = DB._get(DB.KEYS.projects) || [];
      const deletedList = DB._get('vk_admin_deleted_projects') || [];
      const deletedSet = new Set(deletedList);
      return list.filter(p => p && p.id && !deletedSet.has(p.id));
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
          console.warn(`Server project add warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Server project add fetch exception: ${e.message} — keeping local addition`);
      }
      return p;
    },
    async update(id, data) {
      const l = this.all();
      let i = l.findIndex(p => p && p.id === id);
      if (i < 0) {
        l.unshift({ id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        i = 0;
      } else {
        l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      }
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
          console.warn(`Server project update warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Server project update fetch exception: ${e.message} — keeping local change`);
      }
      return l[i];
    },
    async delete(id) {
      if (!id) return false;
      let deletedList = DB._get('vk_admin_deleted_projects') || [];
      if (!deletedList.includes(id)) {
        deletedList.push(id);
        DB._set('vk_admin_deleted_projects', deletedList);
      }

      const remaining = this.all().filter(p => p && p.id !== id);
      DB._lastLocalWrite.projects = Date.now();
      DB._set(DB.KEYS.projects, remaining);
      DB._broadcast('projects-updated', remaining);

      if (typeof ImageDB !== 'undefined' && ImageDB.delete) {
        for (let i = 0; i < 20; i++) {
          ImageDB.delete(`proj_${id}_${i}`).catch(() => {});
        }
      }

      try {
        const res = await fetch((getApiBaseUrl() || '') + `/api/projects/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          console.warn(`Server project delete warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Server project delete fetch exception: ${e.message} — keeping local deletion`);
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
      const list = DB._get(DB.KEYS.reviews) || [];
      const deletedList = DB._get('vk_admin_deleted_reviews') || [];
      const deletedSet = new Set(deletedList.map(id => String(id)));
      return list.filter(r => r && r.id && !deletedSet.has(String(r.id)));
    },
    get(id) {
      return this.all().find(r => r && r.id && (r.id === id || String(r.id) === String(id))) || null;
    },
    _syncPublicMirror(list) {
      try {
        if (!Array.isArray(list)) return;
        const approvedOnly = list
          .filter(r => r && typeof r === 'object' && (r.status === 'approved' || String(r.status || '').toLowerCase() === 'approved'))
          .map(r => {
            let rating = 5;
            try {
              const num = Number(r.rating);
              if (!isNaN(num) && num >= 1 && num <= 5) rating = Math.round(num);
              else {
                const parsed = parseInt(String(r.rating || 5), 10);
                if (!isNaN(parsed)) rating = Math.min(5, Math.max(1, parsed));
              }
            } catch (e) {}

            return {
              id: String(r.id || ''),
              clientName: String(r.clientName || r.author || 'Verified Client'),
              clientRole: String(r.clientRole || r.role || 'Client'),
              projectId: String(r.projectId || 'general'),
              industry: String(r.industry || r.industryLabel || ''),
              industryLabel: String(r.industryLabel || r.industry || ''),
              rating,
              reviewText: String(r.reviewText || r.text || ''),
              studioResponse: String(r.studioResponse || ''),
              status: 'approved',
              createdAt: String(r.createdAt || r.approvedAt || '')
            };
          });
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
      const i = l.findIndex(r => r && (r.id === id || String(r.id) === String(id)));
      if (i < 0) return null;

      const merged = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      merged.clientName = merged.clientName || merged.author || 'Client';
      merged.clientRole = merged.clientRole || merged.role || 'Client';
      merged.reviewText = merged.reviewText || merged.text || '';
      l[i] = merged;

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
          console.warn(`Review server update warning (HTTP ${res.status}): ${err.error || 'Server sync pending'}`);
        }
      } catch (e) {
        console.warn(`Review server update fetch exception: ${e.message} - keeping local change`);
      }
      return l[i];
    },

    async delete(id) {
      if (!id) return false;
      const idStr = String(id);
      try {
        let deletedList = DB._get('vk_admin_deleted_reviews') || [];
        if (!deletedList.includes(idStr)) {
          deletedList.push(idStr);
          DB._set('vk_admin_deleted_reviews', deletedList);
        }
      } catch (e) {}

      const remaining = this.all().filter(r => r && r.id !== id && String(r.id) !== idStr);
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
          console.warn(`Review server delete warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Review server delete fetch exception: ${e.message} — keeping local deletion`);
      }
      return true;
    },

    async approve(id) { return await this.update(id, { status: 'approved', approvedAt: new Date().toISOString() }); },
    async reject(id)  { return await this.update(id, { status: 'rejected' }); },
    pending()   { return this.all().filter(r => r && typeof r === 'object' && (r.status === 'pending' || String(r.status || 'pending').toLowerCase() === 'pending')); },
    approved()  { return this.all().filter(r => r && typeof r === 'object' && (r.status === 'approved' || String(r.status || '').toLowerCase() === 'approved')); },
    stats() {
      const all = this.all();
      const approvedList = all.filter(r => r && typeof r === 'object' && (r.status === 'approved' || String(r.status || '').toLowerCase() === 'approved'));
      const pendingList  = all.filter(r => r && typeof r === 'object' && (r.status === 'pending'  || String(r.status || 'pending').toLowerCase() === 'pending'));
      const rejectedList = all.filter(r => r && typeof r === 'object' && (r.status === 'rejected' || String(r.status || '').toLowerCase() === 'rejected'));
      
      let sumRating = 0;
      approvedList.forEach(r => {
        try {
          const num = Number(r.rating);
          sumRating += (!isNaN(num) && num >= 1 && num <= 5) ? num : 5;
        } catch (e) {
          sumRating += 5;
        }
      });

      return {
        total: all.length,
        pending: pendingList.length,
        approved: approvedList.length,
        rejected: rejectedList.length,
        avgRating: approvedList.length ? (sumRating / approvedList.length).toFixed(1) : '5.0',
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
          console.warn(`Inquiry server delete warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Inquiry server delete fetch exception: ${e.message} — keeping local deletion`);
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
          console.warn(`Settings server update warning (HTTP ${res.status}): ${err.error || 'Saved locally'}`);
        }
      } catch (e) {
        console.warn(`Settings server update fetch exception: ${e.message} — keeping local change`);
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
      const targetEmail = s?.credentials?.email || 'vkreatearchitecture@gmail.com';
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
        const rawProj = await resProjects.json().catch(() => null);
        let projects = [];
        let deletedList = DB._get('vk_admin_deleted_projects') || [];
        if (Array.isArray(rawProj)) {
          projects = rawProj;
        } else if (rawProj && Array.isArray(rawProj.items)) {
          projects = rawProj.items;
          const remoteDeleted = rawProj.deletedIds || [];
          deletedList = Array.from(new Set([...deletedList, ...remoteDeleted]));
          DB._set('vk_admin_deleted_projects', deletedList);
        }
        const deletedSet = new Set(deletedList);
        projects = projects.filter(p => p && p.id && !deletedSet.has(p.id));

        if (Array.isArray(projects)) {
          if (Date.now() - (DB._lastLocalWrite.projects || 0) < 15000) {
            const currentLocal = (DB._get(DB.KEYS.projects) || []).filter(p => p && p.id && !deletedSet.has(p.id));
            const localIdSet = new Set(currentLocal.map(p => p && p.id));
            const newRemoteAdds = projects.filter(p => p && p.id && !localIdSet.has(p.id) && !deletedSet.has(p.id));
            if (newRemoteAdds.length > 0) {
              const merged = [...currentLocal, ...newRemoteAdds];
              DB._set(DB.KEYS.projects, merged);
              projectsUpdated = true;
            } else {
              DB._set(DB.KEYS.projects, currentLocal);
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
        const rawRev = await resReviews.json().catch(() => null);
        let reviews = [];
        let deletedList = DB._get('vk_admin_deleted_reviews') || [];
        if (Array.isArray(rawRev)) {
          reviews = rawRev;
        } else if (rawRev && Array.isArray(rawRev.items)) {
          reviews = rawRev.items;
          const remoteDeleted = (rawRev.deletedIds || []).map(id => String(id));
          deletedList = Array.from(new Set([...deletedList, ...remoteDeleted]));
          DB._set('vk_admin_deleted_reviews', deletedList);
        }
        if (Array.isArray(reviews)) {
          const deletedSet = new Set(deletedList.map(id => String(id)));
          const currentLocal = (DB._get(DB.KEYS.reviews) || []).filter(r => r && r.id && !deletedSet.has(String(r.id)));
          
          // Create a map of local items to preserve locally modified status
          const localMap = new Map();
          currentLocal.forEach(r => { if (r && r.id) localMap.set(String(r.id), r); });

          // Filter out deleted items from remote reviews
          const activeRemote = reviews.filter(r => r && r.id && !deletedSet.has(String(r.id)));

          const merged = activeRemote.map(remoteItem => {
            const localItem = localMap.get(String(remoteItem.id));
            if (localItem) {
              const localStatus = (localItem.status || 'pending').toLowerCase().trim();
              if (localStatus === 'approved' || localStatus === 'rejected') {
                return { ...remoteItem, ...localItem, status: localStatus };
              }
              const localTs = new Date(localItem.updatedAt || localItem.approvedAt || 0).getTime();
              const remoteTs = new Date(remoteItem.updatedAt || remoteItem.approvedAt || 0).getTime();
              if (localTs > remoteTs) {
                return { ...remoteItem, ...localItem };
              }
            }
            return remoteItem;
          });

          // Also include any local-only items not yet in remote
          const remoteIdSet = new Set(activeRemote.map(r => String(r.id)));
          currentLocal.forEach(localItem => {
            if (localItem && localItem.id && !remoteIdSet.has(String(localItem.id)) && !deletedSet.has(String(localItem.id))) {
              merged.push(localItem);
            }
          });

          const prevJson = JSON.stringify(currentLocal);
          const newJson = JSON.stringify(merged);
          if (prevJson !== newJson) {
            DB._set(DB.KEYS.reviews, merged);
            DB.reviews._syncPublicMirror(merged);
            reviewsUpdated = true;
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
