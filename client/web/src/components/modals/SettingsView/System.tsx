import { FullModalFactory } from '@/components/FullModal/Factory';
import { FullModalField } from '@/components/FullModal/Field';
import { LanguageSelect } from '@/components/LanguageSelect';
import { pluginColorScheme, pluginSettings } from '@/plugin/common';
import { Select, Switch, Button } from 'antd';
import React from 'react';
import {
  t,
  useColorScheme,
  useUserSettings,
} from 'tailchat-shared';
import _get from 'lodash/get';

export const SettingsSystem: React.FC = React.memo(() => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { settings, setSettings, loading } = useUserSettings();

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          通用设置
        </div>
        <FullModalField title={t('系统语言')} content={<LanguageSelect />} />

        <FullModalField
          title={t('配色方案')}
          content={
            <Select
              style={{ width: 280 }}
              size="large"
              value={colorScheme}
              onChange={setColorScheme}
            >
              <Select.Option value="dark">{t('暗黑模式')}</Select.Option>
              <Select.Option value="light">{t('亮色模式')}</Select.Option>
              <Select.Option value="auto">{t('自动')}</Select.Option>
              {pluginColorScheme.map((pcs, i) => (
                <Select.Option key={pcs.name + i} value={pcs.name}>
                  {pcs.label}
                </Select.Option>
              ))}
            </Select>
          }
        />

        <FullModalField
          title={t('关闭消息右键菜单')}
          content={
            <Switch
              checked={settings['disableMessageContextMenu'] ?? false}
              onChange={(checked) =>
                setSettings({
                  disableMessageContextMenu: checked,
                })
              }
            />
          }
        />
      </div>

      <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6">
        <div className="text-lg font-bold text-gray-900 dark:text-white mb-5">
          进阶设置
        </div>
        {pluginSettings
          .filter((item) => item.position === 'system')
          .map((item) => {
            return (
              <FullModalFactory
                key={item.name}
                value={_get(settings, item.name, item.defaultValue ?? false)}
                onChange={(val) => {
                  setSettings({
                    [item.name]: val,
                  });
                }}
                config={item}
              />
            );
          })}
      </div>
      <Button type="primary" onClick={() => window.location.reload()}>
        {t('重新加载')}
      </Button>
    </div>
  );
});
SettingsSystem.displayName = 'SettingsSystem';
