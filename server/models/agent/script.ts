import {
  getModelForClass,
  prop,
  DocumentType,
  index,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import type { AgentForumSinkMode } from 'tailchat-types';

@index({ scriptId: 1 }, { unique: true })
export class AgentScriptTemplateModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ required: true })
  scriptId: string;

  @prop({ required: true })
  name: string;

  @prop({ required: true })
  domain: string;

  @prop({ type: () => [String], required: true, default: [] })
  stages: string[];

  @prop()
  entryTrigger?: string;

  @prop()
  conversionGoal?: string;

  @prop({ default: 'topic-thread' })
  forumSinkMode: AgentForumSinkMode;

  @prop()
  forumTargetCategory?: string;

  @prop()
  forumPostTitleTemplate?: string;

  @prop({ type: () => [String], default: [] })
  archiveTags: string[];
}

export type AgentScriptTemplateDocument = DocumentType<AgentScriptTemplateModel>;

const model = getModelForClass(AgentScriptTemplateModel);

export type AgentScriptTemplateMongoModel = typeof model;

export default model;
