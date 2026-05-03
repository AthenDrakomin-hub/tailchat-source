import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentDefinitionDocument,
  AgentDefinitionMongoModel,
} from '../../models/agent/definition';
import { buildAgentDefinition } from './utils/agentDefinition';

interface DefinitionService
  extends TcService,
    TcDbService<AgentDefinitionDocument, AgentDefinitionMongoModel> {}

class DefinitionService extends TcService {
  get serviceName(): string {
    return 'agent.definition';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/definition').default);

    this.registerAction('list', this.list);
    this.registerAction('create', this.create, {
      params: {
        agentId: 'string',
        name: 'string',
        externalAgentId: 'string',
        avatar: { type: 'string', optional: true },
        domain: { type: 'string', optional: true },
        runtimeMode: { type: 'string', optional: true },
        provider: { type: 'string', optional: true },
        description: { type: 'string', optional: true },
        availableScopes: { type: 'array', items: 'string', optional: true },
        tags: { type: 'array', items: 'string', optional: true },
        status: { type: 'string', optional: true },
      },
    });
    this.registerAction('updateStatus', this.updateStatus, {
      params: {
        agentId: 'string',
        status: 'string',
      },
    });
  }

  async list(ctx: TcContext) {
    const docs = await this.adapter.model.find({}).sort({ updatedAt: -1 }).exec();
    return await this.transformDocuments(ctx, {}, docs);
  }

  async create(ctx: TcContext<any>) {
    const payload = buildAgentDefinition(ctx.params);
    const doc = await this.adapter.model.create(payload);
    return await this.transformDocuments(ctx, {}, doc);
  }

  async updateStatus(
    ctx: TcContext<{
      agentId: string;
      status: string;
    }>
  ) {
    const doc = await this.adapter.model.findOneAndUpdate(
      { agentId: ctx.params.agentId },
      { $set: { status: ctx.params.status } },
      { new: true }
    );
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default DefinitionService;
