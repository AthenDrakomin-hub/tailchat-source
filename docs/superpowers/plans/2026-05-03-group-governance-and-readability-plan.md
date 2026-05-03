# 群聊发言治理与阅读优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为群面板补齐角色级发言治理、频率限制、机器人限流、防刷屏和消息阅读识别增强，并把输入框旁禁言按钮接成真实的默认发言规则快捷入口。

**Architecture:** 在 `GroupPanel` 上新增 `meta.speakPolicy` 作为面板级治理配置，服务端在 `chat.message.sendMessage()` 的群消息路径里追加“权限后、落库前”的治理校验。前端在群面板设置里新增“发言治理”配置区，并在群聊渲染层读取角色样式配置做轻量识别增强，同时强化消息搜索落点高亮。

**Tech Stack:** TypeScript, React, Ant Design, Moleculer service, Mongoose adapter, Redis-based rate limit helper, Tailchat shared models/hooks

---

## File Map

### Shared / 类型
- Modify: `client/shared/model/group.ts`
  - 补充 `GroupPanel` 相关 speak policy 类型和面板修改 helper 的调用形状

### Server / 群聊治理
- Modify: `server/services/core/chat/message.service.ts`
  - 在群消息发送路径中接入发言治理校验
- Create: `server/services/core/chat/utils/groupSpeakPolicy.ts`
  - 负责规则解析、最严格规则合并、文本/富媒体判定
- Create: `server/services/core/chat/utils/groupSpeakRateLimit.ts`
  - 负责 Redis 频率限制与重复消息防刷校验
- Test: `server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts`
- Test: `server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts`

### Frontend / 面板设置与快捷禁言
- Modify: `client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx`
  - 新增“发言治理”配置区
- Create: `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
  - 编辑默认规则、角色规则、机器人规则、防刷和阅读样式
- Modify: `client/web/src/components/ChatBox/ChatInputBox/MuteAllButton.tsx`
  - 改为切换默认发言规则

### Frontend / 阅读优化
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
  - 读取角色样式并渲染昵称色、头像环、气泡侧边色条
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.less`
  - 配套样式
- Modify: `client/web/src/components/Panel/common/MessageSearch.tsx`
  - 点击搜索结果跳转并触发高亮
- Modify: `client/web/src/components/ChatBox/ChatMessageList/MessageHighlightContainer.tsx`
  - 增强落点高亮样式和持续时间

### Frontend / 测试
- Test: `client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`
- Test: `client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx`

## Task 1: 建立面板 speak policy 类型边界

**Files:**
- Modify: `client/shared/model/group.ts`
- Test: `server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts`

- [ ] **Step 1: 写失败测试，锁定规则解析输入输出**

```ts
import { describe, expect, test } from '@jest/globals';
import {
  getMostStrictSpeakRule,
  isRichMessagePayload,
} from '../utils/groupSpeakPolicy';

describe('group speak policy', () => {
  test('returns strictest rule from matched role rules', () => {
    const result = getMostStrictSpeakRule(
      [
        { allowText: true, allowRichContent: true, rateLimitWindowSec: 10, rateLimitCount: 5 },
        { allowText: true, allowRichContent: false, rateLimitWindowSec: 30, rateLimitCount: 2 },
      ],
      { allowText: true, allowRichContent: true, rateLimitWindowSec: 15, rateLimitCount: 4 }
    );

    expect(result).toEqual({
      allowText: true,
      allowRichContent: false,
      rateLimitWindowSec: 30,
      rateLimitCount: 2,
    });
  });

  test('treats image decorator payload as rich content', () => {
    expect(
      isRichMessagePayload('![img](https://example.com/a.png)', {
        decorators: [{ type: 'image', url: 'https://example.com/a.png' }],
      })
    ).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts --runInBand`
Expected: FAIL，提示 `groupSpeakPolicy` helper 未定义或导出不存在

- [ ] **Step 3: 在 shared 中补充 speak policy 类型**

```ts
export interface GroupPanelSpeakRule {
  allowText?: boolean;
  allowRichContent?: boolean;
  rateLimitWindowSec?: number;
  rateLimitCount?: number;
}

export interface GroupPanelFloodControlRule {
  enabled?: boolean;
  duplicateWindowSec?: number;
  duplicateLimit?: number;
}

export interface GroupPanelRoleStyle {
  nicknameColor?: string;
  avatarRingColor?: string;
  sideAccentColor?: string;
}

export interface GroupPanelReadabilityRule {
  roleStyleMode?: 'none' | 'nickname' | 'avatar-ring' | 'side-accent' | 'combined';
  roleStyleMap?: Record<string, GroupPanelRoleStyle>;
}

export interface GroupPanelSpeakPolicy {
  enabled?: boolean;
  defaultRule?: GroupPanelSpeakRule;
  roleRules?: Record<string, GroupPanelSpeakRule>;
  botRule?: GroupPanelSpeakRule;
  floodControl?: GroupPanelFloodControlRule;
  readability?: GroupPanelReadabilityRule;
}
```

- [ ] **Step 4: 新建最小 helper 实现让测试转绿**

```ts
export function getMostStrictSpeakRule(
  matchedRules: GroupPanelSpeakRule[],
  defaultRule?: GroupPanelSpeakRule
): GroupPanelSpeakRule {
  const rules = [...matchedRules];
  if (defaultRule) {
    rules.push(defaultRule);
  }

  return rules.reduce<GroupPanelSpeakRule>(
    (acc, rule) => ({
      allowText: acc.allowText === false || rule.allowText === false ? false : true,
      allowRichContent:
        acc.allowRichContent === false || rule.allowRichContent === false ? false : true,
      rateLimitWindowSec: Math.max(acc.rateLimitWindowSec ?? 0, rule.rateLimitWindowSec ?? 0),
      rateLimitCount:
        acc.rateLimitCount == null
          ? rule.rateLimitCount
          : rule.rateLimitCount == null
            ? acc.rateLimitCount
            : Math.min(acc.rateLimitCount, rule.rateLimitCount),
    }),
    { allowText: true, allowRichContent: true }
  );
}

export function isRichMessagePayload(content: string, meta?: Record<string, any>) {
  return (
    /\!\[.*\]\(.*\)/.test(content) ||
    Array.isArray(meta?.decorators) && meta.decorators.length > 0 ||
    Boolean(meta?.card) ||
    Boolean(meta?.file)
  );
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/shared/model/group.ts server/services/core/chat/utils/groupSpeakPolicy.ts server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts
git commit -m "feat: add group speak policy types"
```

## Task 2: 服务端加群消息频率限制与重复消息防刷

**Files:**
- Create: `server/services/core/chat/utils/groupSpeakRateLimit.ts`
- Modify: `server/services/core/chat/message.service.ts`
- Test: `server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts`

- [ ] **Step 1: 写失败测试，覆盖频率限制与重复消息**

```ts
import { describe, expect, test } from '@jest/globals';
import { createGroupSpeakRateLimiter } from '../utils/groupSpeakRateLimit';

describe('group speak rate limiter', () => {
  test('throws when count exceeds window limit', async () => {
    const memory = new Map<string, number>();
    const limiter = createGroupSpeakRateLimiter({
      incr: async (key) => {
        const next = (memory.get(key) ?? 0) + 1;
        memory.set(key, next);
        return next;
      },
      expire: async () => undefined,
      get: async (key) => String(memory.get(key) ?? ''),
      set: async (key, value) => void memory.set(key, Number(value)),
    });

    await limiter.assertWithinRateLimit({
      groupId: 'g1',
      panelId: 'p1',
      userId: 'u1',
      rule: { rateLimitWindowSec: 10, rateLimitCount: 1 },
      plain: 'hello',
    });

    await expect(
      limiter.assertWithinRateLimit({
        groupId: 'g1',
        panelId: 'p1',
        userId: 'u1',
        rule: { rateLimitWindowSec: 10, rateLimitCount: 1 },
        plain: 'hello again',
      })
    ).rejects.toThrow('发送过于频繁');
  });

  test('throws when duplicate messages exceed threshold', async () => {
    const store = new Map<string, string>();
    const limiter = createGroupSpeakRateLimiter({
      incr: async () => 1,
      expire: async () => undefined,
      get: async (key) => store.get(key) ?? '',
      set: async (key, value) => void store.set(key, value),
    });

    await limiter.assertDuplicateWindow({
      groupId: 'g1',
      panelId: 'p1',
      userId: 'u1',
      plain: 'same',
      floodControl: { enabled: true, duplicateWindowSec: 30, duplicateLimit: 1 },
    });

    await expect(
      limiter.assertDuplicateWindow({
        groupId: 'g1',
        panelId: 'p1',
        userId: 'u1',
        plain: 'same',
        floodControl: { enabled: true, duplicateWindowSec: 30, duplicateLimit: 1 },
      })
    ).rejects.toThrow('请勿短时间重复发送相同内容');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts --runInBand`
Expected: FAIL，提示 `createGroupSpeakRateLimiter` 未定义

- [ ] **Step 3: 写最小 rate limiter helper**

```ts
export function createGroupSpeakRateLimiter(client: RedisLike) {
  return {
    async assertWithinRateLimit({ groupId, panelId, userId, rule, plain }) {
      if (!rule?.rateLimitWindowSec || !rule?.rateLimitCount) {
        return;
      }

      const bucket = Math.floor(Date.now() / 1000 / rule.rateLimitWindowSec);
      const key = `speak:group:${groupId}:panel:${panelId}:user:${userId}:window:${bucket}`;
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, rule.rateLimitWindowSec);
      }
      if (count > rule.rateLimitCount) {
        throw new Error(`发送过于频繁，请在 ${rule.rateLimitWindowSec} 秒后再试`);
      }
    },

    async assertDuplicateWindow({ groupId, panelId, userId, plain, floodControl }) {
      if (!floodControl?.enabled || !plain?.trim()) {
        return;
      }

      const key = `speak:dup:group:${groupId}:panel:${panelId}:user:${userId}`;
      const raw = await client.get(key);
      const record = raw ? JSON.parse(raw) : { text: '', count: 0 };
      const nextCount = record.text === plain ? record.count + 1 : 1;
      await client.set(key, JSON.stringify({ text: plain, count: nextCount }));
      if (floodControl.duplicateWindowSec) {
        await client.expire(key, floodControl.duplicateWindowSec);
      }
      if (nextCount > (floodControl.duplicateLimit ?? 0)) {
        throw new Error('请勿短时间重复发送相同内容');
      }
    },
  };
}
```

- [ ] **Step 4: 在 `sendMessage()` 接入治理校验**

```ts
if (isGroupMessage) {
  const groupInfo = await call(ctx).getGroupInfo(groupId);
  const panelInfo = groupInfo.panels.find((p) => String(p.id) === String(converseId));
  const speakPolicy = panelInfo?.meta?.speakPolicy;

  if (speakPolicy?.enabled) {
    const member = groupInfo.members.find((m) => String(m.userId) === userId);
    const matchedRoleRules = (member?.roles ?? [])
      .map((roleId) => speakPolicy.roleRules?.[roleId])
      .filter(Boolean);
    const effectiveRule = isRobotUser(userId)
      ? speakPolicy.botRule ?? speakPolicy.defaultRule
      : getMostStrictSpeakRule(matchedRoleRules, speakPolicy.defaultRule);

    assertSpeakAllowed(effectiveRule, content, meta, t);
    await limiter.assertWithinRateLimit({
      groupId,
      panelId: String(panelInfo?.id ?? converseId),
      userId,
      rule: effectiveRule,
      plain: plain ?? content,
    });
    await limiter.assertDuplicateWindow({
      groupId,
      panelId: String(panelInfo?.id ?? converseId),
      userId,
      plain: plain ?? content,
      floodControl: speakPolicy.floodControl,
    });
  }
}
```

- [ ] **Step 5: 运行测试确认通过**

Run:
- `pnpm test server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts --runInBand`
- `pnpm test server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts --runInBand`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/services/core/chat/utils/groupSpeakRateLimit.ts server/services/core/chat/message.service.ts server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts
git commit -m "feat: add group speak rate limiting"
```

## Task 3: 面板设置加“发言治理”编辑器

**Files:**
- Create: `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
- Modify: `client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx`
- Test: `client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定默认规则和角色规则的编辑行为**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupSpeakPolicyEditor } from '../GroupSpeakPolicyEditor';

test('updates default rule and role rule values', async () => {
  const user = userEvent.setup();
  const handleChange = vi.fn();

  render(
    <GroupSpeakPolicyEditor
      roles={[{ _id: 'r1', name: '管理员' } as any]}
      value={{ enabled: true }}
      onChange={handleChange}
    />
  );

  await user.click(screen.getByLabelText('启用发言治理'));
  await user.type(screen.getByLabelText('默认窗口秒数'), '30');

  expect(handleChange).toHaveBeenCalled();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx --runInBand`
Expected: FAIL，提示组件不存在

- [ ] **Step 3: 写最小编辑器组件**

```tsx
export const GroupSpeakPolicyEditor: React.FC<Props> = ({
  roles,
  value,
  onChange,
}) => {
  const next = value ?? {};

  return (
    <Space direction="vertical" className="w-full">
      <Switch
        checked={next.enabled}
        onChange={(enabled) => onChange({ ...next, enabled })}
      />
      <InputNumber
        aria-label="默认窗口秒数"
        value={next.defaultRule?.rateLimitWindowSec}
        onChange={(rateLimitWindowSec) =>
          onChange({
            ...next,
            defaultRule: { ...next.defaultRule, rateLimitWindowSec: Number(rateLimitWindowSec) },
          })
        }
      />
      {roles.map((role) => (
        <InputNumber
          key={role._id}
          aria-label={`${role.name}-次数`}
          value={next.roleRules?.[role._id]?.rateLimitCount}
          onChange={(rateLimitCount) =>
            onChange({
              ...next,
              roleRules: {
                ...next.roleRules,
                [role._id]: {
                  ...next.roleRules?.[role._id],
                  rateLimitCount: Number(rateLimitCount),
                },
              },
            })
          }
        />
      ))}
    </Space>
  );
};
```

- [ ] **Step 4: 在 `ModifyGroupPanel.tsx` 挂接编辑器**

```tsx
<Collapse
  items={[
    {
      key: 'speakPolicy',
      label: t('发言治理'),
      children: (
        <GroupSpeakPolicyEditor
          roles={groupInfo.roles}
          value={panel.meta?.speakPolicy}
          onChange={(speakPolicy) => setPanel((draft) => {
            draft.meta = { ...(draft.meta ?? {}), speakPolicy };
          })}
        />
      ),
    },
  ]}
/>
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx
git commit -m "feat: add group speak policy editor"
```

## Task 4: 快捷禁言按钮接到默认发言规则

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatInputBox/MuteAllButton.tsx`

- [ ] **Step 1: 写失败测试或手工断言点**

```ts
test('toggles default speak rule instead of fallback permissions', async () => {
  const next = buildNextPanelSpeakPolicy({ enabled: true }, true);
  expect(next.defaultRule?.allowText).toBe(false);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx --runInBand`
Expected: FAIL，helper 不存在

- [ ] **Step 3: 改写按钮切换逻辑**

```ts
const speakPolicy = panelInfo.meta?.speakPolicy ?? { enabled: true };
const nextSpeakPolicy = {
  ...speakPolicy,
  enabled: true,
  defaultRule: {
    allowText: isMuted,
    allowRichContent: isMuted,
    rateLimitWindowSec: speakPolicy.defaultRule?.rateLimitWindowSec ?? 10,
    rateLimitCount: speakPolicy.defaultRule?.rateLimitCount ?? 6,
  },
};

await model.group.modifyGroupPanel(groupId, panelId, {
  ...panelInfo,
  meta: {
    ...(panelInfo.meta ?? {}),
    speakPolicy: nextSpeakPolicy,
  },
} as any);
```

- [ ] **Step 4: 更新按钮文案与 tooltip**

```ts
title={
  isMuted
    ? t('解除默认成员发言限制')
    : t('默认成员禁言')
}
```

- [ ] **Step 5: 运行相关测试确认通过**

Run: `pnpm test client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/ChatBox/ChatInputBox/MuteAllButton.tsx
git commit -m "feat: connect mute shortcut to speak policy"
```

## Task 5: 群聊角色识别样式增强

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.less`
- Test: `client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定角色样式渲染**

```tsx
import { render } from '@testing-library/react';
import { RoleStyledMessageMeta } from '../Item';

test('renders nickname and side accent colors from role style', () => {
  const { getByText, container } = render(
    <RoleStyledMessageMeta
      nickname="运营"
      roleStyle={{
        nicknameColor: '#ff4d4f',
        sideAccentColor: '#1677ff',
      }}
    />
  );

  expect(getByText('运营')).toHaveStyle({ color: '#ff4d4f' });
  expect(container.querySelector('[data-role-accent="true"]')).toHaveStyle({
    background: '#1677ff',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx --runInBand`
Expected: FAIL，组件或样式未实现

- [ ] **Step 3: 提取最小角色样式渲染逻辑**

```tsx
const roleStyle = getPanelRoleStyle(groupInfo, panelId, payload.author);

{roleStyle?.sideAccentColor && (
  <div
    data-role-accent="true"
    className="chat-message-role-accent"
    style={{ background: roleStyle.sideAccentColor }}
  />
)}

<div
  className="chat-message-item_nickname"
  style={roleStyle?.nicknameColor ? { color: roleStyle.nicknameColor } : undefined}
>
  {userInfo.nickname}
</div>
```

- [ ] **Step 4: 补充头像环样式**

```ts
style={roleStyle?.avatarRingColor ? { boxShadow: `0 0 0 2px ${roleStyle.avatarRingColor}` } : undefined}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm test client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/ChatBox/ChatMessageList/Item.tsx client/web/src/components/ChatBox/ChatMessageList/Item.less client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx
git commit -m "feat: add role-based message styling"
```

## Task 6: 搜索落点高亮与爬楼友好度增强

**Files:**
- Modify: `client/web/src/components/Panel/common/MessageSearch.tsx`
- Modify: `client/web/src/components/ChatBox/ChatMessageList/MessageHighlightContainer.tsx`

- [ ] **Step 1: 写失败测试或最小验收断言**

```ts
test('highlight container injects animated background for target message', () => {
  const style = buildHighlightStyle('m1');
  expect(style).toContain('[data-message-id="m1"]');
  expect(style).toContain('animation');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx --runInBand`
Expected: FAIL，highlight helper 未定义

- [ ] **Step 3: 强化高亮样式**

```ts
style.innerHTML = `
.${className} [data-message-id="${messageId}"] {
  background: linear-gradient(90deg, rgba(250, 204, 21, 0.22), rgba(250, 204, 21, 0.08)) !important;
  box-shadow: inset 3px 0 0 #f59e0b;
  animation: highlight-pulse 1.2s ease-in-out 2;
}
`;
```

- [ ] **Step 4: 给搜索结果加跳转动作**

```tsx
<div onClick={() => openModal(<MessageHighlightContainer messageId={message._id}><NormalMessage ... /></MessageHighlightContainer>)}>
  <NormalMessage ... />
</div>
```

- [ ] **Step 5: 运行相关测试确认通过**

Run: `pnpm test client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx --runInBand`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/Panel/common/MessageSearch.tsx client/web/src/components/ChatBox/ChatMessageList/MessageHighlightContainer.tsx
git commit -m "feat: improve message highlight readability"
```

## Task 7: 整体验证

**Files:**
- Modify: `docs/superpowers/specs/2026-05-03-group-governance-and-readability-design.md` (仅当实现偏差需要回填)

- [ ] **Step 1: 运行后端测试**

Run:
- `pnpm test server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts --runInBand`
- `pnpm test server/services/core/chat/__tests__/groupSpeakRateLimit.spec.ts --runInBand`

Expected: PASS

- [ ] **Step 2: 运行前端测试**

Run:
- `pnpm test client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx --runInBand`
- `pnpm test client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.tsx --runInBand`

Expected: PASS

- [ ] **Step 3: 运行类型检查**

Run:
- `pnpm --dir client/web check:type`
- `pnpm --dir server check:type`

Expected: PASS

- [ ] **Step 4: 手工验收**

Run through:
- 群管理员在面板设置中开启发言治理并保存
- 为一个角色设置 `30 秒内 2 次`
- 该角色成员在群聊中第 3 次发言被拦截
- 默认成员禁言按钮能切换默认规则
- 机器人在 `botRule` 下被限流
- 群聊消息中不同角色可通过昵称色/头像环/侧边色条识别
- 搜索结果落点消息高亮更明显

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement group governance and readability"
```
