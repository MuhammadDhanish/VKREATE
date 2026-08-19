const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function request(method, pathUrl, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(pathUrl, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: { 'Content-Type': 'application/json' },
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

async function runSyncTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING VKREATE BIDIRECTIONAL SYNC TEST SUITE');
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

  try {
    // ----------------------------------------------------
    // TEST A: Admin → Admin (Admin A ↔ Admin B ↔ Backend)
    // ----------------------------------------------------
    console.log('--- TEST A: Admin A → Admin B (Admin Sync) ---');
    const testProjectId = 'test-proj-' + Date.now();
    const testProject = {
      id: testProjectId,
      name: 'Automated Test Project — Luxury Lounge',
      industry: 'office',
      industryLabel: 'Offices & Workspaces',
      location: 'Trivandrum, Kerala',
      area: '3,500 sq ft',
      duration: '5 months',
      budgetRange: '₹30L – ₹40L',
      status: 'published',
      thumbnail: 'assets/images/project_lounge.png',
      images: ['assets/images/project_lounge.png'],
      challenge: 'Design a state of the art lounge',
      solution: 'Sculptural furniture and ambient troffers',
      result: '100% satisfaction',
      createdAt: new Date().toISOString()
    };

    // 1. Admin A creates project via API
    const resAddP = await request('POST', '/api/projects', testProject);
    assert(resAddP.status === 200 && resAddP.body.success, 'Admin A created new project successfully');

    // 2. Admin B fetches projects from backend database
    const resGetP = await request('GET', '/api/projects');
    const foundInB = Array.isArray(resGetP.body) && resGetP.body.find(p => p.id === testProjectId);
    assert(!!foundInB && foundInB.name === testProject.name, 'Admin B sees exact change created by Admin A');

    // 3. Check disk database file persistence
    const dbProjectsOnDisk = JSON.parse(fs.readFileSync(path.join(__dirname, 'js', 'admin-projects.json'), 'utf8'));
    const diskFoundP = dbProjectsOnDisk.find(p => p.id === testProjectId);
    assert(!!diskFoundP && diskFoundP.name === testProject.name, 'Backend persisted project to disk database');

    // 4. Admin A updates project
    const updatedName = 'Automated Test Project — VIP Executive Suite';
    const resUpdateP = await request('PUT', `/api/projects/${testProjectId}`, { name: updatedName });
    assert(resUpdateP.status === 200 && resUpdateP.body.success, 'Admin A updated project');

    // 5. Admin B confirms updated project name
    const resGetP2 = await request('GET', '/api/projects');
    const updatedInB = Array.isArray(resGetP2.body) && resGetP2.body.find(p => p.id === testProjectId);
    assert(!!updatedInB && updatedInB.name === updatedName, 'Admin B receives updated project name');

    console.log();

    // ----------------------------------------------------
    // TEST B: Admin → Live Site (Admin ↔ Live Site)
    // ----------------------------------------------------
    console.log('--- TEST B: Admin → Live Site (Live Site Sync) ---');

    // 1. Admin approves a review or updates settings
    const testSettings = {
      studio: {
        name: 'Vkreate Interior Architecture',
        tagline: 'Crafting Iconic Spaces',
        email: 'vkreatearchitecture@gmail.com',
        phone: '+91 90371 61861',
        address: 'LPOne Beyond, Venture Arcade, Thondayad, Kozhikode - 673016',
        mapsUrl: 'https://maps.app.goo.gl/452k5apcwZBYBL2v6?g_st=aw',
        instagram: 'https://www.instagram.com/vkreate_interior_architecture',
        website: 'https://vkreate.com',
      }
    };
    const resPutSettings = await request('PUT', '/api/settings', testSettings);
    assert(resPutSettings.status === 200 && resPutSettings.body.success, 'Admin updated studio settings');

    // 2. Live Site fetches updated settings from backend API
    const resGetSettings = await request('GET', '/api/settings');
    assert(resGetSettings.body && resGetSettings.body.studio?.tagline === 'Crafting Iconic Spaces', 'Live Site retrieves updated tagline from Backend');

    // 3. Admin publishes a new approved review
    const testReviewId = 'rev-test-' + Date.now();
    const testReview = {
      id: testReviewId,
      projectId: testProjectId,
      clientName: 'Sarah Connor',
      author: 'Sarah Connor',
      clientRole: 'CEO, Cyberdyne Systems',
      rating: 5,
      reviewText: 'Phenomenal interior architecture delivered on time and within budget.',
      status: 'approved',
      createdAt: new Date().toISOString()
    };
    const resAddRev = await request('POST', '/api/reviews', testReview);
    assert(resAddRev.status === 200 && resAddRev.body.success, 'Admin saved and approved new review');

    // 4. Live Site fetches reviews and verifies approved review is present
    const resGetRevs = await request('GET', '/api/reviews');
    const liveFoundRev = Array.isArray(resGetRevs.body) && resGetRevs.body.find(r => r.id === testReviewId);
    assert(!!liveFoundRev && liveFoundRev.status === 'approved', 'Live Site displays approved review');

    console.log();

    // ----------------------------------------------------
    // TEST C: Live Site → Admin (Live Site Submission Sync)
    // ----------------------------------------------------
    console.log('--- TEST C: Live Site → Admin (Submission Sync) ---');

    // 1. Live Site user submits Contact Form Inquiry
    const testInquiryId = 'inq-test-' + Date.now();
    const testInquiry = {
      id: testInquiryId,
      name: 'Alexander Pierce',
      email: 'alex@triskelion.com',
      phone: '+91 99887 76655',
      industry: 'Offices & Workspaces',
      projectBudget: '₹50L – ₹75L',
      timeline: '3 months',
      brief: 'Need a complete 10,000 sq ft headquarters fitout in Kochi.',
      status: 'new',
      notes: '',
      createdAt: new Date().toISOString()
    };

    const resAddInq = await request('POST', '/api/inquiries', testInquiry);
    assert(resAddInq.status === 200 && resAddInq.body.success, 'Live Site user submitted contact inquiry');

    // 2. Admin fetches inquiries from backend database
    const resGetInq = await request('GET', '/api/inquiries');
    const adminFoundInq = Array.isArray(resGetInq.body) && resGetInq.body.find(i => i.id === testInquiryId);
    assert(!!adminFoundInq && adminFoundInq.name === testInquiry.name, 'Admin dashboard receives live inquiry');

    // 3. Live Site user submits a client review (pending state)
    const pendingReviewId = 'rev-pending-' + Date.now();
    const pendingReview = {
      id: pendingReviewId,
      projectId: testProjectId,
      clientName: 'Marcus Wright',
      clientRole: 'Director, Resistance Tech',
      rating: 5,
      reviewText: 'Outstanding craftsmanship and spatial planning!',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    const resAddPendingRev = await request('POST', '/api/reviews', pendingReview);
    assert(resAddPendingRev.status === 200 && resAddPendingRev.body.success, 'Live Site user submitted client review');

    // 4. Admin sees pending review in queue
    const resGetPendingRevs = await request('GET', '/api/reviews');
    const adminFoundPendingRev = Array.isArray(resGetPendingRevs.body) && resGetPendingRevs.body.find(r => r.id === pendingReviewId);
    assert(!!adminFoundPendingRev && adminFoundPendingRev.status === 'pending', 'Admin review queue receives pending review from Live Site');

    // 5. Admin approves pending review
    const resApproveRev = await request('PUT', `/api/reviews/${pendingReviewId}`, { status: 'approved' });
    assert(resApproveRev.status === 200 && resApproveRev.body.review.status === 'approved', 'Admin approved pending review');

    console.log();

    // ----------------------------------------------------
    // Cleanup & Summary
    // ----------------------------------------------------
    console.log('--- Cleanup Test Data ---');
    await request('DELETE', `/api/projects/${testProjectId}`);
    await request('DELETE', `/api/reviews/${testReviewId}`);
    await request('DELETE', `/api/reviews/${pendingReviewId}`);
    await request('DELETE', `/api/inquiries/${testInquiryId}`);
    console.log('  Cleaned up test records from backend database.\n');

  } catch (err) {
    console.error('Fatal error during test execution:', err);
    failed++;
  }

  console.log('====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runSyncTests();
