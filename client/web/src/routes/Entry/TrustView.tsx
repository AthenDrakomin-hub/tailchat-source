import React from 'react';
import {
  BRAND_COMPANY,
  BRAND_EVENT_NAME,
  BRAND_SUBTITLE,
  TRUST_TITLE,
} from 'tailchat-shared';
import { DocumentLayout } from './DocumentLayout';

const badges = ['SSL 加密', '每日備份', 'GDPR Ready'];

export const TrustView: React.FC = React.memo(() => {
  return (
    <DocumentLayout title={TRUST_TITLE} subtitle={BRAND_SUBTITLE}>
      <div className="space-y-5 text-sm leading-7 text-[rgba(255,255,255,0.82)]">
        <section>
          <div className="text-base font-semibold text-white mb-2">平台主體</div>
          <p>{BRAND_COMPANY}</p>
          <p>{BRAND_EVENT_NAME}</p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">傳輸與訪問安全</div>
          <p>平台全站使用 TLS 1.3 傳輸保護，並啟用 HSTS 策略以降低中間人攻擊風險。</p>
          <p>核心後台與平台操作採用分層權限控制和審計留痕。</p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">數據存儲與備份</div>
          <p>平台數據部署於日本東京區域數據節點，消息傳輸與落盤均採用加密保護。</p>
          <p>核心數據按照每日備份策略執行，便於故障恢復與運營連續性保障。</p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">信任標識</div>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-tc-primary/30 bg-tc-primary/10 px-3 py-1 text-xs font-medium text-tc-primary"
              >
                {badge}
              </span>
            ))}
          </div>
        </section>
      </div>
    </DocumentLayout>
  );
});
TrustView.displayName = 'TrustView';
