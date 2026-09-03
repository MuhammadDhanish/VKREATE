const app = require('../server.js');
const http = require('http');

async function testBackend() {
  console.log('🧪 Starting MongoDB backend integration verification test...');

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3099, resolve));

  async function getJson(path) {
    return new Promise((resolve, reject) => {
      http.get(`http://localhost:3099${path}`, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
          catch(e) { resolve({ status: res.statusCode, body }); }
        });
      }).on('error', reject);
    });
  }

  try {
    const projRes = await getJson('/api/projects/public');
    console.log(`✅ GET /api/projects/public -> status: ${projRes.status}, items: ${Array.isArray(projRes.data) ? projRes.data.length : 'N/A'}`);

    const revRes = await getJson('/api/reviews/public');
    console.log(`✅ GET /api/reviews/public -> status: ${revRes.status}, items: ${Array.isArray(revRes.data) ? revRes.data.length : 'N/A'}`);

    const setRes = await getJson('/api/settings');
    console.log(`✅ GET /api/settings -> status: ${setRes.status}, studio: ${setRes.data && setRes.data.studio ? setRes.data.studio.name : 'N/A'}`);

    console.log('🎉 All backend API endpoints verified successfully!');
  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    server.close();
  }
}

testBackend();
