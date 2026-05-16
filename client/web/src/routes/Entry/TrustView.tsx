import React from 'react';
import {
  BRAND_COMPANY,
  BRAND_EVENT_NAME,
  BRAND_SUBTITLE,
  TRUST_TITLE,
} from 'tailchat-shared';
import { DocumentLayout } from './DocumentLayout';

const badges = ['SSL 加密', '每日备份', 'GDPR Ready'];

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
          <div className="text-base font-semibold text-white mb-2">传输與访问安全</div>
          <p>平台全站使用 TLS 1.3 传输保护，並啟用 HSTS 策略以降低中間人攻擊风险。</p>
          <p>核心後台與平台操作採用分層权限控制和审计留痕。</p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">数据存储與备份</div>
          <p>平台数据部署於日本东京区域数据节点，消息传输與落盘均採用加密保护。</p>
          <p>核心数据按照每日备份策略执行，便于故障恢复與运营连续性保障。</p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">信任标识</div>
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
