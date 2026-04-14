import { TcService, TcContext, call } from 'tailchat-server-sdk';
import type { ServiceSchema } from 'moleculer';

interface SyncState {
  roomId: string;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

const REDIS_KEY_PREFIX = 'syncplayer:state:';

class SyncPlayerService extends TcService {
  get serviceName() {
    return 'plugin:com.msgbyte.syncplayer';
  }

  onInit() {
    this.registerLocalE2EAction('push', {
      params: {
        roomId: 'string',
        videoUrl: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string; videoUrl: string }>) {
        // Only allow pushing if user has group permission (ideally checking group.hasPermission)
        const { roomId, videoUrl } = ctx.params;
        const state: SyncState = {
          roomId,
          videoUrl,
          isPlaying: true,
          currentTime: 0,
          updatedAt: Date.now(),
        };

        await this.broker.cacher?.set(`${REDIS_KEY_PREFIX}${roomId}`, state);
        await this.roomcastNotify(ctx, roomId, 'sync_state', state);
        return state;
      },
    });

    this.registerLocalE2EAction('updateState', {
      params: {
        roomId: 'string',
        isPlaying: 'boolean',
        currentTime: 'number',
      },
      async handler(
        ctx: TcContext<{
          roomId: string;
          isPlaying: boolean;
          currentTime: number;
        }>
      ) {
        const { roomId, isPlaying, currentTime } = ctx.params;
        const key = `${REDIS_KEY_PREFIX}${roomId}`;

        const existingState = (await this.broker.cacher?.get(
          key
        )) as SyncState | null;
        if (!existingState) {
          throw new Error('No active sync player in this room');
        }

        const newState: SyncState = {
          ...existingState,
          isPlaying,
          currentTime,
          updatedAt: Date.now(),
        };

        await this.broker.cacher?.set(key, newState);
        await this.roomcastNotify(ctx, roomId, 'sync_state', newState);
        return newState;
      },
    });

    this.registerLocalE2EAction('close', {
      params: {
        roomId: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string }>) {
        const { roomId } = ctx.params;
        await this.broker.cacher?.del(`${REDIS_KEY_PREFIX}${roomId}`);
        await this.roomcastNotify(ctx, roomId, 'sync_close', { roomId });
        return true;
      },
    });

    this.registerLocalE2EAction('getState', {
      params: {
        roomId: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string }>) {
        const { roomId } = ctx.params;
        const state = (await this.broker.cacher?.get(
          `${REDIS_KEY_PREFIX}${roomId}`
        )) as SyncState | null;
        return state || null;
      },
    });
  }
}

export default SyncPlayerService as unknown as ServiceSchema;
