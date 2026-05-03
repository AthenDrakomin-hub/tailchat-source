import { Typography } from 'antd';
import React from 'react';
import {
  BRAND_COMPANY,
  BRAND_NAME_FULL,
  BRAND_SUBTITLE,
  BRAND_EVENT_NAME,
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
        {BRAND_SUBTITLE} · {BRAND_EVENT_NAME}
      </Paragraph>
      <Paragraph className="text-gray-600 dark:text-gray-300">
        {BRAND_COMPANY}
      </Paragraph>
      <Paragraph className="text-gray-600 dark:text-gray-300">
        內部通訊 · 投資論壇 · 語音互動
      </Paragraph>

      <Paragraph>
        <div className="font-bold mb-2">{RISK_DECLARATION_TITLE}</div>
        <div className="whitespace-pre-line text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
          {RISK_DECLARATION_FULL}
        </div>
      </Paragraph>

      <Paragraph className="space-x-4">
        <a href="/entry/about" target="_blank" rel="noreferrer">
          查看完整關於我們
        </a>
        <a href="/entry/trust" target="_blank" rel="noreferrer">
          查看安全與合規
        </a>
      </Paragraph>

      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-5 py-5 mb-4">
        <div className="font-bold text-base text-gray-900 dark:text-white">
          使用帮助
        </div>
        <div className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
          建议先熟悉动态、群组与私信三条主链路；若遇到登录、聊天或群组异常，先回到“状态”页查看服务健康度，再决定下一步操作。
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <a
            href="/main/personal/friends"
            className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300"
          >
            返回起步面板
          </a>
          <a
            href="https://tailchat.msgbyte.com/downloads"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300"
          >
            查看客户端下载说明
          </a>
        </div>
      </div>

      <Paragraph>当前版本: {version}</Paragraph>
    </div>
  );
});
SettingsAbout.displayName = 'SettingsAbout';
