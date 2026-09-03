const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Clean Wiped State Check');
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

// 1. Check js/admin-projects.json
const projectsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../js/admin-projects.json'), 'utf8'));
assert(Array.isArray(projectsJson.items) && projectsJson.items.length === 0, 'js/admin-projects.json is empty (items: [])');

// 2. Check js/admin-reviews.json
const reviewsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../js/admin-reviews.json'), 'utf8'));
assert(Array.isArray(reviewsJson.items) && reviewsJson.items.length === 0, 'js/admin-reviews.json is empty (items: [])');

// 3. Check js/admin-inquiries.json
const inquiriesJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../js/admin-inquiries.json'), 'utf8'));
assert(Array.isArray(inquiriesJson.items) && inquiriesJson.items.length === 0, 'js/admin-inquiries.json is empty (items: [])');

// 4. Check js/data.js staticOriginals
const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
assert(dataJs.includes('const staticOriginals = [];'), 'js/data.js staticOriginals is empty []');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
