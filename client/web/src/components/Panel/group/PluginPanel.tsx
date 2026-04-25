import { Problem } from '@/components/Problem';
import { findPluginPanelInfoByName } from '@/utils/plugin-helper';
import { Alert } from 'antd';
import React, { useMemo } from 'react';
import { isValidStr, t, useGroupPanelInfo } from 'tailchat-shared';

interface GroupPluginPanelProps {
  groupId: string;
  panelId: string;
}

/**
 * 插件群组面板
 */
export const GroupPluginPanel: React.FC<GroupPluginPanelProps> = React.memo(
  (props) => {
    const panelInfo = useGroupPanelInfo(props.groupId, props.panelId);

    if (!panelInfo) {
      return (
        <Alert className="w-full text-center" message={t('无法获取面板信息')} />
      );
    }

    if (typeof panelInfo.provider !== 'string') {
      return (
        <Alert
          className="w-full text-center"
          message={t('未找到插件的提供者')}
        />
      );
    }

    // 从已安装插件注册的群组面板中查找对应群组的面板配置
    const pluginPanelInfo = useMemo(() => {
      if (!isValidStr(panelInfo.pluginPanelName)) {
        return null;
      }

      return findPluginPanelInfoByName(panelInfo.pluginPanelName);
    }, [panelInfo.name]);

    if (!pluginPanelInfo) {
      return (
        <div className="w-full h-full flex justify-center pt-20">
          <Alert
            className="w-[400px] max-w-[90vw] shadow-sm"
            type="warning"
            showIcon
            message={t('未安装或加载对应插件')}
            description={
              <div className="mt-2 text-sm opacity-80">
                <p>{t('该面板需要依赖特定插件才能正常显示。')}</p>
                <div className="mt-2 space-y-1">
                  <p>
                    {t('插件提供者')}: <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">{panelInfo.provider}</span>
                  </p>
                  <p>
                    {t('面板标识')}: <span className="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">{panelInfo.pluginPanelName}</span>
                  </p>
                </div>
                <p className="mt-4 font-medium">{t('请联系管理员或前往「我-插件中心」安装该插件，安装后刷新页面生效。')}</p>
              </div>
            }
          />
        </div>
      );
    }

    const Component = pluginPanelInfo.render;

    if (!Component) {
      return <Problem text={t('插件组件加载失败，请尝试重新安装该插件或联系开发者。')} />;
    }

    return <Component panelInfo={panelInfo} />;
  }
);
GroupPluginPanel.displayName = 'GroupPluginPanel';
