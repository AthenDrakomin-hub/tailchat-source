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
import { SettingsWechatNotify } from './WechatNotify';

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
          title: t('微信通知'),
          content: <SettingsWechatNotify />,
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
          title: t('用户协议'),
          content: (
            <SettingsLinkPanel
              title="用户协议"
              description="查看财讯账号使用规则、禁止行为、知识产权与免责边界。"
              href="/entry/terms"
            />
          ),
        },
        {
          type: 'item',
          title: t('隐私政策'),
          content: (
            <SettingsLinkPanel
              title="隐私政策"
              description="查看平台收集的信息类型、存储地点、日本节点部署与加密保护方式。"
              href="/entry/privacy"
            />
          ),
        },
        {
          type: 'item',
          title: t('社区公约'),
          content: (
            <SettingsLinkPanel
              title="社区公约"
              description="查看社区交流规范，了解平台禁止行为与秩序要求。"
              href="/entry/community"
            />
          ),
        },
        {
          type: 'item',
          title: t('安全與合规'),
          content: (
            <SettingsLinkPanel
              title="財訊 · 安全與合规"
              description="查看 TLS 1.3、HSTS、日本东京数据节点、每日备份與信任标识。"
              href="/entry/trust"
            />
          ),
        },
        {
          type: 'item',
          title: t('下载说明'),
          content: (
            <SettingsLinkPanel
              title="下载说明"
              description="查看桌面端、移動端與 Web 的使用入口與下载方式。"
              href="/downloads"
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
