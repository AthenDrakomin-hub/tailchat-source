export const BRAND_NAME_FULL = '財訊';
export const BRAND_NAME_SHORT = '財訊';
export const BRAND_NAME_ADMIN = '財訊後台';
export const BRAND_SUBTITLE = '高质量交流与即时沟通平台';
export const BRAND_COMPANY = '日斗投資諮詢有限公司';
export const BRAND_EVENT_NAME = '品牌资讯';
export const BRAND_EVENT_FULL = '財訊即时沟通平台';
export const BRAND_TAGLINE = '即時通訊 · 社區交流 · 語音互動';
export const PRIVACY_TITLE = '隱私政策';
export const TERMS_TITLE = '用戶協議';
export const COMMUNITY_TITLE = '社區公約';
export const TRUST_TITLE = '財訊 · 安全與合規';
export const ENTRY_META_DESCRIPTION =
  '財訊｜高质量交流与即时沟通平台，支持即時交流、群组协作与语音互动。';

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

export const RISK_DECLARATION_TITLE = '投資風險提示';
export const RISK_DECLARATION_FULL = [
  '本平台內容僅用於學習、交流與觀點分享，不構成任何投資建議、收益承諾或買賣依據。',
  '證券、基金、期貨等金融產品具有風險，市場有風險，投資需謹慎；過往表現不代表未來結果。',
  '請在充分理解產品特性與風險後，結合自身風險承受能力，獨立做出決策，並自行承擔投資結果。',
  '交流中涉及的任何觀點、策略、標的與案例均具有時效性與不確定性，請勿盲從、勿衝動交易。',
  '我們倡導理性、長期、合規的投資行為：規避系統性風險，長期跟蹤，多方求證。',
].join('\n');

export const RISK_AGREE_LABEL = '我已閱讀並同意《用戶協議》與《隱私政策》';
