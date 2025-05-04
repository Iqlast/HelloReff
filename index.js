const { spawn } = require('child_process');

// Jalankan mail.js (tanpa output)
spawn('node', ['mail.js'], {
  stdio: 'ignore',
  detached: true
});

// Jalankan run.js (dengan input/output penuh)
const run = spawn('node', ['run2.js'], {
  stdio: ['inherit', 'inherit', 'inherit']
});

run.on('close', (code) => {
  console.log(`\n✅ run2.js selesai (exit code ${code})`);
});
