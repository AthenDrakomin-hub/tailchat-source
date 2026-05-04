import { db } from 'tailchat-server-sdk';
const { getModelForClass, prop, modelOptions, TimeStamps } = db;

@modelOptions({
  options: {
    customName: 'wxnotify_log',
  },
})
export class WxNotifyLog extends TimeStamps implements db.Base {
  _id: db.Types.ObjectId;
  id: string;

  @prop({ required: true, default: 'wxpusher' })
  provider: string;

  @prop({ required: true })
  type: string;

  @prop({ required: true })
  status: string;

  @prop()
  targetUserId?: string;

  @prop()
  targetUid?: string;

  @prop()
  authorId?: string;

  @prop()
  converseId?: string;

  @prop()
  groupId?: string;

  @prop()
  summary?: string;

  @prop()
  error?: string;
}

export type WxNotifyLogDocument = db.DocumentType<WxNotifyLog>;

const model = getModelForClass(WxNotifyLog);

export type WxNotifyLogModel = typeof model;

export default model;
