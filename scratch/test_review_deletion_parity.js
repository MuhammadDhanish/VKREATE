const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Review Deletion System Parity');
console.log('====================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

// Mock environment
const storage = {};
global.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => { storage[key] = String(val); },
  removeItem: (key) => { delete storage[key]; }
};

let toastCalled = false;
let toastType = '';
let closeModalCalled = false;
let sidebarUpdated = false;
let afterMutationCalled = false;

global.document = {
  addEventListener: () => {},
  getElementById: () => null,
  querySelectorAll: () => []
};
global.window = {
  location: { hostname: 'localhost', port: '5500' },
  dispatchEvent: () => {},
  addEventListener: () => {},
  requestAnimationFrame: (cb) => cb()
};
global.requestAnimationFrame = (cb) => cb();
global.CustomEvent = class {};
globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ success: true }) });
global.getApiBaseUrl = () => '';
global.getAuthHeaders = () => ({});

let activeConfirmPromise = null;

global.UI = {
  escapeHTML: (str) => String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  dateShort: () => '24 Aug 2026',
  badge: (st) => `<span>${st}</span>`,
  toast: (msg, type) => {
    toastCalled = true;
    toastType = type;
    console.log(`  [UI.toast] "${msg}" (type: ${type})`);
  },
  confirm: (title, msg, icon, callback) => {
    console.log('  [UI.confirm called]', title);
    if (typeof callback === 'function') {
      activeConfirmPromise = (async () => {
        await callback();
      })();
    }
  },
  closeModal: () => {
    closeModalCalled = true;
    console.log('  [UI.closeModal] Modal closed cleanly.');
  },
  modal: () => {}
};

global.App = {
  updateSidebar: () => {
    sidebarUpdated = true;
    console.log('  [App.updateSidebar] Sidebar counters refreshed.');
  }
};

// Load data.js & reviews.js
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(adminDataJs + '\nglobal.DB = DB;');

// Override getApiBaseUrl to avoid external fetch timeouts during test
global.getApiBaseUrl = () => '';

// Override DB.afterMutation to test hook
const origAfterMutation = DB.afterMutation;
DB.afterMutation = function() {
  afterMutationCalled = true;
  console.log('  [DB.afterMutation] Global sync event triggered.');
  if (origAfterMutation) origAfterMutation.call(this);
};

const reviewsJs = fs.readFileSync(path.join(__dirname, '../admin/js/reviews.js'), 'utf8');
eval(reviewsJs + '\nglobal.Reviews = window.Reviews;');

async function runTest() {
  // Seed test data
  const testReviews = [
    { id: 'rev-parity-1', clientName: 'Alice Johnson', rating: 5, status: 'approved', reviewText: 'Fantastic work!' },
    { id: 'rev-parity-2', clientName: 'Bob Smith', rating: 4, status: 'approved', reviewText: 'Great quality.' }
  ];

  DB._set(DB.KEYS.reviews, testReviews);

  console.log('1. Initial reviews count:', DB.reviews.all().length);
  assert(DB.reviews.all().length === 2, 'Initial review dataset seeded');

  // Execute Reviews.delete
  console.log('\n2. Executing Reviews.delete("rev-parity-1")...');
  await Reviews.delete('rev-parity-1');
  if (activeConfirmPromise) await activeConfirmPromise;

  // Assertions
  const remaining = DB.reviews.all();
  assert(remaining.length === 1, 'Review rev-parity-1 removed from active DB reviews');
  assert(remaining[0].id === 'rev-parity-2', 'Remaining review is rev-parity-2');

  const deletedList = JSON.parse(localStorage.getItem('vk_admin_deleted_reviews') || '[]');
  assert(deletedList.includes('rev-parity-1'), 'Deleted review ID added to vk_admin_deleted_reviews in localStorage');

  const publicMirror = JSON.parse(localStorage.getItem('vk_reviews') || '{}');
  assert(Array.isArray(publicMirror.reviews) && publicMirror.reviews.length === 1, 'Public mirror vk_reviews automatically updated');

  assert(toastCalled && toastType === 'success', 'UI.toast was called with success notification type');
  assert(sidebarUpdated, 'App.updateSidebar was called to update sidebar counters');
  assert(afterMutationCalled, 'DB.afterMutation was triggered for sync listeners');
  assert(closeModalCalled, 'UI.closeModal was called to close any open review modal');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
