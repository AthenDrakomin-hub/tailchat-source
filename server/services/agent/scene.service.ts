import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentSceneConfigDocument,
  AgentSceneConfigMongoModel,
} from '../../models/agent/scene';
import { buildAgentSceneConfig } from './utils/agentSceneConfig';

interface SceneService
  extends TcService,
    TcDbService<AgentSceneConfigDocument, AgentSceneConfigMongoModel> {}

class SceneService extends TcService {
  get serviceName(): string {
    return 'agent.scene';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/scene').default);

    this.registerAction('list', this.list);
    this.registerAction('create', this.create, {
      params: {
        sceneId: 'string',
        name: 'string',
        domain: 'string',
        target: 'string',
        enabledActions: { type: 'array', items: 'string', optional: true },
        roleIds: { type: 'array', items: 'string', optional: true },
        groupIds: { type: 'array', items: 'string', optional: true },
        enabled: { type: 'boolean', optional: true },
      },
    });
  }

  async list(ctx: TcContext) {
    const docs = await this.adapter.model.find({}).sort({ updatedAt: -1 }).exec();
    return await this.transformDocuments(ctx, {}, docs);
  }

  async create(ctx: TcContext<any>) {
    const payload = buildAgentSceneConfig(ctx.params);
    const doc = await this.adapter.model.create(payload);
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default SceneService;
