import React from 'react';
import { BRAND_EVENT_NAME, BRAND_SUBTITLE, t } from 'tailchat-shared';

export const EventBanner: React.FC = React.memo(() => {
  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      <div className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37]">
        {t('平台介绍')}
      </div>
      <div className="mt-1 text-base font-semibold text-white">
        {BRAND_EVENT_NAME}
      </div>
      <div className="mt-1 text-xs text-[rgba(255,255,255,0.64)]">
        {BRAND_SUBTITLE}
      </div>
    </div>
  );
});
EventBanner.displayName = 'EventBanner';
