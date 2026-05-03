import { createGroupSpeakRateLimiter } from '../utils/groupSpeakRateLimit';

describe('groupSpeakRateLimit', () => {
  test('throws when count exceeds window limit', async () => {
    const store = new Map<string, string>();
    const limiter = createGroupSpeakRateLimiter({
      get: async (key) => store.get(key),
      set: async (key, value) => {
        store.set(key, value);
      },
    });

    await limiter.assertWithinRateLimit({
      groupId: 'g1',
      panelId: 'p1',
      userId: 'u1',
      rule: { rateLimitWindowSec: 10, rateLimitCount: 1 },
      plain: 'hello',
      now: 1000,
    });

    await expect(
      limiter.assertWithinRateLimit({
        groupId: 'g1',
        panelId: 'p1',
        userId: 'u1',
        rule: { rateLimitWindowSec: 10, rateLimitCount: 1 },
        plain: 'hello again',
        now: 1005,
      })
    ).rejects.toThrow('发送过于频繁');
  });

  test('throws when duplicate messages exceed threshold', async () => {
    const store = new Map<string, string>();
    const limiter = createGroupSpeakRateLimiter({
      get: async (key) => store.get(key),
      set: async (key, value) => {
        store.set(key, value);
      },
    });

    await limiter.assertDuplicateWindow({
      groupId: 'g1',
      panelId: 'p1',
      userId: 'u1',
      plain: 'same',
      floodControl: { enabled: true, duplicateWindowSec: 30, duplicateLimit: 1 },
      now: 1000,
    });

    await expect(
      limiter.assertDuplicateWindow({
        groupId: 'g1',
        panelId: 'p1',
        userId: 'u1',
        plain: 'same',
        floodControl: { enabled: true, duplicateWindowSec: 30, duplicateLimit: 1 },
        now: 1002,
      })
    ).rejects.toThrow('请勿短时间重复发送相同内容');
  });
});
