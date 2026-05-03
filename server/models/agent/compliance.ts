import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';

@index({ action: 1, scopeSceneId: 1, scopeGroupId: 1, scopeRoleId: 1 })
export class AgentComplianceRuleModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  action: string;

  @prop({ default: false })
  blocked: boolean;

  @prop()
  reason?: string;

  @prop()
  scopeSceneId?: string;

  @prop()
  scopeGroupId?: string;

  @prop()
  scopeRoleId?: string;
}

export type AgentComplianceRuleDocument = DocumentType<AgentComplianceRuleModel>;

const model = getModelForClass(AgentComplianceRuleModel);

export type AgentComplianceMongoModel = typeof model;

export default model;
