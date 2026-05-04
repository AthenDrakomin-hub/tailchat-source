const assert = require('assert');
const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, 'build/index.html');
const html = fs.readFileSync(indexPath, 'utf8');

assert.strictEqual(
  html.includes('https://tianji.moonrailgun.com/tracker.js'),
  false,
  'website build output should not include Tianji tracker script'
);

console.log('website build telemetry check passed');
