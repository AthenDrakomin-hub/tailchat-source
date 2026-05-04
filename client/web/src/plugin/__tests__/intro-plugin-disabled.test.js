const assert = require('assert');
const fs = require('fs');
const path = require('path');

const builtinPath = path.resolve(__dirname, '../builtin.ts');
const source = fs.readFileSync(builtinPath, 'utf8');

const requiredSection = source.split('export const requiredBuiltinPluginIds = [')[1];

assert.ok(requiredSection, 'required builtin plugin list should exist');
assert.strictEqual(
  requiredSection.includes("'com.msgbyte.intro'"),
  false,
  'intro plugin should not be force-enabled'
);

console.log('intro plugin required list check passed');
