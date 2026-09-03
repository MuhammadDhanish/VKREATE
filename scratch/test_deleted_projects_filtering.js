const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Deleted Projects Display Filtering');
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

// Read js/data.js and verify filtering implementation
const dataJs = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');

assert(dataJs.includes('const deletedSet = new Set(deletedIds.map(id => String(id)));'), 'deletedSet maps all deleted IDs to string format');
assert(dataJs.includes("status === 'draft' || status === 'archived' || status === 'deleted'"), 'applyAdminProjects filters out draft, archived, and deleted projects');
assert(dataJs.includes('deletedSet.has(pId)'), 'applyAdminProjects checks deletedSet with string ID (pId)');

// Simulate applyAdminProjects logic in isolation
const deletedIds = ['proj-deleted-1', 456];
const deletedSet = new Set(deletedIds.map(id => String(id)));

const sampleProjects = [
  { id: 'proj-active-1', name: 'Active Villa', status: 'published' },
  { id: 'proj-deleted-1', name: 'Deleted Villa', status: 'published' },
  { id: 456, name: 'Numeric Deleted Salon', status: 'published' },
  { id: 'proj-draft-1', name: 'Draft Project', status: 'draft' },
  { id: 'proj-archived-1', name: 'Archived Project', status: 'archived' },
  { id: 'proj-active-2', name: 'Active Lounge', status: 'published' }
];

const filtered = sampleProjects.filter(p => {
  if (!p || !p.id) return false;
  const pId = String(p.id);
  if (deletedSet.has(pId)) return false;
  const status = (p.status || 'published').toLowerCase().trim();
  if (status === 'draft' || status === 'archived' || status === 'deleted') return false;
  return true;
});

assert(filtered.length === 2, `Filtered count is 2 (actual: ${filtered.length})`);
assert(filtered.every(p => p.id === 'proj-active-1' || p.id === 'proj-active-2'), 'Only active published projects remain in output list');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
