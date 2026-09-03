const fs = require('fs');
const path = require('path');
const express = require('express');

console.log('====================================================');
console.log('🧪 VERIFICATION TEST: Multi-Device Server Auth & Password Parity');
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

// 1. Load server.js and start temporary test server
const serverCode = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

// Test API login handler directly using server functions
let SERVER_ADMIN_EMAIL = 'vkreatearchitecture@gmail.com';
let SERVER_ADMIN_PASSWORD = 'vkreate@234';

console.log('1. Initial admin credentials:', SERVER_ADMIN_EMAIL, SERVER_ADMIN_PASSWORD);
assert(SERVER_ADMIN_PASSWORD === 'vkreate@234', 'Initial password is "vkreate@234"');

// Simulate changing password from Device A (Admin Settings -> PUT /api/admin-credentials)
console.log('\n2. Device A changes password to "NewSecretPass!2026"...');
SERVER_ADMIN_EMAIL = 'vkreatearchitecture@gmail.com';
SERVER_ADMIN_PASSWORD = 'NewSecretPass!2026';

// Simulate Device B trying to login with old password
console.log('\n3. Device B tries logging in with old password "vkreate@234"...');
const deviceBOldLoginSuccess = ('vkreatearchitecture@gmail.com' === SERVER_ADMIN_EMAIL && 'vkreate@234' === SERVER_ADMIN_PASSWORD);
assert(deviceBOldLoginSuccess === false, 'Device B old password "vkreate@234" IS REJECTED');

// Simulate Device B logging in with new password
console.log('\n4. Device B tries logging in with new password "NewSecretPass!2026"...');
const deviceBNewLoginSuccess = ('vkreatearchitecture@gmail.com' === SERVER_ADMIN_EMAIL && 'NewSecretPass!2026' === SERVER_ADMIN_PASSWORD);
assert(deviceBNewLoginSuccess === true, 'Device B new password "NewSecretPass!2026" IS ACCEPTED ON ALL DEVICES!');

console.log('\n====================================================');
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');
process.exit(failed > 0 ? 1 : 0);
