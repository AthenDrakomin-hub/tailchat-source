import { Runner } from 'moleculer';
import path from 'path';
import cluster from 'cluster';
import { config } from '../services/lib/settings';

declare module 'moleculer' {
  class Runner {
    flags?: {
      config?: string;
      repl?: boolean;
      hot?: boolean;
      silent?: boolean;
      env?: boolean;
      envfile?: string;
      instances?: number;
      mask?: string;
    };
    servicePaths: string[];

    start(args: any[]): void;
    startWorkers(instances: number): void;
    _run(): void;
  }
}

interface DevRunnerOptions {
  config?: string;
}

const isProd = config.env === 'production';

/**
 * 开始一个启动器
 */
export function startDevRunner(options: DevRunnerOptions) {
  const runner = new Runner();
  runner.flags = {
    hot: isProd ? false : true,
    repl: isProd ? false : true,
    env: true,
    config: options.config ?? path.resolve(__dirname, './moleculer.config.ts'),
  };
  runner.servicePaths = [
    'services/**/*.service.ts',
    'services/**/*.service.dev.ts', // load plugins in dev mode
    'plugins/**/*.service.ts',
    'plugins/**/*.service.dev.ts', // load plugins in dev mode
  ];

  if (runner.flags.instances !== undefined && cluster.isPrimary) {
    return runner.startWorkers(runner.flags.instances);
  }

  return runner._run();
}

interface ProdRunnerOptions {
  config?: string;
}

export function startProdRunner(options: ProdRunnerOptions = {}) {
  const runner = new Runner();
  const resolvedConfig =
    options.config ??
    path.resolve(process.cwd(), 'moleculer.config.js');

  runner.flags = {
    hot: false,
    repl: false,
    env: true,
    config: resolvedConfig,
  };

  const loadConfigFileStrictJs = (configFile?: unknown) => {
    const raw =
      typeof configFile === 'string'
        ? configFile
        : typeof runner.flags?.config === 'string'
          ? runner.flags.config
          : resolvedConfig;

    const abs = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);

    if (abs.endsWith('.ts')) {
      throw new Error(`Production runner only supports .js config: ${abs}`);
    }

    const mod = require(abs);
    return mod?.default ?? mod;
  };

  (runner as any).loadConfigFile = loadConfigFileStrictJs;

  runner.servicePaths = [
    'services/**/*.service.js',
    'services/**/*.service.dev.js',
    'plugins/**/*.service.js',
    'plugins/**/*.service.dev.js',
  ];

  if (runner.flags.instances !== undefined && cluster.isPrimary) {
    return runner.startWorkers(runner.flags.instances);
  }

  return runner._run();
}
