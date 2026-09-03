const fs = require('fs');
const path = require('path');

console.log('--- 🧪 VERIFICATION TEST: Customer Review -> Admin Panel Sync ---');

// Mock localStorage & window environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

global.document = {
  addEventListener: () => {}
};
global.window = {
  location: { hostname: 'localhost', port: '5500' },
  dispatchEvent: () => {},
  addEventListener: () => {}
};
global.CustomEvent = class {};

// Load admin data.js logic
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(adminDataJs + '\nglobal.DB = DB;');

// Simulate Customer submitting a review on reviews.html
const customerReview = {
  id: 'rev-test-customer-' + Date.now(),
  clientName: 'Rahul Sharma',
  clientRole: 'Restaurant Owner',
  clientEmail: 'rahul@dining.in',
  projectId: 'lilaa-restaurant',
  rating: 5,
  reviewText: 'Outstanding design and execution by VKREATE for our restaurant space!',
  status: 'pending',
  createdAt: new Date().toISOString()
};

// 1. Save to vk_admin_reviews as js/reviews.js does
const currentRaw = localStorage.getItem('vk_admin_reviews');
let currentLocal = currentRaw ? JSON.parse(currentRaw) : [];
currentLocal.unshift(customerReview);
localStorage.setItem('vk_admin_reviews', JSON.stringify(currentLocal));

console.log('1. Customer review saved to localStorage key vk_admin_reviews');

// 2. Query DB.reviews.all() in Admin Panel
const adminReviews = DB.reviews.all();
console.log('2. Admin DB.reviews.all() count:', adminReviews.length);

const found = adminReviews.find(r => r && r.id === customerReview.id);
if (!found) {
  console.error('❌ FAIL: Customer review not found in DB.reviews.all()!');
  process.exit(1);
}

console.log('3. Review found in Admin DB:', found.clientName, '| Status:', found.status);

// 4. Test stats
const stats = DB.reviews.stats();
console.log('4. Admin DB.reviews.stats():', stats);

if (found && found.clientName === 'Rahul Sharma' && found.status === 'pending' && stats.pending >= 1) {
  console.log('✅ VERIFICATION TEST PASSED! Customer review is properly accessible and counted in Admin Panel.');
} else {
  console.error('❌ FAIL: Review stats or data mismatch.');
  process.exit(1);
}
