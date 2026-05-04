import got from 'got';
import {
  TcContext,
  TcService,
  call,
  TcDbService,
} from 'tailchat-server-sdk';
import {
  buildWxNotifyMessage,
  buildWxNotifyTestMessage,
  detectMentionAll,
  getWxNotifyBinding,
  getWxNotifyDefaultRules,
  maskWxNotifyToken,
  shouldSendWxNotify,
} from './wxnotify.helper';
import type {
  WxNotifyLogDocument,
  WxNotifyLogModel,
} from '../../../models/notify/wxnotifyLog';

interface WxNotifyService
  extends TcService,
    TcDbService<WxNotifyLogDocument, WxNotifyLogModel> {}
class WxNotifyService extends TcService {
  get serviceName(): string {
    return 'wxnotify';
  }

  onInit(): void {
    this.registerLocalDb(require('../../../models/notify/wxnotifyLog').default);

    this.registerEventListener(
      'chat.message.updateMessage',
      async (payload, ctx) => {
        if (payload.type !== 'add') {
          return;
        }

        const mentions = Array.isArray(payload.meta?.mentions)
          ? payload.meta.mentions
          : [];

        if (!payload.groupId) {
          const converseInfo = await call(ctx).getConverseInfo(payload.converseId);
          const members = Array.isArray(converseInfo?.members)
            ? converseInfo.members.map(String)
            : [];

          if (converseInfo?.type === 'DM' && members.length === 2) {
            const receiverId = members.find((item) => item !== payload.author);

            if (receiverId) {
              await ctx.call('wxnotify.pushMessageNotify', {
                userId: receiverId,
                authorId: payload.author,
                messageSnippet: payload.plain ?? payload.content ?? '',
                converseId: payload.converseId,
                notifyType: 'directMessage',
              });
            }
          }
        }

        if (
          payload.groupId &&
          detectMentionAll(payload.plain ?? payload.content ?? '')
        ) {
          const group = await call(ctx).getGroupInfo(String(payload.groupId));
          const members = Array.isArray(group?.members) ? group.members : [];

          await Promise.all(
            members
              .map((member: any) => String(member.userId))
              .filter((userId: string) => userId !== payload.author)
              .map((userId: string) =>
                ctx.call('wxnotify.pushMessageNotify', {
                  userId,
                  authorId: payload.author,
                  messageSnippet: payload.plain ?? payload.content ?? '',
                  groupId: payload.groupId,
                  converseId: payload.converseId,
                  notifyType: 'mentionAll',
                })
              )
          );
        }
      }
    );

    this.registerAction('status', this.status, {
      rest: 'GET /status',
    });
    this.registerAction('createBindSession', this.createBindSession, {
      rest: 'POST /session',
    });
    this.registerAction('checkBindSession', this.checkBindSession, {
      rest: 'GET /session/:code',
      params: {
        code: 'string',
      },
    });
    this.registerAction('unbind', this.unbind, {
      rest: 'POST /unbind',
    });
    this.registerAction('adminOverview', this.adminOverview, {
      visibility: 'public',
    });
    this.registerAction('adminSendTestMessage', this.adminSendTestMessage, {
      visibility: 'public',
      params: {
        userId: 'string',
      },
    });
    this.registerAction('pushMessageNotify', this.pushMessageNotify, {
      visibility: 'public',
      params: {
        userId: 'string',
        authorId: 'string',
        messageSnippet: 'string',
        groupId: { type: 'string', optional: true },
        converseId: 'string',
        notifyType: {
          type: 'enum',
          values: ['directMessage', 'mentionAll'],
        },
      },
    });
    this.registerAction('pushVoiceCall', this.pushVoiceCall, {
      visibility: 'public',
      params: {
        userId: 'string',
        authorId: 'string',
        converseId: 'string',
      },
    });
  }

  private get appToken(): string {
    return process.env.WXPUSHER_APP_TOKEN ?? '';
  }

  private get available(): boolean {
    return this.appToken.length > 0;
  }

  private async appendLog(input: {
    type: string;
    status: 'success' | 'failed';
    targetUserId?: string;
    targetUid?: string;
    authorId?: string;
    converseId?: string;
    groupId?: string;
    summary?: string;
    error?: string;
  }) {
    await this.adapter.model.create({
      provider: 'wxpusher',
      ...input,
    });
  }

  private async sendWxMessage(input: {
    uid: string;
    targetUserId?: string;
    type: string;
    summary: string;
    content: string;
    authorId?: string;
    converseId?: string;
    groupId?: string;
  }) {
    try {
      await got.post('https://wxpusher.zjiecode.com/api/send/message', {
        json: {
          appToken: this.appToken,
          content: input.content,
          summary: input.summary,
          contentType: 2,
          uids: [input.uid],
        },
      });

      await this.appendLog({
        type: input.type,
        status: 'success',
        targetUserId: input.targetUserId,
        targetUid: input.uid,
        authorId: input.authorId,
        converseId: input.converseId,
        groupId: input.groupId,
        summary: input.summary,
      });

      return true;
    } catch (err) {
      await this.appendLog({
        type: input.type,
        status: 'failed',
        targetUserId: input.targetUserId,
        targetUid: input.uid,
        authorId: input.authorId,
        converseId: input.converseId,
        groupId: input.groupId,
        summary: input.summary,
        error: err instanceof Error ? err.message : String(err),
      });

      throw err;
    }
  }

  private async getCurrentBinding(ctx: TcContext | TcContext<any>) {
    const user = await call(ctx).getUserInfo(String(ctx.meta.userId));
    return getWxNotifyBinding(user?.extra);
  }

  async status(ctx: TcContext) {
    const binding = await this.getCurrentBinding(ctx);

    return {
      available: this.available,
      provider: 'wxpusher',
      ...binding,
    };
  }

  async adminOverview() {
    const userModel = require('../../../models/user/user').default;
    const recentLogs = await this.adapter.model
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const boundUserCount = await userModel.countDocuments({
      'extra.wxNotifyBinding.uid': {
        $exists: true,
        $ne: '',
      },
    });

    const successCount = recentLogs.filter((item) => item.status === 'success').length;
    const failedCount = recentLogs.filter((item) => item.status === 'failed').length;

    return {
      available: this.available,
      provider: 'wxpusher',
      appTokenConfigured: this.available,
      appTokenMasked: maskWxNotifyToken(this.appToken),
      defaultRules: getWxNotifyDefaultRules(),
      boundUserCount,
      successCount,
      failedCount,
      recentLogs,
    };
  }

  async createBindSession(ctx: TcContext) {
    if (!this.available) {
      throw new Error('WxPusher appToken 未配置');
    }

    const extra = `${ctx.meta.userId}:${Date.now()}`;
    const res: any = await got
      .post('https://wxpusher.zjiecode.com/api/fun/create/qrcode', {
        json: {
          appToken: this.appToken,
          extra,
          validTime: 1800,
        },
      })
      .json();

    const data = res?.data ?? {};

    return {
      code: data.code ?? '',
      qrcodeUrl: data.url ?? data.qrcodeUrl ?? '',
      expiresAt: data.expireTime ?? '',
    };
  }

  async checkBindSession(ctx: TcContext<{ code: string }>) {
    if (!this.available) {
      throw new Error('WxPusher appToken 未配置');
    }

    const { code } = ctx.params;
    const res: any = await got
      .get('https://wxpusher.zjiecode.com/api/fun/scan-qrcode-uid', {
        searchParams: {
          code,
        },
      })
      .json();

    const uid =
      res?.data?.uid ??
      res?.data?.wxUser?.uid ??
      res?.data?.records?.[0]?.uid ??
      '';

    if (!uid) {
      return {
        available: true,
        isBound: false,
        isEnabled: false,
        uid: '',
        pending: true,
      };
    }

    await ctx.call('user.updateUserExtra', {
      fieldName: 'wxNotifyBinding',
      fieldValue: {
        provider: 'wxpusher',
        uid,
        enabled: true,
        boundAt: new Date().toISOString(),
      },
    });

    return {
      available: true,
      isBound: true,
      isEnabled: true,
      uid,
      pending: false,
    };
  }

  async unbind(ctx: TcContext) {
    await ctx.call('user.updateUserExtra', {
      fieldName: 'wxNotifyBinding',
      fieldValue: null,
    });

    return {
      success: true,
    };
  }

  async adminSendTestMessage(ctx: TcContext<{ userId: string }>) {
    if (!this.available) {
      throw new Error('WxPusher appToken 未配置');
    }

    const { userId } = ctx.params;
    const targetUser = await call(ctx).getUserInfo(userId);
    const binding = getWxNotifyBinding(targetUser?.extra);
    if (!binding.isBound || !binding.uid) {
      throw new Error('当前账号尚未绑定微信通知');
    }

    const message = buildWxNotifyTestMessage('财讯助手');
    await this.sendWxMessage({
      uid: binding.uid,
      targetUserId: userId,
      type: 'test',
      summary: message.summary,
      content: message.content,
    });

    return {
      success: true,
    };
  }

  async pushMessageNotify(
    ctx: TcContext<{
      userId: string;
      authorId: string;
      messageSnippet: string;
      groupId?: string;
      converseId: string;
      notifyType: 'directMessage' | 'mentionAll';
    }>
  ) {
    if (!this.available) {
      return false;
    }

    const { userId, authorId, messageSnippet, groupId, converseId, notifyType } =
      ctx.params;
    const targetUser = await call(ctx).getUserInfo(userId);
    const binding = getWxNotifyBinding(targetUser?.extra);

    if (!binding.isBound || !binding.isEnabled || !binding.uid) {
      return false;
    }

    const settings = await ctx.call(
      'user.getUserSettings',
      {},
      {
        meta: {
          userId,
        },
      }
    );

    if (
      !shouldSendWxNotify(settings as Record<string, any>, {
        type: notifyType,
        converseId,
        groupId,
      })
    ) {
      return false;
    }

    const author = await call(ctx).getUserInfo(authorId);
    const sceneName = groupId
      ? await ctx
          .call('group.getGroupBasicInfo', { groupId })
          .then((group: any) => group?.name ?? '群消息')
          .catch(() => '群消息')
      : '私聊消息';
    const authorName = author?.nickname ?? '新消息';
    const snippet = messageSnippet.replace(/\s+/g, ' ').trim().slice(0, 80);
    const message =
      notifyType === 'directMessage'
        ? {
            summary: `${authorName} 给你发来私信`,
            content: `<h3>${authorName} 给你发来私信</h3><p>${snippet}</p>`,
          }
        : {
            summary: `${authorName} 在 ${sceneName} @了所有人`,
            content: `<h3>${authorName} 在 ${sceneName} @了所有人</h3><p>${snippet}</p>`,
          };

    await this.sendWxMessage({
      uid: binding.uid,
      targetUserId: userId,
      type: notifyType,
      summary: message.summary,
      content: message.content,
      authorId,
      converseId,
      groupId,
    });

    return true;
  }

  async pushVoiceCall(
    ctx: TcContext<{
      userId: string;
      authorId: string;
      converseId: string;
    }>
  ) {
    if (!this.available) {
      return false;
    }

    const { userId, authorId, converseId } = ctx.params;
    const targetUser = await call(ctx).getUserInfo(userId);
    const binding = getWxNotifyBinding(targetUser?.extra);

    if (!binding.isBound || !binding.isEnabled || !binding.uid) {
      return false;
    }

    const settings = await ctx.call(
      'user.getUserSettings',
      {},
      {
        meta: {
          userId,
        },
      }
    );

    if (
      !shouldSendWxNotify(settings as Record<string, any>, {
        type: 'voiceCall',
        converseId,
      })
    ) {
      return false;
    }

    const author = await call(ctx).getUserInfo(authorId);
    const authorName = author?.nickname ?? '新消息';

    await this.sendWxMessage({
      uid: binding.uid,
      targetUserId: userId,
      type: 'voiceCall',
      summary: `${authorName} 邀请你进行语音通话`,
      content: `<h3>${authorName} 邀请你进行语音通话</h3><p>请尽快回到财讯接听来电。</p>`,
      authorId,
      converseId,
    });

    return true;
  }
}

export default WxNotifyService;
