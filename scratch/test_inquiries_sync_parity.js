const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Inquiry Sync & Permanent Deletion');
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

global.document = { addEventListener: () => {} };
global.window = {
  location: { hostname: 'localhost', port: '5500' },
  dispatchEvent: () => {},
  addEventListener: () => {}
};
global.CustomEvent = class {};

// Load admin data.js
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(adminDataJs + '\nglobal.DB = DB;');

// Seed initial inquiries in localStorage
const initialInquiries = [
  { id: 'inq-1', name: 'Original Client 1', email: 'c1@example.com', status: 'new' },
  { id: 'inq-2', name: 'Original Client 2', email: 'c2@example.com', status: 'contacted' }
];
storage['vk_admin_inquiries'] = JSON.stringify(initialInquiries);

console.log('1. Initial inquiries count:', DB.inquiries.all().length);
assert(DB.inquiries.all().length === 2, 'Seeded initial 2 inquiries');

// Test 1: Add new inquiry from live site (simulating submission)
console.log('\n2. Simulating new inquiry submission from contact form...');
const newInquiry = { id: 'inq-new-123', name: 'New Lead Client', email: 'lead@example.com', status: 'new' };
const localBefore = JSON.parse(storage['vk_admin_inquiries'] || '[]');
localBefore.unshift(newInquiry);
storage['vk_admin_inquiries'] = JSON.stringify(localBefore);

const currentAll = DB.inquiries.all();
assert(currentAll.some(i => i.id === 'inq-new-123'), 'New inquiry visible in Admin Panel DB.inquiries.all()');

// Test 2: Delete old inquiry in Admin Panel
console.log('\n3. Deleting inquiry "inq-1" via DB.inquiries.delete()...');
DB.inquiries.delete('inq-1');

const remainingInquiries = DB.inquiries.all();
assert(!remainingInquiries.some(i => i.id === 'inq-1'), 'Inquiry "inq-1" removed from active inquiries');

const deletedIds = JSON.parse(storage['vk_admin_deleted_inquiries'] || '[]');
assert(deletedIds.includes('inq-1'), 'Inquiry ID "inq-1" recorded in vk_admin_deleted_inquiries');

// Test 3: Simulate page refresh & remote data reload
console.log('\n4. Simulating page refresh & loadRemoteData()...');
// Mock fetch to simulate remote returning old JSON array including inq-1
global.fetch = async (url) => {
  if (url.includes('/api/inquiries')) {
    return {
      ok: true,
      json: async () => [
        { id: 'inq-1', name: 'Original Client 1', email: 'c1@example.com', status: 'new' },
        { id: 'inq-2', name: 'Original Client 2', email: 'c2@example.com', status: 'contacted' }
      ]
    };
  }
  return { ok: false, json: async () => ({}) };
};

DB._lastLocalWrite.inquiries = 0; // Force remote merge path
DB.loadRemoteData();

setTimeout(() => {
  const afterRefresh = DB.inquiries.all();
  assert(!afterRefresh.some(i => i.id === 'inq-1'), 'Deleted inquiry "inq-1" DOES NOT COME BACK after refresh');
  assert(afterRefresh.some(i => i.id === 'inq-new-123'), 'Newly added inquiry "inq-new-123" IS NOT ERASED after refresh');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}, 200);
