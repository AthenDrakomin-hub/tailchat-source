import {
  getModelForClass,
  prop,
  DocumentType,
  modelOptions,
  index,
} from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export type PseudoLiveStatus = 'queued' | 'running' | 'done' | 'failed';

@modelOptions({
  options: {
    customName: 'p_pseudolive_tasks',
  },
})
@index({ streamId: 1 }, { unique: true })
export class PseudoLiveTask extends TimeStamps {
  @prop({ required: true })
  streamId: string;

  @prop({ required: true, default: 'queued' })
  status: PseudoLiveStatus;

  @prop({ required: true, index: true })
  groupId: string;

  @prop({ required: true })
  panelId: string;

  @prop()
  title?: string;

  /** 上传文件在 MinIO 的 objectName */
  @prop({ required: true })
  fileObjectName: string;

  /** 发起人 userId */
  @prop({ required: true, index: true })
  startedBy: string;

  @prop()
  hlsUrl?: string;

  @prop()
  error?: string;

  @prop()
  startedAt?: Date;

  @prop()
  finishedAt?: Date;
}

export type PseudoLiveTaskDocument = DocumentType<PseudoLiveTask>;
const model = getModelForClass(PseudoLiveTask);
export type PseudoLiveTaskModel = typeof model;
export default model;

