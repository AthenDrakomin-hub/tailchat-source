import {
  DocumentType,
  getModelForClass,
  index,
  modelOptions,
  prop,
  Ref,
  ReturnModelType,
  Severity,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import { Group } from '../group/group';
import { User } from '../user/user';

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
@index({ createdAt: -1 })
@index({ author: 1, createdAt: -1 })
@index({ groupId: 1, createdAt: -1 })
export class FeedPost extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ ref: () => User, required: true, index: true })
  author!: Ref<User>;

  @prop({ required: true, trim: true })
  content!: string;

  @prop({ type: () => [String], default: [] })
  images!: string[];

  @prop({ ref: () => Group })
  groupId?: Ref<Group>;

  @prop({ ref: () => User, type: () => [User], default: [] })
  likes!: Ref<User>[];

  static async listLatest(
    this: ReturnModelType<typeof FeedPost>,
    limit = 20,
    groupId?: string
  ) {
    const query = groupId ? { groupId } : {};
    return this.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export type FeedPostDocument = DocumentType<FeedPost>;

const model = getModelForClass(FeedPost);
export type FeedPostModel = typeof model;
export default model;
