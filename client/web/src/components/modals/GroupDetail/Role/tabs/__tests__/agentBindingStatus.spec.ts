import { buildAgentBindingStatus } from '../agentBindingStatus';

describe('agentBindingStatus', () => {
  test('returns unbound status when no external agent selected', () => {
    expect(buildAgentBindingStatus(null)).toMatchObject({
      status: 'unbound',
      title: '未绑定外部 Agent',
    });
  });

  test('returns bound status when external agent summary exists', () => {
    expect(
      buildAgentBindingStatus({
        label: '投教主讲老师 (agent_teacher_finance)',
        externalAgentId: 'openclaw.teacher.finance',
        provider: 'openclaw',
        runtimeMode: 'openclaw-bridge',
        domain: 'finance',
        description: undefined,
      })
    ).toMatchObject({
      status: 'bound',
      title: '已绑定外部 Agent',
    });
  });
});
