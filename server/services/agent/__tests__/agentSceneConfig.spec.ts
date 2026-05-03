import { buildAgentSceneConfig } from '../utils/agentSceneConfig';

describe('agentSceneConfig', () => {
  test('builds scene access config with infrastructure defaults', () => {
    expect(
      buildAgentSceneConfig({
        sceneId: 'group_growth',
        name: '群活跃场景',
        domain: 'finance',
        target: 'group',
      })
    ).toMatchObject({
      sceneId: 'group_growth',
      name: '群活跃场景',
      domain: 'finance',
      target: 'group',
      enabled: true,
      enabledActions: [],
    });
  });

  test('keeps enabled actions and scope fields when configured', () => {
    expect(
      buildAgentSceneConfig({
        sceneId: 'social_growth',
        name: '社交增长场景',
        domain: 'finance',
        target: 'personal-dm',
        enabledActions: ['publish-post', 'add-friend', 'reply-dm'],
        roleIds: ['r_teacher'],
        groupIds: ['g_demo'],
      })
    ).toMatchObject({
      target: 'personal-dm',
      enabledActions: ['publish-post', 'add-friend', 'reply-dm'],
      roleIds: ['r_teacher'],
      groupIds: ['g_demo'],
    });
  });
});
