/**
 * 插件商店
 */

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PillTabs } from '@/components/PillTabs';
import { Divider } from 'antd';
import React from 'react';
import { getGlobalConfig, t, useAsync, useUserInfo } from 'tailchat-shared';
import { builtinPlugins, requiredBuiltinPluginIds } from '../builtin';
import { pluginManager } from '../manager';
import { PluginStoreItem } from './Item';
import _uniqBy from 'lodash/uniqBy';

function usePluginStoreData() {
  const { loading: loading1, value: installedPluginList = [] } = useAsync(
    async () => pluginManager.getInstalledPlugins(),
    []
  );
  const { loading: loading2, value: allPlugins = [] } = useAsync(
    async () => pluginManager.getRegistryPlugins(),
    []
  );

  const loading = loading1 || loading2;

  return {
    loading,
    installedPluginList,
    allPlugins,
  };
}

export const PluginStore: React.FC = React.memo(() => {
  const { loading, installedPluginList, allPlugins } = usePluginStoreData();
  const userInfo = useUserInfo();

  if (loading) {
    return <LoadingSpinner tip={t('正在加载插件列表')} />;
  }

  const enabledPlugins = (getGlobalConfig() as any).enabledPlugins ?? {};
  const role = (userInfo as any)?.systemRole ?? 'student';
  const requiredSet = new Set(requiredBuiltinPluginIds);
  const isAllowed = (pluginName: string) => {
    if (requiredSet.has(pluginName)) return true;
    const rule = enabledPlugins?.[pluginName];
    if (!rule?.enabled) return false;
    const allowRoles = Array.isArray(rule.allowRoles) ? rule.allowRoles : [];
    return allowRoles.includes(role);
  };

  const builtinAllowed = builtinPlugins.filter((p) => isAllowed(p.name));
  const installedAllowed = installedPluginList.filter((p) => isAllowed(p.name));
  const allAllowed = allPlugins.filter((p) => isAllowed(p.name));

  const installedPluginNameList = installedAllowed.map((p) => p.name);
  const builtinPluginNameList = builtinAllowed.map((p) => p.name);

  return (
    <div className="p-2 w-full">
      <PillTabs
        items={[
          {
            key: '1',
            label: t('已安装'),
            children: (
              <>
                <Divider orientation="left">{t('已安装')}</Divider>

                <div className="flex flex-wrap">
                  {_uniqBy(
                    [...builtinAllowed, ...installedAllowed],
                    'name'
                  ).map((plugin) => (
                    <PluginStoreItem
                      key={plugin.name}
                      manifest={plugin}
                      installed={true}
                      builtin={builtinPluginNameList.includes(plugin.name)}
                    />
                  ))}
                </div>
              </>
            ),
          },
          {
            key: '2',
            label: t('全部'),
            children: (
              <>
                <Divider orientation="left">{t('内置插件')}</Divider>

                <div className="flex flex-wrap">
                  {builtinAllowed.map((plugin) => (
                    <PluginStoreItem
                      key={plugin.name}
                      manifest={plugin}
                      installed={installedPluginNameList.includes(plugin.name)}
                      builtin={true}
                    />
                  ))}
                </div>

                <Divider orientation="left">{t('插件中心')}</Divider>

                <div className="flex flex-wrap">
                  {allAllowed
                    .filter((p) => !builtinPluginNameList.includes(p.name)) // 插件中心只显示不包含内置插件的插件
                    .map((plugin) => (
                      <PluginStoreItem
                        key={plugin.name}
                        manifest={plugin}
                        installed={installedPluginNameList.includes(
                          plugin.name
                        )}
                      />
                    ))}
                </div>
              </>
            ),
          },
          {
            key: '3',
            label: <span className="text-green-400">{t('手动安装')}</span>,
            children: (
              <div className="p-2 text-muted">
                {t(
                  '已禁用手动安装：插件是否可用由后台“插件发布与权限”统一管理'
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
});
PluginStore.displayName = 'PluginStore';
