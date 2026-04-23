export const BRAND_NAME_FULL = '日斗投资财富交流会 · RIDOU INVESTMENT';
export const BRAND_NAME_SHORT = '日斗投资财富交流会';
export const BRAND_NAME_ADMIN = '财富中心';

export type Quote = {
  text: string;
  /**
   * 可选：用于 UI 展示的署名/来源（若不需要可留空）
   */
  by?: string;
};

/**
 * 语录库（来自用户提供内容的“拆句精选”）
 * 注意：语录仅用于交流氛围与价值观表达，不构成任何投资建议。
 */
export const QUOTES: Record<'entry' | 'sidebar' | 'chatEmpty', Quote[]> = {
  entry: [
    { text: '便宜是硬道理，成长是真功夫' },
    { text: '价值投资既是一场财富的盛宴，也是一场艰苦的修行' },
    { text: '价值投资的最大敌人，是内心的贪婪与恐惧' },
    { text: '不追涨杀跌，跨越周期' },
    { text: '大钱一定是有方向的' },
    { text: '真正赚大钱，往往靠一只股票赚很多倍' },
  ],
  sidebar: [
    { text: '低估值、高现金流、高分红' },
    { text: '长期跟踪，多方求证' },
    { text: '规避系统性风险' },
    { text: '交易：杀伐果断——纪律严明的法家精神' },
    { text: '持有：长期实践——佛家老僧入定' },
    { text: '选股：认知追求——儒家求知少年' },
  ],
  chatEmpty: [
    { text: '既要耐得住寂寞，也要享得了繁华' },
    { text: '投资有两个成本：时间成本与波动' },
    { text: '要有定风波的精神，永远不要偏离核心' },
    { text: '拐点已到，果断重仓（仅作观点表达）' },
    { text: '花开堪折直须折，莫待无花空折枝' },
  ],
};

function hashStringToInt(input: string): number {
  // 简单稳定 hash（跨端一致即可）
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getDailyQuote(
  placement: keyof typeof QUOTES,
  dateISO: string = new Date().toISOString().slice(0, 10)
): Quote {
  const list = QUOTES[placement];
  const idx = hashStringToInt(`${placement}:${dateISO}`) % list.length;
  return list[idx];
}

export const RISK_DECLARATION_TITLE = '投资风险安全宣言 / Risk Disclosure';
export const RISK_DECLARATION_FULL = [
  '本交流会内容仅用于学习与交流分享，不构成任何投资建议、收益承诺或买卖依据。',
  '证券/基金/期货等金融产品与服务存在风险，市场有风险，投资需谨慎；过往表现不代表未来。',
  '请在充分理解产品特性与风险后，结合自身风险承受能力，独立做出决策，并自行承担投资结果。',
  '交流中涉及的任何观点、策略、标的与案例均具有时效性与不确定性，请勿盲从、勿冲动交易。',
  '我们倡导理性、长期、合规的投资行为：规避系统性风险，长期跟踪，多方求证。',
].join('\n');

export const RISK_AGREE_LABEL = '我已阅读并同意《投资风险安全宣言》';
