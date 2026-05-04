import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentComplianceRuleDocument,
  AgentComplianceMongoModel,
} from '../../models/agent/compliance';
import { buildAgentComplianceRule } from './utils/agentCompliance';

interface ComplianceService
  extends TcService,
    TcDbService<AgentComplianceRuleDocument, AgentComplianceMongoModel> {}

class ComplianceService extends TcService {
  get serviceName(): string {
    return 'agent.compliance';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/compliance').default);

    this.registerAction('list', this.list);
    this.registerAction('create', this.create, {
      params: {
        action: 'string',
        blocked: 'boolean',
        reason: { type: 'string', optional: true },
        scopeSceneId: { type: 'string', optional: true },
        scopeGroupId: { type: 'string', optional: true },
        scopeRoleId: { type: 'string', optional: true },
      },
    });
  }

  async list(ctx: TcContext) {
    const docs = await this.adapter.model.find({}).sort({ updatedAt: -1 }).limit(100).exec();
    return await this.transformDocuments(ctx, {}, docs);
  }

  async create(ctx: TcContext<any>) {
    const payload = buildAgentComplianceRule(ctx.params);
    const doc = await this.adapter.model.create(payload);
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default ComplianceService;
