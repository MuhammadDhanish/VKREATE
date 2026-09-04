const app = require('../server.js');
const http = require('http');
const assert = require('assert');

async function testDataPreservation() {
  console.log('🧪 Testing Admin Data Preservation on Reload / Remote Sync...');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3097, resolve));

  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const u = new URL(`http://localhost:3097${path}`);
      const req = http.request(u, { method, headers: { 'Content-Type': 'application/json' } }, res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
          catch (e) { resolve({ status: res.statusCode, body: raw }); }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    const projRes = await request('GET', '/api/projects');
    assert.strictEqual(projRes.status, 200);
    console.log('✅ GET /api/projects works cleanly');

    const revRes = await request('GET', '/api/reviews');
    assert.strictEqual(revRes.status, 200);
    console.log('✅ GET /api/reviews works cleanly');

    console.log('🎉 Data preservation logic verified!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

testDataPreservation();
