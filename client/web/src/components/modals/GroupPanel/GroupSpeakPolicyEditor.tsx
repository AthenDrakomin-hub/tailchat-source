import React from 'react';
import {
  GroupPanelSpeakPolicy,
  GroupRole,
  t,
} from 'tailchat-shared';
import { Divider, Input, InputNumber, Select, Space, Switch } from 'antd';

interface Props {
  roles: GroupRole[];
  value?: GroupPanelSpeakPolicy;
  onChange: (value: GroupPanelSpeakPolicy) => void;
}

function withDefaultPolicy(value?: GroupPanelSpeakPolicy): GroupPanelSpeakPolicy {
  return {
    enabled: value?.enabled ?? false,
    defaultRule: {
      allowText: value?.defaultRule?.allowText ?? true,
      allowRichContent: value?.defaultRule?.allowRichContent ?? true,
      rateLimitWindowSec: value?.defaultRule?.rateLimitWindowSec ?? 10,
      rateLimitCount: value?.defaultRule?.rateLimitCount ?? 6,
    },
    roleRules: value?.roleRules ?? {},
    botRule: {
      allowText: value?.botRule?.allowText ?? true,
      allowRichContent: value?.botRule?.allowRichContent ?? true,
      rateLimitWindowSec: value?.botRule?.rateLimitWindowSec ?? 30,
      rateLimitCount: value?.botRule?.rateLimitCount ?? 2,
    },
    floodControl: {
      enabled: value?.floodControl?.enabled ?? true,
      duplicateWindowSec: value?.floodControl?.duplicateWindowSec ?? 30,
      duplicateLimit: value?.floodControl?.duplicateLimit ?? 2,
    },
    readability: {
      roleStyleMode: value?.readability?.roleStyleMode ?? 'combined',
      roleStyleMap: value?.readability?.roleStyleMap ?? {},
    },
  };
}

export const GroupSpeakPolicyEditor: React.FC<Props> = React.memo((props) => {
  const policy = withDefaultPolicy(props.value);

  const updatePolicy = (patch: Partial<GroupPanelSpeakPolicy>) => {
    props.onChange({
      ...policy,
      ...patch,
    });
  };

  const updateRoleRule = (roleId: string, patch: Record<string, unknown>) => {
    props.onChange({
      ...policy,
      roleRules: {
        ...policy.roleRules,
        [roleId]: {
          ...policy.roleRules?.[roleId],
          ...patch,
        },
      },
    });
  };

  const updateRoleStyle = (roleId: string, patch: Record<string, unknown>) => {
    props.onChange({
      ...policy,
      readability: {
        ...policy.readability,
        roleStyleMap: {
          ...policy.readability?.roleStyleMap,
          [roleId]: {
            ...policy.readability?.roleStyleMap?.[roleId],
            ...patch,
          },
        },
      },
    });
  };

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 p-3 bg-white/70 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{t('发言治理')}</div>
          <div className="text-xs text-gray-400">
            {t('控制默认成员、角色与机器人的发言频率及消息识别样式')}
          </div>
        </div>
        <Switch
          checked={policy.enabled}
          onChange={(enabled) => updatePolicy({ enabled })}
        />
      </div>

      <Divider orientation="left">{t('默认成员规则')}</Divider>
      <RuleEditor
        value={policy.defaultRule}
        onChange={(defaultRule) => updatePolicy({ defaultRule })}
      />

      <Divider orientation="left">{t('机器人规则')}</Divider>
      <RuleEditor
        value={policy.botRule}
        onChange={(botRule) => updatePolicy({ botRule })}
      />

      <Divider orientation="left">{t('防刷屏')}</Divider>
      <Space direction="vertical" className="w-full">
        <div className="flex items-center justify-between">
          <span>{t('启用重复消息拦截')}</span>
          <Switch
            checked={policy.floodControl?.enabled}
            onChange={(enabled) =>
              updatePolicy({
                floodControl: {
                  ...policy.floodControl,
                  enabled,
                },
              })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('重复窗口秒数')}>
            <InputNumber
              className="w-full"
              min={1}
              value={policy.floodControl?.duplicateWindowSec}
              onChange={(duplicateWindowSec) =>
                updatePolicy({
                  floodControl: {
                    ...policy.floodControl,
                    duplicateWindowSec: Number(duplicateWindowSec),
                  },
                })
              }
            />
          </Field>
          <Field label={t('重复上限次数')}>
            <InputNumber
              className="w-full"
              min={1}
              value={policy.floodControl?.duplicateLimit}
              onChange={(duplicateLimit) =>
                updatePolicy({
                  floodControl: {
                    ...policy.floodControl,
                    duplicateLimit: Number(duplicateLimit),
                  },
                })
              }
            />
          </Field>
        </div>
      </Space>

      <Divider orientation="left">{t('角色规则')}</Divider>
      <Field label={t('消息识别样式')}>
        <Select
          className="w-full"
          value={policy.readability?.roleStyleMode}
          options={[
            { label: t('关闭'), value: 'none' },
            { label: t('仅昵称'), value: 'nickname' },
            { label: t('仅头像环'), value: 'avatar-ring' },
            { label: t('仅侧边色条'), value: 'side-accent' },
            { label: t('组合'), value: 'combined' },
          ]}
          onChange={(roleStyleMode) =>
            updatePolicy({
              readability: {
                ...policy.readability,
                roleStyleMode,
              },
            })
          }
        />
      </Field>
      <Space direction="vertical" className="w-full">
        {props.roles.map((role) => (
          <div
            key={role._id}
            className="rounded-xl border border-black/5 dark:border-white/10 p-3"
          >
            <div className="mb-2 font-medium">{role.name}</div>
            <RuleEditor
              compact={true}
              value={policy.roleRules?.[role._id]}
              onChange={(value) => updateRoleRule(role._id, value as Record<string, unknown>)}
            />
            <div className="grid grid-cols-3 gap-3 mt-3">
              <Field label={t('昵称颜色')}>
                <Input
                  value={policy.readability?.roleStyleMap?.[role._id]?.nicknameColor}
                  placeholder="#ff4d4f"
                  onChange={(e) =>
                    updateRoleStyle(role._id, {
                      nicknameColor: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label={t('头像环颜色')}>
                <Input
                  value={policy.readability?.roleStyleMap?.[role._id]?.avatarRingColor}
                  placeholder="#52c41a"
                  onChange={(e) =>
                    updateRoleStyle(role._id, {
                      avatarRingColor: e.target.value,
                    })
                  }
                />
              </Field>
              <Field label={t('侧边色条')}>
                <Input
                  value={policy.readability?.roleStyleMap?.[role._id]?.sideAccentColor}
                  placeholder="#1677ff"
                  onChange={(e) =>
                    updateRoleStyle(role._id, {
                      sideAccentColor: e.target.value,
                    })
                  }
                />
              </Field>
            </div>
          </div>
        ))}
      </Space>
    </div>
  );
});
GroupSpeakPolicyEditor.displayName = 'GroupSpeakPolicyEditor';

const RuleEditor: React.FC<{
  value: GroupPanelSpeakPolicy['defaultRule'];
  onChange: (value: NonNullable<GroupPanelSpeakPolicy['defaultRule']>) => void;
  compact?: boolean;
}> = React.memo(({ value, onChange, compact = false }) => {
  const next = {
    allowText: value?.allowText ?? true,
    allowRichContent: value?.allowRichContent ?? true,
    rateLimitWindowSec: value?.rateLimitWindowSec ?? 10,
    rateLimitCount: value?.rateLimitCount ?? 6,
  };

  return (
    <Space direction="vertical" className="w-full">
      <div className="flex items-center justify-between">
        <span>{t('允许文字消息')}</span>
        <Switch
          checked={next.allowText}
          onChange={(allowText) => onChange({ ...next, allowText })}
        />
      </div>
      <div className="flex items-center justify-between">
        <span>{t('允许富媒体消息')}</span>
        <Switch
          checked={next.allowRichContent}
          onChange={(allowRichContent) => onChange({ ...next, allowRichContent })}
        />
      </div>
      <div className={compact ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-3'}>
        <Field label={t('窗口秒数')}>
          <InputNumber
            className="w-full"
            min={1}
            value={next.rateLimitWindowSec}
            onChange={(rateLimitWindowSec) =>
              onChange({ ...next, rateLimitWindowSec: Number(rateLimitWindowSec) })
            }
          />
        </Field>
        <Field label={t('窗口内次数')}>
          <InputNumber
            className="w-full"
            min={1}
            value={next.rateLimitCount}
            onChange={(rateLimitCount) =>
              onChange({ ...next, rateLimitCount: Number(rateLimitCount) })
            }
          />
        </Field>
      </div>
    </Space>
  );
});
RuleEditor.displayName = 'RuleEditor';

const Field: React.FC<{
  label: string;
  children: React.ReactNode;
}> = React.memo((props) => (
  <div>
    <div className="mb-1 text-xs text-gray-400">{props.label}</div>
    {props.children}
  </div>
));
Field.displayName = 'Field';
