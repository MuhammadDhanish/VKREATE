const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Project Deletion Live Site Sync');
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

// 1. Load admin data.js
const adminDataJs = fs.readFileSync(path.join(__dirname, '../admin/js/data.js'), 'utf8');
eval(adminDataJs + '\nglobal.DB = DB;');

// 2. Load live site data.js
const liveDataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
eval(liveDataJs + '\nglobal.VKREATE_DATA = VKREATE_DATA;');

console.log('1. Initial live site projects count:', VKREATE_DATA.projects.length);
const hasLilaaInitially = VKREATE_DATA.projects.some(p => p.id === 'lilaa-restaurant');
console.log('2. Lilaa project present before deletion:', hasLilaaInitially);

// 3. Delete Lilaa project via Admin DB
console.log('\n3. Deleting "lilaa-restaurant" via Admin DB.projects.delete()...');
DB.projects.delete('lilaa-restaurant');

// 4. Verify Admin Panel dataset
const adminProjects = DB.projects.all();
const foundInAdmin = adminProjects.find(p => p.id === 'lilaa-restaurant');
assert(!foundInAdmin, 'Lilaa project removed from Admin Panel projects list');

// 5. Re-run live site sync (simulating live site sync/refresh)
applyAdminProjects(adminProjects);

const foundInLive = VKREATE_DATA.projects.find(p => p.id === 'lilaa-restaurant');
assert(!foundInLive, 'Lilaa project completely removed from Live Site (VKREATE_DATA.projects)');

const activeProjectsInLive = VKREATE_DATA.projects.map(p => p.id);
console.log('4. Remaining Live Site Project IDs:', activeProjectsInLive);

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
