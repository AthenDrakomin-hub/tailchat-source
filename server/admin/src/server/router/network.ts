/**
 * Network 相关接口
 */

import { Router } from 'express';
import { broker } from '../broker';
import { auth } from '../middleware/auth';
import _ from 'lodash';

const router = Router();

router.get('/all', auth(), async (req, res) => {
  try {
    res.json({
      available: true,
      nodes: Array.from(new Map(broker.registry.nodes.nodes).values()).map(
        (item) =>
          _.pick(item, [
            'id',
            'available',
            'local',
            'ipList',
            'hostname',
            'cpu',
            'client',
          ])
      ),
      events: broker.registry.events.events.map((item: any) => item.name),
      services: broker.registry.services.services.map((item: any) => item.name),
      actions: Array.from(new Map(broker.registry.actions.actions).keys()),
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      available: false,
      nodes: [],
      events: [],
      services: [],
      actions: [],
      error: err instanceof Error ? err.message : String(err),
      actionHint: '请确认 broker 注册表可访问，并检查网络节点状态。',
    });
  }
});

router.get('/ping', auth(), async (req, res) => {
  try {
    const pong = await broker.ping();
    res.json({
      available: true,
      pong,
    });
  } catch (err) {
    res.status(503).json({
      success: false,
      available: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export { router as networkRouter };
