import { buildAgentScriptTemplate } from '../utils/agentScriptTemplate';

describe('agentScriptTemplate', () => {
  test('builds script template with default forum sink mode', () => {
    expect(
      buildAgentScriptTemplate({
        scriptId: 'finance_evening_course',
        name: '金融投教晚间转化脚本',
        domain: 'finance',
        stages: ['预热', '讲课', '互动', '转化', '复盘'],
      })
    ).toMatchObject({
      scriptId: 'finance_evening_course',
      name: '金融投教晚间转化脚本',
      domain: 'finance',
      forumSinkMode: 'topic-thread',
    });
  });
});
