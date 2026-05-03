import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';

@index({ agentId: 1, eventType: 1, createdAt: -1 })
export class AgentAnalyticsEventModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  agentId: string;

  @prop({ required: true })
  eventType: string;

  @prop()
  sourceSceneId?: string;

  @prop()
  groupId?: string;

  @prop()
  roleId?: string;

  @prop()
  conversionLabel?: string;

  @prop({ type: () => Object, default: {} })
  metadata: Record<string, unknown>;
}

export type AgentAnalyticsEventDocument = DocumentType<AgentAnalyticsEventModel>;

const model = getModelForClass(AgentAnalyticsEventModel);

export type AgentAnalyticsMongoModel = typeof model;

export default model;
