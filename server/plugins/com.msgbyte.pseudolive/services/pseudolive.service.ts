import type { ServiceSchema } from 'moleculer';
import {
  TcContext,
  TcService,
  call,
  config,
  NoPermissionError,
  TcDbService,
} from 'tailchat-server-sdk';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';
import { spawn } from 'child_process';
import { parseObjectNameFromFileUrl } from '../utils/parseObjectNameFromFileUrl';
import mime from 'mime';
import type { PseudoLiveTaskDocument, PseudoLiveTaskModel } from '../models/task';

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

interface PseudoLiveService
  extends TcService,
    TcDbService<PseudoLiveTaskDocument, PseudoLiveTaskModel> {}
class PseudoLiveService extends TcService {
  get serviceName() {
    return 'plugin:com.msgbyte.pseudolive';
  }

  private queue: string[] = [];
  private processing = false;

  onInit() {
    // 伪直播任务表（用于排队/状态展示/排错）
    this.registerLocalDb(require('../models/task').default);

    this.registerAction('start', this.start, {
      params: {
        groupId: 'string',
        panelId: 'string',
        title: { type: 'string', optional: true },
        fileUrl: 'string',
      },
    });

    this.registerAction('getTask', this.getTask, {
      params: { streamId: 'string' },
      visibility: 'public',
    });
  }

  private get dataDir() {
    return (
      process.env.PSEUDOLIVE_DATA_DIR ||
      path.join(process.cwd(), 'data', 'pseudolive')
    );
  }

  /**
   * 查询任务状态（给前端/运维排错用）
   */
  private async getTask(ctx: TcContext<{ streamId: string }>) {
    const doc = await this.adapter.model.findOne({ streamId: ctx.params.streamId });
    return doc ? doc.toObject() : null;
  }

  private enqueue(taskId: string) {
    this.queue.push(taskId);
    void this.processQueue();
  }

  /**
   * 单机串行处理（默认 1 并发），避免 ffmpeg 长任务阻塞 action worker
   */
  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const taskId = this.queue.shift();
        if (!taskId) break;
        try {
          await this.runTask(taskId);
        } catch (err) {
          this.logger.error('[pseudolive] runTask failed', err);
        }
      }
    } finally {
      this.processing = false;
    }
  }

  private async runTask(taskId: string) {
    const task = await this.adapter.model.findById(taskId);
    if (!task) return;
    if (task.status !== 'queued') return;

    const startedAt = new Date();
    await this.adapter.model.updateOne(
      { _id: taskId },
      { status: 'running', startedAt, error: '' }
    );

    const streamId = task.streamId;
    const title = task.title || '直播';
    const groupId = task.groupId;
    const panelId = task.panelId;
    const userId = task.startedBy;

    const rawDir = path.join(this.dataDir, 'raw');
    const rawPath = path.join(rawDir, `${streamId}.mp4`);
    const outDir = path.join(this.dataDir, 'hls', streamId);
    await fs.promises.mkdir(rawDir, { recursive: true });
    await fs.promises.mkdir(outDir, { recursive: true });

    try {
      // 1) 下载原始文件
      const readStream = (await this.broker.call('file.get', {
        objectName: task.fileObjectName,
      })) as NodeJS.ReadableStream;
      await pipeline(readStream, fs.createWriteStream(rawPath));

      // 2) ffmpeg 转码 HLS
      const hlsPath = path.join(outDir, 'index.m3u8');
      await runFfmpeg([
        '-y',
        '-i',
        rawPath,
        '-c:v',
        'libx264',
        '-preset',
        process.env.PSEUDOLIVE_FFMPEG_PRESET || 'veryfast',
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

      // 3) 上传 HLS 文件
      const files = await fs.promises.readdir(outDir);
      for (const filename of files) {
        const filePath = path.join(outDir, filename);
        const stat = await fs.promises.stat(filePath);
        if (!stat.isFile()) continue;

        const ext = path.extname(filename);
        const contentType = mime.getType(ext) || 'application/octet-stream';
        const objectName = `streams/${streamId}/${filename}`;
        const stream = fs.createReadStream(filePath);

        await this.broker.call('file.putObject', stream, {
          meta: {
            bucketName: config.storage.bucketName,
            objectName,
            size: stat.size,
            metaData: { 'content-type': contentType },
          },
        });
      }

      const hlsUrl = `${config.apiUrl}/static/streams/${streamId}/index.m3u8`;
      await this.adapter.model.updateOne(
        { _id: taskId },
        { status: 'done', hlsUrl, finishedAt: new Date() }
      );

      // 4) 发送“就绪”消息（带 meta，前端 LiveCard 才能渲染）
      const converseId = `${groupId}|${panelId}`;
      await this.broker.call(
        'chat.message.sendMessage',
        {
          converseId,
          groupId,
          content: `直播已就绪：${title}`,
          meta: {
            pseudolive: {
              streamId,
              title,
              status: 'ready',
              hlsUrl,
              startedBy: userId,
              startedAt: Date.now(),
            },
          },
        },
        { meta: { userId } }
      );
    } catch (err: any) {
      const msg = String(err?.message || err || 'unknown error');
      await this.adapter.model.updateOne(
        { _id: taskId },
        { status: 'failed', error: msg, finishedAt: new Date() }
      );

      const converseId = `${groupId}|${panelId}`;
      await this.broker.call(
        'chat.message.sendMessage',
        {
          converseId,
          groupId,
          content: `直播准备失败：${title}（${msg}）`,
        },
        { meta: { userId } }
      );
      throw err;
    } finally {
      // 清理临时文件
      fs.promises.unlink(rawPath).catch(() => {});
      fs.promises.rm(outDir, { recursive: true, force: true }).catch(() => {});
      // 尝试删除原文件（失败不影响）
      this.broker
        .call('file.delete', { objectName: task.fileObjectName }, { meta: { userId } })
        .catch(() => {});
    }
  }

  private async isEnabled(): Promise<boolean> {
    try {
      const enabled = await this.broker.call('config.get', {
        key: 'ops.pseudolive.enabled',
      });
      if (typeof enabled === 'boolean') return enabled;
      return true;
    } catch {
      return true;
    }
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

    if (!(await this.isEnabled())) {
      throw new Error(t('当前已关闭伪直播功能'));
    }

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
    const converseId = `${groupId}|${panelId}`;

    // 记录任务并异步执行
    const doc = await this.adapter.model.create({
      streamId,
      status: 'queued',
      groupId,
      panelId,
      title: title || '直播',
      fileObjectName: objectName,
      startedBy: String(userId),
    });

    // 先发“准备中”消息（不带 hlsUrl，前端卡片会等就绪消息再显示）
    await ctx.call('chat.message.sendMessage', {
      converseId,
      groupId,
      content: `直播准备中：${title || '直播'}`,
      meta: {
        pseudolive: {
          streamId,
          title: title || '直播',
          status: 'preparing',
          startedBy: userId,
          startedAt: Date.now(),
        },
      },
    });

    this.enqueue(String(doc._id));

    return {
      streamId,
      status: 'queued',
    };
  }
}

export default PseudoLiveService as unknown as ServiceSchema;
