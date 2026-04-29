import path from 'path';
import fs from 'fs';
import { startDevRunner } from 'tailchat-server-sdk/dist/runner';

function resolveConfigFromArgv(argv: string[]) {
  const idx = argv.findIndex((a) => a === '--config');
  if (idx >= 0 && argv[idx + 1]) {
    return path.resolve(process.cwd(), argv[idx + 1]);
  }
  return null;
}

function resolveDefaultConfig() {
  const tsConfig = path.resolve(__dirname, './moleculer.config.ts');
  if (fs.existsSync(tsConfig)) return tsConfig;
  return path.resolve(__dirname, './moleculer.config.js');
}

startDevRunner({
  config: resolveConfigFromArgv(process.argv) ?? resolveDefaultConfig(),
});
