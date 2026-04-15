import fs from 'fs';
import path from 'path';

type JobConfig = {
  intervalSeconds: number;
  groupId: string;
  panelId: string;
  messages: string[];
};

type Config = {
  server: string;
  email: string;
  password: string;
  jobs: JobConfig[];
};

function parseArgs() {
  const args = process.argv.slice(2);
  const idx = args.indexOf('--config');
  if (idx >= 0 && typeof args[idx + 1] === 'string') {
    return { configPath: args[idx + 1] };
  }
  return { configPath: '' };
}

async function readConfig(configPath: string): Promise<Config> {
  const abs = path.isAbsolute(configPath)
    ? configPath
    : path.join(process.cwd(), configPath);
  const raw = await fs.promises.readFile(abs, 'utf-8');
  return JSON.parse(raw);
}

async function apiPost<T>(
  server: string,
  url: string,
  body: any,
  token?: string
): Promise<T> {
  const res = await fetch(`${server}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'X-Token': token } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return json?.data as T;
}

async function login(server: string, email: string, password: string) {
  const data = await apiPost<{ token: string }>(server, '/api/user/login', {
    email,
    password,
  });
  if (!data?.token) {
    throw new Error('Login failed: token missing');
  }
  return data.token;
}

async function sendMessage(
  server: string,
  token: string,
  params: { groupId: string; panelId: string; content: string }
) {
  const converseId = `${params.groupId}|${params.panelId}`;
  await apiPost(
    server,
    '/api/chat/message/sendMessage',
    {
      groupId: params.groupId,
      converseId,
      content: params.content,
    },
    token
  );
}

async function main() {
  const { configPath } = parseArgs();
  if (!configPath) {
    throw new Error('Missing --config <path>');
  }

  const cfg = await readConfig(configPath);

  let token = '';
  let loginAt = 0;

  const ensureToken = async () => {
    const now = Date.now();
    if (token && now - loginAt < 55 * 60 * 1000) {
      return token;
    }
    token = await login(cfg.server, cfg.email, cfg.password);
    loginAt = now;
    return token;
  };

  const counters = new Map<string, number>();

  cfg.jobs.forEach((job) => {
    const key = `${job.groupId}|${job.panelId}`;
    counters.set(key, 0);

    setInterval(async () => {
      try {
        const t = await ensureToken();
        const idx = counters.get(key) || 0;
        const msg = job.messages[idx % job.messages.length];
        counters.set(key, idx + 1);

        await sendMessage(cfg.server, t, {
          groupId: job.groupId,
          panelId: job.panelId,
          content: msg,
        });
      } catch (e) {
        console.error(String(e));
        token = '';
      }
    }, Math.max(5, job.intervalSeconds) * 1000);
  });
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});

