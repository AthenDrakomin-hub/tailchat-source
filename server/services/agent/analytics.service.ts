import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentAnalyticsEventDocument,
  AgentAnalyticsMongoModel,
} from '../../models/agent/analytics';
import { buildAgentAnalyticsEvent } from './utils/agentAnalytics';

interface AnalyticsService
  extends TcService,
    TcDbService<AgentAnalyticsEventDocument, AgentAnalyticsMongoModel> {}

class AnalyticsService extends TcService {
  get serviceName(): string {
    return 'agent.analytics';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/analytics').default);

    this.registerAction('list', this.list);
    this.registerAction('create', this.create, {
      params: {
        agentId: 'string',
        eventType: 'string',
        sourceSceneId: { type: 'string', optional: true },
        groupId: { type: 'string', optional: true },
        roleId: { type: 'string', optional: true },
        conversionLabel: { type: 'string', optional: true },
        metadata: { type: 'object', optional: true },
      },
    });
  }

  async list(ctx: TcContext) {
    const docs = await this.adapter.model.find({}).sort({ createdAt: -1 }).limit(100).exec();
    return await this.transformDocuments(ctx, {}, docs);
  }

  async create(ctx: TcContext<any>) {
    const payload = buildAgentAnalyticsEvent(ctx.params);
    const doc = await this.adapter.model.create(payload);
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default AnalyticsService;
