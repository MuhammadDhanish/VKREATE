/* ============================================================
   VKREATE Admin — Data Layer (localStorage CRUD)
   ============================================================ */

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
        testimonial: { author: 'Unnikrishnan Nair', role: 'Founder & Owner, Lilaa Hospitality', text: 'VKREATE captured our brand\'s warmth and sophistication in every detail.', rating: 5 },
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
        testimonial: { author: 'Dr. Reshma Menon', role: 'Salon Director, Wings Wellness', text: 'Our clients feel like they\'re stepping into a 5-star spa retreat.', rating: 5 },
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
        testimonial: { author: 'Faisal Rahman', role: 'Brand Manager, Wings Retail', text: 'The design makes our jewellery the hero.', rating: 5 },
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
        testimonial: { author: 'Sameer Varma', role: 'Corporate Director, Apex Zenith', text: 'First impressions matter immensely in corporate business.', rating: 5 },
        metrics: { sqft: '2900', satisfaction: '98%', timeline: '2.5 months' },
        tags: ['office','corporate','lounge'],
        createdAt: '2025-01-20T11:00:00Z',
        updatedAt: '2025-02-05T14:00:00Z',
      },
    ];
  },

  _defaultReviews() {
    return [];
  },

  // ── Seed ─────────────────────────────────────────────────
  seed() {
    if (!this._get(this.KEYS.projects)) {
      this._set(this.KEYS.projects, this._defaultProjects());
    }

    // Reviews
    if (!this._get(this.KEYS.reviews)) {
      this._set(this.KEYS.reviews, this._defaultReviews());
    }



    // Inquiries
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

    // Settings
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
        passwordHash: 'Admin@123', // plain for demo
      }
    });
  },

  // ── Firebase Integration Helpers ───────────────────────────
  _syncFirebase(collection, docId, data, action = 'set') {
    if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
      try {
        const ref = FirebaseDB.db.collection(collection).doc(docId);
        if (action === 'delete') {
          ref.delete().catch(err => console.warn('Firebase delete error:', err));
        } else {
          ref.set(data, { merge: true }).catch(err => console.warn('Firebase sync error:', err));
        }
      } catch (e) {
        console.warn('Firebase operation error:', e);
      }
    }
  },

  async uploadImage(file) {
    if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.storage) {
      try {
        const filename = `projects/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const ref = FirebaseDB.storage.ref(filename);
        const snapshot = await ref.put(file);
        const url = await snapshot.ref.getDownloadURL();
        return url;
      } catch (e) {
        console.error('Firebase Storage upload failed:', e);
      }
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

      if (updated) {
        DB._set(DB.KEYS.projects, list);
      }
      return list.filter(p => p && p.id && !deleted.includes(p.id));
    },
    get(id)     { return this.all().find(p => p && p.id === id) || null; },
    save(list)  { DB._set(DB.KEYS.projects, list); },
    add(p) {
      const l = this.all();
      p.id = p.id || DB._id();
      p.createdAt = new Date().toISOString();
      p.updatedAt = p.createdAt;
      if (!p.views) p.views = 0;
      if (!p.clicks) p.clicks = 0;
      if (!p.leads) p.leads = 0;
      l.unshift(p);
      const ok = DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));
      if (!ok) return null;
      DB._syncFirebase('projects', p.id, p, 'set');
      return p;
    },
    update(id, data) {
      const l = this.all();
      const i = l.findIndex(p => p && p.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      const ok = DB._set(DB.KEYS.projects, JSON.parse(JSON.stringify(l)));
      if (!ok) return null;
      DB._syncFirebase('projects', id, l[i], 'set');
      return l[i];
    },
    delete(id)  {
      const p = this.get(id);
      DB._addDeleted(DB.KEYS.deletedProjects, id);
      if (p && p.name) DB._addDeleted(DB.KEYS.deletedProjects, 'name:' + p.name.toLowerCase().trim());
      this.save(this.all().filter(p => p && p.id !== id));
      DB._syncFirebase('projects', id, null, 'delete');
    },
    published() { return this.all().filter(p => p && p.status === 'published'); },
    drafts()    { return this.all().filter(p => p && p.status === 'draft'); },
  },

  reviews: {
    all() {
      // Filter out legacy name/proj prefix strings from deleted list
      const rawDeleted = DB._getDeleted(DB.KEYS.deletedReviews) || [];
      const deleted = rawDeleted.filter(d => typeof d === 'string' && !d.startsWith('name:') && !d.startsWith('proj:'));
      const itemMap = new Map();

      // 1. Add default showcase reviews
      const defaults = (typeof DB._defaultReviews === 'function') ? DB._defaultReviews() : [];
      defaults.forEach(def => {
        if (def && def.id && !deleted.includes(def.id)) {
          itemMap.set(def.id, def);
        }
      });

      // 2. Merge items from localStorage vk_admin_reviews
      const localAdmin = DB._get(DB.KEYS.reviews) || [];
      if (Array.isArray(localAdmin)) {
        localAdmin.forEach(r => {
          if (r && r.id && !deleted.includes(r.id)) {
            const existing = itemMap.get(r.id) || {};
            const status = (existing.status === 'approved' || existing.status === 'rejected') ? existing.status : (r.status || 'pending');
            const studioResponse = r.studioResponse || existing.studioResponse || '';
            itemMap.set(r.id, { ...existing, ...r, status, studioResponse });
          }
        });
      }

      // 3. Merge items from localStorage vk_reviews (if submitted from live site fallback)
      try {
        const rawLive = JSON.parse(localStorage.getItem('vk_reviews')) || [];
        if (Array.isArray(rawLive)) {
          rawLive.forEach(r => {
            if (r && r.id && !deleted.includes(r.id)) {
              const existing = itemMap.get(r.id);
              if (!existing) {
                itemMap.set(r.id, r);
              } else {
                const status = (existing.status === 'approved' || existing.status === 'rejected') ? existing.status : (r.status || existing.status || 'pending');
                const studioResponse = existing.studioResponse || r.studioResponse || '';
                itemMap.set(r.id, { ...r, ...existing, status, studioResponse });
              }
            }
          });
        }
      } catch (e) {}

      return Array.from(itemMap.values()).filter(r => r && r.id && r.id !== 'mswstn7iv0g7w');
    },
    get(id)     { return this.all().find(r => r && r.id === id) || null; },
    save(list)  {
      DB._set(DB.KEYS.reviews, list);
      try {
        localStorage.setItem('vk_reviews', JSON.stringify(list));
      } catch (e) {}
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
    },
    add(r)      {
      const l = this.all();
      r.id = DB._id();
      r.createdAt = new Date().toISOString();
      r.status = 'pending';
      l.unshift(r);
      this.save(l);
      DB._syncFirebase('reviews', r.id, r, 'set');
      return r;
    },
    update(id, data) {
      const l = this.all();
      const i = l.findIndex(r => r && r.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data, updatedAt: new Date().toISOString() };
      this.save(l);
      DB._syncFirebase('reviews', id, l[i], 'set');
      return l[i];
    },
    approve(id) { return this.update(id, { status: 'approved', approvedAt: new Date().toISOString() }); },
    reject(id)  { return this.update(id, { status: 'rejected' }); },
    delete(id)  {
      if (!id) return;
      DB._addDeleted(DB.KEYS.deletedReviews, id);
      const remaining = this.all().filter(r => r && r.id !== id);
      this.save(remaining);
      DB._syncFirebase('reviews', id, null, 'delete');
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
    all()       {
      const list = DB._get(DB.KEYS.inquiries) || [];
      const deleted = DB._getDeleted(DB.KEYS.deletedInquiries);
      return list.filter(i => !deleted.includes(i.id));
    },
    get(id)     { return this.all().find(i => i.id === id) || null; },
    save(list)  { DB._set(DB.KEYS.inquiries, list); },
    add(item)   {
      const l = this.all();
      item.id = DB._id();
      item.createdAt = new Date().toISOString();
      item.status = 'new';
      l.unshift(item);
      this.save(l);
      DB._syncFirebase('inquiries', item.id, item, 'set');
      return item;
    },
    update(id, data) {
      const l = this.all();
      const i = l.findIndex(x => x.id === id);
      if (i < 0) return null;
      l[i] = { ...l[i], ...data };
      this.save(l);
      DB._syncFirebase('inquiries', id, l[i], 'set');
      return l[i];
    },
    delete(id)  {
      DB._addDeleted(DB.KEYS.deletedInquiries, id);
      this.save(this.all().filter(i => i.id !== id));
      DB._syncFirebase('inquiries', id, null, 'delete');
    },
    byStatus(s) { return this.all().filter(i => i.status === s); },
    stats() {
      const all = this.all();
      return {
        new:       all.filter(i => i.status === 'new').length,
        contacted: all.filter(i => i.status === 'contacted').length,
        quoted:    all.filter(i => i.status === 'quoted').length,
        won:       all.filter(i => i.status === 'won').length,
        lost:      all.filter(i => i.status === 'lost').length,
      };
    },
  },

  // ── Settings ─────────────────────────────────────────────
  settings: {
    get()       { return DB._get(DB.KEYS.settings) || {}; },
    save(data)  { DB._set(DB.KEYS.settings, data); },
    update(key, val) { const s = this.get(); s[key] = { ...s[key], ...val }; this.save(s); },
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
        // 8-hour session
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
            const existingTime = new Date(existing.updatedAt || existing.approvedAt || existing.createdAt || 0).getTime();
            const remoteTime = new Date(item.updatedAt || item.approvedAt || item.createdAt || 0).getTime();
            if (remoteTime > existingTime + 5000) {
              itemMap.set(item.id, item);
            }
          }
        }
      });
    }
    return Array.from(itemMap.values());
  },

  // ── Remote Sync Engine (Firebase Firestore & JSON Fallback) ──
  async loadRemoteData() {
    const deletedProjects = DB._getDeleted(DB.KEYS.deletedProjects);
    const deletedReviews = DB._getDeleted(DB.KEYS.deletedReviews);
    const deletedInquiries = DB._getDeleted(DB.KEYS.deletedInquiries);

    let updated = false;

    // 1. Try fetching from Firebase Firestore first if active
    if (typeof FirebaseDB !== 'undefined' && FirebaseDB.initialized && FirebaseDB.db) {
      try {
        const projSnap = await FirebaseDB.db.collection('projects').get();
        if (!projSnap.empty) {
          const remoteProjects = [];
          projSnap.forEach(doc => remoteProjects.push(doc.data()));
          const existing = DB._get(DB.KEYS.projects) || [];
          const merged = this._mergeItems(existing, remoteProjects, deletedProjects);
          DB._set(DB.KEYS.projects, merged);
          updated = true;
        }
      } catch (e) {
        console.warn("Firestore fetch error for projects:", e);
      }

      try {
        const revSnap = await FirebaseDB.db.collection('reviews').get();
        if (!revSnap.empty) {
          const remoteReviews = [];
          revSnap.forEach(doc => remoteReviews.push(doc.data()));
          const existing = DB._get(DB.KEYS.reviews) || [];
          const merged = this._mergeItems(existing, remoteReviews, deletedReviews);
          DB._set(DB.KEYS.reviews, merged);
          updated = true;
        }
      } catch (e) {
        console.warn("Firestore fetch error for reviews:", e);
      }
    } else {
      // 2. Fallback to static JSON files (Merging without wiping local submissions)
      try {
        const projRes = await fetch('../js/admin-projects.json?t=' + Date.now());
        if (projRes.ok) {
          const remoteProjects = await projRes.json();
          if (Array.isArray(remoteProjects)) {
            const existing = DB._get(DB.KEYS.projects) || [];
            const merged = this._mergeItems(existing, remoteProjects, deletedProjects);
            DB._set(DB.KEYS.projects, merged);
            updated = true;
          }
        }
      } catch (e) {}

      try {
        const revRes = await fetch('../js/admin-reviews.json?t=' + Date.now());
        if (revRes.ok) {
          const remoteReviews = await revRes.json();
          if (Array.isArray(remoteReviews)) {
            const existing = DB._get(DB.KEYS.reviews) || [];
            const merged = this._mergeItems(existing, remoteReviews, deletedReviews);
            DB._set(DB.KEYS.reviews, merged);
            updated = true;
          }
        }
      } catch (e) {}



      try {
        const inqRes = await fetch('../js/admin-inquiries.json?t=' + Date.now());
        if (inqRes.ok) {
          const remoteInquiries = await inqRes.json();
          if (Array.isArray(remoteInquiries)) {
            const existing = DB._get(DB.KEYS.inquiries) || [];
            const merged = this._mergeItems(existing, remoteInquiries, deletedInquiries);
            DB._set(DB.KEYS.inquiries, merged);
            updated = true;
          }
        }
      } catch (e) {}
    }

    if (updated) {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
    }
  },
};

(async function autoLoadRemoteAdminData() {
  if (typeof DB !== 'undefined' && DB.loadRemoteData) {
    await DB.loadRemoteData();
  }

  // Refresh when window/tab is focused or shown on phone/desktop
  const handleFocus = async () => {
    if (typeof DB !== 'undefined' && DB.loadRemoteData) {
      await DB.loadRemoteData();
      if (typeof App !== 'undefined' && App._refreshCurrentView) {
        App._refreshCurrentView();
      }
    }
  };

  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handleFocus();
  });
})();
