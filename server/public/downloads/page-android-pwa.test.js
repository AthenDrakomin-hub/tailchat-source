const assert = require('assert');
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

assert.strictEqual(
  html.includes('Desktop Client'),
  false,
  'downloads page should not advertise desktop package client copy'
);

assert.strictEqual(
  html.includes('caixun-desktop-windows.zip'),
  false,
  'downloads page should not include windows desktop package links'
);

assert.strictEqual(
  html.includes('PWA') || html.includes('网页应用'),
  true,
  'downloads page should include pwa guidance'
);

console.log('downloads page android+pwa check passed');
