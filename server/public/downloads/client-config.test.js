const assert = require('assert');
const config = require('./client.json');

assert.deepStrictEqual(
  Object.keys(config).sort(),
  ['android', 'pwa'],
  'downloads config should only expose android and pwa'
);

assert.strictEqual(
  config.pwa && config.pwa.url,
  '/',
  'pwa download entry should point to the web root'
);

console.log('downloads client.json shape check passed');
