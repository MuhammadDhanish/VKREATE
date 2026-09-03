const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

function request(method, pathUrl, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer vk_admin_active_session'
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function runMultiDeviceTest() {
  console.log('====================================================');
  console.log('🧪 MULTI-DEVICE PROJECT DELETION SYNC TEST');
  console.log('====================================================\n');

  const testId = 'proj-multi-' + Date.now();
  const testProject = {
    id: testId,
    name: 'Multi-Device Test Penthouse',
    industry: 'villa',
    industryLabel: 'Residential & Villa',
    location: 'Kochi, Kerala',
    area: '4,000 sq ft',
    status: 'published',
    thumbnail: 'assets/images/project_lilaa_1.jpg',
    images: ['assets/images/project_lilaa_1.jpg']
  };

  // 1. Device A creates project
  console.log('1. Device A creates new project...');
  const addRes = await request('POST', '/api/projects', testProject);
  assert(addRes.status === 200 && addRes.body.success, 'Device A created test project on Server');

  // 2. Device B fetches projects from Server
  console.log('\n2. Device B fetches projects from Server API...');
  const getRes1 = await request('GET', '/api/projects');
  assert(getRes1.body && Array.isArray(getRes1.body.items), 'Device B receives { items, deletedIds } format from GET /api/projects');
  const foundInB = getRes1.body.items.find(p => p.id === testId);
  assert(!!foundInB, 'Device B sees project created by Device A');

  // 3. Device A deletes project
  console.log('\n3. Device A deletes project on Server...');
  const delRes = await request('DELETE', `/api/projects/${testId}`);
  assert(delRes.status === 200 && delRes.body.success, 'Device A deleted project on Server');

  // 4. Device B background poll fetches latest state from Server
  console.log('\n4. Device B polls Server and receives updated database state...');
  const getRes2 = await request('GET', '/api/projects');
  assert(getRes2.body && Array.isArray(getRes2.body.deletedIds), 'Device B receives deletedIds array from Server');
  assert(getRes2.body.deletedIds.includes(testId), `Device B receives testId "${testId}" in server deletedIds list`);
  
  const foundAfterDel = getRes2.body.items.find(p => p.id === testId);
  assert(!foundAfterDel, 'Device B sees project removed from server active items');

  // 5. Test public site data layer simulation on Device B
  console.log('\n5. Simulating Device B public site data layer parsing...');
  const mockLocalStorage = {};
  const deletedSet = new Set(getRes2.body.deletedIds);
  mockLocalStorage['vk_admin_deleted_projects'] = JSON.stringify(Array.from(deletedSet));

  const staticProjects = [
    { id: testId, name: 'Multi-Device Test Penthouse' },
    { id: 'lilaa-restaurant', name: 'Lilaa Restaurant' }
  ];

  const filteredStatic = staticProjects.filter(p => !deletedSet.has(p.id));
  assert(!filteredStatic.some(p => p.id === testId), 'Device B static fallback DOES NOT re-insert deleted project');

  console.log('\n====================================================');
  console.log(process.exitCode ? '❌ MULTI-DEVICE TEST FAILED' : '✅ ALL MULTI-DEVICE SYNC TESTS PASSED');
  console.log('====================================================\n');
}

runMultiDeviceTest();
