import { FullModal } from '@/components/FullModal';
import {
  SidebarView,
  SidebarViewMenuItem,
  SidebarViewMenuType,
} from '@/components/SidebarView';
import { pluginCustomPanel } from '@/plugin/common';
import React, { useCallback, useMemo } from 'react';
import { isDevelopment, t } from 'tailchat-shared';
import { SettingsAbout } from './About';
import { SettingsAccount } from './Account';
import { SettingsDebug } from './Debug';
import { SettingsLinkPanel } from './LinkPanel';
import { SettingsStatus } from './Status';
import { SettingsSystem } from './System';

interface SettingsViewProps {
  onClose: () => void;
}
export const SettingsView: React.FC<SettingsViewProps> = React.memo((props) => {
  const handleChangeVisible = useCallback(
    (visible: boolean) => {
      if (visible === false && typeof props.onClose === 'function') {
        props.onClose();
      }
    },
    [props.onClose]
  );

  const menu: SidebarViewMenuType[] = useMemo(() => {
    const accountCenter: SidebarViewMenuType = {
      type: 'group',
      title: t('我的中心'),
      children: [
        {
          type: 'item',
          title: t('个人资料'),
          content: <SettingsAccount />,
        },
        {
          type: 'item',
          title: t('偏好设置'),
          content: <SettingsSystem />,
        },
        {
          type: 'item',
          title: t('服务与支持'),
          content: <SettingsStatus />,
        },
        {
          type: 'item',
          title: t('关于'),
          content: <SettingsAbout />,
        },
      ],
    };
    if (isDevelopment) {
      // 仅用于开发环境
      accountCenter.children.push({
        type: 'item',
        title: t('调试'),
        content: <SettingsDebug />,
      });
    }

    const more: SidebarViewMenuItem[] = pluginCustomPanel
      .filter((p) => p.position === 'setting')
      .map((p) => ({
        type: 'item',
        title: p.label,
        content: React.createElement(p.render),
      }));

    const menu: SidebarViewMenuType[] = [accountCenter];
    menu.push({
      type: 'group',
      title: t('协议与合规'),
      children: [
        {
          type: 'item',
          title: t('用戶協議'),
          content: (
            <SettingsLinkPanel
              title="用戶協議"
              description="查看財訊賬號使用規則、禁止行為、知識產權與免責邊界。"
              href="/entry/terms"
            />
          ),
        },
        {
          type: 'item',
          title: t('隱私政策'),
          content: (
            <SettingsLinkPanel
              title="隱私政策"
              description="查看平台收集的信息類型、存儲地點、日本節點部署與加密保護方式。"
              href="/entry/privacy"
            />
          ),
        },
        {
          type: 'item',
          title: t('社區公約'),
          content: (
            <SettingsLinkPanel
              title="社區公約"
              description="查看日斗投資財富論壇交流規範，禁止黑嘴、詐騙、刷屏與惡意帶節奏。"
              href="/entry/community"
            />
          ),
        },
        {
          type: 'item',
          title: t('安全與合規'),
          content: (
            <SettingsLinkPanel
              title="財訊 · 安全與合規"
              description="查看 TLS 1.3、HSTS、日本東京數據節點、每日備份與信任標識。"
              href="/entry/trust"
            />
          ),
        },
        {
          type: 'item',
          title: t('下載說明'),
          content: (
            <SettingsLinkPanel
              title="下載說明"
              description="查看桌面端、移動端與 Web 的使用入口與下載方式。"
              href="https://tailchat.msgbyte.com/downloads"
            />
          ),
        },
      ],
    });
    if (more.length > 0) {
      menu.push({
        type: 'group',
        title: t('更多'),
        children: [...more],
      });
    }

    return menu;
  }, []);

  return (
    <FullModal onChangeVisible={handleChangeVisible}>
      <SidebarView menu={menu} defaultContentPath="0.children.0.content" />
    </FullModal>
  );
});
SettingsView.displayName = 'SettingsView';
