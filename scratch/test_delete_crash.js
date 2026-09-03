const fs = require('fs');
const path = require('path');

console.log('--- 🧪 VERIFICATION TEST: Review Deletion Edge Cases & Crash Prevention ---');

// Mock browser environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

global.document = { addEventListener: () => {} };
global.window = {
  location: { hostname: 'localhost', port: '5500' },
  dispatchEvent: () => {},
  addEventListener: () => {}
};
global.CustomEvent = class {};
global.UI = {
  escapeHTML: (str) => String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  dateShort: () => '24 Aug 2026',
  badge: (st) => `<span>${st}</span>`,
  toast: () => {},
  confirm: (title, msg, icon, callback) => callback()
};

// Load data.js and reviews.js
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(adminDataJs + '\nglobal.DB = DB;');

const reviewsJs = fs.readFileSync(path.join(__dirname, '../admin/js/reviews.js'), 'utf8');
eval(reviewsJs + '\nglobal.Reviews = window.Reviews;');

// Seed test reviews including null/malformed entries
const testReviews = [
  { id: 'rev-normal-1', clientName: 'Alice', rating: 5, status: 'approved', reviewText: 'Great service!' },
  { id: 'rev-normal-2', clientName: 'Bob', rating: 4, status: 'pending', reviewText: 'Very good design.' },
  null, // Null entry in array
  { id: 'rev-corrupt-1', rating: Object.create(null), clientName: { corrupt: true }, status: 'pending' } // Malformed object rating
];

DB._set(DB.KEYS.reviews, testReviews);

console.log('1. DB initialized with null & malformed review entries');

try {
  // Test _filtered with null entries
  const filteredAll = Reviews._filtered(DB.reviews.all(), 'all');
  console.log('2. Reviews._filtered("all") count:', filteredAll.length);
  
  const filteredPending = Reviews._filtered(DB.reviews.all(), 'pending');
  console.log('3. Reviews._filtered("pending") count:', filteredPending.length);

  // Test cardsHTML with empty/null/malformed array
  const cardsHtml = Reviews._cardsHTML(filteredAll);
  console.log('4. Cards HTML generated without crash:', typeof cardsHtml === 'string');

  // Test deleting normal review
  console.log('5. Testing DB.reviews.delete("rev-normal-2")...');
  DB.reviews.delete('rev-normal-2');
  console.log('6. DB.reviews.delete successful. Remaining count:', DB.reviews.all().length);

  // Test deleting corrupt review
  console.log('7. Testing DB.reviews.delete("rev-corrupt-1")...');
  DB.reviews.delete('rev-corrupt-1');
  console.log('8. DB.reviews.delete corrupt review successful. Remaining count:', DB.reviews.all().length);

  console.log('✅ ALL DELETION CRASH TESTS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('❌ CRASH DETECTED DURING TEST:', err);
  process.exit(1);
}
