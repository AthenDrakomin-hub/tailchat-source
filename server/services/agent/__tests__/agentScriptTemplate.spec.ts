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
      archiveTags: [],
    });
  });

  test('keeps forum sink strategy fields when configured', () => {
    expect(
      buildAgentScriptTemplate({
        scriptId: 'finance_evening_course',
        name: '金融投教晚间转化脚本',
        domain: 'finance',
        stages: ['预热', '讲课'],
        forumSinkMode: 'knowledge-base',
        forumTargetCategory: '投教精选',
        forumPostTitleTemplate: '{{date}} 投教晚课纪要',
        archiveTags: ['投教', '晚课'],
      })
    ).toMatchObject({
      forumSinkMode: 'knowledge-base',
      forumTargetCategory: '投教精选',
      forumPostTitleTemplate: '{{date}} 投教晚课纪要',
      archiveTags: ['投教', '晚课'],
    });
  });
});
