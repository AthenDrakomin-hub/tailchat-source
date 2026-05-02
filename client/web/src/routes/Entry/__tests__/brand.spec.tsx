import {
  BRAND_NAME_FULL,
  BRAND_NAME_SHORT,
  RISK_AGREE_LABEL,
  RISK_DECLARATION_TITLE,
} from 'tailchat-shared';

describe('caixun brand baseline', () => {
  test('uses caixun as the only public brand name', () => {
    expect(BRAND_NAME_FULL).toBe('財訊');
    expect(BRAND_NAME_SHORT).toBe('財訊');
  });

  test('uses policy-first agreement wording', () => {
    expect(RISK_DECLARATION_TITLE).toBe('投資風險提示');
    expect(RISK_AGREE_LABEL).toBe('我已閱讀並同意《用戶協議》與《隱私政策》');
  });
});
