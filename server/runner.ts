import path from 'path';
import { startDevRunner, startProdRunner } from 'tailchat-server-sdk/dist/runner';

function resolveConfigFromArgv(argv: string[]) {
  const idx = argv.findIndex((a) => a === '--config');
  if (idx >= 0 && argv[idx + 1]) {
    return path.resolve(process.cwd(), argv[idx + 1]);
  }
  return null;
}

const isProd = process.env.NODE_ENV === 'production';
const configFromArgv = resolveConfigFromArgv(process.argv);

if (isProd) {
  startProdRunner({
    config: configFromArgv ?? path.resolve(__dirname, './moleculer.config.js'),
  });
} else {
  startDevRunner({
    config: configFromArgv ?? path.resolve(__dirname, './moleculer.config.ts'),
  });
}
