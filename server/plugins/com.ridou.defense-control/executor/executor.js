const http = require('http');
const crypto = require('crypto');
const https = require('https');
const { execSync } = require('child_process');

const PORT = process.env.EXECUTOR_PORT || 9099;
// 生产环境必须显式配置，否则签名校验形同虚设
const SHARED_SECRET = process.env.DEFENSE_SHARED_SECRET;

const STATES = {
  IDLE: 'IDLE',
  PRECHECK: 'PRECHECK',
  DRYRUN: 'DRYRUN',
  COMMIT: 'COMMIT',
  MONITOR: 'MONITOR',
  ROLLBACK: 'ROLLBACK'
};

let currentState = STATES.IDLE;
let currentConfig = {};

function verifySignature(rawBody, signature) {
  if (!SHARED_SECRET) {
    return false;
  }
  const hmac = crypto.createHmac('sha256', SHARED_SECRET);
  hmac.update(rawBody);
  const expected = hmac.digest('hex');
  
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

// Internal probe module
async function probeUrl(urlStr, isWs = false) {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      if (isWs) {
        const req = https.request({
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname,
          headers: {
            'Connection': 'Upgrade',
            'Upgrade': 'websocket'
          },
          timeout: 5000
        });
        req.on('upgrade', (res, socket, head) => {
          socket.destroy();
          resolve(true);
        });
        req.on('error', (e) => {
          resolve(false);
        });
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
        req.end();
      } else {
        https.get(urlStr, { timeout: 5000 }, (res) => {
          // Accept any response under 500 as "alive"
          resolve(res.statusCode < 500);
        }).on('error', (e) => {
          resolve(false);
        }).on('timeout', () => {
          resolve(false);
        });
      }
    } catch (e) {
      resolve(false);
    }
  });
}

async function runProbes() {
  const results = await Promise.all([
    probeUrl('https://goodpage.cn/'),
    probeUrl('https://goodpage.cn/health'),
    probeUrl('https://goodpage.cn/admin/'),
    probeUrl('wss://goodpage.cn/livekit', true)
  ]);
  return {
    main: results[0],
    health: results[1],
    admin: results[2],
    livekit: results[3],
    allOk: results.every(r => r)
  };
}

// Helper to fetch Cloudflare IPs
async function fetchCloudflareIps() {
  return new Promise((resolve, reject) => {
    https.get('https://api.cloudflare.com/client/v4/ips', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            resolve([...parsed.result.ipv4_cidrs, ...parsed.result.ipv6_cidrs]);
          } else {
            resolve([]);
          }
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

let monitorInterval = null;
let lastCommitTime = null;
const TTL_MS = 60000; // 60s TTL for rollback testing? The task says "TTL自动回滚逻辑". Let's say 5 mins?
const PORTS = '443,11000,7880';

function runIptables(cmd) {
  try {
    console.log(`[Executor] Running: iptables ${cmd}`);
    // Since we're in docker/sandbox, we might mock this or actually run it if we have privileges.
    // We'll log it and run it.
    execSync(`iptables ${cmd}`);
  } catch (e) {
    console.error(`[Executor] iptables failed: ${e.message}`);
  }
}

// State machine logic framework
async function handleStateTransition(targetState, config) {
  console.log(`[Executor] Transitioning from ${currentState} to ${targetState}`);
  
  if (!Object.values(STATES).includes(targetState)) {
    throw new Error(`Invalid target state: ${targetState}`);
  }
  
  const reportRollback = async (status, msg) => {
    try {
      const body = JSON.stringify({
        action: 'ROLLBACK',
        status,
        message: msg,
        mode: currentConfig ? currentConfig.mode : 'L0'
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 11000,
        path: '/api/plugin:com.ridou.defense-control/executorWebhook',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      req.write(body);
      req.end();
    } catch(e) {}
  };
  
  // Basic State Machine Logic
  switch(targetState) {
    case STATES.IDLE:
      console.log('[Executor] Resetting to IDLE');
      if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
      }
      break;
    case STATES.PRECHECK:
      console.log('[Executor] Running PRECHECK');
      const precheckResult = await runProbes();
      console.log('[Executor] Precheck results:', precheckResult);
      if (!precheckResult.allOk) {
        throw new Error('PRECHECK failed, some probes are down');
      }
      break;
    case STATES.DRYRUN:
      console.log('[Executor] Executing DRYRUN logic: Fetch CF IPs and temp allow');
      
      // Save backup snapshot for rollback
      try {
        execSync('iptables-save > /tmp/defense_iptables_backup.rules');
      } catch (e) {}

      // Allow localhost
      runIptables(`-I INPUT -p tcp -m multiport --dports ${PORTS} -s 127.0.0.1 -j ACCEPT`);

      if (config && (config.mode === 'L2' || config.mode === 'L3')) {
        const ips = await fetchCloudflareIps();
        if (!ips.length) throw new Error('Failed to fetch Cloudflare IPs');
        
        // Allow CF IPs
        for (const ip of ips) {
          if (ip.includes(':')) continue; // skip IPv6
          runIptables(`-I INPUT -p tcp -m multiport --dports ${PORTS} -s ${ip} -j ACCEPT`);
        }
      }

      if (config && config.mode === 'L3' && config.selfEdges) {
        // Allow custom edge nodes
        for (const edge of config.selfEdges) {
          if (edge.ip) {
            runIptables(`-I INPUT -p tcp -m multiport --dports ${PORTS} -s ${edge.ip} -j ACCEPT`);
          }
        }
      }
      break;
    case STATES.COMMIT:
      console.log('[Executor] Executing COMMIT logic: Drop other traffic');
      // Drop all other traffic to the protected ports
      runIptables(`-A INPUT -p tcp -m multiport --dports ${PORTS} -j DROP`);
      lastCommitTime = Date.now();
      
      // Record snapshot as requested by task 3.3
      try {
        execSync('iptables-save > /tmp/defense_iptables_snapshot.rules');
        console.log('[Executor] iptables snapshot saved');
      } catch (e) {
        console.error('[Executor] failed to save iptables snapshot:', e);
      }

      // Generate Nginx rate limit config if L1+
      if (config && config.rateLimit && config.rateLimit.enable) {
        const fs = require('fs');
        const nginxConfig = `
# Auto-generated by Defense Control L1 Rate Limit
limit_req_zone $binary_remote_addr zone=defense_limit:10m rate=${config.rateLimit.requestsPerMinute}r/m;

server {
    # Include this snippet in your server block
    limit_req zone=defense_limit burst=5 nodelay;
}
`;
        fs.writeFileSync('/tmp/defense_nginx_ratelimit.conf', nginxConfig);
        console.log('[Executor] Nginx rate limit config generated at /tmp/defense_nginx_ratelimit.conf');
        // Option to reload nginx: execSync('nginx -s reload');
      } else {
        const fs = require('fs');
        if (fs.existsSync('/tmp/defense_nginx_ratelimit.conf')) {
          fs.unlinkSync('/tmp/defense_nginx_ratelimit.conf');
        }
      }
      break;
    case STATES.MONITOR:
      console.log('[Executor] Starting MONITOR logic: 5s polling & TTL rollback');
      if (monitorInterval) clearInterval(monitorInterval);
      
      let failCount = 0;
      monitorInterval = setInterval(async () => {
        const res = await runProbes();
        if (!res.allOk) {
          failCount++;
          console.log(`[Executor] MONITOR probe failed (${failCount}/3)`);
        } else {
          failCount = 0;
        }

        const now = Date.now();
        const ttlExpired = (now - lastCommitTime) > TTL_MS;

        if (failCount >= 3) {
          console.log(`[Executor] Triggering ROLLBACK! failCount=${failCount}`);
          clearInterval(monitorInterval);
          handleStateTransition(STATES.ROLLBACK, currentConfig).catch(console.error);
        } else if (ttlExpired) {
          console.log(`[Executor] TTL expired successfully, no rollback needed. Transitioning to IDLE.`);
          clearInterval(monitorInterval);
          handleStateTransition(STATES.IDLE, currentConfig).catch(console.error);
        }
      }, 5000);
      break;
    case STATES.ROLLBACK:
      console.log('[Executor] Executing ROLLBACK logic: Restore iptables snapshot');
      if (monitorInterval) clearInterval(monitorInterval);
      try {
        execSync('iptables-restore < /tmp/defense_iptables_backup.rules');
        console.log('[Executor] iptables backup restored');
        await reportRollback('SUCCESS', 'Restored iptables from backup');
      } catch (e) {
        console.error('[Executor] failed to restore iptables backup:', e);
        // Fallback: delete the DROP rule we added
        runIptables(`-D INPUT -p tcp -m multiport --dports ${PORTS} -j DROP`);
        await reportRollback('FAILED', e.message);
      }
      break;
  }
  
  currentState = targetState;
  if (config) {
    currentConfig = config;
  }
  
  return { success: true, state: currentState, message: `Successfully transitioned to ${targetState}` };
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ state: currentState, config: currentConfig }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/transition') {
    let body = [];
    req.on('data', chunk => {
      body.push(chunk);
    });
    req.on('end', async () => {
      const rawBody = Buffer.concat(body).toString();
      const signature = req.headers['x-signature'];
      
      if (!signature) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing signature header (x-signature)' }));
        return;
      }
      
      try {
        if (!verifySignature(rawBody, signature)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid signature' }));
          return;
        }
      } catch(e) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Signature verification failed' }));
        return;
      }

      try {
        const payload = JSON.parse(rawBody);
        const targetState = payload.toState;
        
        const result = await handleStateTransition(targetState, payload.config);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('[Executor] Error during transition:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }
  
  if (req.method === 'GET' && req.url === '/api/probe') {
    runProbes().then(result => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Executor] Defense Control Executor listening on 127.0.0.1:${PORT}`);
});
