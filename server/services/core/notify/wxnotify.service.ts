import got from 'got';
import {
  TcContext,
  TcService,
  call,
} from 'tailchat-server-sdk';
import {
  buildWxNotifyMessage,
  buildWxNotifyTestMessage,
  detectMentionAll,
  getWxNotifyBinding,
  shouldSendWxNotify,
} from './wxnotify.helper';

class WxNotifyService extends TcService {
  get serviceName(): string {
    return 'wxnotify';
  }

  onInit(): void {
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
    this.registerAction('sendTestMessage', this.sendTestMessage, {
      rest: 'POST /test-message',
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

  async sendTestMessage(ctx: TcContext) {
    if (!this.available) {
      throw new Error('WxPusher appToken 未配置');
    }

    const binding = await this.getCurrentBinding(ctx);
    if (!binding.isBound || !binding.uid) {
      throw new Error('当前账号尚未绑定微信通知');
    }

    const message = buildWxNotifyTestMessage('财讯助手');

    await got.post('https://wxpusher.zjiecode.com/api/send/message', {
      json: {
        appToken: this.appToken,
        content: message.content,
        summary: message.summary,
        contentType: 2,
        uids: [binding.uid],
      },
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

    await got.post('https://wxpusher.zjiecode.com/api/send/message', {
      json: {
        appToken: this.appToken,
        content: message.content,
        summary: message.summary,
        contentType: 2,
        uids: [binding.uid],
      },
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

    await got.post('https://wxpusher.zjiecode.com/api/send/message', {
      json: {
        appToken: this.appToken,
        content: `<h3>${authorName} 邀请你进行语音通话</h3><p>请尽快回到财讯接听来电。</p>`,
        summary: `${authorName} 邀请你进行语音通话`,
        contentType: 2,
        uids: [binding.uid],
      },
    });

    return true;
  }
}

export default WxNotifyService;
