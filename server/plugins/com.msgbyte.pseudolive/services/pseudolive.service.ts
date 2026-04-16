import type { ServiceSchema } from 'moleculer';
import {
  TcContext,
  TcService,
  call,
  config,
  NoPermissionError,
} from 'tailchat-server-sdk';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import { parseObjectNameFromFileUrl } from '../utils/parseObjectNameFromFileUrl';
import mime from 'mime';

function randomId() {
  return Math.random().toString(36).slice(2);
}

async function runFfmpeg(args: string[]) {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn('ffmpeg', args, { stdio: 'inherit' });
    proc.once('error', reject);
    proc.once('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}`));
      }
    });
  });
}

class PseudoLiveService extends TcService {
  get serviceName() {
    return 'plugin:com.msgbyte.pseudolive';
  }

  onInit() {
    this.registerAction('start', this.start, {
      params: {
        groupId: 'string',
        panelId: 'string',
        title: { type: 'string', optional: true },
        fileUrl: 'string',
      },
    });
  }

  private get dataDir() {
    return (
      process.env.PSEUDOLIVE_DATA_DIR ||
      path.join(process.cwd(), 'data', 'pseudolive')
    );
  }

  async start(
    ctx: TcContext<{
      groupId: string;
      panelId: string;
      title?: string;
      fileUrl: string;
    }>
  ) {
    const { groupId, panelId, title, fileUrl } = ctx.params;
    const { userId, t } = ctx.meta;

    const [hasPermission] = await call(ctx).checkUserPermissions(
      groupId,
      userId,
      ['core.managePanel']
    );
    if (!hasPermission) {
      throw new NoPermissionError(t('没有操作权限'));
    }

    const objectName = parseObjectNameFromFileUrl(fileUrl);
    if (!objectName) {
      throw new Error(t('文件地址不合法'));
    }

    const streamId = `pl_${Date.now()}_${randomId()}`;
    const rawDir = path.join(this.dataDir, 'raw');
    const rawPath = path.join(rawDir, `${streamId}.mp4`);
    const outDir = path.join(this.dataDir, 'hls', streamId);

    await fs.promises.mkdir(rawDir, { recursive: true });
    await fs.promises.mkdir(outDir, { recursive: true });

    const readStream = (await ctx.call('file.get', {
      objectName,
    })) as NodeJS.ReadableStream;
    await pipeline(readStream, fs.createWriteStream(rawPath));

    const hlsPath = path.join(outDir, 'index.m3u8');

    await runFfmpeg([
      '-y',
      '-i',
      rawPath,
      '-c:v',
      'libx264',
      '-preset',
      'veryfast',
      '-c:a',
      'aac',
      '-ar',
      '48000',
      '-b:a',
      '128k',
      '-f',
      'hls',
      '-hls_time',
      '4',
      '-hls_playlist_type',
      'event',
      '-hls_segment_filename',
      path.join(outDir, 'segment_%05d.ts'),
      hlsPath,
    ]);

    const files = await fs.promises.readdir(outDir);
    await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(outDir, filename);
        const stat = await fs.promises.stat(filePath);
        if (!stat.isFile()) {
          return;
        }

        const ext = path.extname(filename);
        const contentType = mime.getType(ext) || 'application/octet-stream';
        const objectName = `streams/${streamId}/${filename}`;
        const stream = fs.createReadStream(filePath);

        await ctx.call('file.putObject', stream, {
          meta: {
            bucketName: config.storage.bucketName,
            objectName,
            size: stat.size,
            metaData: {
              'content-type': contentType,
            },
          },
        });
      })
    );

    ctx.call('file.delete', { objectName }).catch(() => {});
    fs.promises.unlink(rawPath).catch(() => {});
    fs.promises.rm(outDir, { recursive: true, force: true }).catch(() => {});

    const hlsUrl = `${config.apiUrl}/static/streams/${streamId}/index.m3u8`;
    const converseId = `${groupId}|${panelId}`;

    const meta = {
      pseudolive: {
        streamId,
        title: title || '直播',
        status: 'ready',
        hlsUrl,
        startedBy: userId,
        startedAt: Date.now(),
      },
    };

    await ctx.call('chat.message.sendMessage', {
      converseId,
      groupId,
      content: `正在直播：${title || '直播'}`,
      meta,
    });

    return meta.pseudolive;
  }
}

export default PseudoLiveService as unknown as ServiceSchema;
