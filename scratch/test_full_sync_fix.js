const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST SUITE: Full Synchronization Fix');
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

// 1. Verify js/reviews.js fix (let newReview instead of const newReview)
const reviewsJs = fs.readFileSync(path.join(__dirname, '../js/reviews.js'), 'utf8');
assert(!reviewsJs.includes('const newReview = {'), 'js/reviews.js does not assign object to const newReview');
assert(reviewsJs.includes('let newReview = {'), 'js/reviews.js uses let newReview for server ID re-assignment');

// 2. Verify js/data.js fix (fetch /api/reviews/public)
const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
assert(dataJs.includes('/api/reviews/public'), 'js/data.js calls /api/reviews/public for public site');

// 3. Verify js/main.js fix (uses getApiBaseUrl for inquiry POST)
const mainJs = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
assert(mainJs.includes("typeof getApiBaseUrl === 'function'"), 'js/main.js checks getApiBaseUrl() before posting inquiry');

// 4. Verify admin/js/data.js Inquiry & Project merge logic
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
assert(adminDataJs.includes('{ ...localItem, ...remoteItem }'), 'admin/js/data.js prefers remote inquiry updates over stale local items');
assert(!adminDataJs.includes('Date.now() - (DB._lastLocalWrite.projects || 0) < 15000'), 'admin/js/data.js removed crude 15-second project write lock');

// 5. Verify admin/js/data.js BroadcastChannel & Storage listener updates
assert(adminDataJs.includes('DB.loadRemoteData();'), 'admin/js/data.js invokes DB.loadRemoteData() inside sync listeners');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
