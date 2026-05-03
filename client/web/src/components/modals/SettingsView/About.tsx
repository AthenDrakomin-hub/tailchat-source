import { Typography } from 'antd';
import React from 'react';
import {
  BRAND_COMPANY,
  BRAND_NAME_FULL,
  BRAND_SUBTITLE,
  RISK_DECLARATION_FULL,
  RISK_DECLARATION_TITLE,
  version,
} from 'tailchat-shared';
import { BrandLogo } from '@/components/BrandLogo';

const { Paragraph, Text } = Typography;

export const SettingsAbout: React.FC = React.memo(() => {
  return (
    <div className="select-text space-y-6">
      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 overflow-hidden">
        <BrandLogo
          className="float-right select-none bg-black rounded-2xl bg-opacity-40 p-2"
          width={108}
          height={108}
        />
        <Paragraph>
          <Text className="font-bold text-xl">{BRAND_NAME_FULL}</Text>
        </Paragraph>
        <Paragraph className="text-gray-600 dark:text-gray-300">
          {BRAND_SUBTITLE}
        </Paragraph>
        <Paragraph className="text-gray-600 dark:text-gray-300">
          {BRAND_COMPANY}
        </Paragraph>
        <Paragraph className="text-gray-600 dark:text-gray-300">
          內部通訊 · 社區交流 · 語音互動
        </Paragraph>
        <Paragraph>当前版本: {version}</Paragraph>
      </div>

      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
        <div className="font-bold text-base text-gray-900 dark:text-white mb-3">
          聲明與說明
        </div>
        <div className="font-bold mb-2">{RISK_DECLARATION_TITLE}</div>
        <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {RISK_DECLARATION_FULL}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
        <div className="font-bold text-base text-gray-900 dark:text-white mb-4">
          相關入口
        </div>
        <div className="space-x-4">
          <a href="/entry/about" target="_blank" rel="noreferrer">
            查看完整關於我們
          </a>
          <a href="/entry/trust" target="_blank" rel="noreferrer">
            查看安全與合規
          </a>
        </div>
      </div>
    </div>
  );
});
SettingsAbout.displayName = 'SettingsAbout';
