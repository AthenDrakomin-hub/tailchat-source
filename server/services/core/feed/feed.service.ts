import {
  DataNotFoundError,
  TcContext,
  TcDbService,
  TcService,
} from 'tailchat-server-sdk';
import _uniq from 'lodash/uniq';
import { Types } from 'mongoose';
import type { FeedPostDocument, FeedPostModel } from '../../../models/feed/post';
import type {
  FeedCommentDocument,
  FeedCommentModel,
} from '../../../models/feed/comment';

interface FeedService
  extends TcService,
    TcDbService<FeedPostDocument, FeedPostModel> {}

class FeedService extends TcService {
  get serviceName(): string {
    return 'feed';
  }

  private commentModel!: FeedCommentModel;

  onInit(): void {
    this.registerLocalDb(require('../../../models/feed/post').default);
    this.commentModel = require('../../../models/feed/comment').default;

    this.registerAction('createPost', this.createPost, {
      params: {
        content: 'string',
        images: { type: 'array', items: 'string', optional: true },
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('listPosts', this.listPosts, {
      params: {
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('commentPost', this.commentPost, {
      params: {
        postId: 'string',
        content: 'string',
      },
    });
    this.registerAction('likePost', this.likePost, {
      params: {
        postId: 'string',
      },
    });
  }

  private async serializePost(doc: FeedPostDocument) {
    const commentsCount = await this.commentModel.countDocuments({
      postId: doc._id,
    });

    return {
      _id: String(doc._id),
      author: String(doc.author),
      content: doc.content,
      images: doc.images ?? [],
      groupId: doc.groupId ? String(doc.groupId) : null,
      commentsCount,
      likesCount: doc.likes?.length ?? 0,
      createdAt: doc.createdAt?.toISOString?.() ?? '',
      updatedAt: doc.updatedAt?.toISOString?.() ?? '',
    };
  }

  async createPost(
    ctx: TcContext<{
      content: string;
      images?: string[];
      groupId?: string;
    }>
  ) {
    const userId = ctx.meta.userId;
    const { content, images = [], groupId } = ctx.params;

    if (groupId) {
      await ctx.call('group.getGroupInfo', {
        groupId,
      });
    }

    const doc = await this.adapter.model.create({
      author: new Types.ObjectId(userId),
      content,
      images,
      groupId: groupId ? new Types.ObjectId(groupId) : undefined,
      likes: [],
    });

    return this.serializePost(doc);
  }

  async listPosts(ctx: TcContext<{ groupId?: string }>) {
    const { groupId } = ctx.params;
    const docs = await this.adapter.model.listLatest(20, groupId);

    return Promise.all(docs.map((doc) => this.serializePost(doc)));
  }

  async commentPost(
    ctx: TcContext<{
      postId: string;
      content: string;
    }>
  ) {
    const userId = ctx.meta.userId;
    const { postId, content } = ctx.params;

    const post = await this.adapter.findById(postId);
    if (!post) {
      throw new DataNotFoundError();
    }

    const comment = await this.commentModel.create({
      postId: new Types.ObjectId(postId),
      author: new Types.ObjectId(userId),
      content,
    });

    return {
      _id: String(comment._id),
      postId,
      author: String(comment.author),
      content: comment.content,
      createdAt: comment.createdAt?.toISOString?.() ?? '',
      updatedAt: comment.updatedAt?.toISOString?.() ?? '',
    };
  }

  async likePost(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    const userId = ctx.meta.userId;
    const { postId } = ctx.params;

    const post = await this.adapter.findById(postId);
    if (!post) {
      throw new DataNotFoundError();
    }

    post.likes = _uniq([...(post.likes ?? []).map(String), userId]).map(
      (id) => new Types.ObjectId(id)
    );
    await post.save();

    return {
      postId,
      likesCount: post.likes.length,
    };
  }
}

export default FeedService;
