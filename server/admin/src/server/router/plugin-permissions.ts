import express from 'express';
import { broker } from '../broker';

export const pluginPermissionsRouter = express.Router();

pluginPermissionsRouter.get('/', async (req, res) => {
  res.json({ data: [], total: 0 });
});
