#!/usr/bin/env bash
set -euo pipefail

node - <<'NODE'
const pkg = require('./server/package.json');
const s = pkg.scripts && pkg.scripts['start:service'];
if (s !== 'cd dist && node runner.js --config ../moleculer.config.js') {
  console.error('unexpected start:service:', s);
  process.exit(1);
}
console.log('ok: start:service');
NODE

grep -q -- "argv" server/runner.ts
grep -q -- "resolveConfigFromArgv" server/runner.ts
grep -q -- "moleculer.config.js" server/runner.ts
! grep -q -- "fs.copy('./moleculer.config.ts', './dist/moleculer.config.ts')" server/scripts/build.ts

echo "ok: runner config resolution"
