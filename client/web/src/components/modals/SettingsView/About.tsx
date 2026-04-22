import { Typography } from 'antd';
import React from 'react';
import {
  BRAND_NAME_FULL,
  RISK_DECLARATION_FULL,
  RISK_DECLARATION_TITLE,
  version,
} from 'tailchat-shared';
import { BrandLogo } from '@/components/BrandLogo';

const { Paragraph, Text } = Typography;

export const SettingsAbout: React.FC = React.memo(() => {
  return (
    <div className="select-text">
      <BrandLogo
        className="float-right select-none bg-black rounded-2xl bg-opacity-40 p-2"
        width={128}
        height={128}
      />

      <Paragraph>
        <Text className="font-bold text-xl">{BRAND_NAME_FULL}</Text>
      </Paragraph>
      <Paragraph className="text-gray-600 dark:text-gray-300">
        价值投资 · 长期主义 · 严格风控
      </Paragraph>

      <Paragraph>
        <div className="font-bold mb-2">{RISK_DECLARATION_TITLE}</div>
        <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {RISK_DECLARATION_FULL}
        </div>
      </Paragraph>

      <Paragraph>当前版本: {version}</Paragraph>
    </div>
  );
});
SettingsAbout.displayName = 'SettingsAbout';
