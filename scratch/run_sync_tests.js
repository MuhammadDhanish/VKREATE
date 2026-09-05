const path = require('path');
const app = require('../server.js');
const { spawn } = require('child_process');

const PORT = 3000;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}...`);
  const testProc = spawn('node', ['test_sync.js'], { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
  testProc.on('close', (code) => {
    server.close();
    process.exit(code);
  });
});
