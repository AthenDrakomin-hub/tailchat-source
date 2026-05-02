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

      if (actionName === 'feed.listPostComments') {
        return [
          {
            _id: 'comment_1',
            postId: params.postId,
            content: '评论A',
          },
        ];
      }

      if (actionName === 'feed.likePost') {
        return {
          postId: params.postId,
          likesCount: 3,
        };
      }

      if (actionName === 'feed.removePost') {
        return { success: true };
      }

      if (actionName === 'group.getGroupInfo') {
        return { _id: params.groupId, name: '群组A', description: '今晚八点专题讨论' };
      }

      if (actionName === 'group.getGroupLobbyConverseId') {
        return 'group_converse_1';
      }

      if (actionName === 'group.listGroupMembers') {
        return [
          {
            userId: 'user_1',
            nickname: '成员A',
          },
        ];
      }

      if (actionName === 'group.updateGroupField') {
        return {
          groupId: params.groupId,
          fieldName: params.fieldName,
          fieldValue: params.fieldValue,
        };
      }

      if (actionName === 'chat.converse.findConverseInfo') {
        return {
          _id: params.converseId,
          type: 'DM',
        };
      }

      if (actionName === 'chat.message.fetchConverseMessage') {
        return [
          {
            _id: 'msg_1',
            converseId: params.converseId,
            content: '会话消息A',
          },
        ];
      }

      if (actionName === 'chat.message.sendMessage') {
        return {
          _id: 'msg_sent_1',
          converseId: params.converseId,
          groupId: params.groupId,
          content: params.content,
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
    const commentList = await broker.call('openapi.account.listFeedComments', {
      postId: 'post_1',
    });
    const liked = await broker.call('openapi.account.likeFeedPost', {
      postId: 'post_1',
    });
    const removed = await broker.call('openapi.account.removeFeedPost', {
      postId: 'post_1',
    });
    const group = await broker.call('openapi.account.getGroupDetail', {
      groupId: 'group_1',
    });
    const groupContext = await broker.call(
      'openapi.account.getGroupOperationsContext',
      {
        groupId: 'group_1',
      }
    );
    const groupAnnouncement = await broker.call(
      'openapi.account.getGroupAnnouncement',
      {
        groupId: 'group_1',
      }
    );
    const groupLobbyConversation = await broker.call(
      'openapi.account.getGroupLobbyConversation',
      {
        groupId: 'group_1',
      }
    );
    const groupMembers = await broker.call('openapi.account.listGroupMembers', {
      groupId: 'group_1',
    });
    const groupRecentMessages = await broker.call(
      'openapi.account.listGroupRecentMessages',
      {
        groupId: 'group_1',
      }
    );
    const announcement = await broker.call(
      'openapi.account.updateGroupAnnouncement',
      {
        groupId: 'group_1',
        announcement: '今晚八点专题讨论',
      }
    );
    const conversation = await broker.call(
      'openapi.account.getConversationDetail',
      {
        converseId: 'converse_1',
      }
    );
    const messages = await broker.call('openapi.account.listConversationMessages', {
      converseId: 'converse_1',
    });
    const lobbyMessage = await broker.call('openapi.account.sendGroupLobbyMessage', {
      groupId: 'group_1',
      content: '欢迎大家今晚准时参加讨论',
    });

    expect(detail).toHaveProperty('content', '详情动态');
    expect(Array.isArray(ownPosts)).toBe(true);
    expect(comment).toHaveProperty('content', '收到，今晚参与讨论');
    expect(Array.isArray(commentList)).toBe(true);
    expect(liked).toHaveProperty('likesCount', 3);
    expect(removed).toHaveProperty('success', true);
    expect(group).toHaveProperty('name', '群组A');
    expect(groupContext).toHaveProperty('announcement', '今晚八点专题讨论');
    expect(groupContext).toHaveProperty('lobbyConverseId', 'group_converse_1');
    expect(groupAnnouncement).toHaveProperty('announcement', '今晚八点专题讨论');
    expect(groupLobbyConversation).toHaveProperty('converseId', 'group_converse_1');
    expect(Array.isArray(groupMembers)).toBe(true);
    expect(Array.isArray(groupRecentMessages)).toBe(true);
    expect(announcement).toHaveProperty('fieldName', 'description');
    expect(conversation).toHaveProperty('type', 'DM');
    expect(Array.isArray(messages)).toBe(true);
    expect(lobbyMessage).toHaveProperty('content', '欢迎大家今晚准时参加讨论');
  });
});
