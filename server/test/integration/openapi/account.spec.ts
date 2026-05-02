import { createTestServiceBroker } from '../../utils';
import OpenAccountService from '../../../services/openapi/account.service';

describe('Test "openapi.account" service', () => {
  const { broker, contextCallMock } =
    createTestServiceBroker<OpenAccountService>(OpenAccountService);

  test('can list conversations and publish feed post through facade', async () => {
    contextCallMock.mockImplementation((actionName: string) => {
      if (actionName === 'chat.converse.findAndJoinRoom') {
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
});
