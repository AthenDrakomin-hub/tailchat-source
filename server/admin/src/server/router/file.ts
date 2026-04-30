/**
 * Network 相关接口
 */

import { Router } from 'express';
import { callBrokerAction } from '../broker';
import { auth } from '../middleware/auth';
import Busboy from '@fastify/busboy';
import fileModel from '../../../../models/file';
import { isDbReady } from '../utils/db-ready';

const router = Router();

router.put('/upload', auth(), async (req, res) => {
  const busboy = new Busboy({ headers: req.headers as any });

  const promises: Promise<any>[] = [];
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    promises.push(
      callBrokerAction('file.save', file, {
        filename: filename,
      })
        .then((data) => {
          console.log(data);
          return data;
        })
        .catch((err) => {
          file.resume(); // Drain file stream to continue processing form
          busboy.emit('error', err);
          return err;
        })
    );
  });

  busboy.on('finish', async () => {
    /* istanbul ignore next */
    if (promises.length == 0) {
      res.status(500).json({
        success: false,
        error: 'File missing in the request',
      });
      return;
    }

    try {
      const files = await Promise.all(promises);

      res.json({ files });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  busboy.on('error', (err) => {
    console.error(err);
    req.unpipe(busboy);
    req.resume();
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  req.pipe(busboy);
});

router.get('/filesizeSum', auth(), async (req, res) => {
  if (!isDbReady()) {
    res.json({
      success: false,
      totalSize: 0,
      error: 'database not ready',
    });
    return;
  }

  try {
    const ret = await fileModel.aggregate([
      {
        $group: {
          _id: '$objectName' as any,
          size: { $first: '$size' },
        },
      },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    const totalSize = (ret?.[0]?.totalSize as number | undefined) ?? 0;
    res.json({ totalSize });
  } catch (err) {
    res.json({
      success: false,
      totalSize: 0,
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

export { router as fileRouter };
