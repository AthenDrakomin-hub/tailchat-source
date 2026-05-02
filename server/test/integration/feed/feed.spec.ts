import { Types } from 'mongoose';
import { createTestServiceBroker } from '../../utils';
import FeedService from '../../../services/core/feed/feed.service';

describe('Test "feed" service', () => {
  const { broker } = createTestServiceBroker<FeedService>(FeedService);

  test('feed.createPost and feed.listPosts should work for current user', async () => {
    const userId = String(new Types.ObjectId());

    const created = await broker.call(
      'feed.createPost',
      {
        content: '早盘观察：市场情绪有所修复',
      },
      {
        meta: {
          userId,
        },
      }
    );

    const list = await broker.call(
      'feed.listPosts',
      {},
      {
        meta: {
          userId,
        },
      }
    );

    expect(created).toHaveProperty('content', '早盘观察：市场情绪有所修复');
    expect(Array.isArray(list)).toBe(true);
    expect(list[0].content).toBe('早盘观察：市场情绪有所修复');
  });

  test('feed post can be linked to a group', async () => {
    const userId = String(new Types.ObjectId());
    const groupId = String(new Types.ObjectId());

    const created = await broker.call(
      'feed.createPost',
      {
        content: '今晚八点专题分享开始',
        groupId,
      },
      {
        meta: {
          userId,
        },
      }
    );

    expect(created).toHaveProperty('groupId', groupId);
  });
});
