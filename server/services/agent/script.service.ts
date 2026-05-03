import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentScriptTemplateDocument,
  AgentScriptTemplateMongoModel,
} from '../../models/agent/script';
import { buildAgentScriptTemplate } from './utils/agentScriptTemplate';

interface ScriptService
  extends TcService,
    TcDbService<AgentScriptTemplateDocument, AgentScriptTemplateMongoModel> {}

class ScriptService extends TcService {
  get serviceName(): string {
    return 'agent.script';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/script').default);

    this.registerAction('list', this.list);
    this.registerAction('create', this.create, {
      params: {
        scriptId: 'string',
        name: 'string',
        domain: 'string',
        stages: { type: 'array', items: 'string' },
        entryTrigger: { type: 'string', optional: true },
        conversionGoal: { type: 'string', optional: true },
        forumSinkMode: { type: 'string', optional: true },
      },
    });
  }

  async list(ctx: TcContext) {
    const docs = await this.adapter.model.find({}).sort({ updatedAt: -1 }).exec();
    return await this.transformDocuments(ctx, {}, docs);
  }

  async create(ctx: TcContext<any>) {
    const payload = buildAgentScriptTemplate(ctx.params);
    const doc = await this.adapter.model.create(payload);
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default ScriptService;
