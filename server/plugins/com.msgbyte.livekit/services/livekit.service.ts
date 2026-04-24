import type { TcContext } from 'tailchat-server-sdk';
import { TcService, TcDbService, call, config } from 'tailchat-server-sdk';
import type { LivekitDocument, LivekitModel } from '../models/livekit';
import {
  AccessToken,
  RoomServiceClient,
  WebhookEvent,
} from 'livekit-server-sdk';
import Redis from 'ioredis';

/**
 * livekit
 *
 * Add livekit to provide meeting and live streaming feature
 */
interface LivekitService
  extends TcService,
    TcDbService<LivekitDocument, LivekitModel> {}
class LivekitService extends TcService {
  // roomServiceClient: RoomServiceClient = null;
  redisClient: Redis.Redis;

  get serviceName() {
    return 'plugin:com.msgbyte.livekit';
  }

  get livekitUrl() {
    return process.env.LIVEKIT_URL;
  }

  /**
   * 给客户端返回的 LiveKit 连接地址（应为公网可访问的 WSS/HTTPS）
   * - 示例：wss://chat.yefeng.us.cc/livekit
   * - 若未配置，则回退使用 LIVEKIT_URL
   */
  get livekitPublicUrl() {
    return process.env.LIVEKIT_PUBLIC_URL || this.livekitUrl;
  }

  get apiKey() {
    return process.env.LIVEKIT_API_KEY;
  }

  get apiSecret() {
    return process.env.LIVEKIT_API_SECRET;
  }

  /**
   * 返回服务是否可用
   */
  get serverAvailable(): boolean {
    if (this.apiKey && this.apiSecret) {
      return true;
    }

    return false;
  }

  getRoomServiceClient() {
    return new RoomServiceClient(this.livekitUrl, this.apiKey, this.apiSecret);
  }

  onInit() {
    this.redisClient = new Redis(config.redisUrl, {
      keyPrefix: 'tailchat:livekit:shortlink:',
    });

    this.registerAvailableAction(() => this.serverAvailable);

    if (!this.serverAvailable) {
      console.warn(
        'Livekit service not available, miss env var: LIVEKIT_API_KEY, LIVEKIT_API_SECRET'
      );
      return;
    }

    // this.registerLocalDb(require('../models/livekit').default);

    this.registerAction('url', this.url);
    this.registerAction('generateToken', this.generateToken, {
      params: {
        roomName: 'string',
      },
    });
    this.registerAction('generateGuestToken', this.generateGuestToken, {
      params: {
        roomName: 'string',
        nickname: 'string',
      },
    });
    this.registerAction('generateShortLink', this.generateShortLink, {
      params: {
        roomId: 'string',
      },
    });
    this.registerAction('getAndBurnShortLink', this.getAndBurnShortLink, {
      params: {
        code: 'string',
      },
    });
    this.registerAuthWhitelist([
      '/generateGuestToken',
      '/getAndBurnShortLink',
    ]);
    this.registerAction('roomMembers', this.roomMembers, {
      params: {
        roomName: 'string',
      },
    });
    this.registerAction('inviteCall', this.inviteCall, {
      params: {
        roomName: 'string',
        targetUserIds: { type: 'array', items: 'string' },
      },
    });
    this.registerAction('webhook', this.webhook);
  }

  async url(ctx: TcContext) {
    return {
      url: this.livekitPublicUrl,
    };
  }

  async generateToken(
    ctx: TcContext<{
      roomName: string;
    }>
  ) {
    const { roomName } = ctx.params;

    const { userId, user } = ctx.meta;
    const nickname = user.nickname;
    const identity = userId;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: userId,
      name: nickname,
    });
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });
    const accessToken = at.toJwt();

    return {
      identity,
      accessToken,
    };
  }

  async generateGuestToken(
    ctx: TcContext<{
      roomName: string;
      nickname: string;
    }>
  ) {
    const { roomName, nickname } = ctx.params;

    if (!nickname) {
      throw new Error('Nickname is required');
    }

    const identity = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity,
      name: nickname,
    });
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });
    const accessToken = at.toJwt();

    return {
      identity,
      accessToken,
    };
  }

  async generateShortLink(ctx: TcContext<{ roomId: string }>) {
    const { roomId } = ctx.params;
    const userId = ctx.meta.userId;

    const user = await call(ctx).getUserInfo(userId);
    const inviterName = user?.nickname || '未知用户';
    const inviterAvatar = user?.avatar || '';

    const code = Math.random().toString(36).substring(2, 8);
    const data = JSON.stringify({ roomId, inviterName, inviterAvatar });

    await this.redisClient.set(code, data, 'EX', 24 * 60 * 60);

    return { code };
  }

  async getAndBurnShortLink(ctx: TcContext<{ code: string }>) {
    const { code } = ctx.params;

    const data = await this.redisClient.get(code);
    if (!data) {
      throw new Error('通话链接已失效或已被他人接听');
    }

    await this.redisClient.del(code);

    return JSON.parse(data);
  }

  async roomMembers(ctx: TcContext<{ roomName: string }>) {
    if (!this.serverAvailable) {
      throw new Error('livekit server not available');
    }

    try {
      const client = this.getRoomServiceClient();
      const participants = await client.listParticipants(ctx.params.roomName);

      return participants;
    } catch (err) {
      return [];
    }
  }

  /**
   * 邀请加入会话
   */
  async inviteCall(
    ctx: TcContext<{ roomName: string; targetUserIds: string[] }>
  ) {
    const { roomName, targetUserIds } = ctx.params;
    const senderUserId = ctx.meta.userId;

    const isOnlineList = await call(ctx).isUserOnline(targetUserIds);

    await this.listcastNotify(ctx, targetUserIds, 'inviteCall', {
      senderUserId,
      roomName,
    });

    return {
      online: targetUserIds.filter((_, i) => isOnlineList[i]),
      offline: targetUserIds.filter((_, i) => !isOnlineList[i]),
    };
  }

  async webhook(ctx: TcContext) {
    const payload = ctx.params as WebhookEvent;

    if (payload.event === 'participant_joined') {
      const room = payload.room;
      const [groupId, panelId] = room.name.split('#');

      this.roomcastNotify(ctx, groupId, 'participantJoined', {
        groupId,
        panelId,
        participant: payload.participant,
      });

      return;
    } else if (payload.event === 'participant_left') {
      const room = payload.room;
      const [groupId, panelId] = room.name.split('#');

      this.roomcastNotify(ctx, groupId, 'participantLeft', {
        groupId,
        panelId,
        participant: payload.participant,
      });

      return;
    }
  }
}

export default LivekitService;
