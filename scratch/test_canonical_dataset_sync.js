const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Canonical Dataset & Server TTL Sync');
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

// 1. Verify js/admin-projects.json canonical dataset
const adminProjectsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../js/admin-projects.json'), 'utf8'));
assert(Array.isArray(adminProjectsJson.items) && adminProjectsJson.items.length === 4, 'js/admin-projects.json has all 4 canonical studio projects');

const projectIds = adminProjectsJson.items.map(p => p.id);
assert(projectIds.includes('lilaa-restaurant'), 'js/admin-projects.json contains lilaa-restaurant');
assert(projectIds.includes('luxury-salon'), 'js/admin-projects.json contains luxury-salon');
assert(projectIds.includes('retail-jewellery'), 'js/admin-projects.json contains retail-jewellery');
assert(projectIds.includes('corporate-lounge'), 'js/admin-projects.json contains corporate-lounge');

// 2. Verify admin/js/data.js _defaultProjects
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
assert(adminDataJs.includes("'retail-jewellery'"), 'admin/js/data.js _defaultProjects includes retail-jewellery');
assert(adminDataJs.includes("'corporate-lounge'"), 'admin/js/data.js _defaultProjects includes corporate-lounge');

// 3. Verify lib/github-store.js TTL_MS
const githubStoreJs = fs.readFileSync(path.join(__dirname, '../lib/github-store.js'), 'utf8');
assert(githubStoreJs.includes('TTL_MS = 1000'), 'lib/github-store.js reduced TTL_MS to 1000ms for instant data freshness');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
