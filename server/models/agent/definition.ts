import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import type { AgentRuntimeMode, AgentStatus } from 'tailchat-types';

@index({ agentId: 1 }, { unique: true })
export class AgentDefinitionModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  agentId: string;

  @prop({ required: true })
  name: string;

  @prop()
  avatar?: string;

  @prop({ required: true })
  externalAgentId: string;

  @prop({ default: 'general' })
  domain: string;

  @prop({ default: 'openclaw-bridge' })
  runtimeMode: AgentRuntimeMode;

  @prop({ default: 'openclaw' })
  provider: string;

  @prop()
  description?: string;

  @prop({ type: () => [String], default: [] })
  availableScopes: string[];

  @prop({ type: () => [String], default: [] })
  tags: string[];

  @prop({ default: 'draft' })
  status: AgentStatus;
}

export type AgentDefinitionDocument = DocumentType<AgentDefinitionModel>;

const model = getModelForClass(AgentDefinitionModel);

export type AgentDefinitionMongoModel = typeof model;

export default model;
