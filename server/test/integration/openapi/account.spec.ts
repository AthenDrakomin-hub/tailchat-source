import { createTestServiceBroker } from '../../utils';
import OpenAccountService from '../../../services/openapi/account.service';

describe('Test "openapi.account" service', () => {
  const { broker, contextCallMock } =
    createTestServiceBroker<OpenAccountService>(OpenAccountService);

  test('can list conversations and publish feed post through facade', async () => {
    contextCallMock.mockImplementation((actionName: string) => {
      if (actionName === 'user.dmlist.getAllConverse') {
        return ['converse_1'];
      }

      if (actionName === 'chat.converse.findConverseInfo') {
        return [];
      }

      if (actionName === 'feed.createPost') {
        return {
          _id: 'post_1',
          content: '测试动态',
        };
      }

      return [];
    });

    const conversations = await broker.call('openapi.account.listConversations');
    const post = await broker.call('openapi.account.publishFeedPost', {
      content: '测试动态',
    });

    expect(Array.isArray(conversations)).toBe(true);
    expect(post).toHaveProperty('content', '测试动态');
  });

  test('can operate linkage actions through facade', async () => {
    contextCallMock.mockImplementation((actionName: string, params: any) => {
      if (actionName === 'feed.getPostDetail') {
        return {
          _id: params.postId,
          content: '详情动态',
        };
      }

      if (actionName === 'feed.listUserPosts') {
        return [{ _id: 'post_self', content: '我的动态' }];
      }

      if (actionName === 'feed.commentPost') {
        return {
          _id: 'comment_1',
          postId: params.postId,
          content: params.content,
        };
      }

      if (actionName === 'feed.removePost') {
        return { success: true };
      }

      if (actionName === 'group.getGroupInfo') {
        return { _id: params.groupId, name: '群组A' };
      }

      if (actionName === 'group.updateGroupField') {
        return {
          groupId: params.groupId,
          fieldName: params.fieldName,
          fieldValue: params.fieldValue,
        };
      }

      return [];
    });

    const detail = await broker.call('openapi.account.getFeedPostDetail', {
      postId: 'post_1',
    });
    const ownPosts = await broker.call('openapi.account.listOwnFeedPosts');
    const comment = await broker.call('openapi.account.commentFeedPost', {
      postId: 'post_1',
      content: '收到，今晚参与讨论',
    });
    const removed = await broker.call('openapi.account.removeFeedPost', {
      postId: 'post_1',
    });
    const group = await broker.call('openapi.account.getGroupDetail', {
      groupId: 'group_1',
    });
    const announcement = await broker.call(
      'openapi.account.updateGroupAnnouncement',
      {
        groupId: 'group_1',
        announcement: '今晚八点专题讨论',
      }
    );

    expect(detail).toHaveProperty('content', '详情动态');
    expect(Array.isArray(ownPosts)).toBe(true);
    expect(comment).toHaveProperty('content', '收到，今晚参与讨论');
    expect(removed).toHaveProperty('success', true);
    expect(group).toHaveProperty('name', '群组A');
    expect(announcement).toHaveProperty('fieldName', 'description');
  });
});
