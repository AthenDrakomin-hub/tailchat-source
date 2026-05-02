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
    this.registerAction('publishFeedPost', this.publishFeedPost, {
      params: {
        content: 'string',
        groupId: { type: 'string', optional: true },
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

  async publishFeedPost(
    ctx: TcContext<{
      content: string;
      groupId?: string;
    }>
  ) {
    return ctx.call('feed.createPost', ctx.params, { meta: ctx.meta });
  }
}

export default OpenAccountService;
