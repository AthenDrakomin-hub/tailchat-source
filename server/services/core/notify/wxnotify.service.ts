import got from 'got';
import {
  TcContext,
  TcService,
  call,
} from 'tailchat-server-sdk';
import {
  buildWxNotifyMessage,
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

        if (mentions.length > 0) {
          await Promise.all(
            mentions.map((userId: string) =>
              ctx.call('wxnotify.pushMention', {
                userId,
                authorId: payload.author,
                messageSnippet: payload.plain ?? payload.content ?? '',
                groupId: payload.groupId,
                converseId: payload.converseId,
                notifyType: 'mention',
              })
            )
          );
        }

        if (!payload.groupId) {
          const converseInfo = await call(ctx).getConverseInfo(payload.converseId);
          const members = Array.isArray(converseInfo?.members)
            ? converseInfo.members.map(String)
            : [];

          if (converseInfo?.type === 'DM' && members.length === 2) {
            const receiverId = members.find((item) => item !== payload.author);

            if (receiverId) {
              await ctx.call('wxnotify.pushMention', {
                userId: receiverId,
                authorId: payload.author,
                messageSnippet: payload.plain ?? payload.content ?? '',
                converseId: payload.converseId,
                notifyType: 'directMessage',
              });
            }
          }
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
    this.registerAction('pushMention', this.pushMention, {
      visibility: 'public',
      params: {
        userId: 'string',
        authorId: 'string',
        messageSnippet: 'string',
        groupId: { type: 'string', optional: true },
        converseId: 'string',
        notifyType: { type: 'enum', values: ['mention', 'directMessage'] },
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

  async pushMention(
    ctx: TcContext<{
      userId: string;
      authorId: string;
      messageSnippet: string;
      groupId?: string;
      converseId: string;
      notifyType: 'mention' | 'directMessage';
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

    const message = buildWxNotifyMessage({
      authorName: author?.nickname ?? '新消息',
      messageSnippet,
      sceneName,
    });

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
}

export default WxNotifyService;
