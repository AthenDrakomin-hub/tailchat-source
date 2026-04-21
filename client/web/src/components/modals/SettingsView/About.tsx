import { Typography } from 'antd';
import React from 'react';
import { t, version } from 'tailchat-shared';
import logoUrl from '@assets/images/logo.svg';

const { Paragraph, Text } = Typography;

export const SettingsAbout: React.FC = React.memo(() => {
  return (
    <div className="select-text">
      <img
        className="float-right select-none bg-black rounded-2xl bg-opacity-40 p-2"
        width={128}
        height={128}
        src={logoUrl}
      />

      <Paragraph>
        <Text className="font-bold text-xl">财富会客厅</Text>
      </Paragraph>
      <Paragraph>{t('您的专属财富管家与交流平台')}</Paragraph>
      <Paragraph>
        {t('在这里，对话首席经济学家，洞察宏观趋势，前瞻投资机遇。')}
      </Paragraph>

      <Paragraph>
        <div className="font-bold">{t('核心功能')}:</div>
        <ul className="list-disc list-inside mt-2">
          <li>{t('实时图文与直播互动')}</li>
          <li>{t('私密专属社群与一对一管家服务')}</li>
          <li>{t('投资研报与宏观数据首发')}</li>
        </ul>
      </Paragraph>

      <Paragraph>
        {t('当前版本')}: {version}
      </Paragraph>
    </div>
  );
});
SettingsAbout.displayName = 'SettingsAbout';
