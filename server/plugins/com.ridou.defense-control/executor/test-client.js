const crypto = require('crypto');
const http = require('http');

const secret = 'defense-secret-key';
const body = JSON.stringify({ toState: 'PRECHECK' });
const hmac = crypto.createHmac('sha256', secret);
hmac.update(body);
const signature = hmac.digest('hex');

const req = http.request({
  hostname: '127.0.0.1',
  port: 9099,
  path: '/api/transition',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-signature': signature
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.write(body);
req.end();
