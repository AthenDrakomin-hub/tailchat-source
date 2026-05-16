import React from 'react';
import { BRAND_NAME_FULL } from 'tailchat-shared';
import { DocumentLayout } from './DocumentLayout';

export const AboutView: React.FC = React.memo(() => {
  return (
    <DocumentLayout title="关于我们" subtitle="">
      <div className="space-y-5 text-sm leading-7 text-[rgba(255,255,255,0.82)]">
        <section>
          <div className="text-base font-semibold text-white mb-2">{BRAND_NAME_FULL}</div>
          <p>{BRAND_NAME_FULL} 是面向高质量交流场景的即时沟通平台。</p>
        </section>
      </div>
    </DocumentLayout>
  );
});
AboutView.displayName = 'AboutView';
