// ============================================================
// VKREATE — Static Data & Real-Time Sync Engine
// ============================================================

// Canonical Domain Redirect: ensure all visitors share identical origin and localStorage
if (typeof window !== 'undefined' && window.location && window.location.hostname === 'vkreatearchitecture.com') {
  window.location.replace('https://www.vkreatearchitecture.com' + window.location.pathname + window.location.search + window.location.hash);
}

// ── 1. Storage Purge & Clean Initialization ──────────────────
(function initCleanStorage() {
  try {
    const PURGE_KEY = 'vk_purge_v2026_zero_state_v4';
    if (localStorage.getItem('vk_purge_key') !== PURGE_KEY) {
      localStorage.removeItem('vk_reviews');
      localStorage.removeItem('vk_reviews_list');
      localStorage.removeItem('vk_projects_cache');
      localStorage.removeItem('vk_admin_projects');
      localStorage.removeItem('vk_admin_reviews');
      localStorage.setItem('vk_purge_key', PURGE_KEY);
    }
  } catch (e) {}
})();

// ── 2. Primary VKREATE Data Store ────────────────────────────
window.VKREATE_DATA = {
  projects: [],
  reviews: [],

  services: [
    {
      id: "interior-design",
      num: "01",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="8" width="36" height="32" rx="3" stroke="currentColor" stroke-width="2"/><path d="M6 18h36M18 18v22M30 18v22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Interior Design",
      subtitle: "Concept · Spatial Layout · Palette",
      description: "Conceptual phase defining spatial layout, aesthetic vision, material palette, and functional requirements. Transforms briefs into detailed plans optimized for flow and well-being.",
      features: ["Spatial Layout", "Aesthetic Vision", "Material Palette", "Ergonomics"],
      projectLink: ""
    },
    {
      id: "fitout-contracting",
      num: "02",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 38V18l14-10 14 10v20a2 2 0 01-2 2H12a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/><path d="M18 40V24h12v16" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "Fit-Out & Contracting",
      subtitle: "Tendering · On-Site Management · Partitioning",
      description: "Execution phase where design plans are physically realized. Involves competitive tendering, project scheduling, on-site construction management, and built-in components.",
      features: ["On-Site Management", "Project Scheduling", "Finishes & Partitioning", "Tendering"],
      projectLink: ""
    },
    {
      id: "design-build",
      num: "03",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 8l8-4 8 4M24 20v12M16 26h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Design + Build",
      subtitle: "Single Entity · Streamlined · Fast Delivery",
      description: "Integrated project delivery model where a single entity manages both design and construction. Streamlines communication and ensures faster completion.",
      features: ["Single-Entity Delivery", "Risk Reduction", "Overlapped Timelines", "Seamless Comms"],
      projectLink: ""
    },
    {
      id: "brand-integration",
      num: "04",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/><path d="M24 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="currentColor"/></svg>`,
      title: "Brand Integration",
      subtitle: "Identity · Experiential · Narrative",
      description: "Strategic step ensuring the physical space acts as a tangible extension of your organization's identity, values, and culture through bespoke touchpoints.",
      features: ["Brand Identity", "Bespoke Elements", "Experiential Touchpoints", "Culture"],
      projectLink: ""
    },
    {
      id: "3d-visualisation",
      num: "05",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L6 14v20l18 10 18-10V14L24 4z" stroke="currentColor" stroke-width="2"/><path d="M24 24L6 14M24 24l18-10M24 24v20" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "3D Visualisation",
      subtitle: "Photorealistic · VR Walkthroughs · Renders",
      description: "Powerful tool generating photorealistic imagery, virtual reality (VR) walkthroughs, and rendered videos allowing stakeholders to approve finishes before construction.",
      features: ["Photorealistic Renders", "VR Walkthroughs", "Rendered Videos", "Finish Approval"],
      projectLink: ""
    },
    {
      id: "material-detailing",
      num: "06",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8h32v32H8V8z" stroke="currentColor" stroke-width="2"/><path d="M16 8v32M32 8v32M8 16h32M8 32h32" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`,
      title: "Material Detailing",
      subtitle: "Construction Drawings · Joinery · Specs",
      description: "Technical process of creating precise, highly-detailed construction drawings specifying how materials meet, join, and integrate for longevity and quality.",
      features: ["Construction Drawings", "Material Joinery", "Technical Compliance", "Bespoke Specs"],
      projectLink: ""
    }
  ],

  team: [
    {
      name: "Vikrant Rao",
      role: "Founder & Creative Director",
      bio: "Architect-turned-designer with 14 years experience across India's most celebrated commercial projects.",
      initial: "VR"
    },
    {
      name: "Shreya Mehta",
      role: "Principal Interior Designer",
      bio: "Specialises in hospitality, restaurant, and retail environments with bespoke material instincts and contemporary spatial styling.",
      initial: "SM"
    },
    {
      name: "Arjun Pillai",
      role: "Project Director",
      bio: "Ensures every project runs on time and on brief. Arjun is the bridge between creative vision and on-site reality.",
      initial: "AP"
    }
  ],

  stats: [
    { value: "0", label: "Projects Completed" },
    { value: "12+", label: "Years of Excellence" },
    { value: "5.0", label: "Average Rating" },
    { value: "100%", label: "On-Time Delivery" }
  ],

  faqs: [
    {
      q: "How does VKREATE structure a project from start to finish?",
      a: "Every project follows our five-phase process: Discovery (brief & space planning), Concept (3D mood & spatial strategy), Detailing (drawings & material specs), Execution (contractor coordination), and Handover (snagging & final styling)."
    },
    {
      q: "What budget range do your projects typically require?",
      a: "Commercial retail & kiosk projects begin around ₹12L–₹18L. Luxury beauty salons range ₹18L–₹25L. Restaurant & fine dining fitouts range ₹25L–₹35L+. We are fully transparent about budgets from day one."
    }
  ],

  studio: {
    name: 'Vkreate Interior Architecture',
    tagline: 'Where Design Speaks',
    email: 'vkreatearchitecture@gmail.com',
    phone: '+91 90371 61861',
    address: 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016',
    mapsUrl: 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw',
    instagram: 'https://www.instagram.com/vkreate_interior_architecture',
    website: 'https://vkreatearchitecture.com'
  }
};

var VKREATE_DATA = window.VKREATE_DATA;

// ── 3. IndexedDB Image Reader ────────────────────────────────
window.ImageDBReader = {
  _db: null,
  DB_NAME: 'vkreate_images',
  STORE: 'images',

  async open() {
    if (this._db) return this._db;
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const req = indexedDB.open(this.DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(this.STORE)) {
            db.createObjectStore(this.STORE, { keyPath: 'id' });
          }
        };
        req.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  },

  async get(id) {
    try {
      const db = await this.open();
      if (!db) return null;
      return new Promise((resolve) => {
        const tx = db.transaction(this.STORE, 'readonly');
        const store = tx.objectStore(this.STORE);
        const req = store.get(id);
        req.onsuccess = (e) => resolve(e.target.result?.dataUrl || null);
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  },

  async resolve(ref) {
    if (!ref) return '';
    if (typeof ref === 'string' && ref.startsWith('idb:')) {
      const key = ref.slice(4);
      const dataUrl = await this.get(key);
      if (dataUrl) return dataUrl;
      return ref;
    }
    return ref;
  },

  async resolveProject(p) {
    if (!p) return p;
    if (Array.isArray(p.images) && p.images.length > 0) {
      p.images = await Promise.all(p.images.map(img => this.resolve(img)));
    }
    if (p.thumbnail && p.thumbnail.startsWith('idb:')) {
      const resolvedThumb = await this.resolve(p.thumbnail);
      if (resolvedThumb && !resolvedThumb.startsWith('idb:')) {
        p.thumbnail = resolvedThumb;
      } else if (p.images && p.images[0] && !p.images[0].startsWith('idb:')) {
        p.thumbnail = p.images[0];
      }
    } else if (!p.thumbnail && p.images && p.images[0]) {
      p.thumbnail = p.images[0];
    }
    if (p.afterImage && p.afterImage.startsWith('idb:')) {
      const resolvedAfter = await this.resolve(p.afterImage);
      if (resolvedAfter && !resolvedAfter.startsWith('idb:')) p.afterImage = resolvedAfter;
    }
    if (p.beforeImage && p.beforeImage.startsWith('idb:')) {
      const resolvedBefore = await this.resolve(p.beforeImage);
      if (resolvedBefore && !resolvedBefore.startsWith('idb:')) p.beforeImage = resolvedBefore;
    }
    return p;
  }
};

// ── 4. Unified Rebuilt Synchronization Engine ─────────────────
const VKREATE_SYNC = {
  _isFetchingProjects: false,
  _isFetchingReviews: false,
  _isFetchingSettings: false,
  _sseSource: null,

  getBaseUrl() {
    if (typeof window !== 'undefined' && window.location) {
      const h = window.location.hostname;
      const p = window.location.port;
      const proto = window.location.protocol || 'http:';
      if (p !== '3000' && p !== '' && p !== '80' && p !== '443') {
        return `${proto}//${h}:3000`;
      }
    }
    return '';
  },

  fixPath(p) {
    if (!p || typeof p !== 'string') return '';
    if (p.startsWith('data:') || p.startsWith('http://') || p.startsWith('https://') || p.startsWith('idb:')) return p;
    return p.replace(/^(\.\.\/)+/, '');
  },

  getDeletedProjectIds() {
    try {
      const raw = localStorage.getItem('vk_admin_deleted_projects');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) {
      return [];
    }
  },

  getDeletedReviewIds() {
    try {
      const raw = localStorage.getItem('vk_admin_deleted_reviews');
      return raw ? (JSON.parse(raw) || []) : [];
    } catch (e) {
      return [];
    }
  },

  // ── Fetch & Apply Projects ──────────────────────────────────
  async fetchProjects() {
    if (this._isFetchingProjects) return;
    this._isFetchingProjects = true;

    let remoteList = null;
    try {
      const res = await fetch(this.getBaseUrl() + '/api/projects/public?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) remoteList = raw;
        else if (raw && Array.isArray(raw.items)) remoteList = raw.items;
      }
    } catch (e) {}

    // Fallback to /api/projects if /api/projects/public is unavailable
    if (!remoteList) {
      try {
        const res = await fetch(this.getBaseUrl() + '/api/projects?t=' + Date.now());
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) remoteList = raw;
          else if (raw && Array.isArray(raw.items)) remoteList = raw.items;
        }
      } catch (e) {}
    }

    // Offline JSON Fallback
    if (!remoteList) {
      try {
        const res = await fetch('js/admin-projects.json?t=' + Date.now());
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) remoteList = raw;
          else if (raw && Array.isArray(raw.items)) remoteList = raw.items;
        }
      } catch (e) {}
    }

    if (Array.isArray(remoteList)) {
      const active = remoteList.filter(p => {
        if (!p || !p.id) return false;
        const status = (p.status || 'published').toLowerCase().trim();
        return status !== 'draft' && status !== 'archived' && status !== 'deleted';
      }).map(p => {
        const rawThumb = p.thumbnail || (p.images && p.images[0]) || '';
        const thumb = this.fixPath(rawThumb);
        const imgs = (p.images && p.images.length) ? p.images.map(i => this.fixPath(i)) : (thumb ? [thumb] : []);
        return {
          id: p.id,
          name: p.name || 'Untitled Project',
          client: p.client || p.clientName || 'Client',
          industry: p.industry || 'commercial',
          industryLabel: p.industryLabel || p.industry || 'Commercial',
          location: p.location || 'Kerala, India',
          area: p.area || '',
          budgetRange: p.budgetRange || '',
          duration: p.duration || '',
          completionDate: p.completionDate || '',
          rating: p.rating || p.testimonial?.rating || 5,
          rank: typeof p.rank === 'number' ? p.rank : (parseInt(p.rank) || 99),
          thumbnail: thumb,
          images: imgs,
          beforeImage: this.fixPath(p.beforeImage) || imgs[0] || '',
          afterImage: this.fixPath(p.afterImage) || thumb || '',
          tagline: p.tagline || (p.solution ? p.solution.slice(0, 70) + '...' : 'Designed by VKREATE Studio'),
          challenge: p.challenge || '',
          solution: p.solution || '',
          result: p.result || '',
          processPhases: (p.processPhases && p.processPhases.length) ? p.processPhases : ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
          testimonial: p.testimonial?.text ? p.testimonial : null,
          metrics: p.metrics || { sqft: p.area || '', satisfaction: '100%' }
        };
      });

      // Update in-memory state
      window.VKREATE_DATA.projects = active;
      if (window.VKREATE_DATA.stats && window.VKREATE_DATA.stats[0]) {
        window.VKREATE_DATA.stats[0].value = active.length.toString();
      }

      // Read-only offline snapshot
      try { localStorage.setItem('vk_projects_cache', JSON.stringify(active)); } catch (e) {}

      // Resolve IndexedDB local images if present
      if (window.ImageDBReader) {
        try {
          await Promise.all(active.map(p => window.ImageDBReader.resolveProject(p)));
        } catch (e) {}
      }

      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
    }
    this._isFetchingProjects = false;
  },

  // ── Fetch & Apply Reviews ───────────────────────────────────
  async fetchReviews() {
    if (this._isFetchingReviews) return;
    this._isFetchingReviews = true;

    let remoteList = null;
    try {
      const res = await fetch(this.getBaseUrl() + '/api/reviews/public?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) remoteList = raw;
        else if (raw && Array.isArray(raw.items)) remoteList = raw.items;
      }
    } catch (e) {}

    // Offline JSON Fallback
    if (!remoteList) {
      try {
        const res = await fetch('js/admin-reviews.json?t=' + Date.now());
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) remoteList = raw;
          else if (raw && Array.isArray(raw.items)) remoteList = raw.items;
        }
      } catch (e) {}
    }

    if (Array.isArray(remoteList)) {
      const active = remoteList.filter(r => {
        if (!r || !r.id) return false;
        const status = (r.status || 'approved').toLowerCase().trim();
        return status === 'approved';
      }).map(r => {
        const dateFormatted = r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : (r.date || 'Recent');
        const computedRank = typeof r.rank === 'number' ? r.rank : (parseInt(r.rank) || 0);
        return {
          id: r.id,
          projectId: r.projectId || 'general',
          author: r.clientName || r.author || 'Verified Client',
          role: r.clientRole || r.role || 'Client',
          industry: r.industry || r.industryLabel || 'commercial',
          industryLabel: r.industryLabel || r.industry || 'Commercial',
          rating: r.rating || 5,
          rank: computedRank,
          date: dateFormatted,
          text: r.reviewText || r.text || '',
          verified: true,
          status: 'approved',
          studioResponse: r.studioResponse || ''
        };
      });

      active.sort((a, b) => a.rank - b.rank);

      window.VKREATE_DATA.reviews = active;
      try { localStorage.setItem('vk_reviews', JSON.stringify(active)); } catch (e) {}
      window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
    }
    this._isFetchingReviews = false;
  },

  // ── Fetch & Apply Settings ──────────────────────────────────
  async fetchSettings() {
    if (this._isFetchingSettings) return;
    this._isFetchingSettings = true;
    try {
      const res = await fetch(this.getBaseUrl() + '/api/settings?t=' + Date.now());
      if (res.ok) {
        const data = await res.json();
        if (data && data.studio) {
          window.VKREATE_DATA.studio = { ...window.VKREATE_DATA.studio, ...data.studio };
          window.dispatchEvent(new CustomEvent('vkreate:settings-updated'));
        }
      }
    } catch (e) {}
    this._isFetchingSettings = false;
  },

  // ── Fetch Everything in Parallel ────────────────────────────
  async fetchAll() {
    await Promise.all([
      this.fetchProjects(),
      this.fetchReviews(),
      this.fetchSettings()
    ]);
  },

  // ── Server-Sent Events (SSE) Push Listener ───────────────────
  initSSE() {
    const sseBase = this.getBaseUrl();
    if (!sseBase && window.location.protocol === 'file:') return;

    try {
      if (this._sseSource) this._sseSource.close();
      this._sseSource = new EventSource((sseBase || '') + '/api/events');

      let debounceTimer = null;
      this._sseSource.onmessage = (e) => {
        const data = (e.data || '').trim();
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          if (data === 'projects-updated' || data === 'all-updated') this.fetchProjects();
          if (data === 'reviews-updated' || data === 'all-updated') this.fetchReviews();
          if (data === 'settings-updated' || data === 'all-updated') this.fetchSettings();
        }, 150);
      };

      this._sseSource.onerror = () => {
        if (this._sseSource) this._sseSource.close();
        // Reconnect after 5 seconds if connection drops
        setTimeout(() => this.initSSE(), 5000);
      };
    } catch (e) {}
  },

  // ── BroadcastChannel (Cross-Tab Instant Sync in Same Browser) ─
  initBroadcastChannel() {
    if (typeof BroadcastChannel === 'undefined') return;
    try {
      const channel = new BroadcastChannel('vk_sync');
      channel.onmessage = (e) => {
        const type = e.data?.type || e.data;
        if (type === 'projects-updated' || type === 'all-updated') this.fetchProjects();
        if (type === 'reviews-updated' || type === 'all-updated') this.fetchReviews();
        if (type === 'settings-updated' || type === 'all-updated') this.fetchSettings();
      };
    } catch (e) {}
  },

  // ── Listeners & Initialization ──────────────────────────────
  init() {
    // Initial fetch
    this.fetchAll();

    // Push channels
    this.initSSE();
    this.initBroadcastChannel();

    // Re-fetch when user switches back to this tab
    window.addEventListener('focus', () => this.fetchAll());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.fetchAll();
    });

    // Light heartbeat poll (every 10s only when visible) as reliable safety net
    setInterval(() => {
      if (document.visibilityState === 'visible') this.fetchAll();
    }, 10000);
  }
};

window.VKREATE_SYNC = VKREATE_SYNC;

// Boot synchronization engine immediately
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => VKREATE_SYNC.init());
} else {
  VKREATE_SYNC.init();
}
