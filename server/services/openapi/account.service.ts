import { TcContext, TcService } from 'tailchat-server-sdk';

class OpenAccountService extends TcService {
  get serviceName(): string {
    return 'openapi.account';
  }

  onInit(): void {
    this.registerAction('getProfile', this.getProfile);
    this.registerAction('updateProfile', this.updateProfile, {
      params: {
        nickname: { type: 'string', optional: true },
        avatar: { type: 'string', optional: true },
        bio: { type: 'string', optional: true },
      },
    });
    this.registerAction('listConversations', this.listConversations);
    this.registerAction('sendConversationMessage', this.sendConversationMessage, {
      params: {
        converseId: 'string',
        content: 'string',
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('listGroups', this.listGroups);
    this.registerAction('listGroupMembers', this.listGroupMembers, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('getGroupDetail', this.getGroupDetail, {
      params: {
        groupId: 'string',
      },
    });
    this.registerAction('updateGroupAnnouncement', this.updateGroupAnnouncement, {
      params: {
        groupId: 'string',
        announcement: 'string',
      },
    });
    this.registerAction('publishFeedPost', this.publishFeedPost, {
      params: {
        content: 'string',
        groupId: { type: 'string', optional: true },
      },
    });
    this.registerAction('getFeedPostDetail', this.getFeedPostDetail, {
      params: {
        postId: 'string',
      },
    });
    this.registerAction('listOwnFeedPosts', this.listOwnFeedPosts);
    this.registerAction('commentFeedPost', this.commentFeedPost, {
      params: {
        postId: 'string',
        content: 'string',
      },
    });
    this.registerAction('listFeedComments', this.listFeedComments, {
      params: {
        postId: 'string',
      },
    });
    this.registerAction('likeFeedPost', this.likeFeedPost, {
      params: {
        postId: 'string',
      },
    });
    this.registerAction('removeFeedPost', this.removeFeedPost, {
      params: {
        postId: 'string',
      },
    });
    this.registerAction('getConversationDetail', this.getConversationDetail, {
      params: {
        converseId: 'string',
      },
    });
    this.registerAction('listConversationMessages', this.listConversationMessages, {
      params: {
        converseId: 'string',
        startId: { type: 'string', optional: true },
      },
    });
  }

  async getProfile(ctx: TcContext) {
    return ctx.call('user.getUserInfo', {
      userId: ctx.meta.userId,
    });
  }

  async updateProfile(
    ctx: TcContext<{
      nickname?: string;
      avatar?: string;
      bio?: string;
    }>
  ) {
    const { nickname, avatar, bio } = ctx.params;
    const payload: Record<string, string> = {};

    if (nickname) {
      payload.nickname = nickname;
    }
    if (avatar) {
      payload.avatar = avatar;
    }
    if (bio) {
      payload.bio = bio;
    }

    return ctx.call('user.updateUserField', payload, {
      meta: ctx.meta,
    });
  }

  async listConversations(ctx: TcContext) {
    const converseIds: string[] = await ctx.call('user.dmlist.getAllConverse', {}, {
      meta: ctx.meta,
    });

    return Promise.all(
      (converseIds ?? []).map((converseId) =>
        ctx.call('chat.converse.findConverseInfo', { converseId }, { meta: ctx.meta })
      )
    );
  }

  async sendConversationMessage(
    ctx: TcContext<{
      converseId: string;
      content: string;
      groupId?: string;
    }>
  ) {
    return ctx.call('chat.message.sendMessage', ctx.params, {
      meta: ctx.meta,
    });
  }

  async listGroups(ctx: TcContext) {
    return ctx.call('group.getUserGroups', {}, { meta: ctx.meta });
  }

  async listGroupMembers(
    ctx: TcContext<{
      groupId: string;
    }>
  ) {
    return ctx.call('group.listGroupMembers', ctx.params, { meta: ctx.meta });
  }

  async getGroupDetail(
    ctx: TcContext<{
      groupId: string;
    }>
  ) {
    return ctx.call('group.getGroupInfo', ctx.params, { meta: ctx.meta });
  }

  async updateGroupAnnouncement(
    ctx: TcContext<{
      groupId: string;
      announcement: string;
    }>
  ) {
    return ctx.call(
      'group.updateGroupField',
      {
        groupId: ctx.params.groupId,
        fieldName: 'description',
        fieldValue: ctx.params.announcement,
      },
      { meta: ctx.meta }
    );
  }

  async publishFeedPost(
    ctx: TcContext<{
      content: string;
      groupId?: string;
    }>
  ) {
    return ctx.call('feed.createPost', ctx.params, { meta: ctx.meta });
  }

  async getFeedPostDetail(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    return ctx.call('feed.getPostDetail', ctx.params, { meta: ctx.meta });
  }

  async listOwnFeedPosts(ctx: TcContext) {
    return ctx.call(
      'feed.listUserPosts',
      {
        userId: ctx.meta.userId,
      },
      { meta: ctx.meta }
    );
  }

  async commentFeedPost(
    ctx: TcContext<{
      postId: string;
      content: string;
    }>
  ) {
    return ctx.call('feed.commentPost', ctx.params, { meta: ctx.meta });
  }

  async listFeedComments(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    return ctx.call('feed.listPostComments', ctx.params, { meta: ctx.meta });
  }

  async likeFeedPost(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    return ctx.call('feed.likePost', ctx.params, { meta: ctx.meta });
  }

  async removeFeedPost(
    ctx: TcContext<{
      postId: string;
    }>
  ) {
    return ctx.call('feed.removePost', ctx.params, { meta: ctx.meta });
  }

  async getConversationDetail(
    ctx: TcContext<{
      converseId: string;
    }>
  ) {
    return ctx.call('chat.converse.findConverseInfo', ctx.params, {
      meta: ctx.meta,
    });
  }

  async listConversationMessages(
    ctx: TcContext<{
      converseId: string;
      startId?: string;
    }>
  ) {
    return ctx.call('chat.message.fetchConverseMessage', ctx.params, {
      meta: ctx.meta,
    });
  }
}

export default OpenAccountService;
