/**
 * Network 相关接口
 */

import { Router } from 'express';
import { broker } from '../broker';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/client', auth(), async (req, res, next) => {
  try {
    const config = await broker.call('config.client');

    res.json({
      config,
      available: true,
      actionHint: '',
    });
  } catch (err) {
    res.json({
      config: {},
      available: false,
      error: err instanceof Error ? err.message : String(err),
      actionHint:
        '请确认主系统 broker 已接通，并且 config.client action 在当前环境可调用。',
    });
  }
});

router.patch('/client', auth(), async (req, res, next) => {
  try {
    await broker.call('config.setClientConfig', {
      key: req.body.key,
      value: req.body.value,
    });

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      available: false,
      actionHint:
        '请确认主系统 broker 已接通，并且 config.setClientConfig action 在当前环境可调用。',
    });
  }
});

export { router as configRouter };
