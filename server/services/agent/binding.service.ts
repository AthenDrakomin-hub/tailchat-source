import { TcContext, TcDbService, TcService } from 'tailchat-server-sdk';
import type {
  AgentRoleBindingDocument,
  AgentRoleBindingMongoModel,
} from '../../models/agent/roleBinding';
import { buildAgentRoleBinding } from './utils/agentRoleBinding';

interface BindingService
  extends TcService,
    TcDbService<AgentRoleBindingDocument, AgentRoleBindingMongoModel> {}

class BindingService extends TcService {
  get serviceName(): string {
    return 'agent.binding';
  }

  onInit(): void {
    this.registerLocalDb(require('../../models/agent/roleBinding').default);

    this.registerAction('get', this.get, {
      params: {
        groupId: 'string',
        roleId: 'string',
      },
    });
    this.registerAction('upsert', this.upsert, {
      params: {
        groupId: 'string',
        roleId: 'string',
        agentId: 'string',
        panelIds: { type: 'array', items: 'string', optional: true },
        triggerMode: { type: 'string', optional: true },
        active: { type: 'boolean', optional: true },
      },
    });
  }

  async get(
    ctx: TcContext<{
      groupId: string;
      roleId: string;
    }>
  ) {
    const doc = await this.adapter.model.findOne(ctx.params).exec();
    return await this.transformDocuments(ctx, {}, doc);
  }

  async upsert(ctx: TcContext<any>) {
    const payload = buildAgentRoleBinding(ctx.params);
    const doc = await this.adapter.model.findOneAndUpdate(
      {
        groupId: payload.groupId,
        roleId: payload.roleId,
      },
      { $set: payload },
      { upsert: true, new: true }
    );
    return await this.transformDocuments(ctx, {}, doc);
  }
}

export default BindingService;
