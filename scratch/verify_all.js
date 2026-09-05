const http = require('http');
const path = require('path');
const fs = require('fs');

const app = require('../server.js');

let server;
const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: reqHeaders,
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

async function runTests() {
  console.log('===================================================');
  console.log('🧪 VERIFYING ADMIN PROJECTS PERSISTENCE & SYNC');
  console.log('===================================================\n');

  server = app.listen(PORT);
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Login to get token
    console.log('1. Testing Auth Login...');
    const loginRes = await request('POST', '/api/login', {
      email: 'vkreatearchitecture@gmail.com',
      password: 'vkreate@234'
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'Login returns valid signed JWT session token');
    const token = loginRes.body.token;
    const authHeaders = { Authorization: `Bearer ${token}` };

    // 2. Reject bad token
    console.log('\n2. Testing Token Verification (Require Auth)...');
    const badAuthRes = await request('PUT', '/api/projects/test-id', { name: 'Unauthorized Edit' }, { Authorization: 'Bearer vk_sess_fake_123' });
    assert(badAuthRes.status === 401, 'Invalid session token returns HTTP 401 Unauthorized');

    // 3. Create Project via POST /api/projects
    console.log('\n3. Testing Project Creation...');
    const testProjectId = 'verify-proj-' + Date.now();
    const newProject = {
      id: testProjectId,
      name: 'Verification Penthouse Test',
      industry: 'residential',
      industryLabel: 'Luxury Residences',
      location: 'Kochi, Kerala',
      area: '4,500 sq ft',
      duration: '6 months',
      budgetRange: '₹60L – ₹80L',
      status: 'published',
      rank: 5,
      thumbnail: 'assets/images/project_luxury.png',
      images: ['assets/images/project_luxury.png'],
      challenge: 'Initial challenge text',
      solution: 'Initial solution text',
      result: 'Initial result text',
      createdAt: new Date().toISOString()
    };

    const createRes = await request('POST', '/api/projects', newProject, authHeaders);
    assert(createRes.status === 200 && createRes.body.success, 'POST /api/projects creates new project');

    // 4. Update Project with payload including _id field (simulating frontend state containing _id)
    console.log('\n4. Testing Project Update with _id payload (MongoDb immutability & sanitization test)...');
    const updatePayload = {
      _id: '650000000000000000000000', // Mongo internal ID field that previously caused Mongo $set failure!
      __v: 0,
      id: testProjectId,
      name: 'Verification Penthouse (UPDATED NAME)',
      location: 'Kozhikode, Kerala',
      challenge: 'Updated challenge text',
      solution: 'Updated solution text',
      result: 'Updated result text',
      rank: 1,
      status: 'published'
    };

    const updateRes = await request('PUT', `/api/projects/${testProjectId}`, updatePayload, authHeaders);
    assert(updateRes.status === 200 && updateRes.body.success, 'PUT /api/projects/:id succeeds when payload includes _id and __v');

    // 5. Verify GET /api/projects returns updated document
    console.log('\n5. Testing GET /api/projects (Admin API persistence)...');
    const getRes = await request('GET', '/api/projects');
    const items = Array.isArray(getRes.body) ? getRes.body : (getRes.body?.items || []);
    const foundProj = items.find(p => p.id === testProjectId);
    assert(!!foundProj, 'Project found in GET /api/projects list');
    assert(foundProj && foundProj.name === 'Verification Penthouse (UPDATED NAME)', 'Project updated name persisted correctly');
    assert(foundProj && foundProj.location === 'Kozhikode, Kerala', 'Project updated location persisted correctly');

    // 6. Verify GET /api/projects/public returns updated document
    console.log('\n6. Testing GET /api/projects/public (Public Site API persistence)...');
    const publicRes = await request('GET', '/api/projects/public');
    const publicItems = Array.isArray(publicRes.body) ? publicRes.body : (publicRes.body?.items || []);
    const foundPublic = publicItems.find(p => p.id === testProjectId);
    assert(!!foundPublic && foundPublic.name === 'Verification Penthouse (UPDATED NAME)', 'Public site endpoint returns updated project name');

    // 7. Cleanup
    console.log('\n7. Cleaning up test data...');
    const deleteRes = await request('DELETE', `/api/projects/${testProjectId}`, null, authHeaders);
    assert(deleteRes.status === 200 && deleteRes.body.success, 'DELETE /api/projects/:id cleans up test project');

  } catch (err) {
    console.error('Fatal error during verification:', err);
    failed++;
  } finally {
    if (server) server.close();
    console.log('\n===================================================');
    console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('===================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
