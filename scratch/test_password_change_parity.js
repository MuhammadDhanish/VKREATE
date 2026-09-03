const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Admin Password Change Parity');
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

// Test 1: Initial default login
console.log('1. Testing initial default login...');
assert(DB.auth.login('vkreatearchitecture@gmail.com', 'vkreate@234') === true, 'Login with default password "vkreate@234" succeeds');
assert(DB.auth.login('vkreatearchitecture@gmail.com', 'wrongpass') === false, 'Login with wrong password fails');

// Test 2: Update password in settings
console.log('\n2. Updating password to "newsecret@567"...');
const s = DB.settings.get() || {};
s.credentials = {
  email: 'vkreatearchitecture@gmail.com',
  passwordHash: 'newsecret@567'
};
DB.settings.save(s);

// Test 3: Test login with new password
console.log('\n3. Testing login after password change...');
assert(DB.auth.login('vkreatearchitecture@gmail.com', 'vkreate@234') === false, 'Old password "vkreate@234" is rejected');
assert(DB.auth.login('vkreatearchitecture@gmail.com', 'newsecret@567') === true, 'New password "newsecret@567" is accepted');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
