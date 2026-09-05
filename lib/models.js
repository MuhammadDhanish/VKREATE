const mongoose = require('mongoose');

// ── Project Schema ──────────────────────────────────────────
const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  category: { type: String, default: '' },
  industry: { type: String, required: true, index: true },
  industryLabel: { type: String, default: '' },
  location: { type: String, default: '' },
  area: { type: String, default: '' },
  duration: { type: String, default: '' },
  budgetRange: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  rank: { type: Number, default: 99, index: true },
  cover: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  images: [{ type: String }],
  gallery: [{ type: String }],
  beforeImage: { type: String, default: '' },
  afterImage: { type: String, default: '' },
  tagline: { type: String, default: '' },
  description: { type: String, default: '' },
  highlights: [{ type: String }],
  challenge: { type: String, default: '' },
  solution: { type: String, default: '' },
  result: { type: String, default: '' },
  clientName: { type: String, default: '' },
  clientRole: { type: String, default: '' },
  testimonial: { type: mongoose.Schema.Types.Mixed, default: {} },
  processPhases: [{ type: String }],
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  leads: { type: Number, default: 0 },
  specs: { type: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, default: 'published', index: true }
}, { timestamps: true, strict: false });

// ── Review Schema ───────────────────────────────────────────
const ReviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  clientName: { type: String, default: '' },
  author: { type: String, default: '' },
  clientRole: { type: String, default: '' },
  role: { type: String, default: '' },
  rating: { type: Number, default: 5 },
  reviewText: { type: String, default: '' },
  text: { type: String, default: '' },
  comment: { type: String, default: '' },
  industry: { type: String, default: 'general', index: true },
  industryLabel: { type: String, default: '' },
  projectId: { type: String, default: 'general' },
  projectName: { type: String, default: 'General Studio Review' },
  location: { type: String, default: '' },
  clientEmail: { type: String, default: '' },
  status: { type: String, default: 'pending', enum: ['approved', 'pending', 'rejected'], index: true },
  studioResponse: { type: String, default: '' },
  submittedAt: { type: String, default: '' },
  approvedAt: { type: String, default: '' }
}, { timestamps: true, strict: false });

// ── Inquiry Schema ──────────────────────────────────────────
const InquirySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  clientName: { type: String, default: '' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  industry: { type: String, default: '' },
  projectType: { type: String, default: '' },
  budget: { type: String, default: '' },
  timeline: { type: String, default: '' },
  location: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: 'new', enum: ['new', 'contacted', 'quoted', 'won', 'lost'], index: true }
}, { timestamps: true, strict: false });

// ── Setting Schema ──────────────────────────────────────────
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_settings' },
  studio: {
    name: { type: String, default: 'Vkreate Interior Architecture' },
    tagline: { type: String, default: 'Where Design Speaks' },
    email: { type: String, default: 'vkreatearchitecture@gmail.com' },
    phone: { type: String, default: '+91 90371 61861' },
    address: { type: String, default: 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016' },
    mapsUrl: { type: String, default: 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw' },
    instagram: { type: String, default: 'https://www.instagram.com/vkreate_interior_architecture' },
    facebook: { type: String, default: '' },
    website: { type: String, default: 'https://vkreate.com' },
  },
  notifications: {
    newReview: { type: Boolean, default: true },
    newInquiry: { type: Boolean, default: true },
    notifEmail: { type: String, default: 'vkreatearchitecture@gmail.com' },
  },
  credentials: {
    email: { type: String, default: '' },
    passwordHash: { type: String, default: '' },
  },
  deletedIds: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: false });

const ProjectModel = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const ReviewModel = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
const InquiryModel = mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
const SettingModel = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

module.exports = {
  ProjectModel,
  ReviewModel,
  InquiryModel,
  SettingModel,
};
