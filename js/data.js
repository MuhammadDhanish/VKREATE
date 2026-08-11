// ============================================================
// VKREATE — Static Data Layer
// ============================================================

const VKREATE_DATA = {

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
      testimonial: {
        author: "Dr. Reshma Menon",
        role: "Salon Director, Wings Wellness",
        text: "Our clients feel like they're stepping into a 5-star spa retreat. VKREATE's design elevated our entire brand perception. The private pedicure suite and vanity pods are guest favorites!"
      },
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
      testimonial: {
        author: "Faisal Rahman",
        role: "Brand Manager, Wings Retail",
        text: "The design makes our jewellery the hero. Customers spend significantly more time browsing, and our storefront is now the most recognizable facade in the entire mall."
      },
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
      thumbnail: "assets/images/project_lilaa_5.png",
      images: [
        "assets/images/project_lilaa_5.png",
        "assets/images/project_lilaa_4.jpg"
      ],
      beforeImage: "assets/images/project_lilaa_4.jpg",
      afterImage: "assets/images/project_lilaa_5.png",
      tagline: "First impressions crafted with sculptural elegance",
      challenge: "Design an executive reception and waiting lounge that conveys prestige, hospitality, and privacy for high-net-worth corporate visitors.",
      solution: "Sculptural cream armchairs, warm indirect LED ceiling troffers, organic cloud pendant chandeliers, vertical ribbed acoustic timber panels, and a terrazzo pathway guiding visitors to private consultation suites.",
      result: "Enhanced client-facing experience reinforcing Apex Zenith's market position, leading to positive feedback from international delegates.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Sameer Varma",
        role: "Corporate Director, Apex Zenith",
        text: "First impressions matter immensely in corporate business. VKREATE designed a VIP reception that speaks our core values immediately upon arrival."
      },
      metrics: { sqft: "2,900", satisfaction: "98%", executiveZones: 4, timeline: "2.5 months" }
    }
  ],

  reviews: [
    {
      id: "r-lilaa",
      projectId: "lilaa-restaurant",
      author: "Unnikrishnan Nair",
      role: "Founder & Owner, Lilaa Hospitality",
      industry: "restaurant",
      rating: 5,
      date: "May 2025",
      text: "VKREATE captured our brand's warmth and sophistication in every detail. The arched niches, warm lighting, and seating layout elevated our entire dining experience. The space speaks for itself.",
      verified: true
    },
    {
      id: "r-salon",
      projectId: "luxury-salon",
      author: "Dr. Reshma Menon",
      role: "Salon Director, Wings Wellness",
      industry: "beauty",
      rating: 5,
      date: "April 2025",
      text: "Our clients feel like they're stepping into a 5-star spa retreat. VKREATE's design elevated our entire brand perception. The private pedicure suite and vanity pods are guest favorites!",
      verified: true
    },
    {
      id: "r-jewellery",
      projectId: "retail-jewellery",
      author: "Faisal Rahman",
      role: "Brand Manager, Wings Retail",
      industry: "retail",
      rating: 5,
      date: "February 2025",
      text: "The design makes our jewellery the hero. Customers spend significantly more time browsing, and our storefront is now the most recognizable facade in the entire mall.",
      verified: true
    },
    {
      id: "r-lounge",
      projectId: "corporate-lounge",
      author: "Sameer Varma",
      role: "Corporate Director, Apex Zenith",
      industry: "office",
      rating: 5,
      date: "January 2025",
      text: "First impressions matter immensely in corporate business. VKREATE designed a VIP reception that speaks our core values immediately upon arrival.",
      verified: true
    }
  ],

  services: [
    {
      id: "commercial",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="36" height="28" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 14V10a2 2 0 012-2h12a2 2 0 012 2v4" stroke="currentColor" stroke-width="2"/><path d="M24 22v14M17 29h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Commercial & Workspaces",
      subtitle: "Corporate Suites · Reception Lounges · Offices",
      description: "We design executive work environments that project prestige and optimize productivity. From VIP waiting lounges to open-plan office transformations.",
      features: ["Executive lounge design", "Ergonomic space planning", "Acoustic timber walling", "Brand identity integration"],
      projectLink: "corporate-lounge"
    },
    {
      id: "restaurant",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 6v12c0 3.314 3.134 6 7 6h2c3.866 0 7-2.686 7-6V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 24v18M16 42h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 6v36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Restaurants & Dining",
      subtitle: "Malayali Cuisine · Fine Dining · Cafés",
      description: "Crafting mood-driven dining spaces with illuminated arched niches, warm acoustics, and custom booth seating that maximize guest experience and table turns.",
      features: ["Multi-zone dining planning", "Acoustic comfort design", "Custom millwork & seating", "Social-media ready ambiance"],
      projectLink: "lilaa-restaurant"
    },
    {
      id: "beauty",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="16" stroke="currentColor" stroke-width="2"/><path d="M24 14v10l7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Beauty & Wellness Salons",
      subtitle: "Luxury Salons · Pedicure Suites · Spas",
      description: "Designing Instagram-ready self-care sanctuaries with individual vanity pods, oversized LED circular mirrors, botanical murals, and serene drapery.",
      features: ["Individual vanity pod layout", "Acoustic drapery suites", "Botanical wall curation", "Shadow-free LED mirror lighting"],
      projectLink: "luxury-salon"
    },
    {
      id: "retail",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12l4-6h24l4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="12" width="36" height="30" rx="2" stroke="currentColor" stroke-width="2"/><path d="M30 22a6 6 0 01-12 0" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "Jewellery & Retail Showrooms",
      subtitle: "Mall Kiosks · Boutiques · Showrooms",
      description: "High-impact storefront facades with maroon arched window grids, backlit diamond mirror walls, and precision lighting that elevates merchandise.",
      features: ["Grand facade architecture", "Diamond mirror feature walls", "Micro-spotlight merchandise illumination", "High footfall conversion design"],
      projectLink: "retail-jewellery"
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
    { value: "85+", label: "Projects Completed" },
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
  ]

};
