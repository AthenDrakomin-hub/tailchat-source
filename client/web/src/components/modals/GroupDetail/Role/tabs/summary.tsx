import {
  DefaultFullModalInputEditorRender,
  FullModalField,
} from '@/components/FullModal/Field';
import { openReconfirmModal } from '@/components/Modal';
import { Button, Select, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  AgentTriggerMode,
  model,
  showErrorToasts,
  showSuccessToasts,
  t,
  useAsyncRequest,
  useMemoizedFn,
} from 'tailchat-shared';
import { buildAgentBindingDisplay } from './agentBindingDisplay';
import { buildAgentBindingStatus } from './agentBindingStatus';

interface RoleSummaryProps {
  groupId: string;
  currentRoleInfo: model.group.GroupRole;
  onChangeRoleName: (roleName: string) => void;
  onDeleteRole: () => Promise<void>;
}
// 权限概述
export const RoleSummary: React.FC<RoleSummaryProps> = React.memo((props) => {
  const { currentRoleInfo } = props;
  const [agentOptions, setAgentOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [agentDefinitions, setAgentDefinitions] = useState<
    model.agent.AgentDefinition[]
  >([]);
  const [agentId, setAgentId] = useState('');
  const [triggerMode, setTriggerMode] =
    useState<AgentTriggerMode>('mention-or-script');
  const [active, setActive] = useState(true);

  const handleDeleteRole = useMemoizedFn(() => {
    openReconfirmModal({
      title: t('确认要删除角色 {{name}} 么?', {
        name: currentRoleInfo.name,
      }),
      onConfirm: () => props.onDeleteRole(),
    });
  });

  const [{ loading: bindingLoading }, saveBinding] = useAsyncRequest(async () => {
    if (!agentId) {
      throw new Error(t('请先选择一个 Agent'));
    }

    await model.agent.upsertAgentRoleBinding({
      groupId: props.groupId,
      roleId: currentRoleInfo._id,
      agentId,
      panelIds: [],
      triggerMode,
      active,
    });
  }, [props.groupId, currentRoleInfo._id, agentId, triggerMode, active]);

  useEffect(() => {
    model.agent
      .listAgentDefinitions()
      .then((list) => {
        setAgentDefinitions(list);
        setAgentOptions(
          list.map((item) => ({
            label: `${item.name} (${item.agentId})`,
            value: item.agentId,
          }))
        );
      })
      .catch(showErrorToasts);
  }, []);

  const agentDisplay = buildAgentBindingDisplay(agentDefinitions, agentId);
  const bindingStatus = buildAgentBindingStatus(agentDisplay);

  useEffect(() => {
    model.agent
      .getAgentRoleBinding(props.groupId, currentRoleInfo._id)
      .then((binding) => {
        setAgentId(binding?.agentId ?? '');
        setTriggerMode(binding?.triggerMode ?? 'mention-or-script');
        setActive(binding?.active ?? true);
      })
      .catch(showErrorToasts);
  }, [props.groupId, currentRoleInfo._id]);

  return (
    <div className="px-3 py-2">
      <FullModalField
        title={t('身份组名称')}
        value={props.currentRoleInfo.name}
        editable={true}
        renderEditor={DefaultFullModalInputEditorRender}
        onSave={props.onChangeRoleName}
      />

      <div className="mb-3 rounded-2xl border border-black/5 bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.03)]">
        <div className="text-xs text-gray-400 mb-2">{t('绑定外部 Agent')}</div>
        <div className="space-y-3">
          <Select
            className="w-full"
            value={agentId || undefined}
            placeholder={t('选择一个外部 Agent')}
            options={agentOptions}
            onChange={setAgentId}
          />

          <div
            className={`rounded-xl border px-3 py-2 text-sm ${
              bindingStatus.status === 'bound'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <div className="font-medium">{t(bindingStatus.title)}</div>
            <div className="mt-1">{t(bindingStatus.description)}</div>
          </div>

          {agentDisplay && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <div>
                <span className="text-slate-400">{t('接入对象')}：</span>
                {agentDisplay.label}
              </div>
              <div>
                <span className="text-slate-400">{t('外部 Agent ID')}：</span>
                {agentDisplay.externalAgentId}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="text-slate-400">{t('来源')}：</span>
                  {agentDisplay.provider}
                </span>
                <span>
                  <span className="text-slate-400">{t('运行模式')}：</span>
                  {agentDisplay.runtimeMode}
                </span>
                <span>
                  <span className="text-slate-400">{t('行业域')}：</span>
                  {agentDisplay.domain}
                </span>
              </div>
              {agentDisplay.description && (
                <div>
                  <span className="text-slate-400">{t('接入说明')}：</span>
                  {agentDisplay.description}
                </div>
              )}
            </div>
          )}

          <Select
            className="w-full"
            value={triggerMode}
            options={[
              { label: t('仅提及时触发'), value: 'mention-only' },
              { label: t('提及或场景触发'), value: 'mention-or-script' },
              { label: t('仅场景触发'), value: 'script-only' },
            ]}
            onChange={setTriggerMode}
          />

          <div className="flex items-center justify-between">
            <span>{t('启用此绑定')}</span>
            <Switch checked={active} onChange={setActive} />
          </div>

          <div className="text-right">
            <Button
              type="primary"
              loading={bindingLoading}
              onClick={async () => {
                try {
                  await saveBinding();
                  showSuccessToasts();
                } catch (err) {
                  showErrorToasts(err);
                }
              }}
            >
              {t('保存外部 Agent 绑定')}
            </Button>
          </div>
        </div>
      </div>

      <Button danger={true} onClick={handleDeleteRole}>
        {t('删除身份组')}
      </Button>
    </div>
  );
});
RoleSummary.displayName = 'RoleSummary';
