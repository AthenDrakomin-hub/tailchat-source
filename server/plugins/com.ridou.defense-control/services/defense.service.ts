import { TcService, TcDbService, TcContext, SYSTEM_USERID } from 'tailchat-server-sdk';
import type { DefenseConfigDocument, DefenseConfigModel } from '../models/defense';
import { DefenseAuditLogModel } from '../models/defense';
import crypto from 'crypto';
import http from 'http';

const EXECUTOR_PORT = process.env.EXECUTOR_PORT || 9099;
// 生产环境必须显式配置，否则 HMAC 校验形同虚设
const SHARED_SECRET = process.env.DEFENSE_SHARED_SECRET;

async function callExecutor(toState: string, config: any): Promise<any> {
  if (!SHARED_SECRET) {
    throw new Error(
      'DEFENSE_SHARED_SECRET is not set. Refuse to call executor in production mode.'
    );
  }
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ toState, config });
    const hmac = crypto.createHmac('sha256', SHARED_SECRET);
    hmac.update(body);
    const signature = hmac.digest('hex');

    const req = http.request({
      hostname: '127.0.0.1',
      port: EXECUTOR_PORT,
      path: '/api/transition',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': signature
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Executor Error: ${data}`));
        } else {
          try {
            resolve(JSON.parse(data));
          } catch(e) {
            resolve(data);
          }
        }
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

interface DefenseControlService
  extends TcService,
    TcDbService<DefenseConfigDocument, DefenseConfigModel> {}

class DefenseControlService extends TcService {
  private currentConfig: any = null;

  get serviceName() {
    return 'plugin:com.ridou.defense-control';
  }

  onInit() {
    if (!process.env.DEFENSE_SHARED_SECRET) {
      this.logger.warn(
        '[defense-control] DEFENSE_SHARED_SECRET is not configured. ' +
          'Defense executor integration will be disabled until you set it.'
      );
    }

    this.registerLocalDb(require('../models/defense').default);
    this.registerLocalDb(require('../models/defense').DefenseAuditLogModel);

    this.registerAction('getConfig', this.getConfig);
    this.registerAction('updateConfig', this.updateConfig);
    this.registerAction('getAuditLogs', this.getAuditLogs);
    this.registerAction('executorWebhook', this.executorWebhook);
  }

  async onStart() {
    // Load config on start
    let config = await this.adapter.model.findOne({});
    if (!config) {
      config = await this.adapter.model.create({ mode: 'L0' });
    }
    this.currentConfig = config.toObject();

    // Wrap actions to implement L0 protection
    const wrapAction = (actionName: string, checkFn: (ctx: any) => void) => {
      const actionList = this.broker.registry.actions.get(actionName);
      if (!actionList) return;
      const endpoints = actionList.endpoints;
      for (const endpoint of endpoints) {
        if (endpoint.local) {
          const originalHandler = endpoint.action.handler;
          endpoint.action.handler = async (ctx: any) => {
            await checkFn(ctx);
            return originalHandler(ctx);
          };
        }
      }
    };

    wrapAction('user.register', async (ctx: any) => {
      if (this.currentConfig?.disableRegister) {
        throw new Error(ctx.meta.t ? ctx.meta.t('当前处于应用自保状态，注册已关闭') : 'Application Defense L0: user registration is temporarily disabled.');
      }
    });

    wrapAction('file.save', async (ctx: any) => {
      if (this.currentConfig?.disableUpload) {
        throw new Error(ctx.meta.t ? ctx.meta.t('当前处于应用自保状态，文件上传已关闭') : 'Application Defense L0: file upload is temporarily disabled.');
      }
    });
  }

  async getConfig(ctx: TcContext) {
    let config = await this.adapter.model.findOne({});
    if (!config) {
      config = await this.adapter.model.create({ mode: 'L0' });
    }
    return config;
  }

  async getAuditLogs(ctx: TcContext) {
    if (ctx.meta.userId !== SYSTEM_USERID) {
      throw new Error('No permission to view defense audit logs');
    }
    return await DefenseAuditLogModel.find({}).sort({ createdAt: -1 }).limit(100);
  }

  async executorWebhook(ctx: TcContext<any>) {
    // Allows executor to report status (e.g. ROLLBACK from MONITOR)
    const { action, status, message, mode } = ctx.params;
    await DefenseAuditLogModel.create({ action, status, message, mode });
    
    // If it's a rollback, we might want to update the config mode to reflect the current state
    if (action === 'ROLLBACK' && status === 'SUCCESS') {
      const config = await this.adapter.model.findOne({});
      if (config) {
        // Find previous mode, or default to L0
        config.mode = 'L0'; // Simple fallback for now, in reality might be L2
        await config.save();
        this.currentConfig = config.toObject();
      }
    }
    return { success: true };
  }

  async updateConfig(ctx: TcContext<any>) {
    if (ctx.meta.userId !== SYSTEM_USERID) {
      throw new Error('No permission to update defense config');
    }

    const { mode, cloudflare, selfEdges, rateLimit, disableRegister, disableUpload } = ctx.params;
    
    let config = await this.adapter.model.findOne({});
    if (!config) {
      config = await this.adapter.model.create({ mode: 'L0' });
    }

    const nextMode = mode !== undefined ? mode : config.mode;
    const nextCloudflare = cloudflare !== undefined ? cloudflare : config.cloudflare;

    if (nextMode === 'L2' || nextMode === 'L3') {
      if (!nextCloudflare || !nextCloudflare.apiKey || !nextCloudflare.email || !nextCloudflare.zoneId) {
        throw new Error('当前档位必须填写完整的 Cloudflare 凭证 (API Key, Email, Zone ID) 才能通过 PRECHECK');
      }
    }

    // Call Executor to trigger PRECHECK and other states
    if (nextMode !== config.mode) {
      const payloadConfig = { 
        mode: nextMode, 
        cloudflare: nextCloudflare, 
        selfEdges: selfEdges !== undefined ? selfEdges : config.selfEdges,
        rateLimit: rateLimit !== undefined ? rateLimit : config.rateLimit
      };

      const executeWithAudit = async (action: string) => {
        try {
          await callExecutor(action, payloadConfig);
          await DefenseAuditLogModel.create({ action, status: 'SUCCESS', mode: nextMode });
        } catch (err: any) {
          await DefenseAuditLogModel.create({ action, status: 'FAILED', message: err.message, mode: nextMode });
          throw err;
        }
      };

      // If we were already in L2 or L3, and we are switching to another mode,
      // it's safer to rollback previous iptables rules first to avoid rule accumulation.
      if (config.mode === 'L2' || config.mode === 'L3') {
        try {
          await executeWithAudit('ROLLBACK');
        } catch (e) {} // ignore rollback errors if backup missing
      }

      if (nextMode === 'L3' || nextMode === 'L2') {
        await executeWithAudit('PRECHECK');
        await executeWithAudit('DRYRUN');
        await executeWithAudit('COMMIT');
        await executeWithAudit('MONITOR');
      } else if (nextMode === 'L0' || nextMode === 'L1') {
        // Already rolled back above if previous was L2/L3
        await executeWithAudit('IDLE');
      }
    }

    if (mode !== undefined) config.mode = mode;
    if (cloudflare !== undefined) config.cloudflare = cloudflare;
    if (selfEdges !== undefined) config.selfEdges = selfEdges;
    if (rateLimit !== undefined) config.rateLimit = rateLimit;
    if (typeof disableRegister === 'boolean') config.disableRegister = disableRegister;
    if (typeof disableUpload === 'boolean') config.disableUpload = disableUpload;

    await config.save();

    this.currentConfig = config.toObject();

    return config;
  }
}

export default DefenseControlService;
