const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(
  path.resolve(__dirname, 'deploy-all.sh'),
  'utf8'
);

assert.strictEqual(
  source.includes('git restore server/public/downloads/client.json || true'),
  true,
  'deploy-all should restore downloads config before pull'
);

assert.strictEqual(
  source.includes('check_endpoint()'),
  true,
  'deploy-all should use retry-based endpoint checks'
);

console.log('deploy-all script safety checks passed');
