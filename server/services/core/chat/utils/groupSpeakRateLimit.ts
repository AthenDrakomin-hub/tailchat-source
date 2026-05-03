import type {
  GroupPanelFloodControlRule,
  GroupPanelSpeakRule,
} from '../../../../../packages/types/src/model/group';

interface RateLimitCacheStore {
  get(key: string): Promise<string | undefined | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void> | void;
}

interface RateWindowRecord {
  count: number;
  expiresAt: number;
}

interface DuplicateRecord {
  text: string;
  count: number;
  expiresAt: number;
}

export function createGroupSpeakRateLimiter(store: RateLimitCacheStore) {
  return {
    async assertWithinRateLimit(params: {
      groupId: string;
      panelId: string;
      userId: string;
      rule?: GroupPanelSpeakRule;
      plain?: string;
      now?: number;
    }) {
      const { groupId, panelId, userId, rule } = params;
      if (!rule?.rateLimitWindowSec || !rule?.rateLimitCount) {
        return;
      }

      const now = params.now ?? Date.now() / 1000;
      const key = `speak:group:${groupId}:panel:${panelId}:user:${userId}:window`;
      const raw = await store.get(key);
      const record: RateWindowRecord | undefined = raw ? JSON.parse(raw) : undefined;

      const nextRecord: RateWindowRecord =
        record && record.expiresAt > now
          ? {
              count: record.count + 1,
              expiresAt: record.expiresAt,
            }
          : {
              count: 1,
              expiresAt: now + rule.rateLimitWindowSec,
            };

      await store.set(
        key,
        JSON.stringify(nextRecord),
        Math.ceil(nextRecord.expiresAt - now)
      );

      if (nextRecord.count > rule.rateLimitCount) {
        throw new Error(
          `发送过于频繁，请在 ${Math.max(
            1,
            Math.ceil(nextRecord.expiresAt - now)
          )} 秒后再试`
        );
      }
    },

    async assertDuplicateWindow(params: {
      groupId: string;
      panelId: string;
      userId: string;
      plain?: string;
      floodControl?: GroupPanelFloodControlRule;
      now?: number;
    }) {
      const { groupId, panelId, userId, plain, floodControl } = params;
      if (!floodControl?.enabled || !plain?.trim()) {
        return;
      }

      const duplicateWindowSec = floodControl.duplicateWindowSec ?? 30;
      const duplicateLimit = floodControl.duplicateLimit ?? 2;
      const now = params.now ?? Date.now() / 1000;
      const key = `speak:dup:group:${groupId}:panel:${panelId}:user:${userId}`;
      const raw = await store.get(key);
      const record: DuplicateRecord | undefined = raw ? JSON.parse(raw) : undefined;

      const nextRecord: DuplicateRecord =
        record && record.expiresAt > now && record.text === plain
          ? {
              text: plain,
              count: record.count + 1,
              expiresAt: record.expiresAt,
            }
          : {
              text: plain,
              count: 1,
              expiresAt: now + duplicateWindowSec,
            };

      await store.set(
        key,
        JSON.stringify(nextRecord),
        Math.ceil(nextRecord.expiresAt - now)
      );

      if (nextRecord.count > duplicateLimit) {
        throw new Error('请勿短时间重复发送相同内容');
      }
    },
  };
}
