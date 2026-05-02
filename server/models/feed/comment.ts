import {
  DocumentType,
  getModelForClass,
  index,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import type { Types } from 'mongoose';
import { FeedPost } from './post';
import { User } from '../user/user';

@index({ postId: 1, createdAt: 1 })
export class FeedComment extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;

  @prop({ ref: () => FeedPost, required: true, index: true })
  postId!: Ref<FeedPost>;

  @prop({ ref: () => User, required: true, index: true })
  author!: Ref<User>;

  @prop({ required: true, trim: true })
  content!: string;
}

export type FeedCommentDocument = DocumentType<FeedComment>;

const model = getModelForClass(FeedComment);
export type FeedCommentModel = typeof model;
export default model;
