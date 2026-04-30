# Admin Second-Round Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成管理端第二轮可用性加固，统一插件页与 Socket.IO 页的定位、降级能力与错误展示，减少剩余“点开就炸”和“报错但看不懂”的情况。

**Architecture:** 以“轻量共享能力层”为核心，不重写后台框架。新增一个统一降级卡片组件和一个统一错误格式化函数，然后把 `插件注册表`、`Socket.IO 诊断`、`系统控制台`、`防御控制系统`、以及关键资源页动作接入这套能力层。最后通过 Node 原生测试和前端构建做回归验证。

**Tech Stack:** React, TypeScript, Tushan, Axios, Vite, Node.js test runner

---

## 文件变更清单（锁定边界）

**Create**
- `server/admin/src/client/components/FeatureStatusCard.tsx`
- `server/admin/src/client/utils/admin-error.ts`

**Modify**
- `server/admin/src/client/App.tsx`
- `server/admin/src/client/i18n/zh.ts`
- `server/admin/src/client/i18n/en.ts`
- `server/admin/src/client/routes/plugin-permissions.tsx`
- `server/admin/src/client/routes/socketio.tsx`
- `server/admin/src/client/routes/ops-control/index.tsx`
- `server/admin/src/client/routes/defense-control/index.tsx`
- `server/admin/src/client/resources/user.tsx`
- `server/admin/src/client/resources/group.tsx`
- `server/admin/tests/admin-hardening.test.mjs`

**Verify**
- `node --test server/admin/tests/admin-hardening.test.mjs`
- `pnpm --filter tailchat-admin build:client`

---

### Task 1: 先补第二轮失败用例

**Files:**
- Modify: `server/admin/tests/admin-hardening.test.mjs`

- [ ] **Step 1: 为第二轮需求补充失败测试**

在 `server/admin/tests/admin-hardening.test.mjs` 末尾追加以下测试：

```js
test('插件页改名为“插件注册表”并保留独立路由', () => {
  const app = read('client/App.tsx');
  const zh = read('client/i18n/zh.ts');

  assert.match(app, /<CustomRoute name="plugin-registry"/);
  assert.doesNotMatch(app, /<CustomRoute name="plugin-permissions"/);
  assert.match(zh, /'plugin-registry':\s*\{\s*name:\s*'插件注册表'/);
});

test('Socket.IO 页面改名为“Socket.IO 诊断”', () => {
  const app = read('client/App.tsx');
  const zh = read('client/i18n/zh.ts');

  assert.match(app, /<CustomRoute name="socketio-diagnostic"/);
  assert.doesNotMatch(app, /<CustomRoute name="socketio"/);
  assert.match(zh, /'socketio-diagnostic':\s*\{\s*name:\s*'Socket\\.IO 诊断'/);
});

test('插件注册表页具备统一降级卡片能力', () => {
  const page = read('client/routes/plugin-permissions.tsx');

  assert.match(page, /FeatureStatusCard/);
  assert.match(page, /registryUnavailable/);
});

test('Socket.IO 诊断页明确声明自己是诊断入口', () => {
  const page = read('client/routes/socketio.tsx');

  assert.match(page, /诊断入口|外部诊断工具/);
  assert.match(page, /FeatureStatusCard/);
});

test('管理端存在统一错误格式化工具并被关键页面接入', () => {
  const errorUtil = read('client/utils/admin-error.ts');
  const opsPage = read('client/routes/ops-control/index.tsx');
  const defensePage = read('client/routes/defense-control/index.tsx');
  const userPage = read('client/resources/user.tsx');
  const groupPage = read('client/resources/group.tsx');

  assert.match(errorUtil, /export function formatAdminError/);
  assert.match(opsPage, /formatAdminError/);
  assert.match(defensePage, /formatAdminError/);
  assert.match(userPage, /formatAdminError/);
  assert.match(groupPage, /formatAdminError/);
});
```

- [ ] **Step 2: 运行测试并确认先失败**

Run:

```bash
node --test server/admin/tests/admin-hardening.test.mjs
```

Expected:

```text
not ok ... 插件页改名为“插件注册表”并保留独立路由
not ok ... Socket.IO 页面改名为“Socket.IO 诊断”
not ok ... 插件注册表页具备统一降级卡片能力
not ok ... 管理端存在统一错误格式化工具并被关键页面接入
```

- [ ] **Step 3: Commit 测试基线**

```bash
git add server/admin/tests/admin-hardening.test.mjs
git commit -m "test(admin): add second-round hardening coverage"
```

---

### Task 2: 新增共享降级卡片与错误格式化工具

**Files:**
- Create: `server/admin/src/client/components/FeatureStatusCard.tsx`
- Create: `server/admin/src/client/utils/admin-error.ts`
- Test: `server/admin/tests/admin-hardening.test.mjs`

- [ ] **Step 1: 创建统一降级卡片组件**

创建 `server/admin/src/client/components/FeatureStatusCard.tsx`：

```tsx
import React from 'react';
import { Card, Typography, Input } from 'tushan';

export type FeatureStatusCardProps = {
  title: string;
  summary: string;
  detail?: string;
  actionHint?: string;
};

export const FeatureStatusCard: React.FC<FeatureStatusCardProps> = React.memo(
  ({ title, summary, detail = '', actionHint = '' }) => {
    return (
      <Card>
        <Typography.Title heading={4}>{title}</Typography.Title>
        <Typography.Paragraph>{summary}</Typography.Paragraph>
        {actionHint ? (
          <Typography.Paragraph type="secondary">{actionHint}</Typography.Paragraph>
        ) : null}
        {detail ? <Input.TextArea value={detail} rows={4} readOnly /> : null}
      </Card>
    );
  }
);

FeatureStatusCard.displayName = 'FeatureStatusCard';
```

- [ ] **Step 2: 创建统一错误格式化工具**

创建 `server/admin/src/client/utils/admin-error.ts`：

```ts
export function formatAdminError(
  err: unknown,
  fallback = '操作失败，请稍后重试'
): string {
  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  const maybeAxiosError = err as any;
  const responseMessage =
    maybeAxiosError?.response?.data?.error ||
    maybeAxiosError?.response?.data?.message ||
    maybeAxiosError?.response?.data?.msg;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  const nestedMessage = maybeAxiosError?.message;
  if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
    return nestedMessage;
  }

  return fallback;
}
```

- [ ] **Step 3: 运行测试，确认当前新增文件被测试识别但页面测试仍未全绿**

Run:

```bash
node --test server/admin/tests/admin-hardening.test.mjs
```

Expected:

```text
部分测试通过
仍有插件页 / Socket.IO 页面 / 接入点相关测试失败
```

- [ ] **Step 4: Commit 共享基础设施**

```bash
git add server/admin/src/client/components/FeatureStatusCard.tsx server/admin/src/client/utils/admin-error.ts server/admin/tests/admin-hardening.test.mjs
git commit -m "feat(admin): add shared status card and error formatter"
```

---

### Task 3: 插件页改为“插件注册表”并支持统一降级

**Files:**
- Modify: `server/admin/src/client/App.tsx`
- Modify: `server/admin/src/client/i18n/zh.ts`
- Modify: `server/admin/src/client/i18n/en.ts`
- Modify: `server/admin/src/client/routes/plugin-permissions.tsx`
- Create: `server/admin/src/client/components/FeatureStatusCard.tsx`
- Create: `server/admin/src/client/utils/admin-error.ts`
- Test: `server/admin/tests/admin-hardening.test.mjs`

- [ ] **Step 1: 调整路由名**

在 `server/admin/src/client/App.tsx` 中把：

```tsx
<CustomRoute name="plugin-permissions" icon={<IconExperiment />}>
  <PluginPermissions />
</CustomRoute>
```

改为：

```tsx
<CustomRoute name="plugin-registry" icon={<IconExperiment />}>
  <PluginPermissions />
</CustomRoute>
```

- [ ] **Step 2: 调整中英文菜单名称**

在 `server/admin/src/client/i18n/zh.ts` 中把：

```ts
'plugin-permissions': {
  name: '插件发布与权限',
},
```

改为：

```ts
'plugin-registry': {
  name: '插件注册表',
},
```

在 `server/admin/src/client/i18n/en.ts` 的 `resources` 中追加：

```ts
'plugin-registry': {
  name: 'Plugin Registry',
},
```

- [ ] **Step 3: 改造插件注册表页面**

将 `server/admin/src/client/routes/plugin-permissions.tsx` 改成以下结构：

```tsx
import { PageHeader, useAsync, Table } from 'tushan';
import axios from 'axios';
import { FeatureStatusCard } from '../components/FeatureStatusCard';

export const PluginPermissions: React.FC = () => {
  const { value, loading } = useAsync(async () => {
    try {
      const { data } = await axios.get('/registry-be.json');
      return {
        registryData: Array.isArray(data) ? data : [],
        registryUnavailable: false,
        registryError: '',
      };
    } catch (err: any) {
      return {
        registryData: [],
        registryUnavailable: true,
        registryError: err?.message ? String(err.message) : 'registry-be.json not found',
      };
    }
  }, []);

  if (value?.registryUnavailable) {
    return (
      <FeatureStatusCard
        title="插件注册表"
        summary="当前无法读取后端插件注册表，因此此页面只能进入降级态。"
        actionHint="请确认构建产物中存在 /registry-be.json，并确保 Admin 静态资源路径正确。"
        detail={value.registryError}
      />
    );
  }

  return (
    <div>
      <PageHeader title="插件注册表" />
      <div style={{ padding: 20 }}>
        <p style={{ marginBottom: 16 }}>
          当前页面仅用于查看服务端加载的插件注册表，不提供在线发布或权限编辑能力。
        </p>
        <Table
          loading={loading}
          data={value?.registryData || []}
          rowKey="name"
          columns={[
            { title: '标识 (name)', dataIndex: 'name' },
            {
              title: '显示名 (label)',
              dataIndex: 'label',
              render: (val, record: any) => record['label.zh-CN'] || val,
            },
            { title: '版本 (version)', dataIndex: 'version' },
            {
              title: '描述 (description)',
              dataIndex: 'description',
              render: (val, record: any) => record['description.zh-CN'] || val,
            },
          ]}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: 运行测试确认插件页相关断言转绿**

Run:

```bash
node --test server/admin/tests/admin-hardening.test.mjs
```

Expected:

```text
插件页改名相关测试 PASS
插件注册表页降级态测试 PASS
其他 Socket.IO / 错误格式化接入测试可能仍未全绿
```

- [ ] **Step 5: Commit 插件注册表修复**

```bash
git add server/admin/src/client/App.tsx server/admin/src/client/i18n/zh.ts server/admin/src/client/i18n/en.ts server/admin/src/client/routes/plugin-permissions.tsx server/admin/src/client/components/FeatureStatusCard.tsx
git commit -m "feat(admin): turn plugin permissions into registry view"
```

---

### Task 4: Socket.IO 页面改为“Socket.IO 诊断”

**Files:**
- Modify: `server/admin/src/client/App.tsx`
- Modify: `server/admin/src/client/i18n/zh.ts`
- Modify: `server/admin/src/client/i18n/en.ts`
- Modify: `server/admin/src/client/routes/socketio.tsx`
- Create: `server/admin/src/client/components/FeatureStatusCard.tsx`
- Test: `server/admin/tests/admin-hardening.test.mjs`

- [ ] **Step 1: 调整路由名**

在 `server/admin/src/client/App.tsx` 中把：

```tsx
<CustomRoute name="socketio" icon={<IconDashboard />}>
  <SocketIOAdmin />
</CustomRoute>
```

改为：

```tsx
<CustomRoute name="socketio-diagnostic" icon={<IconDashboard />}>
  <SocketIOAdmin />
</CustomRoute>
```

- [ ] **Step 2: 调整菜单名称**

在 `server/admin/src/client/i18n/zh.ts` 中把：

```ts
socketio: {
  name: 'Socket.IO 长链接',
},
```

改为：

```ts
'socketio-diagnostic': {
  name: 'Socket.IO 诊断',
},
```

在 `server/admin/src/client/i18n/en.ts` 的 `resources` 中追加：

```ts
'socketio-diagnostic': {
  name: 'Socket.IO Diagnostic',
},
```

- [ ] **Step 3: 改造页面为诊断页**

将 `server/admin/src/client/routes/socketio.tsx` 改为：

```tsx
import React from 'react';
import { Button, Card, Typography, useTranslation } from 'tushan';
import { FeatureStatusCard } from '../components/FeatureStatusCard';

export const SocketIOAdmin: React.FC = React.memo(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  const socketUrl = `${protocol}://${host}`;
  const { t } = useTranslation();

  if (!host) {
    return (
      <FeatureStatusCard
        title="Socket.IO 诊断"
        summary="当前无法生成诊断地址，因此页面进入降级态。"
        actionHint="请确认管理端运行在正常浏览器环境中。"
        detail="window.location.host is empty"
      />
    );
  }

  return (
    <Card>
      <Typography.Title heading={4}>Socket.IO 诊断</Typography.Title>
      <Typography.Paragraph>
        这是一个外部诊断入口，用于辅助排查 Socket.IO 长连接，不是内嵌式管理后台。
      </Typography.Paragraph>
      <Typography.Paragraph>
        {t('custom.socketio.tip1')} <strong>{socketUrl}</strong>
      </Typography.Paragraph>
      <Typography.Paragraph>{t('custom.socketio.tip2')}</Typography.Paragraph>
      <Typography.Paragraph>{t('custom.socketio.tip3')}</Typography.Paragraph>
      <Button
        type="primary"
        onClick={() => {
          window.open('https://admin.socket.io/');
        }}
      >
        {t('custom.socketio.btn')}
      </Button>
    </Card>
  );
});

SocketIOAdmin.displayName = 'SocketIOAdmin';
```

- [ ] **Step 4: 运行测试确认 Socket.IO 相关断言转绿**

Run:

```bash
node --test server/admin/tests/admin-hardening.test.mjs
```

Expected:

```text
Socket.IO 页面改名测试 PASS
Socket.IO 诊断页定位测试 PASS
```

- [ ] **Step 5: Commit Socket.IO 诊断页修复**

```bash
git add server/admin/src/client/App.tsx server/admin/src/client/i18n/zh.ts server/admin/src/client/i18n/en.ts server/admin/src/client/routes/socketio.tsx
git commit -m "feat(admin): convert socketio page to diagnostic entry"
```

---

### Task 5: 给关键页面与资源动作接入统一错误格式化

**Files:**
- Modify: `server/admin/src/client/routes/ops-control/index.tsx`
- Modify: `server/admin/src/client/routes/defense-control/index.tsx`
- Modify: `server/admin/src/client/resources/user.tsx`
- Modify: `server/admin/src/client/resources/group.tsx`
- Create: `server/admin/src/client/utils/admin-error.ts`
- Test: `server/admin/tests/admin-hardening.test.mjs`

- [ ] **Step 1: 系统控制台接入 `formatAdminError`**

在 `server/admin/src/client/routes/ops-control/index.tsx` 顶部增加：

```tsx
import { formatAdminError } from '../../utils/admin-error';
```

把页面内所有：

```tsx
Message.error(String(err));
```

改为：

```tsx
Message.error(formatAdminError(err, '系统控制台操作失败'));
```

- [ ] **Step 2: 防御控制系统接入 `formatAdminError`**

在 `server/admin/src/client/routes/defense-control/index.tsx` 顶部增加：

```tsx
import { formatAdminError } from '../../utils/admin-error';
```

把：

```tsx
Message.error(String(err));
setLoadError(String(err));
```

改为：

```tsx
Message.error(formatAdminError(err, '防御控制系统操作失败'));
setLoadError(formatAdminError(err, '防御控制插件当前不可用'));
```

- [ ] **Step 3: 用户管理动作接入 `formatAdminError`**

在 `server/admin/src/client/resources/user.tsx` 顶部增加：

```tsx
import { formatAdminError } from '../utils/admin-error';
```

把三个动作里的：

```tsx
Message.error(String(err));
```

改为：

```tsx
Message.error(formatAdminError(err, '用户管理操作失败'));
```

- [ ] **Step 4: 群组管理动作接入 `formatAdminError`**

在 `server/admin/src/client/resources/group.tsx` 顶部增加：

```tsx
import { formatAdminError } from '../utils/admin-error';
```

把：

```tsx
Message.error(String(err));
```

改为：

```tsx
Message.error(formatAdminError(err, '群组管理操作失败'));
```

- [ ] **Step 5: 运行完整回归测试**

Run:

```bash
node --test server/admin/tests/admin-hardening.test.mjs
```

Expected:

```text
# pass 10
# fail 0
```

- [ ] **Step 6: 构建前端验证页面可编译**

Run:

```bash
pnpm --filter tailchat-admin build:client
```

Expected:

```text
vite v...
✓ built in ...
```

- [ ] **Step 7: Commit 第二轮统一错误展示**

```bash
git add server/admin/src/client/routes/ops-control/index.tsx server/admin/src/client/routes/defense-control/index.tsx server/admin/src/client/resources/user.tsx server/admin/src/client/resources/group.tsx server/admin/src/client/utils/admin-error.ts server/admin/tests/admin-hardening.test.mjs
git commit -m "refactor(admin): unify error handling for custom pages"
```

---

### Task 6: 产出修复摘要

**Files:**
- Create: `/workspace/admin-second-round-summary.md`

- [ ] **Step 1: 写第二轮修复摘要**

摘要至少包含：

```md
# 管理端第二轮修复摘要

- 插件页已改为“插件注册表”
- Socket.IO 页已改为“Socket.IO 诊断”
- 新增统一降级卡片 `FeatureStatusCard`
- 新增统一错误格式化工具 `formatAdminError`
- 关键页面和资源动作已接入统一错误提示
- 回归测试与前端构建结果
```

- [ ] **Step 2: 复制摘要到工作区供用户查看**

Run:

```bash
cp docs/superpowers/plans/2026-04-30-admin-second-round-hardening-plan.md /workspace/
```

- [ ] **Step 3: Commit 文档（如需要）**

```bash
git add /workspace/admin-second-round-summary.md
git commit -m "docs(admin): add second-round fix summary"
```

---

## 自检结果

### Spec coverage
- 插件页重命名与降级：Task 3 覆盖
- Socket.IO 诊断页定位修正：Task 4 覆盖
- 统一错误展示：Task 2、Task 5 覆盖
- 回归验证：Task 1、Task 5 覆盖

### Placeholder scan
- 已检查，无 `TODO` / `TBD` / “类似前面” 这类占位写法

### Type consistency
- 共享组件名统一为 `FeatureStatusCard`
- 共享错误函数名统一为 `formatAdminError`
- 插件路由名统一为 `plugin-registry`
- Socket.IO 路由名统一为 `socketio-diagnostic`
