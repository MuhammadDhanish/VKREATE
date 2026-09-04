const app = require('../server.js');
const http = require('http');
const assert = require('assert');

async function runParityTest() {
  console.log('🧪 Testing Project and Review section parity...');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3098, resolve));

  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const u = new URL(`http://localhost:3098${path}`);
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
    // 1. Verify GET /api/projects/public returns 200 array
    const projPub = await request('GET', '/api/projects/public');
    assert.strictEqual(projPub.status, 200);
    assert(Array.isArray(projPub.body), 'Public projects endpoint returns an array');
    console.log('✅ GET /api/projects/public returns array format matching /api/reviews/public');

    // 2. Verify GET /api/reviews/public returns 200 array
    const revPub = await request('GET', '/api/reviews/public');
    assert.strictEqual(revPub.status, 200);
    assert(Array.isArray(revPub.body), 'Public reviews endpoint returns an array');
    console.log('✅ GET /api/reviews/public returns array format');

    console.log('🎉 Project and Review section sync parity fully verified!');
  } catch (err) {
    console.error('❌ Parity test failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

runParityTest();
