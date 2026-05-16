import {
  DataNotFoundError,
  NoPermissionError,
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
      rest: 'POST /createPost',
      params: {
        content: 'string',
        images: { type: 'array', items: 'string', optional: true },
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('listPosts', this.listPosts, {
      rest: 'GET /listPosts',
      params: {
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('getPostDetail', this.getPostDetail, {
      rest: 'GET /getPostDetail',
      params: {
        postId: 'string',
      },
    });
    this.registerAction('listUserPosts', this.listUserPosts, {
      rest: 'GET /listUserPosts',
      params: {
        userId: 'string',
      },
    });
    this.registerAction('commentPost', this.commentPost, {
      rest: 'POST /commentPost',
      params: {
        postId: 'string',
        content: 'string',
      },
    });
    this.registerAction('listPostComments', this.listPostComments, {
      rest: 'GET /listPostComments',
      params: {
        postId: 'string',
      },
    });
    this.registerAction('likePost', this.likePost, {
      rest: 'POST /likePost',
      params: {
        postId: 'string',
      },
    });
    this.registerAction('removePost', this.removePost, {
      rest: 'POST /removePost',
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

  private serializeComment(doc: FeedCommentDocument) {
    return {
      _id: String(doc._id),
      postId: String(doc.postId),
      author: String(doc.author),
      content: doc.content,
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

  async getPostDetail(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    const post = await this.adapter.findById(ctx.params.postId);
    if (!post) {
      throw new DataNotFoundError();
    }

    return this.serializePost(post);
  }

  async listUserPosts(
    ctx: TcContext<{
      userId: string;
    }>
  ) {
    const docs = await this.adapter.model
      .find({
        author: ctx.params.userId,
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

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
      ...this.serializeComment(comment),
    };
  }

  async listPostComments(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    const { postId } = ctx.params;
    const comments = await this.commentModel
      .find({
        postId,
      })
      .sort({ createdAt: 1 })
      .limit(50)
      .exec();

    return comments.map((comment) => this.serializeComment(comment));
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

  async removePost(
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

    if (String(post.author) !== String(userId)) {
      throw new NoPermissionError('Cannot remove others feed post');
    }

    await this.commentModel.deleteMany({
      postId,
    });
    await this.adapter.removeById(postId);

    return {
      success: true as const,
    };
  }
}

export default FeedService;
