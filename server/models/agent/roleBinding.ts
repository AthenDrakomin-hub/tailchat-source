import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import type { AgentTriggerMode } from 'tailchat-types';

@index({ groupId: 1, roleId: 1 }, { unique: true })
export class AgentRoleBindingModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  groupId: string;

  @prop({ required: true })
  roleId: string;

  @prop({ type: () => [String], default: [] })
  panelIds: string[];

  @prop({ required: true })
  agentId: string;

  @prop({ default: 'mention-or-script' })
  triggerMode: AgentTriggerMode;

  @prop({ default: true })
  active: boolean;
}

export type AgentRoleBindingDocument = DocumentType<AgentRoleBindingModel>;

const model = getModelForClass(AgentRoleBindingModel);

export type AgentRoleBindingMongoModel = typeof model;

export default model;
