import { buildAgentBindingDisplay } from '../agentBindingDisplay';

describe('agentBindingDisplay', () => {
  test('builds external agent summary from selected agent definition', () => {
    expect(
      buildAgentBindingDisplay(
        [
          {
            agentId: 'agent_teacher_finance',
            name: '投教主讲老师',
            externalAgentId: 'openclaw.teacher.finance',
            provider: 'openclaw',
            runtimeMode: 'openclaw-bridge',
            domain: 'finance',
            status: 'active',
          },
        ],
        'agent_teacher_finance'
      )
    ).toMatchObject({
      label: '投教主讲老师 (agent_teacher_finance)',
      externalAgentId: 'openclaw.teacher.finance',
      provider: 'openclaw',
      runtimeMode: 'openclaw-bridge',
      domain: 'finance',
    });
  });

  test('returns null when selected agent is missing', () => {
    expect(buildAgentBindingDisplay([], 'missing')).toBeNull();
  });
});
