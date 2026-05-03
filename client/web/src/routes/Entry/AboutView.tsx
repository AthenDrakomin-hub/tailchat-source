import React from 'react';
import {
  BRAND_COMPANY,
  BRAND_EVENT_NAME,
  BRAND_NAME_FULL,
  BRAND_SUBTITLE,
  BRAND_TAGLINE,
} from 'tailchat-shared';
import { DocumentLayout } from './DocumentLayout';

export const AboutView: React.FC = React.memo(() => {
  return (
    <DocumentLayout title="關於我們" subtitle={BRAND_SUBTITLE}>
      <div className="space-y-5 text-sm leading-7 text-[rgba(255,255,255,0.82)]">
        <section>
          <div className="text-base font-semibold text-white mb-2">{BRAND_NAME_FULL}</div>
          <p>
            {BRAND_NAME_FULL} 是面向高质量交流场景的即时沟通平台，用於承接即時消息、群组协作、语音互动与长期交流。
          </p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">平台定位</div>
          <p>{BRAND_TAGLINE}</p>
          <p>
            平台以穩健、理性、合規的交流氛圍為核心，服務於用戶日常沟通、协作与内容沉淀。
          </p>
        </section>

        <section>
          <div className="text-base font-semibold text-white mb-2">主體與品牌</div>
          <p>主體公司：{BRAND_COMPANY}</p>
          <p>社群名稱：{BRAND_SUBTITLE}</p>
          <p>平台介紹：{BRAND_EVENT_NAME}</p>
        </section>
      </div>
    </DocumentLayout>
  );
});
AboutView.displayName = 'AboutView';
