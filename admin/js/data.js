/* ============================================================
   VKREATE Admin — Data Layer (Unified API, Sync Engine & Fallback)
   ============================================================ */

// Helper to resolve backend server API URL when running on dev static ports (e.g. live-server 5500)
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

// BroadcastChannel for instant cross-tab sync in same browser
const syncChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('vk_sync') : null;

const DB = {

  // ── Keys ─────────────────────────────────────────────────
  KEYS: {
    projects:          'vk_admin_projects',
    reviews:           'vk_admin_reviews',
    inquiries:         'vk_admin_inquiries',
    settings:          'vk_admin_settings',
    session:           'vk_admin_session',
    deletedProjects:   'vk_admin_deleted_projects',
    deletedReviews:    'vk_admin_deleted_reviews',
    deletedInquiries:  'vk_admin_deleted_inquiries',
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
  _broadcast(type, data) {
    if (syncChannel) {
      try { syncChannel.postMessage({ type, data }); } catch (e) {}
    }
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(`vkreate:${type}`));
  },
  _getDeleted(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  },
  _addDeleted(key, id) {
    if (!id) return;
    const list = this._getDeleted(key);
    if (!list.includes(id)) {
      list.push(id);
      try { localStorage.setItem(key, JSON.stringify(list)); } catch {}
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
        duration: '3 months',
        completionDate: '2025-04-10',
        budgetRange: '₹18L – ₹25L',
        status: 'published',
        thumbnail: '../assets/images/project_salon_3.png',
        images: ['../assets/images/project_salon_3.png'],
        challenge: 'Create a luxurious, Instagram-ready salon that feels intimate yet spacious.',
        solution: 'Individual styling pods with LED mirrors, private pedicure suite, botanical murals.',
        result: '45% increase in repeat bookings, high client retention.',
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        testimonial: null,
        metrics: { sqft: '2200', pods: 6, timeline: '3 months' },
        tags: ['salon','beauty','wellness'],
        createdAt: '2025-04-10T09:00:00Z',
        updatedAt: '2025-05-20T11:00:00Z',
      },
      {
        id: 'retail-jewellery',
        name: 'Wings Jewellery & Retail Showroom',
        industry: 'retail',
        industryLabel: 'Jewellery & Retail',
        location: 'Calicut, Kerala',
        area: '1,800 sq ft',
        duration: '2 months',
        completionDate: '2025-02-14',
        budgetRange: '₹12L – ₹18L',
        status: 'published',
        thumbnail: '../assets/images/project_jewellery_1.jpg',
        images: ['../assets/images/project_jewellery_1.jpg', '../assets/images/project_jewellery_2.jpg'],
        challenge: 'Stand out in a busy luxury mall corridor with limited square footage.',
        solution: 'High-impact storefront featuring grand arched maroon grid glass windows, diamond-cut mirror wall.',
        result: '40% increase in corridor foot traffic, 32% conversion lift.',
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        testimonial: null,
        metrics: { sqft: '1800', footTraffic: '+40%', timeline: '2 months' },
        tags: ['retail','jewellery','showroom'],
        createdAt: '2025-02-14T10:00:00Z',
        updatedAt: '2025-03-01T09:00:00Z',
      },
      {
        id: 'corporate-lounge',
        name: 'Corporate VIP Reception & Lounge',
        industry: 'office',
        industryLabel: 'Offices & Workspaces',
        location: 'Kochi, Kerala',
        area: '2,900 sq ft',
        duration: '2.5 months',
        completionDate: '2025-01-20',
        budgetRange: '₹15L – ₹20L',
        status: 'published',
        thumbnail: '../assets/images/project_lounge.png',
        images: ['../assets/images/project_lounge.png', '../assets/images/project_lilaa_5.png'],
        challenge: 'Design an executive reception and waiting lounge that conveys prestige, hospitality, and privacy.',
        solution: 'Sculptural cream armchairs, warm indirect LED ceiling troffers, organic cloud pendant chandeliers.',
        result: '98% executive visitor satisfaction, reinforced brand authority.',
        processPhases: ['Discovery','Concept','Detailing','Execution','Handover'],
        testimonial: null,
        metrics: { sqft: '2900', satisfaction: '98%', timeline: '2.5 months' },
        tags: ['office','corporate','lounge'],
        createdAt: '2025-01-20T11:00:00Z',
        updatedAt: '2025-02-05T14:00:00Z',
      },
    ];
  },

  _defaultReviews() {
    return [
      {
        id: 'rev-lilaa-01',
        clientName: 'Anand Varma',
        clientRole: 'Founder, Lilaa Restaurants',
        clientEmail: 'anand@lilaarestaurants.com',
        projectId: 'lilaa-restaurant',
        rating: 5,
        reviewText: "VKREATE transformed our vision into Kerala's most talked-about dining space. The arched alcoves, warm ambient lighting, and bespoke furniture elevated our brand experience significantly. Table turn rate increased 30% in the first month!",
        status: 'approved',
        createdAt: '2025-07-02T10:00:00Z',
        approvedAt: '2025-07-02T12:00:00Z',
        studioResponse: 'Thank you Anand! Designing Lilaa was an incredible experience for our entire interior architecture team.'
      },
      {
        id: 'rev-wings-02',
        clientName: 'Dr. Priya Nair',
        clientRole: 'Managing Director, Wings Salon & Spa',
        clientEmail: 'priya@wingsbeauty.in',
        projectId: 'luxury-salon',
        rating: 5,
        reviewText: 'Flawless execution from concept to completion. The layout optimization in our Kochi salon created a serene, high-end sanctuary that our VIP clients absolutely love. Highly recommend VKREATE for luxury wellness spaces.',
        status: 'approved',
        createdAt: '2025-07-10T14:30:00Z',
        approvedAt: '2025-07-10T16:00:00Z',
        studioResponse: 'We are thrilled Dr. Priya! The curved glass arches and acoustic detailing in Wings remain one of our proudest accomplishments.'
      },
      {
        id: 'rev-pending-03',
        clientName: 'Suresh Menon',
        clientRole: 'Commercial Property Owner',
        clientEmail: 'suresh.menon@menongroup.com',
        projectId: 'corporate-lounge',
        rating: 5,
        reviewText: 'Outstanding craftsmanship on our executive workspace lounge in Calicut. The lighting accents and wood ribbing created an extraordinary corporate environment for our executive guests.',
        status: 'pending',
        createdAt: '2025-08-18T18:20:00Z',
        studioResponse: ''
      }
    ];
  },

  // ── Seed ─────────────────────────────────────────────────
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
          id: this._id(),
          name: 'Rajesh Kumar',
          email: 'rajesh@grandhotel.com',
          phone: '+91 98765 43210',
          industry: 'Hospitality',
          projectBudget: '₹50L – ₹75L',
          timeline: '6 months',
          brief: 'Looking to redesign our hotel lobby and 3 dining areas. 5-star property in Trivandrum.',
          status: 'new',
          notes: '',
          createdAt: '2025-07-31T09:00:00Z',
          respondedAt: null,
        },
        {
          id: this._id(),
          name: 'Meera Thomas',
          email: 'meera@blossomcafe.in',
          phone: '+91 94400 12345',
          industry: 'Restaurants & Cafes',
          projectBudget: '₹15L – ₹25L',
          timeline: '3 months',
          brief: 'Café design for a new 1,500 sq ft space in Kochi. Inspired by European café culture.',
          status: 'contacted',
          notes: 'Called on 28 July. Interested in a full concept presentation. Scheduled site visit for Aug 5.',
          createdAt: '2025-07-25T14:30:00Z',
          respondedAt: '2025-07-28T11:00:00Z',
        },
        {
          id: this._id(),
          name: 'Dr. Anil Sharma',
          email: 'dr.anil@skincare.com',
          phone: '+91 90001 23456',
          industry: 'Beauty & Wellness',
          projectBudget: '₹20L – ₹30L',
          timeline: '4 months',
          brief: 'Premium dermatology clinic in Bangalore. Need a modern clinical-yet-luxurious feel.',
          status: 'quoted',
          notes: 'Sent proposal on 20 July. Follow up scheduled for Aug 3.',
          createdAt: '2025-07-15T11:00:00Z',
          respondedAt: '2025-07-18T10:00:00Z',
        },
        {
          id: this._id(),
          name: 'Sanjay Pillai',
          email: 'sanjay@fashionretail.in',
          phone: '+91 80000 98765',
          industry: 'Retail',
          projectBudget: '₹35L – ₹45L',
          timeline: '5 months',
          brief: 'High-end fashion boutique in Kochi. 3,000 sq ft with a focus on premium materials.',
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
        },
        credentials: {
          email: 'admin@vkreate.com',
          passwordHash: 'Admin@123',
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
    if (typeof GithubSync !== 'undefined' && GithubSync.push) {
      GithubSync.push();
    }
  },

  // ── Image Upload Helper ─────────────────────────────────
  async uploadImage(fileOrBase64, filename = '') {
    // 1. Try backend API upload
    try {
      let base64Data = fileOrBase64;
      if (fileOrBase64 instanceof File) {
        base64Data = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(fileOrBase64);
        });
        filename = fileOrBase64.name;
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, base64Data })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.url) return json.url;
      }
    } catch (e) {
      console.warn('Backend image upload fallback to local storage / IDB:', e);
    }

    // 2. Fallback to ImageDB (IndexedDB)
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
      const defaults = (typeof DB._defaultProjects === 'function') ? DB._defaultProjects() : [];
      const deleted = DB._getDeleted(DB.KEYS.deletedProjects);
      let updated = false;

      defaults.forEach(def => {
        if (def && def.id && !deleted.includes(def.id) && !list.some(p => p && p.id === def.id)) {
          list.push(def);
          updated = true;
        }
      });

      if (updated) DB._set(DB.KEYS.projects, list);
      return list.filter(p => p && p.id && !deleted.includes(p.id));
    },
    get(id) { return this.all().find(p => p && p.id && (p.id === id || String(p.id) === String(id))) || null; },
    save(list) {
      DB._set(DB.KEYS.projects, list);
      DB._broadcast('projects-updated', list);
    },
    add(p) {
      const l = this.all();
      p.id = p.id || DB._id();
      p.createdAt = p.createdAt || new Date().toISOString();
      p.updatedAt = new Date().toISOString();
      if (!p.views) p.views = 0;
      if (!p.clicks) p.clicks = 0;
      if (!p.leads) p.leads = 0;
      l.unshift(p);
      DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));

      // Sync to API asynchronously
      fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p)
      }).catch(e => console.warn('API sync error:', e));

      DB._broadcast('projects-updated', l);
      return p;
    },
    update(id, data) {
      const l = this.all();
      const i = l.findIndex(p => p && p.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));

      fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(l[i])
      }).catch(e => console.warn('API update error:', e));

      DB._broadcast('projects-updated', l);
      return l[i];
    },
    delete(id) {
      const p = this.get(id);
      DB._addDeleted(DB.KEYS.deletedProjects, id);
      if (p && p.name) DB._addDeleted(DB.KEYS.deletedProjects, 'name:' + p.name.toLowerCase().trim());
      const remaining = this.all().filter(p => p && p.id !== id);
      DB._set(DB.KEYS.projects, remaining);

      fetch(`/api/projects/${id}`, { method: 'DELETE' }).catch(e => console.warn('API delete error:', e));
      DB._broadcast('projects-updated', remaining);
    },
    published() { return this.all().filter(p => p && p.status === 'published'); },
    drafts()    { return this.all().filter(p => p && p.status === 'draft'); },
  },

  // ── Reviews CRUD ──────────────────────────────────────────
  reviews: {
    all() {
      const rawDeleted = DB._getDeleted(DB.KEYS.deletedReviews) || [];
      const deleted = rawDeleted.filter(d => typeof d === 'string' && !d.startsWith('name:') && !d.startsWith('proj:'));
      const itemMap = new Map();

      const normalize = (r) => {
        if (!r || typeof r !== 'object') return null;
        const statusRaw = (r.status || 'pending').toString().toLowerCase().trim();
        const status = (statusRaw === 'approved' || statusRaw === 'published') ? 'approved' : (statusRaw === 'rejected' ? 'rejected' : 'pending');
        return {
          ...r,
          id: r.id || DB._id(),
          clientName: r.clientName || r.author || r.name || 'Anonymous Client',
          clientRole: r.clientRole || r.role || 'Client',
          clientEmail: r.clientEmail || r.email || '',
          reviewText: r.reviewText || r.text || r.content || '',
          rating: parseInt(r.rating || 5, 10),
          status,
          createdAt: r.createdAt || r.approvedAt || r.date || new Date().toISOString()
        };
      };

      // 1. Read local admin reviews
      try {
        const localAdmin = DB._get(DB.KEYS.reviews) || [];
        if (Array.isArray(localAdmin)) {
          localAdmin.forEach(raw => {
            const r = normalize(raw);
            if (r && r.id && !deleted.includes(r.id)) {
              itemMap.set(r.id, r);
            }
          });
        }
      } catch (e) {}

      // 2. Read live reviews
      try {
        const rawLive = JSON.parse(localStorage.getItem('vk_reviews')) || [];
        if (Array.isArray(rawLive)) {
          rawLive.forEach(raw => {
            const r = normalize(raw);
            if (r && r.id && !deleted.includes(r.id)) {
              const existing = itemMap.get(r.id);
              if (!existing) {
                itemMap.set(r.id, r);
              } else {
                const status = r.status || existing.status;
                const studioResponse = r.studioResponse !== undefined ? r.studioResponse : (existing.studioResponse || '');
                itemMap.set(r.id, { ...existing, ...r, status, studioResponse });
              }
            }
          });
        }
      } catch (e) {}

      // 3. Fallback merge with default seed reviews
      try {
        const defaults = DB._defaultReviews();
        if (Array.isArray(defaults)) {
          defaults.forEach(raw => {
            const r = normalize(raw);
            if (r && r.id && !deleted.includes(r.id) && !itemMap.has(r.id)) {
              itemMap.set(r.id, r);
            }
          });
        }
      } catch (e) {}

      const result = Array.from(itemMap.values()).filter(r => r && r.id && r.id !== 'mswstn7iv0g7w');
      result.sort((a, b) => {
        const tA = new Date(a.createdAt || a.approvedAt || a.date || 0).getTime();
        const tB = new Date(b.createdAt || b.approvedAt || b.date || 0).getTime();
        return tB - tA;
      });
      return result;
    },
    get(id) { return this.all().find(r => r && r.id && (r.id === id || String(r.id) === String(id))) || null; },
    save(list) {
      DB._set(DB.KEYS.reviews, list);
      try { localStorage.setItem('vk_reviews', JSON.stringify(list)); } catch (e) {}
      DB._broadcast('reviews-updated', list);
    },
    async add(r) {
      r.id = r.id || DB._id();
      r.createdAt = r.createdAt || new Date().toISOString();
      if (!r.status) r.status = 'pending';

      try {
        const res = await fetch(getApiBaseUrl() + '/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r)
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.success) throw new Error(json?.error || 'Failed to add review on server');

        const serverReview = json.review || r;
        const l = this.all();
        const existingIdx = l.findIndex(x => x && x.id === serverReview.id);
        if (existingIdx >= 0) {
          l[existingIdx] = serverReview;
        } else {
          l.unshift(serverReview);
        }
        this.save(l);
        DB._broadcast('reviews-updated', l);
        return serverReview;
      } catch (e) {
        console.error('API review add error:', e);
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast(`Failed to add review: ${e.message}`, 'error');
        }
        return null;
      }
    },
    async update(id, data) {
      const l = this.all();
      const i = l.findIndex(r => r && r.id === id);
      if (i < 0) return null;

      const updatedRecord = { ...l[i], ...data, updatedAt: new Date().toISOString() };

      try {
        const res = await fetch(getApiBaseUrl() + `/api/reviews/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRecord)
        });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.success) throw new Error(json?.error || 'Failed to update review on server');

        const serverReview = json.review || updatedRecord;
        l[i] = serverReview;
        this.save(l);
        DB._broadcast('reviews-updated', l);
        return serverReview;
      } catch (e) {
        console.error('API review update error:', e);
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast(`Failed to save changes: ${e.message}`, 'error');
        }
        return null;
      }
    },
    approve(id) { return this.update(id, { status: 'approved', approvedAt: new Date().toISOString() }); },
    reject(id)  { return this.update(id, { status: 'rejected' }); },
    async delete(id)  {
      if (!id) return false;
      try {
        const res = await fetch(getApiBaseUrl() + `/api/reviews/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
        const json = await res.json();
        if (!json || !json.success) throw new Error(json?.error || 'Failed to delete review on server');

        DB._addDeleted(DB.KEYS.deletedReviews, id);
        const remaining = this.all().filter(r => r && r.id !== id);
        this.save(remaining);

        if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
          FirebaseDB.db.collection('reviews').doc(id).delete().catch(e => console.warn('Firestore review delete warning:', e));
        }

        DB._broadcast('reviews-updated', remaining);
        return true;
      } catch (e) {
        console.error('API review delete error:', e);
        if (typeof UI !== 'undefined' && UI.toast) {
          UI.toast(`Failed to delete review: ${e.message}`, 'error');
        }
        return false;
      }
    },
    pending()   { return this.all().filter(r => r && r.status === 'pending'); },
    approved()  { return this.all().filter(r => r && r.status === 'approved'); },
    stats() {
      const all = this.all();
      return {
        total: all.length,
        pending: all.filter(r => r && r.status === 'pending').length,
        approved: all.filter(r => r && r.status === 'approved').length,
        rejected: all.filter(r => r && r.status === 'rejected').length,
        avgRating: all.length ? (all.reduce((s,r) => s + (r.rating || 5), 0) / all.length).toFixed(1) : 0,
      };
    },
  },

  // ── Inquiries CRUD ────────────────────────────────────────
  inquiries: {
    all() {
      const list = DB._get(DB.KEYS.inquiries) || [];
      const deleted = DB._getDeleted(DB.KEYS.deletedInquiries);
      return list.filter(i => i && i.id && !deleted.includes(i.id));
    },
    get(id) { return this.all().find(i => i && i.id && (i.id === id || String(i.id) === String(id))) || null; },
    save(list) {
      DB._set(DB.KEYS.inquiries, list);
      DB._broadcast('inquiries-updated', list);
    },
    add(item) {
      const l = this.all();
      item.id = item.id || DB._id();
      item.createdAt = item.createdAt || new Date().toISOString();
      item.status = item.status || 'new';
      l.unshift(item);
      this.save(l);

      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }).catch(e => console.warn('API inquiry add error:', e));

      DB._broadcast('inquiries-updated', l);
      return item;
    },
    update(id, data) {
      const l = this.all();
      const i = l.findIndex(x => x && x.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data };
      this.save(l);

      fetch(`/api/inquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(l[i])
      }).catch(e => console.warn('API inquiry update error:', e));

      DB._broadcast('inquiries-updated', l);
      return l[i];
    },
    delete(id) {
      DB._addDeleted(DB.KEYS.deletedInquiries, id);
      const remaining = this.all().filter(i => i && i.id !== id);
      this.save(remaining);

      fetch(`/api/inquiries/${id}`, { method: 'DELETE' }).catch(e => console.warn('API inquiry delete error:', e));
      DB._broadcast('inquiries-updated', remaining);
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
    save(data) {
      DB._set(DB.KEYS.settings, data);
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(e => console.warn('API settings save error:', e));
      DB._broadcast('settings-updated', data);
    },
    update(key, val) {
      const s = this.get();
      s[key] = { ...s[key], ...val };
      this.save(s);
    },
  },

  // ── Auth ─────────────────────────────────────────────────
  auth: {
    login(email, password) {
      const s = DB.settings.get();
      if (!s.credentials) return false;
      return s.credentials.email === email && s.credentials.passwordHash === password;
    },
    session: {
      set(data)   { DB._set(DB.KEYS.session, { ...data, ts: Date.now() }); },
      get()       { return DB._get(DB.KEYS.session); },
      clear()     { localStorage.removeItem(DB.KEYS.session); },
      isValid()   {
        const s = this.get();
        if (!s) return false;
        return (Date.now() - s.ts) < 8 * 60 * 60 * 1000;
      },
    },
  },

  _mergeItems(existingList, remoteList, deletedIds = []) {
    const itemMap = new Map();
    if (Array.isArray(existingList)) {
      existingList.forEach(item => {
        if (item && item.id && !deletedIds.includes(item.id)) {
          itemMap.set(item.id, item);
        }
      });
    }
    if (Array.isArray(remoteList)) {
      remoteList.forEach(item => {
        if (item && item.id && !deletedIds.includes(item.id)) {
          const existing = itemMap.get(item.id);
          if (!existing) {
            itemMap.set(item.id, item);
          } else {
            const status = item.status || existing.status;
            const studioResponse = item.studioResponse !== undefined ? item.studioResponse : (existing.studioResponse || '');
            const existingTime = new Date(existing.updatedAt || existing.approvedAt || existing.createdAt || 0).getTime();
            const remoteTime = new Date(item.updatedAt || item.approvedAt || item.createdAt || 0).getTime();

            if (remoteTime >= existingTime) {
              itemMap.set(item.id, { ...existing, ...item, status, studioResponse });
            } else {
              itemMap.set(item.id, { ...item, ...existing, status, studioResponse });
            }
          }
        }
      });
    }
    return Array.from(itemMap.values());
  },

  // ── Remote Sync Engine ─────────────────────────────────────
  async loadRemoteData() {
    let updated = false;

    // Helper to fetch from API or static JSON file
    const fetchEntity = async (apiEndpoint, staticPath) => {
      try {
        const res = await fetch(getApiBaseUrl() + apiEndpoint + '?t=' + Date.now());
        if (res.ok) return await res.json();
      } catch (e) {}

      try {
        let res = await fetch('../' + staticPath + '?t=' + Date.now());
        if (!res.ok) res = await fetch(staticPath + '?t=' + Date.now());
        if (res.ok) return await res.json();
      } catch (e) {}

      return null;
    };

    try {
      const [remoteProjects, remoteReviews, remoteInquiries, remoteSettings] = await Promise.all([
        fetchEntity('/api/projects', 'js/admin-projects.json'),
        fetchEntity('/api/reviews', 'js/admin-reviews.json'),
        fetchEntity('/api/inquiries', 'js/admin-inquiries.json'),
        fetchEntity('/api/settings', 'js/admin-settings.json'),
      ]);

      if (Array.isArray(remoteProjects) && remoteProjects.length > 0) {
        DB._set(DB.KEYS.projects, remoteProjects);
        updated = true;
      }

      // Always merge remote reviews regardless of count (empty list = server was cleared,
      // non-empty list = merge new pending submissions from frontend users)
      if (Array.isArray(remoteReviews)) {
        const localRev = DB._get(DB.KEYS.reviews) || [];
        const rawLiveRev = (() => { try { return JSON.parse(localStorage.getItem('vk_reviews')) || []; } catch { return []; } })();
        const currentRev = DB._mergeItems(localRev, rawLiveRev);
        const mergedReviews = DB._mergeItems(currentRev, remoteReviews, DB._getDeleted(DB.KEYS.deletedReviews) || []);
        DB._set(DB.KEYS.reviews, mergedReviews);
        try { localStorage.setItem('vk_reviews', JSON.stringify(mergedReviews)); } catch (e) {}
        updated = true;
      }

      if (Array.isArray(remoteInquiries)) {
        DB._set(DB.KEYS.inquiries, remoteInquiries);
        updated = true;
      }

      if (remoteSettings && remoteSettings.studio) {
        DB._set(DB.KEYS.settings, remoteSettings);
        updated = true;
      }
    } catch (e) {
      console.warn("loadRemoteData error:", e);
    }

    if (updated) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:inquiries-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:settings-updated'));
    }
  },
};

// Seed DB locally if empty
DB.seed();

// Setup Real-time Sync Listeners
(function setupSyncListeners() {
  // 1. BroadcastChannel Listener
  if (syncChannel) {
    syncChannel.onmessage = (event) => {
      if (event.data && event.data.type) {
        DB.loadRemoteData();
        window.dispatchEvent(new CustomEvent(`vkreate:${event.data.type}`));
      }
    };
  }

  // 2. Storage event listener (cross-tab in same browser)
  window.addEventListener('storage', (e) => {
    DB.loadRemoteData();
  });

  // 3. SSE Server-Sent Events Listener (real-time from server)
  if (typeof EventSource !== 'undefined') {
    try {
      const evtSource = new EventSource(getApiBaseUrl() + '/api/events');
      evtSource.onmessage = async (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type && msg.type !== 'connected') {
            await DB.loadRemoteData();
            // Always fire the specific entity event so modules re-render
            window.dispatchEvent(new CustomEvent(`vkreate:${msg.type}`));
            // Also fire reviews-updated when any entity changes (covers cross-entity broadcasts)
            if (msg.type === 'reviews-updated') {
              window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
            }
            if (typeof App !== 'undefined' && App._refreshCurrentView) {
              App._refreshCurrentView();
            }
          }
        } catch (err) {}
      };
      evtSource.onerror = () => {
        // SSE connection dropped — browser will auto-reconnect, no action needed
      };
    } catch (e) {}
  }

  // 4. Firebase Firestore Real-Time Listener
  if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
    try {
      FirebaseDB.db.collection('reviews').onSnapshot((snapshot) => {
        const firestoreReviews = [];
        snapshot.forEach((doc) => {
          if (doc.exists) firestoreReviews.push(doc.data());
        });
        if (firestoreReviews.length > 0) {
          const currentLocal = DB._get(DB.KEYS.reviews) || [];
          const merged = DB._mergeItems(currentLocal, firestoreReviews, DB._getDeleted(DB.KEYS.deletedReviews) || []);
          DB._set(DB.KEYS.reviews, merged);
          window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
          if (typeof App !== 'undefined') App.updateSidebar();
        }
      });
    } catch (e) {
      console.warn('Firestore review listener warning:', e);
    }
  }

  // Initial load
  DB.loadRemoteData();

  // Handle tab visibility change & focus (sync memory data silently without destroying DOM)
  const handleFocus = async () => {
    await DB.loadRemoteData();
    if (typeof App !== 'undefined' && App.updateSidebar) {
      App.updateSidebar();
    }
  };

  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleFocus();
  });
})();
