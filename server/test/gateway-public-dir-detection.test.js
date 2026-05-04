const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.resolve(__dirname, '../services/core/gateway.service.ts'),
  'utf8'
);

assert.strictEqual(
  source.includes("pwa.webmanifest"),
  true,
  'gateway public dir detection should support pwa.webmanifest'
);

console.log('gateway public dir detection check passed');
