import { Router } from 'express';
import axios from 'axios';
import { broker } from '../broker';
import { auth } from '../middleware/auth';

const router = Router();

const OPS_EXECUTOR_URL = process.env.OPS_EXECUTOR_URL || '';
const EXECUTOR_SHARED_SECRET = process.env.EXECUTOR_SHARED_SECRET || '';

function isExecutorConfigured() {
  return Boolean(OPS_EXECUTOR_URL && EXECUTOR_SHARED_SECRET);
}

function respondExecutorUnavailable(res: any, err: any) {
  res.status(503).json({
    ok: false,
    error: err?.message ? String(err.message) : 'executor unreachable',
  });
}

async function callExecutor(path: string) {
  if (!isExecutorConfigured()) {
    throw new Error('executor not configured');
  }
  const url = `${OPS_EXECUTOR_URL.replace(/\/+$/, '')}${path}`;
  const { data } = await axios.request({
    method: 'POST',
    url,
    headers: {
      'X-Executor-Secret': EXECUTOR_SHARED_SECRET,
    },
    timeout: 20_000,
  });
  return data;
}

async function getExecutor(path: string) {
  if (!isExecutorConfigured()) {
    throw new Error('executor not configured');
  }
  const url = `${OPS_EXECUTOR_URL.replace(/\/+$/, '')}${path}`;
  const { data } = await axios.request({
    method: 'GET',
    url,
    headers: {
      'X-Executor-Secret': EXECUTOR_SHARED_SECRET,
    },
    timeout: 20_000,
  });
  return data;
}

router.get('/config', auth(), async (req, res, next) => {
  try {
    const pseudoliveEnabled = await broker.call('config.get', {
      key: 'ops.pseudolive.enabled',
    });
    const botEnabled = await broker.call('config.get', { key: 'ops.bot.enabled' });
    const botIntervalSec = await broker.call('config.get', {
      key: 'ops.bot.intervalSec',
    });
    const botUserId = await broker.call('config.get', { key: 'ops.bot.userId' });
    const botGroupId = await broker.call('config.get', { key: 'ops.bot.groupId' });
    const botPanelId = await broker.call('config.get', { key: 'ops.bot.panelId' });
    const botMessages = await broker.call('config.get', { key: 'ops.bot.messages' });

    res.json({
      pseudoliveEnabled: typeof pseudoliveEnabled === 'boolean' ? pseudoliveEnabled : true,
      bot: {
        enabled: typeof botEnabled === 'boolean' ? botEnabled : false,
        intervalSec: typeof botIntervalSec === 'number' ? botIntervalSec : 30,
        userId: typeof botUserId === 'string' ? botUserId : '',
        groupId: typeof botGroupId === 'string' ? botGroupId : '',
        panelId: typeof botPanelId === 'string' ? botPanelId : '',
        messages: Array.isArray(botMessages) ? botMessages : [],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/status', auth(), async (req, res, next) => {
  try {
    const pseudoliveEnabled = await broker.call('config.get', {
      key: 'ops.pseudolive.enabled',
    });
    const botEnabled = await broker.call('config.get', { key: 'ops.bot.enabled' });
    const botIntervalSec = await broker.call('config.get', {
      key: 'ops.bot.intervalSec',
    });
    const botUserId = await broker.call('config.get', { key: 'ops.bot.userId' });
    const botGroupId = await broker.call('config.get', { key: 'ops.bot.groupId' });
    const botPanelId = await broker.call('config.get', { key: 'ops.bot.panelId' });
    const botMessages = await broker.call('config.get', { key: 'ops.bot.messages' });

    res.json({
      pseudoliveEnabled: typeof pseudoliveEnabled === 'boolean' ? pseudoliveEnabled : true,
      bot: {
        enabled: typeof botEnabled === 'boolean' ? botEnabled : false,
        intervalSec: typeof botIntervalSec === 'number' ? botIntervalSec : 30,
        userId: typeof botUserId === 'string' ? botUserId : '',
        groupId: typeof botGroupId === 'string' ? botGroupId : '',
        panelId: typeof botPanelId === 'string' ? botPanelId : '',
        messages: Array.isArray(botMessages) ? botMessages : [],
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/config', auth(), async (req, res, next) => {
  try {
    const { pseudoliveEnabled, bot } = req.body ?? {};
    if (typeof pseudoliveEnabled === 'boolean') {
      await broker.call('config.set', {
        key: 'ops.pseudolive.enabled',
        value: pseudoliveEnabled,
      });
    }

    if (bot && typeof bot === 'object') {
      if (typeof bot.enabled === 'boolean') {
        await broker.call('config.set', { key: 'ops.bot.enabled', value: bot.enabled });
      }
      if (typeof bot.intervalSec === 'number') {
        await broker.call('config.set', {
          key: 'ops.bot.intervalSec',
          value: bot.intervalSec,
        });
      }
      if (typeof bot.userId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.userId', value: bot.userId });
      }
      if (typeof bot.groupId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.groupId', value: bot.groupId });
      }
      if (typeof bot.panelId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.panelId', value: bot.panelId });
      }
      if (typeof bot.messages === 'string') {
        const lines = bot.messages
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean);
        await broker.call('config.set', { key: 'ops.bot.messages', value: lines });
      } else if (Array.isArray(bot.messages)) {
        await broker.call('config.set', { key: 'ops.bot.messages', value: bot.messages });
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.post('/status', auth(), async (req, res, next) => {
  try {
    const { pseudoliveEnabled, bot } = req.body ?? {};
    if (typeof pseudoliveEnabled === 'boolean') {
      await broker.call('config.set', {
        key: 'ops.pseudolive.enabled',
        value: pseudoliveEnabled,
      });
    }

    if (bot && typeof bot === 'object') {
      if (typeof bot.enabled === 'boolean') {
        await broker.call('config.set', { key: 'ops.bot.enabled', value: bot.enabled });
      }
      if (typeof bot.intervalSec === 'number') {
        await broker.call('config.set', {
          key: 'ops.bot.intervalSec',
          value: bot.intervalSec,
        });
      }
      if (typeof bot.userId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.userId', value: bot.userId });
      }
      if (typeof bot.groupId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.groupId', value: bot.groupId });
      }
      if (typeof bot.panelId === 'string') {
        await broker.call('config.set', { key: 'ops.bot.panelId', value: bot.panelId });
      }
      if (typeof bot.messages === 'string') {
        const lines = bot.messages
          .split('\n')
          .map((s: string) => s.trim())
          .filter(Boolean);
        await broker.call('config.set', { key: 'ops.bot.messages', value: lines });
      } else if (Array.isArray(bot.messages)) {
        await broker.call('config.set', { key: 'ops.bot.messages', value: bot.messages });
      }
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/livekit/ps', auth(), async (req, res, next) => {
  try {
    const data = await getExecutor('/livekit/ps');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

router.get('/livekit/status', auth(), async (req, res, next) => {
  try {
    const data = await getExecutor('/livekit/status');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

router.post('/livekit/start', auth(), async (req, res, next) => {
  try {
    const data = await callExecutor('/livekit/start');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

router.post('/livekit/stop', auth(), async (req, res, next) => {
  try {
    const data = await callExecutor('/livekit/stop');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

router.post('/livekit/restart', auth(), async (req, res, next) => {
  try {
    const data = await callExecutor('/livekit/restart');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

router.get('/executor/health', auth(), async (req, res, next) => {
  try {
    const data = await getExecutor('/health');
    res.json(data);
  } catch (err) {
    respondExecutorUnavailable(res, err);
  }
});

export { router as opsRouter };
