import { buildAgentAnalyticsEvent } from '../utils/agentAnalytics';

describe('agentAnalytics', () => {
  test('builds analytics event with conversion metadata', () => {
    expect(
      buildAgentAnalyticsEvent({
        agentId: 'agent_teacher_finance',
        eventType: 'friend_accept',
        sourceSceneId: 'social_growth',
        conversionLabel: 'lead',
      })
    ).toMatchObject({
      agentId: 'agent_teacher_finance',
      eventType: 'friend_accept',
      sourceSceneId: 'social_growth',
      conversionLabel: 'lead',
    });
  });
});
