import { pluginInspectServices } from '@/plugin/common';
import { Icon } from 'tailchat-design';
import React, { useMemo } from 'react';
import { t, useAvailableServices } from 'tailchat-shared';
import { Button } from 'antd';
import { Loading } from '@/components/Loading';

/**
 * 默认检查服务列表
 */
const DEFAULT_SERVICES = [
  {
    name: 'config',
    label: t('全局配置'),
  },
  {
    name: 'gateway',
    label: t('服务网关'),
  },
  {
    name: 'user',
    label: t('用户服务'),
  },
  {
    name: 'user.dmlist',
    label: t('私信服务'),
  },
  {
    name: 'chat.message',
    label: t('聊天服务'),
  },
  {
    name: 'chat.converse',
    label: t('聊天列表服务'),
  },
  {
    name: 'chat.ack',
    label: t('已读服务'),
  },
  {
    name: 'friend',
    label: t('联系人服务'),
  },
  {
    name: 'group',
    label: t('群组服务'),
  },
  {
    name: 'group.invite',
    label: t('群组邀请服务'),
  },
  {
    name: 'file',
    label: t('文件服务'),
  },
  {
    name: 'mail',
    label: t('邮件服务'),
  },
  {
    name: 'plugin.registry',
    label: t('插件中心服务'),
  },
];

/**
 * 服务状态
 */
export const SettingsStatus: React.FC = React.memo(() => {
  const inspectServices = useMemo(
    () => [...DEFAULT_SERVICES, ...pluginInspectServices],
    []
  ); // 需要检查服务状态的列表

  const { loading, availableServices, refetch } = useAvailableServices();
  const availableCount = availableServices?.filter((service) =>
    inspectServices.some((item) => item.name === service)
  ).length;
  const totalCount = inspectServices.length;
  const healthLevel =
    availableCount === totalCount
      ? '健康'
      : (availableCount ?? 0) >= Math.ceil(totalCount * 0.7)
        ? '需关注'
        : '异常';

  return (
    <div>
      <div className="mb-4 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-5 py-5">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Web 试运营状态中心
        </div>
        <div className="mt-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
          这里用于确认当前 Web 端是否适合继续承接试运营主链路。建议在出现登录异常、聊天异常、联系人异常或群组异常时，先看这里再决定是否继续操作。
        </div>
        <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">整体状态</div>
            <div className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
              {healthLevel}
            </div>
          </div>
          <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">可用服务</div>
            <div className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
              {availableCount ?? 0} / {totalCount}
            </div>
          </div>
          <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">建议动作</div>
            <div className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              {healthLevel === '健康'
                ? '继续体验动态、群组、私信主链路'
                : healthLevel === '需关注'
                  ? '先刷新状态，再做关键操作'
                  : '暂停继续操作，优先排查服务'}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <a href="/entry/about" target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
            查看关于我们
          </a>
          <a href="/entry/trust" target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
            查看安全与合规
          </a>
          <a href="https://tailchat.msgbyte.com/downloads" target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
            查看客户端下载说明
          </a>
        </div>
      </div>
      <Button
        className="mb-2"
        type="primary"
        loading={loading}
        onClick={refetch}
      >
        {t('刷新')}
      </Button>
      <Loading spinning={loading}>
        <div className="mb-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            试运营建议
          </div>
          <div className="mt-3 space-y-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            <div>1. 先确认 `全局配置`、`服务网关`、`用户服务`、`聊天服务` 和 `群组服务` 都正常。</div>
            <div>2. 如果这里只是局部异常，优先继续验证动态、群组和联系人等未受影响链路。</div>
            <div>3. 如果基础服务大量异常，先暂停继续试运营，避免把技术问题误判为产品问题。</div>
          </div>
        </div>
        {inspectServices.map((service) => (
          <div key={service.name} className="flex items-center">
            <span className="mr-1">{service.label}:</span>
            {availableServices?.includes(service.name) ? (
              <span title={t('当前服务可用')}>
                <Icon icon="emojione:white-heavy-check-mark" />
              </span>
            ) : (
              <span title={t('服务异常')}>
                <Icon icon="emojione:cross-mark-button" />
              </span>
            )}
          </div>
        ))}
      </Loading>
    </div>
  );
});
SettingsStatus.displayName = 'SettingsStatus';
