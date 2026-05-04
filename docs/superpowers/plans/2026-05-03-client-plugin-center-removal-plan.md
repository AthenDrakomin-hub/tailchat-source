# 财讯客户端移除插件中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 隐藏财讯客户端中的插件中心产品入口，让插件能力完全回到后台统一配置，客户端只呈现业务能力结果。

**Architecture:** 采用“先隐藏入口、保留底层机制”的收口方案。客户端去掉个人侧边栏和 Quick Switch 中的插件中心曝光，保留现有 `/main/personal/plugins` 路由和底层插件加载能力，避免破坏现有依赖；同时用测试锁住“前台主流程中不可见插件中心”的目标。

**Tech Stack:** React、TypeScript、Jest、Tailchat Shared、React Router

---

## 文件结构与职责

### 需要修改

- `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
  - 移除个人侧边栏中的插件中心入口
- `client/web/src/components/QuickSwitcher/useQuickSwitcherAllAction.ts`
  - 移除 Quick Switch 中的插件中心动作
- `client/web/src/routes/Main/Content/Personal/index.tsx`
  - 保留插件路由，但增加注释说明这是隐藏路由，不是公开产品入口

### 需要新增测试

- `client/web/src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx`
  - 验证个人侧边栏不再展示插件中心
- `client/web/src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts`
  - 验证内置快捷动作不再包含插件中心

---

### Task 1: 移除个人侧边栏插件中心入口

**Files:**
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Test: `client/web/src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx`

- [ ] **Step 1: 写失败测试**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { PersonalSidebar } from '../Sidebar';

jest.mock('tailchat-shared', () => ({
  t: (value: string) => value,
  useDMConverseList: () => [],
  useUserInfo: () => ({ systemRole: 'teacher' }),
  useGlobalConfigStore: () => false,
  useAppSelector: () => false,
}));

jest.mock('@/components/Modal', () => ({
  openModal: jest.fn(),
}));

jest.mock('@/components/modals/CreateDMConverse', () => ({
  CreateDMConverse: () => null,
}));

jest.mock('../SidebarItem', () => ({
  SidebarItem: ({ name }: any) => <div>{name}</div>,
}));

jest.mock('./SidebarDMItem', () => ({
  SidebarDMItem: () => null,
}));

jest.mock('@/components/SectionHeader', () => ({
  SectionHeader: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/CommonSidebarWrapper', () => ({
  CommonSidebarWrapper: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('../CustomSidebarItem', () => ({
  CustomSidebarItem: () => null,
}));

jest.mock('@/plugin/common', () => ({
  pluginCustomPanel: [],
}));

describe('PersonalSidebar', () => {
  test('does not render plugin center entry', () => {
    render(<PersonalSidebar />);
    expect(screen.queryByText('插件中心')).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx`
Expected: FAIL，因为当前侧边栏仍然渲染 `插件中心`

- [ ] **Step 3: 写最小实现**

```tsx
{/* 插件中心入口已从客户端产品面移除，能力是否可用由后台统一配置并投放到具体业务入口 */}
```

并删除：

```tsx
{!disablePluginStore && systemRole !== 'student' && (
  <SidebarItem
    name={t('插件中心')}
    icon={<Icon icon="mdi:puzzle" />}
    to="/main/personal/plugins"
  />
)}
```

- [ ] **Step 4: 重新跑测试**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/web/src/routes/Main/Content/Personal/Sidebar.tsx client/web/src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx
git commit -m "refactor(client): hide plugin center from personal sidebar"
```

---

### Task 2: 移除 Quick Switch 中的插件中心动作

**Files:**
- Modify: `client/web/src/components/QuickSwitcher/useQuickSwitcherAllAction.ts`
- Test: `client/web/src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts`

- [ ] **Step 1: 写失败测试**

```ts
import { renderHook } from '@testing-library/react-hooks';
import { useQuickSwitcherAllAction } from '../useQuickSwitcherAllAction';

jest.mock('tailchat-shared', () => ({
  t: (value: string) => value,
  isValidStr: () => true,
  useAppSelector: () => ({}),
  useAsync: () => ({ value: [] }),
  useUserId: () => 'u1',
  getDMConverseName: async () => '会话',
  model: {
    converse: { ChatConverseType: { DM: 'DM' } },
    group: { GroupPanelType: { GROUP: 'GROUP' } },
  },
  useGlobalConfigStore: () => false,
}));

describe('useQuickSwitcherAllAction', () => {
  test('does not expose plugin center builtin action', () => {
    const { result } = renderHook(() => useQuickSwitcherAllAction());
    expect(result.current.find((item) => item.key === 'plugins')).toBeUndefined();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts`
Expected: FAIL，因为当前 `plugins` 动作仍然存在

- [ ] **Step 3: 写最小实现**

删除：

```ts
if (!disablePluginStore) {
  actions.push({
    key: 'plugins',
    source: 'core',
    label: t('插件中心'),
    action({ navigate }) {
      navigate('/main/personal/plugins');
    },
  });
}
```

并保留：

```ts
const actions: QuickAction[] = [
  {
    key: 'personal',
    source: 'core',
    label: t('个人主页'),
    action({ navigate }) {
      navigate('/main/personal/contacts');
    },
  },
];
```

- [ ] **Step 4: 重新跑测试**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/web/src/components/QuickSwitcher/useQuickSwitcherAllAction.ts client/web/src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts
git commit -m "refactor(client): remove plugin center quick action"
```

---

### Task 3: 保留隐藏路由并锁定产品边界

**Files:**
- Modify: `client/web/src/routes/Main/Content/Personal/index.tsx`
- Test: `client/web/src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx`

- [ ] **Step 1: 写失败测试或复用现有测试基线**

复用 Task 1 的侧边栏测试作为基线，确认公开入口已隐藏。

- [ ] **Step 2: 修改路由文件中的边界说明**

```tsx
{/* 插件页路由暂时保留用于兼容已有实现，但不再作为财讯客户端公开产品入口 */}
{!disablePluginStore && <Route path="/plugins" element={<PluginsPanel />} />}
```

- [ ] **Step 3: 跑定向测试与类型检查**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/routes/Main/Content/Personal/__tests__/sidebar-plugin-entry.spec.tsx src/components/QuickSwitcher/__tests__/builtin-actions.spec.ts`
Expected: PASS

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type`
Expected: PASS

Run: `pnpm --dir /workspace/tailchat-source/server exec tsc -p tsconfig.json --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add client/web/src/routes/Main/Content/Personal/index.tsx
git commit -m "docs(client): mark plugin route as hidden compatibility path"
```

---

## 计划自检

### Spec coverage

- 已覆盖个人侧边栏入口隐藏
- 已覆盖 Quick Switch 插件中心动作移除
- 已覆盖路由保留但隐藏的兼容策略
- 已覆盖测试与类型检查要求

### Placeholder scan

- 无 TBD / TODO
- 每个任务都包含测试、命令、实现与提交动作

### Type consistency

- 统一使用 `插件中心` 作为待移除入口文本
- 保留 `/main/personal/plugins` 作为隐藏兼容路由

## 执行方式

Plan complete and saved to `docs/superpowers/plans/2026-05-03-client-plugin-center-removal-plan.md`.  
按你的要求，我将直接采用 **Inline Execution** 继续实现，不再停下来等待选择。
