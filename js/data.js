// ============================================================
// VKREATE — Static Data Layer
// ============================================================

// Force-purge stale mobile local storage cache
(function purgeStaleMobileStorage() {
  try {
    const PURGE_KEY = 'vk_purge_v6';
    if (localStorage.getItem('vk_purge_key') !== PURGE_KEY) {
      localStorage.removeItem('vk_reviews');
      localStorage.removeItem('vk_admin_projects');
      localStorage.removeItem('vk_admin_reviews');
      localStorage.setItem('vk_purge_key', PURGE_KEY);
    }
  } catch (e) {}
})();

window.VKREATE_DATA = {

  projects: [
    {
      id: "lilaa-restaurant",
      name: "Lilaa — Malayali Cuisine",
      client: "Lilaa Hospitality & Dining Co.",
      industry: "restaurant",
      industryLabel: "Restaurants & Cafes",
      location: "Calicut, Kerala",
      area: "2,500 sq ft",
      budgetRange: "₹25L – ₹35L",
      duration: "4 months",
      completionDate: "Q2 2025",
      rating: 5,
      thumbnail: "assets/images/project_lilaa_1.jpg",
      images: [
        "assets/images/project_lilaa_1.jpg",
        "assets/images/project_lilaa_2.png",
        "assets/images/project_lilaa_3.png",
        "assets/images/project_lilaa_4.jpg",
        "assets/images/project_lilaa_5.png",
        "assets/images/project_lilaa_6.jpg",
        "assets/images/project_lilaa_7.png",
        "assets/images/project_lilaa_8.jpg",
        "assets/images/project_lilaa_9.png"
      ],
      beforeImage: "assets/images/project_lilaa_8.jpg",
      afterImage: "assets/images/project_lilaa_1.jpg",
      tagline: "Capturing warmth & sophistication in every detail",
      challenge: "Transform an underutilized mall space into a premium dining destination with a brand-driven, authentic yet modern ambiance.",
      solution: "Multi-zone dining experience combining intimate booth seating, communal long-table areas, and a lounge with arched niches, vertical ribbed wood panels, custom pendant chandeliers, and a warm cream/beige palette.",
      result: "Functional elegance delivering a 30% increase in table turns, 100% weekend reservation capacity, and a distinctive brand experience.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: null,
      metrics: { sqft: "2,500", seatingCapacity: 85, reservationWait: "100% full", timeline: "4 months" }
    },
    {
      id: "luxury-salon",
      name: "Wings Luxury Beauty & Wellness",
      client: "Wings Wellness Group",
      industry: "beauty",
      industryLabel: "Beauty & Wellness",
      location: "Kochi, Kerala",
      area: "2,200 sq ft",
      budgetRange: "₹18L – ₹25L",
      duration: "3 months",
      completionDate: "04/2025",
      rating: 5,
      thumbnail: "assets/images/project_salon_3.png",
      images: [
        "assets/images/project_salon_3.png",
        "assets/images/project_salon_4.png",
        "assets/images/project_salon_5.png",
        "assets/images/project_salon_6.png",
        "assets/images/project_salon_1.png",
        "assets/images/project_salon_2.png"
      ],
      beforeImage: "assets/images/project_salon_6.png",
      afterImage: "assets/images/project_salon_3.png",
      tagline: "Where luxury self-care meets architectural serenity",
      challenge: "Create a luxurious, Instagram-ready beauty salon that feels intimate yet spacious, providing privacy for premium treatments without compromising flow.",
      solution: "Individual styling pods with oversized illuminated circular LED mirrors, a private pedicure suite with acoustic drapery, botanical flamingo wallpaper murals in terracotta tones, and custom gold-accented styling stations.",
      result: "Elevated brand positioning with improved staff workflow, a 45% increase in repeat bookings, and high client retention.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: null,
      metrics: { sqft: "2,200", pods: 6, retentionRate: "92%", timeline: "3 months" }
    },
    {
      id: "retail-jewellery",
      name: "Wings Jewellery & Retail Showroom",
      client: "Wings Retail & Gold",
      industry: "retail",
      industryLabel: "Jewellery & Retail",
      location: "Calicut, Kerala",
      area: "1,800 sq ft",
      budgetRange: "₹12L – ₹18L",
      duration: "2 months",
      completionDate: "02/2025",
      rating: 5,
      thumbnail: "assets/images/project_jewellery_1.jpg",
      images: [
        "assets/images/project_jewellery_1.jpg",
        "assets/images/project_jewellery_2.jpg",
        "assets/images/project_jewellery_3.jpg",
        "assets/images/project_jewellery_4.jpg"
      ],
      beforeImage: "assets/images/project_jewellery_4.jpg",
      afterImage: "assets/images/project_jewellery_1.jpg",
      tagline: "An iconic mall facade that turns footfall into fascination",
      challenge: "Stand out in a busy luxury mall corridor with limited square footage while creating clear sightlines for high-value merchandise.",
      solution: "High-impact storefront featuring grand arched maroon grid glass windows, a backlit diamond-cut mirror feature wall with glowing gold 'Wings' branding, and precision micro-spotlighting for display cases.",
      result: "40% increase in mall corridor foot traffic, longer average store dwell time, and enhanced brand prestige.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: null,
      metrics: { sqft: "1,800", footTraffic: "+40%", conversionLift: "+32%", timeline: "2 months" }
    },
    {
      id: "corporate-lounge",
      name: "Corporate VIP Reception & Lounge",
      client: "Apex Zenith Global",
      industry: "office",
      industryLabel: "Offices & Workspaces",
      location: "Kochi, Kerala",
      area: "2,900 sq ft",
      budgetRange: "₹15L – ₹20L",
      duration: "2.5 months",
      completionDate: "01/2025",
      rating: 5,
      thumbnail: "assets/images/project_lounge.png",
      images: [
        "assets/images/project_lounge.png",
        "assets/images/project_lilaa_5.png"
      ],
      beforeImage: "assets/images/project_lilaa_5.png",
      afterImage: "assets/images/project_lounge.png",
      tagline: "First impressions crafted with sculptural elegance",
      challenge: "Design an executive reception and waiting lounge that conveys prestige, hospitality, and privacy for high-net-worth corporate visitors.",
      solution: "Sculptural cream armchairs, warm indirect LED ceiling troffers, organic cloud pendant chandeliers, vertical ribbed acoustic timber panels, and a terrazzo pathway guiding visitors to private consultation suites.",
      result: "Enhanced client-facing experience reinforcing Apex Zenith's market position, leading to positive feedback from international delegates.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: null,
      metrics: { sqft: "2,900", satisfaction: "98%", executiveZones: 4, timeline: "2.5 months" }
    }
  ],

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
      projectLink: "lilaa-restaurant"
    },
    {
      id: "fitout-contracting",
      num: "02",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 38V18l14-10 14 10v20a2 2 0 01-2 2H12a2 2 0 01-2-2z" stroke="currentColor" stroke-width="2"/><path d="M18 40V24h12v16" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "Fit-Out & Contracting",
      subtitle: "Tendering · On-Site Management · Partitioning",
      description: "Execution phase where design plans are physically realized. Involves competitive tendering, project scheduling, on-site construction management, and built-in components.",
      features: ["On-Site Management", "Project Scheduling", "Finishes & Partitioning", "Tendering"],
      projectLink: "luxury-salon"
    },
    {
      id: "design-build",
      num: "03",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 8l8-4 8 4M24 20v12M16 26h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Design + Build",
      subtitle: "Single Entity · Streamlined · Fast Delivery",
      description: "Integrated project delivery model where a single entity manages both design and construction. Streamlines communication and ensures faster completion.",
      features: ["Single-Entity Delivery", "Risk Reduction", "Overlapped Timelines", "Seamless Comms"],
      projectLink: "retail-jewellery"
    },
    {
      id: "brand-integration",
      num: "04",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/><path d="M24 14l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" fill="currentColor"/></svg>`,
      title: "Brand Integration",
      subtitle: "Identity · Experiential · Narrative",
      description: "Strategic step ensuring the physical space acts as a tangible extension of your organization's identity, values, and culture through bespoke touchpoints.",
      features: ["Brand Identity", "Bespoke Elements", "Experiential Touchpoints", "Culture"],
      projectLink: "corporate-lounge"
    },
    {
      id: "3d-visualisation",
      num: "05",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 4L6 14v20l18 10 18-10V14L24 4z" stroke="currentColor" stroke-width="2"/><path d="M24 24L6 14M24 24l18-10M24 24v20" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "3D Visualisation",
      subtitle: "Photorealistic · VR Walkthroughs · Renders",
      description: "Powerful tool generating photorealistic imagery, virtual reality (VR) walkthroughs, and rendered videos allowing stakeholders to approve finishes before construction.",
      features: ["Photorealistic Renders", "VR Walkthroughs", "Rendered Videos", "Finish Approval"],
      projectLink: "lilaa-restaurant"
    },
    {
      id: "material-detailing",
      num: "06",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 8h32v32H8V8z" stroke="currentColor" stroke-width="2"/><path d="M16 8v32M32 8v32M8 16h32M8 32h32" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`,
      title: "Material Detailing",
      subtitle: "Construction Drawings · Joinery · Specs",
      description: "Technical process of creating precise, highly-detailed construction drawings specifying how materials meet, join, and integrate for longevity and quality.",
      features: ["Construction Drawings", "Material Joinery", "Technical Compliance", "Bespoke Specs"],
      projectLink: "luxury-salon"
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
      bio: "Specialises in hospitality, restaurant, and retail environments. Her material instincts defined Lilaa Restaurant and Wings Salon.",
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
    { value: "4", label: "Projects Completed" },
    { value: "12+", label: "Years of Excellence" },
    { value: "4.9", label: "Average Rating" },
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

  reviews: []
};

// ============================================================
// ImageDB Reader — resolves idb: image references from IndexedDB
// (same DB used by the admin dashboard)
// ============================================================
const ImageDBReader = {
  _db: null,
  open() {
    return new Promise((resolve, reject) => {
      if (this._db) return resolve(this._db);
      const req = indexedDB.open('vkreate_images', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
      };
      req.onsuccess  = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror    = (e) => reject(e.target.error);
    });
  },
  async get(key) {
    try {
      const db = await this.open();
      return new Promise((resolve) => {
        const tx = db.transaction('images', 'readonly');
        const req = tx.objectStore('images').get(key);
        req.onsuccess = (e) => resolve(e.target.result?.dataUrl || null);
        req.onerror   = () => resolve(null);
      });
    } catch { return null; }
  },
  async resolve(ref) {
    if (!ref || typeof ref !== 'string') return ref;
    if (ref.startsWith('idb:')) return (await this.get(ref.slice(4))) || 'assets/images/project_lilaa_1.jpg';
    return ref;
  },
  async resolveProject(proj) {
    // Replace all idb: refs in a project with real dataURLs
    const has = (v) => v && typeof v === 'string' && v.startsWith('idb:');
    if (has(proj.thumbnail))   proj.thumbnail   = await this.resolve(proj.thumbnail);
    if (has(proj.afterImage))  proj.afterImage   = await this.resolve(proj.afterImage);
    if (has(proj.beforeImage)) proj.beforeImage  = await this.resolve(proj.beforeImage);
    if (proj.images) {
      proj.images = await Promise.all(proj.images.map(img => this.resolve(img)));
    }
    return proj;
  },
};
var VKREATE_DATA = window.VKREATE_DATA;

function getDeletedProjectIds() {
  try {
    const raw = localStorage.getItem('vk_admin_deleted_projects');
    return raw ? (JSON.parse(raw) || []) : [];
  } catch (e) {
    return [];
  }
}

function applyAdminProjects(adminProjects) {
  const deletedIds = getDeletedProjectIds();
  const deletedSet = new Set(deletedIds);

  const fixPath = (p) => {
    if (!p || typeof p !== 'string') return '';
    if (p.startsWith('data:') || p.startsWith('http://') || p.startsWith('https://') || p.startsWith('idb:')) return p;
    return p.replace(/^(\.\.\/)+/, '');
  };

  // If server/admin dataset is explicitly provided as an array, use it as single source of truth
  if (Array.isArray(adminProjects)) {
    const rawList = adminProjects.filter(p => p && p.id && !deletedSet.has(p.id));
    const finalProjects = rawList.map(adminP => {
      const rawThumb = adminP.thumbnail || (adminP.images && adminP.images[0]) || adminP.cover || '';
      const thumb = fixPath(rawThumb) || '';
      const imgs = (adminP.images && adminP.images.length) ? adminP.images.map(fixPath) : (thumb ? [thumb] : []);

      return {
        id: adminP.id,
        name: adminP.name || 'Untitled Project',
        client: adminP.client || adminP.clientName || 'Client',
        industry: adminP.industry || 'restaurant',
        industryLabel: adminP.industryLabel || adminP.industry || 'Commercial',
        location: adminP.location || 'Kerala, India',
        area: adminP.area || '',
        budgetRange: adminP.budgetRange || '',
        duration: adminP.duration || '',
        completionDate: adminP.completionDate || '',
        rating: adminP.rating || adminP.testimonial?.rating || 5,
        rank: typeof adminP.rank === 'number' ? adminP.rank : (parseInt(adminP.rank) || 99),
        thumbnail: thumb,
        images: imgs,
        beforeImage: fixPath(adminP.beforeImage) || imgs[0] || '',
        afterImage: fixPath(adminP.afterImage) || thumb,
        tagline: adminP.tagline || (adminP.solution ? adminP.solution.slice(0, 70) + '...' : 'Designed by VKREATE Studio'),
        challenge: adminP.challenge || '',
        solution: adminP.solution || '',
        result: adminP.result || '',
        processPhases: (adminP.processPhases && adminP.processPhases.length) ? adminP.processPhases : ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
        testimonial: adminP.testimonial?.text ? adminP.testimonial : (adminP.testimonial ? { author: adminP.clientName || 'Client', role: adminP.clientRole || 'Owner', text: adminP.testimonial } : null),
        metrics: adminP.metrics || { sqft: adminP.area || '', satisfaction: '100%' }
      };
    });

    VKREATE_DATA.projects = finalProjects;
    if (VKREATE_DATA.stats && VKREATE_DATA.stats[0]) {
      VKREATE_DATA.stats[0].value = finalProjects.length.toString();
    }
    return;
  }

  // Fallback static original projects list (only if no dataset loaded)
  const staticOriginals = [
    {
      id: "lilaa-restaurant",
      name: "Lilaa — Malayali Cuisine",
      client: "Lilaa Hospitality & Dining Co.",
      industry: "restaurant",
      industryLabel: "Restaurants & Cafes",
      location: "Calicut, Kerala",
      area: "2,500 sq ft",
      budgetRange: "₹25L – ₹35L",
      duration: "4 months",
      completionDate: "Q2 2025",
      rating: 5,
      thumbnail: "assets/images/project_lilaa_1.jpg",
      images: [
        "assets/images/project_lilaa_1.jpg",
        "assets/images/project_lilaa_2.png",
        "assets/images/project_lilaa_3.png",
        "assets/images/project_lilaa_4.jpg",
        "assets/images/project_lilaa_5.png",
        "assets/images/project_lilaa_6.jpg",
        "assets/images/project_lilaa_7.png",
        "assets/images/project_lilaa_8.jpg",
        "assets/images/project_lilaa_9.png"
      ],
      beforeImage: "assets/images/project_lilaa_8.jpg",
      afterImage: "assets/images/project_lilaa_1.jpg",
      tagline: "Capturing warmth & sophistication in every detail",
      challenge: "Transform an underutilized mall space into a premium dining destination with a brand-driven, authentic yet modern ambiance.",
      solution: "Multi-zone dining experience combining intimate booth seating, communal long-table areas, and a lounge with arched niches, vertical ribbed wood panels, custom pendant chandeliers, and a warm cream/beige palette.",
      result: "Functional elegance delivering a 30% increase in table turns, 100% weekend reservation capacity, and a distinctive brand experience.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Unnikrishnan Nair",
        role: "Founder & Owner, Lilaa Hospitality",
        text: "VKREATE captured our brand's warmth and sophistication in every detail. The arched niches, warm lighting, and seating layout elevated our entire dining experience. The space speaks for itself."
      },
      metrics: { sqft: "2,500", seatingCapacity: 85, reservationWait: "100% full", timeline: "4 months" }
    },
    {
      id: "luxury-salon",
      name: "Wings Luxury Beauty & Wellness",
      client: "Wings Wellness Group",
      industry: "beauty",
      industryLabel: "Beauty & Wellness",
      location: "Kochi, Kerala",
      area: "2,200 sq ft",
      budgetRange: "₹18L – ₹25L",
      duration: "3 months",
      completionDate: "04/2025",
      rating: 5,
      thumbnail: "assets/images/project_salon_3.png",
      images: [
        "assets/images/project_salon_3.png",
        "assets/images/project_salon.png",
        "assets/images/project_salon_1.png",
        "assets/images/project_salon_2.png",
        "assets/images/project_salon_4.png",
        "assets/images/project_salon_5.png",
        "assets/images/project_salon_6.png"
      ],
      beforeImage: "assets/images/project_salon_1.png",
      afterImage: "assets/images/project_salon_3.png",
      tagline: "Unwinding luxury crafted into every square foot",
      challenge: "Create a luxurious, Instagram-ready salon and spa that feels intimate yet spacious on a tight footprint.",
      solution: "Individual styling pods with integrated LED vanity mirrors, a dedicated private pedicure suite, and botanical accent wall murals.",
      result: "45% increase in repeat bookings and glowing client feedback from day one.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Dr. Reshma Menon",
        role: "Salon Director, Wings Wellness",
        text: "Our clients feel like they're stepping into a 5-star spa retreat. The private styling pods and botanical murals created an ambiance that keeps customers coming back."
      },
      metrics: { sqft: "2,200", pods: 6, repeatBookingRate: "+45%", timeline: "3 months" }
    },
    {
      id: "retail-jewellery",
      name: "Wings Jewellery & Retail Showroom",
      client: "Wings Retail International",
      industry: "retail",
      industryLabel: "Jewellery & Retail",
      location: "Calicut, Kerala",
      area: "1,800 sq ft",
      budgetRange: "₹12L – ₹18L",
      duration: "2 months",
      completionDate: "02/2025",
      rating: 5,
      thumbnail: "assets/images/project_jewellery_1.jpg",
      images: [
        "assets/images/project_jewellery_1.jpg",
        "assets/images/project_jewellery_2.jpg",
        "assets/images/project_jewellery_3.jpg",
        "assets/images/project_jewellery_4.jpg",
        "assets/images/project_jewellery.png"
      ],
      beforeImage: "assets/images/project_jewellery_3.jpg",
      afterImage: "assets/images/project_jewellery_1.jpg",
      tagline: "Illuminating brilliance through architectural precision",
      challenge: "Stand out in a busy luxury mall corridor with limited square footage and strict illumination requirements.",
      solution: "High-impact storefront featuring grand arched maroon grid glass windows, a diamond-cut mirror feature wall, and precision spotlighting.",
      result: "40% increase in corridor foot traffic and a 32% conversion lift within the first quarter.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Faisal Rahman",
        role: "Brand Manager, Wings Retail",
        text: "The design makes our jewellery the hero. The arched glass storefront draws people in from across the mall."
      },
      metrics: { sqft: "1,800", footTraffic: "+40%", conversionLift: "+32%", timeline: "2 months" }
    },
    {
      id: "corporate-lounge",
      name: "Corporate VIP Reception & Lounge",
      client: "Apex Zenith Group",
      industry: "office",
      industryLabel: "Offices & Workspaces",
      location: "Kochi, Kerala",
      area: "2,900 sq ft",
      budgetRange: "₹15L – ₹20L",
      duration: "2.5 months",
      completionDate: "01/2025",
      rating: 5,
      thumbnail: "assets/images/project_lounge.png",
      images: [
        "assets/images/project_lounge.png",
        "assets/images/project_lilaa_5.png"
      ],
      beforeImage: "assets/images/project_lilaa_5.png",
      afterImage: "assets/images/project_lounge.png",
      tagline: "Elegance meets executive presence",
      challenge: "Design an executive reception and waiting lounge that conveys prestige, hospitality, and privacy.",
      solution: "Sculptural cream armchairs, warm indirect LED ceiling troffers, organic cloud pendant chandeliers, and acoustic fabric wall panels.",
      result: "98% executive visitor satisfaction rating and reinforced brand authority.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Sameer Varma",
        role: "Corporate Director, Apex Zenith",
        text: "First impressions matter immensely in corporate business. VKREATE created a reception lounge that immediately commands respect and instills confidence."
      },
      metrics: { sqft: "2,900", executiveRating: "98%", timeline: "2.5 months" }
    }
  ];

  staticOriginals.forEach(staticP => {
    if (deletedSet.has(staticP.id)) return;
    if (adminProjMap.has(staticP.id)) {
      const adminP = adminProjMap.get(staticP.id);
      if (adminP.status === 'published') {
        const adminImgs = (adminP.images && adminP.images.length) ? adminP.images.map(fixPath) : null;
        const adminThumb = fixPath(adminP.thumbnail) || (adminImgs && adminImgs[0]) || null;

        finalProjects.push({
          ...staticP,
          name: adminP.name || staticP.name,
          industry: adminP.industry || staticP.industry,
          industryLabel: adminP.industryLabel || staticP.industryLabel,
          location: adminP.location || staticP.location,
          area: adminP.area || staticP.area,
          duration: adminP.duration || staticP.duration,
          budgetRange: adminP.budgetRange || staticP.budgetRange,
          rank: typeof adminP.rank === 'number' ? adminP.rank : (staticP.rank || 99),
          thumbnail: adminThumb || staticP.thumbnail,
          images: adminImgs || staticP.images,
          beforeImage: (adminImgs && adminImgs[1]) || (adminImgs && adminImgs[0]) || staticP.beforeImage,
          afterImage: adminThumb || staticP.afterImage,
          challenge: adminP.challenge || staticP.challenge,
          solution: adminP.solution || staticP.solution,
          result: adminP.result || staticP.result,
          testimonial: adminP.testimonial?.text ? {
            author: adminP.testimonial.author,
            role: adminP.testimonial.role,
            text: adminP.testimonial.text,
            rating: adminP.testimonial.rating || 5
          } : null
        });
      }
    } else if (!hasAdminDataset) {
      finalProjects.push(staticP);
    }
  });

  // B. Process custom admin-created projects
  rawList.forEach(adminP => {
    if (adminP.status === 'published' && !staticOriginals.some(sp => sp.id === adminP.id)) {
      const rawThumb = adminP.thumbnail || (adminP.images && adminP.images[0]) || '';
      const thumb = fixPath(rawThumb) || 'assets/images/project_lilaa_1.jpg';
      const imgs = (adminP.images && adminP.images.length) ? adminP.images.map(fixPath) : [thumb];

      finalProjects.push({
        id: adminP.id,
        name: adminP.name || 'Untitled Project',
        client: adminP.client || adminP.testimonial?.author || 'Client',
        industry: adminP.industry || 'restaurant',
        industryLabel: adminP.industryLabel || adminP.industry || 'Commercial',
        location: adminP.location || 'Kerala, India',
        area: adminP.area || '2,000 sq ft',
        budgetRange: adminP.budgetRange || '',
        duration: adminP.duration || '3 months',
        completionDate: adminP.completionDate || '',
        rating: adminP.testimonial?.rating || 5,
        rank: typeof adminP.rank === 'number' ? adminP.rank : (parseInt(adminP.rank) || 99),
        thumbnail: thumb,
        images: imgs,
        beforeImage: fixPath(adminP.beforeImage) || imgs[0],
        afterImage: fixPath(adminP.afterImage) || thumb,
        tagline: adminP.tagline || (adminP.solution ? adminP.solution.slice(0, 70) + '...' : 'Designed by VKREATE Studio'),
        challenge: adminP.challenge || 'Design a high-impact interior tailored to client vision.',
        solution: adminP.solution || 'Integrated spatial strategy combining ambient lighting, bespoke materials, and ergonomic layouts.',
        result: adminP.result || 'Delivered on time with 100% client satisfaction.',
        processPhases: (adminP.processPhases && adminP.processPhases.length) ? adminP.processPhases : ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
        testimonial: adminP.testimonial?.text ? adminP.testimonial : { author: 'Client', role: 'Owner', text: 'VKREATE delivered a stunning interior transformation.' },
        metrics: adminP.metrics || { sqft: adminP.area || '2,000', satisfaction: '100%' }
      });
    }
  });

  VKREATE_DATA.projects = finalProjects;
  if (VKREATE_DATA.stats && VKREATE_DATA.stats[0]) {
    VKREATE_DATA.stats[0].value = finalProjects.length.toString();
  }
}

// ============================================================
// Sync Engine — Full-Duplex Admin Dashboard & Website Sync
// ============================================================
(function syncEngine() {
  try {
    // ── 1. LocalStorage Sync ─────────────────────────────────
    const rawProjects = localStorage.getItem('vk_admin_projects');
    if (rawProjects !== null) {
      try {
        const adminProjects = JSON.parse(rawProjects);
        if (Array.isArray(adminProjects)) {
          applyAdminProjects(adminProjects);
        }
      } catch (e) {}
    } else {
      const deletedIds = getDeletedProjectIds();
      if (deletedIds.length > 0 && Array.isArray(VKREATE_DATA.projects)) {
        const deletedSet = new Set(deletedIds);
        VKREATE_DATA.projects = VKREATE_DATA.projects.filter(p => p && p.id && !deletedSet.has(p.id));
      }
    }

    // ── 2. Reviews Sync ──────────────────────────────────────
    const deletedReviewIds = getDeletedReviewIds();
    const rawReviews = localStorage.getItem('vk_admin_reviews');
    if (rawReviews !== null) {
      try {
        const adminReviews = JSON.parse(rawReviews);
        if (Array.isArray(adminReviews)) {
          applyAdminReviews(adminReviews);
        }
      } catch (e) {}
    } else {
      if (Array.isArray(VKREATE_DATA.reviews)) {
        VKREATE_DATA.reviews = VKREATE_DATA.reviews.filter(r => !isDeletedReview(r, deletedReviewIds));
      }
    }

    // ── 3. Studio Settings Sync ──────────────────────────────
    VKREATE_DATA.studio = {
      name: 'Vkreate Interior Architecture',
      tagline: 'Where Design Speaks',
      email: 'vkreatearchitecture@gmail.com',
      phone: '+91 90371 61861',
      address: 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016',
      mapsUrl: 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw',
      instagram: 'https://www.instagram.com/vkreate_interior_architecture',
      website: 'https://vkreatearchitecture.com'
    };
    const rawSettings = localStorage.getItem('vk_admin_settings');
    if (rawSettings) {
      try {
        const settings = JSON.parse(rawSettings);
        if (settings.studio) {
          settings.studio.name = 'Vkreate Interior Architecture';
          settings.studio.email = 'vkreatearchitecture@gmail.com';
          settings.studio.address = 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016';
          settings.studio.mapsUrl = 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw';
          localStorage.setItem('vk_admin_settings', JSON.stringify(settings));
          VKREATE_DATA.studio = settings.studio;
        }
      } catch (err) {}
    }

  } catch (e) {
    console.warn('Error in syncEngine:', e);
  }
})();

function getDeletedReviewIds() {
  try {
    return JSON.parse(localStorage.getItem('vk_admin_deleted_reviews')) || [];
  } catch (e) {
    return [];
  }
}

function isDeletedReview(r, deletedIds) {
  if (!r || !deletedIds || !deletedIds.length) return false;
  const strSet = new Set(deletedIds.map(id => String(id)));
  if (r.id && (strSet.has(String(r.id)) || deletedIds.includes(r.id))) return true;
  if (r.projectId && (strSet.has(String(r.projectId)) || strSet.has('proj:' + String(r.projectId)))) return true;
  const name = (r.clientName || r.author || '').toLowerCase().trim();
  if (name && (strSet.has(name) || strSet.has('name:' + name))) return true;
  return false;
}

const staticDefaultReviews = [];

function applyAdminReviews(adminReviews, hasAdminSource = false) {
  const deletedIds = getDeletedReviewIds();
  const reviewsMap = new Map();

  // Always seed static default showcase reviews first (unless deleted)
  staticDefaultReviews.forEach(r => {
    if (!isDeletedReview(r, deletedIds)) {
      reviewsMap.set(r.id, r);
    }
  });

  if (Array.isArray(adminReviews)) {
    adminReviews.forEach(r => {
      const isApproved = r.status === 'approved' || (r.status !== 'pending' && r.status !== 'rejected' && r.verified === true);
      if (isApproved && !isDeletedReview(r, deletedIds)) {
        let industry = r.industry || 'restaurant';
        if (r.projectId && VKREATE_DATA.projects) {
          const proj = VKREATE_DATA.projects.find(p => p.id === r.projectId);
          if (proj) industry = proj.industry;
        }
        const dateFormatted = r.createdAt
          ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : (r.date || 'Recent');

        // Unranked approved user reviews default to rank 0 so they appear at the top of the grid
        const computedRank = typeof r.rank === 'number' ? r.rank : (parseInt(r.rank) === 0 ? 0 : (parseInt(r.rank) || 0));

        reviewsMap.set(r.id, {
          id: r.id,
          projectId: r.projectId || 'general',
          author: r.clientName || r.author || 'Client',
          role: r.clientRole || r.role || 'Client',
          industry: r.industry || industry,
          rating: r.rating || 5,
          rank: computedRank,
          date: dateFormatted,
          text: r.reviewText || r.text || '',
          verified: true,
          status: 'approved',
          studioResponse: r.studioResponse || ''
        });
      }
    });
  }

  const resultList = Array.from(reviewsMap.values());
  resultList.sort((a, b) => (typeof a.rank === 'number' ? a.rank : 0) - (typeof b.rank === 'number' ? b.rank : 0));
  VKREATE_DATA.reviews = resultList;
}

// ============================================================
function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location) {
    const h = window.location.hostname;
    const p = window.location.port;
    const proto = window.location.protocol || 'http:';
    if (p !== '3000' && p !== '' && p !== '80' && p !== '443') {
      return `${proto}//${h}:3000`;
    }
  }
  return '';
}

// Remote Admin-Projects & Reviews Sync (API, SSE & JSON Fallback)
// ============================================================
const syncChannelLive = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('vk_sync') : null;

async function loadRemoteAdminProjects() {
  try {
    let remoteProjects = null;
    let remoteDeleted = [];
    try {
      const res = await fetch(getApiBaseUrl() + '/api/projects?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          remoteProjects = raw;
        } else if (raw && typeof raw === 'object') {
          remoteProjects = Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.projects) ? raw.projects : null);
          remoteDeleted = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
        }
      }
    } catch (e) {}

    if (!remoteProjects) {
      try {
        const res = await fetch('js/admin-projects.json?t=' + Date.now());
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw)) {
            remoteProjects = raw;
          } else if (raw && typeof raw === 'object') {
            remoteProjects = Array.isArray(raw.items) ? raw.items : null;
            remoteDeleted = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
          }
        }
      } catch (e) {}
    }

    if (remoteDeleted.length > 0) {
      try {
        const currentDeleted = getDeletedProjectIds();
        const combined = Array.from(new Set([...currentDeleted, ...remoteDeleted]));
        localStorage.setItem('vk_admin_deleted_projects', JSON.stringify(combined));
      } catch (e) {}
    }

    if (Array.isArray(remoteProjects)) {
      try {
        const rawLocal = localStorage.getItem('vk_admin_projects');
        const currentLocal = rawLocal ? JSON.parse(rawLocal) : null;
        if (Array.isArray(currentLocal) && currentLocal.length > 0) {
          const localMap = new Map();
          currentLocal.forEach(p => { if (p && p.id) localMap.set(p.id, p); });
          remoteProjects = remoteProjects.map(remoteP => {
            if (!remoteP || !remoteP.id) return remoteP;
            const localP = localMap.get(remoteP.id);
            if (localP) {
              return { ...remoteP, ...localP };
            }
            return remoteP;
          });
        }
      } catch (e) {}

      const deletedIds = getDeletedProjectIds();
      const deletedSet = new Set(deletedIds);
      remoteProjects = remoteProjects.filter(p => p && p.id && !deletedSet.has(p.id));

      try { localStorage.setItem('vk_admin_projects', JSON.stringify(remoteProjects)); } catch (e) {}
      applyAdminProjects(remoteProjects);
      window.dispatchEvent(new CustomEvent('vkreate:projects-updated'));
    }
  } catch (e) {}
}

async function loadRemoteAdminReviews() {
  let remoteReviews = null;
  let remoteDeleted = [];
  try {
    const res = await fetch(getApiBaseUrl() + '/api/reviews?t=' + Date.now());
    if (res.ok) {
      const raw = await res.json();
      if (Array.isArray(raw)) {
        remoteReviews = raw;
      } else if (raw && typeof raw === 'object') {
        remoteReviews = Array.isArray(raw.items) ? raw.items : (Array.isArray(raw.reviews) ? raw.reviews : null);
        remoteDeleted = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
      }
    }
  } catch (e) {}

  if (!remoteReviews) {
    try {
      const res = await fetch('js/admin-reviews.json?t=' + Date.now());
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw)) {
          remoteReviews = raw;
        } else if (raw && typeof raw === 'object') {
          remoteReviews = Array.isArray(raw.items) ? raw.items : null;
          remoteDeleted = Array.isArray(raw.deletedIds) ? raw.deletedIds : [];
        }
      }
    } catch (e) {}
  }

  if (remoteDeleted.length > 0) {
    try {
      const currentDeleted = getDeletedReviewIds();
      const combined = Array.from(new Set([...currentDeleted, ...remoteDeleted.map(String)]));
      localStorage.setItem('vk_admin_deleted_reviews', JSON.stringify(combined));
    } catch (e) {}
  }

  const deletedIds = getDeletedReviewIds();
  if (Array.isArray(remoteReviews)) {
    remoteReviews = remoteReviews.filter(r => r && !isDeletedReview(r, deletedIds));

    // Preserve local approved/rejected status decisions & un-synced pending customer reviews
    try {
      const rawLocal = localStorage.getItem('vk_admin_reviews');
      const currentLocal = rawLocal ? JSON.parse(rawLocal) : null;
      if (Array.isArray(currentLocal) && currentLocal.length > 0) {
        const localMap = new Map();
        currentLocal.forEach(r => { if (r && r.id && !isDeletedReview(r, deletedIds)) localMap.set(String(r.id), r); });
        
        remoteReviews = remoteReviews.map(remoteItem => {
          if (!remoteItem || !remoteItem.id) return remoteItem;
          const localItem = localMap.get(String(remoteItem.id));
          if (localItem) {
            const localStatus = (localItem.status || 'pending').toLowerCase().trim();
            if (localStatus === 'approved' || localStatus === 'rejected') {
              return { ...remoteItem, ...localItem, status: localStatus };
            }
          }
          return remoteItem;
        });

        // Also keep any local-only reviews (e.g. submitted while offline or pending server write)
        const remoteIdSet = new Set(remoteReviews.map(r => r && String(r.id)).filter(Boolean));
        currentLocal.forEach(localItem => {
          if (localItem && localItem.id && !isDeletedReview(localItem, deletedIds)) {
            const idStr = String(localItem.id);
            const existsById = remoteIdSet.has(idStr);
            const existsByMatch = remoteReviews.some(r => r && (
              (r.clientEmail && localItem.clientEmail && r.clientEmail.toLowerCase() === localItem.clientEmail.toLowerCase() && r.reviewText === localItem.reviewText) ||
              (r.clientName === localItem.clientName && r.reviewText === localItem.reviewText)
            ));
            if (!existsById && !existsByMatch) {
              remoteReviews.unshift(localItem);
              remoteIdSet.add(idStr);
            }
          }
        });
      }
    } catch (e) {}

    remoteReviews = remoteReviews.filter(r => r && !isDeletedReview(r, deletedIds));

    // Authoritative update from server/database — store merged list
    try {
      localStorage.setItem('vk_admin_reviews', JSON.stringify(remoteReviews));
      localStorage.setItem('vk_reviews', JSON.stringify(remoteReviews));
    } catch (e) {}

    applyAdminReviews(remoteReviews, true);
  } else {
    VKREATE_DATA.reviews = [];
  }

  window.dispatchEvent(new CustomEvent('vkreate:reviews-updated'));
}

// Initial remote load
loadRemoteAdminProjects();
loadRemoteAdminReviews();

// ── Setup Live Sync Listeners ─────────────────────────────
if (syncChannelLive) {
  syncChannelLive.onmessage = (event) => {
    loadRemoteAdminProjects();
    loadRemoteAdminReviews();
  };
}

window.addEventListener('storage', function (e) {
  loadRemoteAdminProjects();
  loadRemoteAdminReviews();
});

// Active Multi-Device Background Sync Poller (every 5s)
setInterval(() => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    loadRemoteAdminProjects();
    loadRemoteAdminReviews();
  }
}, 5000);


// ============================================================
// Async IDB Reader & Resolution — resolve idb: image refs on public pages
// ============================================================
window.ImageDBReader = window.ImageDBReader || {
  _db: null,
  DB_NAME: 'vkreate_images',
  STORE: 'images',

  async open() {
    if (this._db) return this._db;
    return new Promise((resolve) => {
      try {
        if (typeof indexedDB === 'undefined') return resolve(null);
        const req = indexedDB.open(this.DB_NAME, 1);
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

(async function resolveIdbImages() {
  try {
    if (!window.VKREATE_DATA || !Array.isArray(window.VKREATE_DATA.projects)) return;
    const hasIdb = window.VKREATE_DATA.projects.some(p =>
      p && (
        (p.thumbnail || '').startsWith('idb:') ||
        (p.images || []).some(img => (img || '').startsWith('idb:'))
      )
    );
    if (!hasIdb) return;

    await Promise.all(window.VKREATE_DATA.projects.map(p => ImageDBReader.resolveProject(p)));
    window.dispatchEvent(new CustomEvent('vkreate:idb-resolved'));
  } catch (e) {
    console.warn('IDB image resolution error:', e);
  }
})();

