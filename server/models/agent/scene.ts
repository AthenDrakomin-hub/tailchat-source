import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import type { AgentSceneAction, AgentSceneTarget } from 'tailchat-types';

@index({ sceneId: 1 }, { unique: true })
export class AgentSceneConfigModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  sceneId: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  domain: string;

  @prop({ required: true })
  target: AgentSceneTarget;

  @prop({ type: () => [String], default: [] })
  enabledActions: AgentSceneAction[];

  @prop({ type: () => [String], default: [] })
  roleIds: string[];

  @prop({ type: () => [String], default: [] })
  groupIds: string[];

  @prop({ default: true })
  enabled: boolean;
}

export type AgentSceneConfigDocument = DocumentType<AgentSceneConfigModel>;

const model = getModelForClass(AgentSceneConfigModel);

export type AgentSceneConfigMongoModel = typeof model;

export default model;
