const https = require('https');

function callWipe() {
  console.log('🚀 Triggering live wipe-all-data API on https://www.vkreatearchitecture.com ...');
  
  const options = {
    hostname: 'www.vkreatearchitecture.com',
    port: 443,
    path: '/api/wipe-all-data',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, res => {
    let raw = '';
    res.on('data', chunk => raw += chunk);
    res.on('end', () => {
      console.log(`HTTP Status: ${res.statusCode}`);
      console.log('Response Body:', raw);
    });
  });

  req.on('error', err => console.error('Error calling live wipe:', err));
  req.end();
}

callWipe();
