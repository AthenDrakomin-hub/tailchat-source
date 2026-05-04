const assert = require('assert');

const config = require('./docusaurus.config.js');

const scripts = Array.isArray(config.scripts) ? config.scripts : [];
const hasTianjiTracker = scripts.some(
  (item) =>
    item &&
    typeof item === 'object' &&
    item.src === 'https://tianji.moonrailgun.com/tracker.js'
);

assert.strictEqual(
  hasTianjiTracker,
  false,
  'website config should not include Tianji tracker script'
);

console.log('website config telemetry check passed');
