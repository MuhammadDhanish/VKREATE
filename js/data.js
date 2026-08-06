// ============================================================
// VKREATE — Static Data Layer
// ============================================================

const VKREATE_DATA = {

  projects: [
    {
      id: "verdant-office",
      name: "The Verdant Office",
      client: "Synapse Technologies Pvt. Ltd.",
      industry: "office",
      industryLabel: "Corporate Office",
      location: "Bengaluru, India",
      area: "3,200 sq ft",
      budgetRange: "₹45L – ₹55L",
      duration: "4 months",
      completionDate: "03/2025",
      rating: 5,
      thumbnail: "assets/images/project_office.png",
      images: [
        "assets/images/project_office.png"
      ],
      beforeImage: "assets/images/project_office.png",
      afterImage: "assets/images/project_office.png",
      tagline: "Where productivity meets nature",
      challenge: "Synapse's legacy office felt disconnected and uninspiring — open grids of desks under harsh fluorescent light with zero identity. Employee retention surveys pointed to the environment as a key factor in dissatisfaction.",
      solution: "We reimagined the 3,200 sq ft space around a biophilic spine — a central green corridor with living walls that divides collaboration zones from focus pods. Deep green accent walls with indirect warm lighting replaced the harsh overhead grid. Custom millwork desks and acoustic partitions balanced openness with privacy.",
      result: "Occupancy satisfaction jumped from 61% to 94% in the first internal survey. Meeting room utilisation improved by 40%. The space was featured in three industry publications as a benchmark for employee-centric design.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Kavya Reddy",
        role: "Head of People & Culture",
        text: "VKREATE didn't just redesign our office — they redesigned how our team feels about coming to work. Every detail was considered with intent. The living wall alone sparked conversations we'd never had before. Their process was transparent, their timelines were met, and the result exceeded every expectation."
      },
      metrics: { sqft: "3,200", rooms: 12, satisfaction: "94%", timeline: "4 months" }
    },
    {
      id: "amber-kitchen",
      name: "Amber Kitchen & Bar",
      client: "Amber Hospitality Group",
      industry: "restaurant",
      industryLabel: "Restaurant",
      location: "Mumbai, India",
      area: "2,800 sq ft",
      budgetRange: "₹60L – ₹75L",
      duration: "5 months",
      completionDate: "11/2024",
      rating: 5,
      thumbnail: "assets/images/project_restaurant.png",
      images: ["assets/images/project_restaurant.png"],
      beforeImage: "assets/images/project_restaurant.png",
      afterImage: "assets/images/project_restaurant.png",
      tagline: "A sensory journey in every seat",
      challenge: "The client wanted a fine-dining experience that would photograph well, create an intimate atmosphere, and operate efficiently across a chaotic Mumbai dinner service — three goals that routinely conflict.",
      solution: "We designed around three distinct mood zones: a theatrical bar front with dramatic pendant constellations, an intimate main dining room with sage-green banquettes and plaster walls, and a private dining alcove wrapped in book-matched walnut veneer. The kitchen pass was designed as a feature — guests could see the choreography.",
      result: "Amber opened to full reservations within 48 hours of launch. Instagram reach in the first month exceeded 200K impressions organically. The private dining alcove now accounts for 35% of monthly revenue.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Rohan Mehta",
        role: "Founder, Amber Hospitality Group",
        text: "We gave VKREATE complete creative trust and they delivered something that became the identity of our brand. The three-zone concept was a revelation — we'd never thought of our space as storytelling. The result is a restaurant that guests talk about long before they discuss the food."
      },
      metrics: { sqft: "2,800", seatingCapacity: 78, reservationWait: "48hrs to full", timeline: "5 months" }
    },
    {
      id: "lumina-jewellers",
      name: "Lumina Fine Jewellers",
      client: "Lumina Retail Ventures",
      industry: "retail",
      industryLabel: "Retail & Jewellery",
      location: "Hyderabad, India",
      area: "1,600 sq ft",
      budgetRange: "₹35L – ₹45L",
      duration: "3 months",
      completionDate: "01/2025",
      rating: 5,
      thumbnail: "assets/images/project_retail.png",
      images: ["assets/images/project_retail.png"],
      beforeImage: "assets/images/project_retail.png",
      afterImage: "assets/images/project_retail.png",
      tagline: "Where every gem finds its stage",
      challenge: "Lumina's existing store was a conventional glass-case grid — jewellery was visible but not celebrated. Conversion rates were low because the space didn't inspire aspiration or trust.",
      solution: "We transformed the space into an experiential boutique. Custom illuminated display cases with precision spotlighting (4,000K for diamonds, 2,700K for gold) were paired with a deep forest green and brass palette. A dedicated VIP consultation suite was carved from back-of-house to serve HNI clients privately.",
      result: "Average transaction value increased 28% in the first quarter post-relaunch. Footfall-to-conversion improved from 18% to 31%. Three competitors enquired about the designer within two weeks of opening.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Priya Sundar",
        role: "Director, Lumina Retail Ventures",
        text: "VKREATE understood something fundamental: in jewellery retail, the environment is the first piece of jewelry a customer sees. They designed a space that commands the same reverence as our finest pieces. The VIP suite alone paid for the entire project in its first month."
      },
      metrics: { sqft: "1,600", conversionLift: "+72%", avgTransactionLift: "+28%", timeline: "3 months" }
    },
    {
      id: "serenity-medical",
      name: "Serenity Medical Centre",
      client: "Serenity Health Group",
      industry: "healthcare",
      industryLabel: "Healthcare",
      location: "Pune, India",
      area: "4,500 sq ft",
      budgetRange: "₹70L – ₹85L",
      duration: "6 months",
      completionDate: "09/2024",
      rating: 5,
      thumbnail: "assets/images/project_healthcare.png",
      images: ["assets/images/project_healthcare.png"],
      beforeImage: "assets/images/project_healthcare.png",
      afterImage: "assets/images/project_healthcare.png",
      tagline: "Healing begins before the consultation",
      challenge: "Healthcare environments suffer from clinical coldness that elevates patient anxiety. Serenity wanted a multi-specialty clinic that felt premium and calming — not institutional — while meeting all infection-control and wayfinding standards.",
      solution: "A biophilic design philosophy guided every decision: sage green and warm white throughout, indirect circadian lighting adjustable by zone, natural materials (wood-effect vinyl for hygiene, stone-effect panels) and a generous indoor garden in the waiting atrium. Navigation was embedded into the floor and ceiling design, eliminating the need for cluttered signage.",
      result: "Patient-reported anxiety scores at check-in dropped 22% versus the clinic's previous premises. Staff retention improved significantly, with several hires citing the work environment as a key factor. Press coverage in two healthcare design journals followed.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Dr. Anand Krishnamurthy",
        role: "Medical Director, Serenity Health",
        text: "We've always believed that healing environments matter. VKREATE proved it. Patients comment on the space before they comment on their treatment. The biophilic waiting area has reduced perceived wait times — people are calmer, staff are happier, and outcomes are measurably better."
      },
      metrics: { sqft: "4,500", anxietyReduction: "22%", specialties: 8, timeline: "6 months" }
    },
    {
      id: "grand-atrium-hotel",
      name: "The Grand Atrium Hotel",
      client: "Grand Atrium Hospitality Ltd.",
      industry: "hospitality",
      industryLabel: "Hospitality",
      location: "Goa, India",
      area: "12,000 sq ft",
      budgetRange: "₹2.8Cr – ₹3.2Cr",
      duration: "10 months",
      completionDate: "12/2024",
      rating: 5,
      thumbnail: "assets/images/project_hotel.png",
      images: ["assets/images/project_hotel.png"],
      beforeImage: "assets/images/project_hotel.png",
      afterImage: "assets/images/project_hotel.png",
      tagline: "A lobby you check into before you check in",
      challenge: "The hotel was mid-renovation with a generic international aesthetic that had no sense of place. The ownership wanted a transformation that honoured Goa's Portuguese-Indian design heritage while projecting a world-class luxury positioning.",
      solution: "We developed a design language we called 'Colonial Botanics' — forest green marble floors with geometric brass inlay referencing azulejo tile patterns, sweeping curved staircases in white marble, and a 7-metre living plant installation at the atrium centre. All FF&E was custom, blending local artisanship with European finishing techniques.",
      result: "TripAdvisor score jumped from 3.9 to 4.7 within 6 months of reopening. ADR (average daily rate) increased 34%. The atrium has become a destination in itself, driving F&B revenue from non-residents.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Vikram Nair",
        role: "Managing Director, Grand Atrium Hospitality",
        text: "VKREATE took an ambitious brief — honour our history, project world-class luxury, and feel unmistakably Goan — and delivered on every dimension. The lobby is now cited in every review. Guests spend time there they hadn't planned. That is what great design does."
      },
      metrics: { sqft: "12,000", adrIncrease: "+34%", tripadvisor: "4.7/5", timeline: "10 months" }
    },
    {
      id: "casa-verde-villa",
      name: "Casa Verde Villa",
      client: "Private Client (Confidential)",
      industry: "villa",
      industryLabel: "Residential Villa",
      location: "Chennai, India",
      area: "6,800 sq ft",
      budgetRange: "₹1.2Cr – ₹1.5Cr",
      duration: "8 months",
      completionDate: "06/2025",
      rating: 5,
      thumbnail: "assets/images/project_villa.png",
      images: ["assets/images/project_villa.png"],
      beforeImage: "assets/images/project_villa.png",
      afterImage: "assets/images/project_villa.png",
      tagline: "A home that breathes with its owners",
      challenge: "A luxury villa for a family of four that had strong individual tastes — the client wanted a unified design identity that could accommodate a collector's art, a teenager's music room, and a home office — without feeling like a showroom.",
      solution: "We anchored the design in a palette of forest green, off-white, and natural stone, using texture and layering to differentiate zones rather than colour. A double-height living room with a feature green wall became the family's gathering point. Art niches with museum-grade lighting were integrated throughout. Each bedroom had a distinct character while sharing the same material language.",
      result: "The project received a nomination for a regional residential design award. The client's family described it as 'the first house that's felt like home.' The art collection — now properly lit and integrated — has appreciated in value as a result of the curation.",
      processPhases: ["Discovery", "Concept", "Detailing", "Execution", "Handover"],
      testimonial: {
        author: "Ananya & Suresh Pillai",
        role: "Homeowners",
        text: "We were anxious about handing creative control to anyone. VKREATE earned our trust in the first week — they listened more than they spoke, and when they presented their vision, it was exactly what we'd imagined but could never articulate. Eight months later, we live in a home that still surprises us."
      },
      metrics: { sqft: "6,800", bedrooms: 4, zones: 12, timeline: "8 months" }
    }
  ],

  reviews: [
    {
      id: "r1",
      projectId: "verdant-office",
      author: "Kavya Reddy",
      role: "Head of People & Culture, Synapse Technologies",
      industry: "office",
      rating: 5,
      date: "April 2025",
      text: "VKREATE didn't just redesign our office — they redesigned how our team feels about coming to work. Every detail was considered with intent. The living wall alone sparked conversations we'd never had before. Their process was transparent, their timelines were met, and the result exceeded every expectation.",
      verified: true
    },
    {
      id: "r2",
      projectId: "amber-kitchen",
      author: "Rohan Mehta",
      role: "Founder, Amber Hospitality Group",
      industry: "restaurant",
      rating: 5,
      date: "December 2024",
      text: "We gave VKREATE complete creative trust and they delivered something that became the identity of our brand. The three-zone concept was a revelation — we'd never thought of our space as storytelling. The result is a restaurant that guests talk about long before they discuss the food.",
      verified: true
    },
    {
      id: "r3",
      projectId: "lumina-jewellers",
      author: "Priya Sundar",
      role: "Director, Lumina Retail Ventures",
      industry: "retail",
      rating: 5,
      date: "February 2025",
      text: "VKREATE understood something fundamental: in jewellery retail, the environment is the first piece of jewelry a customer sees. They designed a space that commands the same reverence as our finest pieces. The VIP suite alone paid for the entire project in its first month.",
      verified: true
    },
    {
      id: "r4",
      projectId: "serenity-medical",
      author: "Dr. Anand Krishnamurthy",
      role: "Medical Director, Serenity Health",
      industry: "healthcare",
      rating: 5,
      date: "October 2024",
      text: "We've always believed that healing environments matter. VKREATE proved it. Patients comment on the space before they comment on their treatment. The biophilic waiting area has reduced perceived wait times — people are calmer, staff are happier, and outcomes are measurably better.",
      verified: true
    },
    {
      id: "r5",
      projectId: "grand-atrium-hotel",
      author: "Vikram Nair",
      role: "Managing Director, Grand Atrium Hospitality",
      industry: "hospitality",
      rating: 5,
      date: "January 2025",
      text: "VKREATE took an ambitious brief — honour our history, project world-class luxury, and feel unmistakably Goan — and delivered on every dimension. The lobby is now cited in every review. Guests spend time there they hadn't planned. That is what great design does.",
      verified: true
    },
    {
      id: "r6",
      projectId: "casa-verde-villa",
      author: "Ananya & Suresh Pillai",
      role: "Homeowners, Chennai",
      industry: "villa",
      rating: 5,
      date: "July 2025",
      text: "We were anxious about handing creative control to anyone. VKREATE earned our trust in the first week — they listened more than they spoke, and when they presented their vision, it was exactly what we'd imagined but could never articulate. Eight months later, we live in a home that still surprises us.",
      verified: true
    },
    {
      id: "r7",
      author: "Meera Joshi",
      role: "Operations Head, FitLife Wellness Centers",
      industry: "healthcare",
      rating: 5,
      date: "May 2025",
      text: "Our fitness centre chain needed a complete brand refresh across three locations simultaneously. VKREATE coordinated the entire rollout with military precision. The new design has driven a 40% increase in new memberships — members genuinely cite the environment as the reason they joined.",
      verified: true
    },
    {
      id: "r8",
      author: "Sanjay Agarwal",
      role: "CEO, Pinnacle School of Excellence",
      industry: "office",
      rating: 5,
      date: "March 2025",
      text: "Schools are rarely designed with joy in mind. VKREATE changed that for us. The learning environment they created is stimulating, flexible, and beautiful. Parent feedback has been overwhelmingly positive, and teacher absenteeism dropped in the semester following the renovation.",
      verified: true
    }
  ],

  services: [
    {
      id: "commercial",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="14" width="36" height="28" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 14V10a2 2 0 012-2h12a2 2 0 012 2v4" stroke="currentColor" stroke-width="2"/><path d="M24 22v14M17 29h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Commercial Interiors",
      subtitle: "Offices · Co-working · Schools",
      description: "We design workplaces where people genuinely want to be — spaces that balance focus, collaboration, and brand identity. From open-plan floor transformations to custom executive suites, every square foot is purposeful.",
      features: ["Employee experience strategy", "Ergonomic space planning", "Acoustic engineering", "Brand identity integration"],
      projectLink: "verdant-office"
    },
    {
      id: "hospitality",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 6C15.163 6 8 13.163 8 22c0 5.386 2.655 10.156 6.75 13.125L13 42h22l-1.75-6.875C37.345 32.156 40 27.386 40 22c0-8.837-7.163-16-16-16z" stroke="currentColor" stroke-width="2"/><path d="M18 28h12M21 34h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Hospitality Design",
      subtitle: "Hotels · Resorts · Clubs",
      description: "Guest experience begins the moment a visitor sees your lobby. We design hospitality spaces that imprint — combining tactile luxury, functional flow, and a narrative that guests take home with them.",
      features: ["Guest journey mapping", "FF&E specification", "Lighting design", "Branded material selection"],
      projectLink: "grand-atrium-hotel"
    },
    {
      id: "restaurant",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 6v12c0 3.314 3.134 6 7 6h2c3.866 0 7-2.686 7-6V6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M24 24v18M16 42h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M10 6v36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Restaurant & F&B",
      subtitle: "Restaurants · Bars · Cafés",
      description: "In F&B, design drives dwell time, return visits, and social sharing. We craft mood-driven dining environments with zone-by-zone lighting strategy, acoustic comfort, and FF&E that photographs as beautifully as it functions.",
      features: ["Mood zoning", "Acoustic design", "Kitchen pass integration", "Social-media-ready aesthetics"],
      projectLink: "amber-kitchen"
    },
    {
      id: "retail",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 12l4-6h24l4 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="12" width="36" height="30" rx="2" stroke="currentColor" stroke-width="2"/><path d="M30 22a6 6 0 01-12 0" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "Retail & Brand Spaces",
      subtitle: "Boutiques · Showrooms · Jewellers",
      description: "Great retail design converts browsers into buyers. We engineer the customer journey through lighting, material, and spatial hierarchy — creating environments where products are celebrated and purchase decisions feel natural.",
      features: ["Customer journey design", "Display & lighting strategy", "VIP area planning", "Brand environment translation"],
      projectLink: "lumina-jewellers"
    },
    {
      id: "healthcare",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8v32M8 24h32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" stroke-width="2"/></svg>`,
      title: "Healthcare Environments",
      subtitle: "Clinics · Hospitals · Wellness",
      description: "Clinical doesn't have to mean cold. We design healthcare environments that reduce patient anxiety, improve wayfinding, and support staff wellbeing — while meeting all compliance standards for materials and infection control.",
      features: ["Evidence-based design", "Infection-control material selection", "Circadian lighting systems", "Wayfinding integration"],
      projectLink: "serenity-medical"
    },
    {
      id: "villa",
      icon: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 42V20L24 8l18 12v22H6z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><rect x="18" y="28" width="12" height="14" rx="1" stroke="currentColor" stroke-width="2"/><path d="M14 20h4M30 20h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
      title: "Residential Villas",
      subtitle: "Luxury Homes · Penthouses",
      description: "A home should feel unmistakably yours. We work with private clients on bespoke residential interiors that balance personal narrative, art integration, and functional family living — without compromising on beauty.",
      features: ["Lifestyle consultation", "Art & object curation", "Custom furniture design", "Smart home integration"],
      projectLink: "casa-verde-villa"
    }
  ],

  team: [
    {
      name: "Vikrant Rao",
      role: "Founder & Creative Director",
      bio: "Architect-turned-designer with 14 years experience across India's most celebrated commercial projects. Believes design is an act of empathy.",
      initial: "VR"
    },
    {
      name: "Shreya Mehta",
      role: "Principal Interior Designer",
      bio: "Specialises in hospitality and retail environments. Her material instincts have defined Amber Kitchen and Lumina Jewellers, among many others.",
      initial: "SM"
    },
    {
      name: "Arjun Pillai",
      role: "Project Director",
      bio: "Ensures every project runs on time and on brief. Arjun is the bridge between creative vision and on-site reality — fluent in both languages.",
      initial: "AP"
    },
    {
      name: "Nisha Varma",
      role: "Head of 3D & Visualisation",
      bio: "Creates photorealistic renders that let clients experience their spaces before a single wall is touched. Her visuals have won three industry awards.",
      initial: "NV"
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
      a: "Every project follows our five-phase process: Discovery (understanding your brief, culture, and constraints), Concept (spatial strategy and mood), Detailing (full drawings, material specifications, and FF&E), Execution (on-site management and vendor coordination), and Handover (final snagging, styling, and photography). You're involved at every milestone."
    },
    {
      q: "What is your typical project timeline?",
      a: "Timelines vary by scale. A boutique retail space typically takes 10–14 weeks. A corporate office floor, 14–20 weeks. A hospitality project can run 6–12 months. We provide a detailed phase schedule in the Concept stage, and we stand behind it."
    },
    {
      q: "Do you work outside of major cities?",
      a: "Yes — we've delivered projects across India and are open to international briefs where the scope justifies travel. Our 3D visualisation capability means most design decisions can be made remotely, with site visits focused on execution milestones."
    },
    {
      q: "What budget range do your projects typically require?",
      a: "We work across a range of scales. Retail and boutique commercial projects typically begin at ₹25–30L. Full-floor corporate offices, ₹40–80L. Hospitality and large residential projects can exceed ₹1Cr. We are transparent about budget from the first call."
    },
    {
      q: "Can you manage contractors, or do we supply our own?",
      a: "We can do both. VKREATE maintains a curated network of contractors, fabricators, and artisans we trust. For clients with existing vendor relationships, we integrate and coordinate those teams. Either way, we are the single point of accountability."
    },
    {
      q: "What makes VKREATE different from other design studios?",
      a: "Two things: process rigour and emotional intelligence. We don't start designing until we understand how a space needs to perform — commercially, culturally, and for the people who will live in it every day. Our designs are built to deliver measurable results, not just beautiful photographs."
    }
  ]

};
