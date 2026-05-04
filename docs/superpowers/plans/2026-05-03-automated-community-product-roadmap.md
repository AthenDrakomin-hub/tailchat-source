# 自动化社群营销系统 Implementation Plan

> 2026-05-03 方向更新：
> 本文保留为旧路线图存档。当前实施边界已改为“OpenClaw 接入底座”模式。
> 最新计划请以 `docs/superpowers/plans/2026-05-03-openclaw-bottom-layer-alignment-plan.md` 为准。
> 旧文中涉及“平台内剧本模板、平台内 Persona/Prompt 管理、平台内导演/策略引擎”的部分，均已迁移到 OpenClaw 负责。

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前 Tailchat 从“群聊 + Bot 接入”升级为“自动化社群营销操作系统”的第一阶段可落地产品，跑通角色消息样式、Agent 总控后台、群角色绑定、OpenClaw Bridge 和剧本化运行骨架。

**Architecture:** 采用“社群协作底座 + 角色消息样式系统 + 系统级 Agent 控制平面 + 群内角色绑定 + 外部 OpenClaw Bridge”五段式架构。先在现有群角色和 OpenAPI Bot 能力上扩展数据模型与后台入口，再通过桥接服务把人格化 Agent 运行时接到群剧本与论坛沉淀闭环中。

**Tech Stack:** Tailchat Web React/TypeScript、Tailchat Server Moleculer/TypeScript、Admin React、MongoDB、Redis、OpenAPI Bot、外部 OpenClaw Gateway

---

## 文件结构与职责

### 已有文件

- `packages/types/src/model/group.ts`
  - 群、面板、角色相关通用类型
- `server/packages/sdk/src/structs/group.ts`
  - 服务端 SDK 侧群结构定义
- `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
  - 当前群面板发言治理编辑器，后续扩展为角色消息样式编辑入口
- `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
  - 群消息渲染主入口
- `client/web/src/components/ChatBox/ChatMessageList/roleStyle.ts`
  - 当前轻量角色样式推导逻辑
- `server/services/openapi/app.service.ts`
  - OpenApp 能力与应用信息管理
- `server/services/openapi/bot.service.ts`
  - 当前 OpenAPI Bot 账号登录和回调服务
- `server/services/openapi/integration.service.ts`
  - 将 bot 加入群组的集成入口
- `server/admin/src/client/routes/ops-control/index.tsx`
  - 现有系统控制台页面，可作为系统级 agent 控台的风格参考

### 计划新增文件

- `packages/types/src/model/agent.ts`
  - 系统级 Agent、人格、角色绑定、剧本模板与运行模式类型
- `server/models/agent/definition.ts`
  - Agent 定义模型
- `server/models/agent/roleBinding.ts`
  - 群角色到 Agent 的绑定模型
- `server/models/agent/script.ts`
  - 剧本模板模型
- `server/services/agent/definition.service.ts`
  - Agent 定义增删改查
- `server/services/agent/binding.service.ts`
  - 群角色绑定管理
- `server/services/agent/script.service.ts`
  - 剧本模板管理
- `server/services/agent/runtime.service.ts`
  - 统一 agent runtime 调度入口
- `server/services/agent/bridge-openclaw.service.ts`
  - OpenClaw 外部网关桥接
- `server/admin/src/client/routes/agent-control/index.tsx`
  - Agent 总控后台首页
- `server/admin/src/client/routes/agent-control/AgentDefinitionForm.tsx`
  - Agent 定义编辑
- `server/admin/src/client/routes/agent-control/RoleBindingTable.tsx`
  - 群角色绑定视图
- `server/admin/src/client/routes/agent-control/ScriptTemplateTable.tsx`
  - 剧本模板视图
- `client/web/src/components/modals/GroupDetail/Role/RoleMessageStyleEditor.tsx`
  - 群角色消息样式编辑器
- `client/web/src/components/modals/GroupDetail/Role/RoleAgentBindingEditor.tsx`
  - 群角色绑定 Agent 的入口
- `docs/superpowers/specs/2026-05-03-role-agent-system-design.md`
  - 角色消息样式 + Agent 后台专用设计文档（如果执行阶段发现需要补专用 spec）

### 计划修改文件

- `packages/types/src/model/group.ts`
- `server/packages/sdk/src/structs/group.ts`
- `client/shared/index.tsx`
- `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- `client/web/src/components/ChatBox/ChatMessageList/roleStyle.ts`
- `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
- `client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx`
- `server/services/openapi/app.service.ts`
- `server/models/openapi/app.ts`
- `server/services/openapi/bot.service.ts`
- `server/services/openapi/integration.service.ts`

---

## 路线图总览

### Phase 1：角色消息样式系统

目标：
- 让不同群角色具备完整的字体色、气泡色、边框、徽标等视觉差异
- 把“轻识别”升级为“人格化消息表现”

### Phase 2：系统级 Agent 总控后台

目标：
- 让 Agent 从“OpenAPI 应用机器人”升级为“可复用人格资产”
- 在管理后台里统一管理 Agent 定义、运行模式和行业用途

### Phase 3：群角色到 Agent 绑定

目标：
- 把群角色和 Agent 资产真正连起来
- 让每个群成为自动化营销剧本单元

### Phase 4：OpenClaw Bridge

目标：
- Tailchat 继续负责群、角色、消息、论坛
- OpenClaw 作为外部 runtime/gateway 接收角色型 Agent 调度

### Phase 5：剧本引擎与论坛沉淀骨架

目标：
- 跑通“剧本化运营 -> 群内转化 -> 论坛沉淀”的闭环雏形

---

### Task 1: 扩展群角色消息样式数据模型

**Files:**
- Create: `packages/types/src/model/agent.ts`
- Modify: `packages/types/src/model/group.ts`
- Modify: `server/packages/sdk/src/structs/group.ts`
- Modify: `client/shared/index.tsx`
- Test: `server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts`

- [ ] **Step 1: 写失败测试，锁定角色消息样式字段结构**

```ts
test('returns full role message style config', () => {
  expect(
    getRoleStyleForRoleIds(
      ['role-sales'],
      {
        roleStyleMode: 'combined',
        roleStyleMap: {
          'role-sales': {
            nicknameColor: '#ff4d4f',
            avatarRingColor: '#fa8c16',
            sideAccentColor: '#722ed1',
            bubbleBgColor: '#fff1f0',
            bubbleTextColor: '#391085',
            bubbleBorderColor: '#ffa39e',
            badgeText: '主讲',
            badgeColor: '#cf1322',
          },
        },
      }
    )
  ).toMatchObject({
    bubbleBgColor: '#fff1f0',
    badgeText: '主讲',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/core/chat/__tests__/groupSpeakPolicy.spec.ts`
Expected: FAIL，报 `bubbleBgColor` / `badgeText` 相关字段不存在或不匹配

- [ ] **Step 3: 在共享类型里补齐角色消息样式结构**

```ts
export interface GroupPanelRoleStyle {
  nicknameColor?: string;
  avatarRingColor?: string;
  sideAccentColor?: string;
  bubbleBgColor?: string;
  bubbleTextColor?: string;
  bubbleBorderColor?: string;
  badgeText?: string;
  badgeColor?: string;
}
```

- [ ] **Step 4: 在服务端 SDK 结构同步相同字段**

```ts
export interface GroupPanelRoleStyle {
  nicknameColor?: string;
  avatarRingColor?: string;
  sideAccentColor?: string;
  bubbleBgColor?: string;
  bubbleTextColor?: string;
  bubbleBorderColor?: string;
  badgeText?: string;
  badgeColor?: string;
}
```

- [ ] **Step 5: 暴露给前端 shared 导出**

```ts
export type {
  GroupPanelRoleStyle,
} from './model/group';
```

- [ ] **Step 6: 重新跑测试确保通过**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/core/chat/__tests__/groupSpeakPolicy.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/types/src/model/group.ts server/packages/sdk/src/structs/group.ts client/shared/index.tsx server/services/core/chat/__tests__/groupSpeakPolicy.spec.ts
git commit -m "feat(group): extend role message style schema"
```

---

### Task 2: 把群角色消息样式真正渲染到消息气泡

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatMessageList/roleStyle.ts`
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Create: `client/web/src/components/ChatBox/ChatMessageList/__tests__/messageRoleStyle.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定气泡颜色和徽标渲染**

```tsx
test('renders role badge and bubble style', () => {
  render(
    <NormalMessage
      showAvatar={true}
      isMergedPrev={false}
      isMergedNext={false}
      payload={{ author: 'u1', content: 'hello', createdAt: new Date().toISOString() } as any}
      isGroup={true}
      groupId="g1"
      panelId="p1"
    />
  );

  expect(screen.getByText('主讲')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/ChatBox/ChatMessageList/__tests__/messageRoleStyle.spec.tsx`
Expected: FAIL，因为当前消息体没有渲染角色徽标和完整气泡样式

- [ ] **Step 3: 扩展角色样式过滤逻辑**

```ts
if (mode === 'combined' || !mode) {
  return style;
}

if (mode === 'badge-only') {
  return {
    badgeText: style.badgeText,
    badgeColor: style.badgeColor,
  };
}
```

- [ ] **Step 4: 在消息组件中应用气泡样式和徽标**

```tsx
{userTypeBadge == null && roleStyle?.badgeText && (
  <div
    className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] leading-none flex-shrink-0"
    style={{
      backgroundColor: `${roleStyle.badgeColor ?? '#1677ff'}22`,
      color: roleStyle.badgeColor ?? '#1677ff',
    }}
  >
    {roleStyle.badgeText}
  </div>
)}
```

```tsx
style={{
  backgroundColor: !isSelf ? roleStyle?.bubbleBgColor : undefined,
  color: !isSelf ? roleStyle?.bubbleTextColor : undefined,
  borderColor: !isSelf ? roleStyle?.bubbleBorderColor : undefined,
}}
```

- [ ] **Step 5: 加深群消息时间块分段与分组感**

```tsx
<span className="inline-flex rounded-full px-3 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
  {showMessageTime(messageCreatedAt)}
</span>
```

- [ ] **Step 6: 运行前端测试确认通过**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/ChatBox/ChatMessageList/__tests__/messageRoleStyle.spec.tsx src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add client/web/src/components/ChatBox/ChatMessageList/roleStyle.ts client/web/src/components/ChatBox/ChatMessageList/Item.tsx client/web/src/components/ChatBox/ChatMessageList/__tests__/messageRoleStyle.spec.tsx
git commit -m "feat(chat): render full role message styles"
```

---

### Task 3: 在群角色管理里加入“消息样式编辑器”

**Files:**
- Create: `client/web/src/components/modals/GroupDetail/Role/RoleMessageStyleEditor.tsx`
- Modify: `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
- Modify: `client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx`
- Test: `client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定角色消息样式配置入口**

```tsx
test('renders role style fields including bubble and badge', () => {
  render(
    <GroupSpeakPolicyEditor
      roles={[{ _id: 'r1', name: '讲师', permissions: [] } as any]}
      value={{ enabled: true }}
      onChange={jest.fn()}
    />
  );

  expect(screen.getByText('气泡背景色')).toBeTruthy();
  expect(screen.getByText('角色徽标')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`
Expected: FAIL，因为当前还没有完整字段

- [ ] **Step 3: 为每个角色增加样式编辑表单**

```tsx
<Field label={t('气泡背景色')}>
  <Input
    value={policy.readability?.roleStyleMap?.[role._id]?.bubbleBgColor}
    placeholder="#fff7e6"
    onChange={(e) => updateRoleStyle(role._id, { bubbleBgColor: e.target.value })}
  />
</Field>
```

```tsx
<Field label={t('角色徽标')}>
  <Input
    value={policy.readability?.roleStyleMap?.[role._id]?.badgeText}
    placeholder="主讲"
    onChange={(e) => updateRoleStyle(role._id, { badgeText: e.target.value })}
  />
</Field>
```

- [ ] **Step 4: 明确 UI 文案，把它从“阅读优化”升级成“人格化消息表现”**

```tsx
<div className="text-xs text-gray-400">
  {t('按群角色定义昵称、徽标、气泡与边框样式，让角色人格在消息流中可见')}
</div>
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx
git commit -m "feat(group): add role message style editor"
```

---

### Task 4: 建立系统级 Agent 定义模型与后台页面

**Files:**
- Create: `packages/types/src/model/agent.ts`
- Create: `server/models/agent/definition.ts`
- Create: `server/services/agent/definition.service.ts`
- Create: `server/admin/src/client/routes/agent-control/index.tsx`
- Create: `server/admin/src/client/routes/agent-control/AgentDefinitionForm.tsx`
- Modify: `server/admin/src/client/routes/index.tsx`
- Test: `server/admin/src/client/routes/agent-control/__tests__/AgentDefinitionForm.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定 Agent 定义表单字段**

```tsx
test('renders agent definition core fields', () => {
  render(<AgentDefinitionForm />);
  expect(screen.getByText('Agent 名称')).toBeTruthy();
  expect(screen.getByText('人格定位')).toBeTruthy();
  expect(screen.getByText('运行模式')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server/admin test -- --runInBand src/client/routes/agent-control/__tests__/AgentDefinitionForm.spec.tsx`
Expected: FAIL，文件和组件不存在

- [ ] **Step 3: 定义 Agent 模型**

```ts
export interface AgentDefinition {
  agentId: string;
  name: string;
  avatar?: string;
  persona: string;
  domain: string;
  runtimeMode: 'openapi-http' | 'openapi-ws' | 'openclaw-bridge';
  provider?: string;
  promptTemplate?: string;
  status: 'draft' | 'active' | 'paused';
}
```

- [ ] **Step 4: 建立管理端表单**

```tsx
<Form.Item field="name" label="Agent 名称" rules={[{ required: true }]}>
  <Input placeholder="例如：投教主讲老师" />
</Form.Item>
<Form.Item field="persona" label="人格定位" rules={[{ required: true }]}>
  <Input.TextArea placeholder="说明这个角色的身份、语气、立场和目标" />
</Form.Item>
```

- [ ] **Step 5: 在 Admin 路由中挂载“Agent 总控台”入口**

```ts
{
  path: '/agent-control',
  element: <AgentControlPanel />,
}
```

- [ ] **Step 6: 运行前端测试确认通过**

Run: `pnpm --dir /workspace/tailchat-source/server/admin test -- --runInBand src/client/routes/agent-control/__tests__/AgentDefinitionForm.spec.tsx`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add packages/types/src/model/agent.ts server/models/agent/definition.ts server/services/agent/definition.service.ts server/admin/src/client/routes/agent-control server/admin/src/client/routes/index.tsx
git commit -m "feat(agent): add agent definition control plane"
```

---

### Task 5: 实现群角色到 Agent 的绑定

**Files:**
- Create: `server/models/agent/roleBinding.ts`
- Create: `server/services/agent/binding.service.ts`
- Create: `client/web/src/components/modals/GroupDetail/Role/RoleAgentBindingEditor.tsx`
- Modify: `client/web/src/components/modals/GroupDetail/Role/*`
- Test: `server/services/agent/__tests__/binding.service.spec.ts`

- [ ] **Step 1: 写失败测试，锁定群角色绑定逻辑**

```ts
test('binds group role to active agent', async () => {
  const result = await service.bindRole({
    groupId: 'g1',
    roleId: 'r1',
    panelIds: ['p1'],
    agentId: 'agent_teacher',
    triggerMode: 'mention-or-script',
  });

  expect(result.agentId).toBe('agent_teacher');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/binding.service.spec.ts`
Expected: FAIL，因为 binding service 尚不存在

- [ ] **Step 3: 定义角色绑定模型**

```ts
export interface AgentRoleBinding {
  groupId: string;
  roleId: string;
  panelIds?: string[];
  agentId: string;
  triggerMode: 'mention-only' | 'mention-or-script' | 'script-only';
  active: boolean;
}
```

- [ ] **Step 4: 在群角色管理界面加入绑定编辑器**

```tsx
<RoleAgentBindingEditor
  groupId={groupId}
  roleId={role._id}
  roleName={role.name}
/>
```

- [ ] **Step 5: 增加服务端查询接口，供群内运行时查“这个角色绑定了谁”**

```ts
this.registerAction('findBindingsByGroup', this.findBindingsByGroup, {
  params: { groupId: 'string' },
});
```

- [ ] **Step 6: 重新跑服务测试**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/binding.service.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add server/models/agent/roleBinding.ts server/services/agent/binding.service.ts client/web/src/components/modals/GroupDetail/Role/RoleAgentBindingEditor.tsx
git commit -m "feat(agent): bind group roles to agent assets"
```

---

### Task 6: 接入 OpenClaw Bridge 作为外部 runtime

**Files:**
- Create: `server/services/agent/runtime.service.ts`
- Create: `server/services/agent/bridge-openclaw.service.ts`
- Modify: `server/services/openapi/bot.service.ts`
- Modify: `server/models/openapi/app.ts`
- Modify: `server/services/openapi/app.service.ts`
- Test: `server/services/agent/__tests__/bridge-openclaw.spec.ts`

- [ ] **Step 1: 写失败测试，锁定 OpenClaw bridge 调用契约**

```ts
test('dispatches role agent event to openclaw bridge', async () => {
  const result = await bridge.dispatch({
    agentId: 'agent_teacher',
    message: '今晚课程开始了吗？',
    groupId: 'g1',
    panelId: 'p1',
    senderId: 'u1',
  });

  expect(result.ok).toBe(true);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/bridge-openclaw.spec.ts`
Expected: FAIL，因为 bridge service 未创建

- [ ] **Step 3: 在 OpenApp 模型中预留 bridge 配置**

```ts
export interface OpenAppBot {
  callbackUrl: string;
  runtimeMode?: 'http-callback' | 'ws' | 'openclaw-bridge';
  bridgeEndpoint?: string;
  bridgeToken?: string;
}
```

- [ ] **Step 4: 建立统一 runtime 调度入口**

```ts
async dispatchToRuntime(ctx, payload) {
  if (payload.runtimeMode === 'openclaw-bridge') {
    return await ctx.call('agent.bridge-openclaw.dispatch', payload);
  }
}
```

- [ ] **Step 5: 在 bridge 服务中调用外部 OpenClaw Gateway**

```ts
const res = await got.post(bridgeEndpoint, {
  json: payload,
  headers: {
    Authorization: `Bearer ${bridgeToken}`,
  },
}).json();
```

- [ ] **Step 6: 跑测试确认桥接契约通过**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/bridge-openclaw.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add server/services/agent/runtime.service.ts server/services/agent/bridge-openclaw.service.ts server/models/openapi/app.ts server/services/openapi/app.service.ts server/services/openapi/bot.service.ts
git commit -m "feat(agent): add openclaw bridge runtime"
```

---

### Task 7: 为“群剧本单元”建立剧本模板与论坛沉淀骨架

**Files:**
- Create: `server/models/agent/script.ts`
- Create: `server/services/agent/script.service.ts`
- Create: `server/services/agent/__tests__/script.service.spec.ts`
- Modify: `server/admin/src/client/routes/agent-control/ScriptTemplateTable.tsx`
- Create: `docs/superpowers/specs/2026-05-03-role-agent-system-design.md`

- [ ] **Step 1: 写失败测试，锁定剧本模板模型**

```ts
test('creates group script template', async () => {
  const script = await service.create({
    name: '金融投教晚间转化脚本',
    domain: 'finance',
    stages: ['预热', '讲课', '互动', '转化', '复盘'],
  });

  expect(script.name).toBe('金融投教晚间转化脚本');
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/script.service.spec.ts`
Expected: FAIL，因为 script model 与 service 尚不存在

- [ ] **Step 3: 定义剧本模板模型**

```ts
export interface AgentScriptTemplate {
  scriptId: string;
  name: string;
  domain: string;
  stages: string[];
  entryTrigger?: string;
  conversionGoal?: string;
  forumSinkMode?: 'topic-thread' | 'knowledge-base' | 'qa-archive';
}
```

- [ ] **Step 4: 在 Admin 里增加剧本模板表**

```tsx
<Table
  columns={[
    { title: '模板名称', dataIndex: 'name' },
    { title: '行业', dataIndex: 'domain' },
    { title: '阶段', dataIndex: 'stages' },
    { title: '论坛沉淀', dataIndex: 'forumSinkMode' },
  ]}
  data={list}
/>
```

- [ ] **Step 5: 补一份专用 spec，明确后续论坛沉淀和脚本引擎接口**

```md
# 角色 Agent 系统设计

- 群剧本单元
- 角色 Agent 资产
- 行业模板
- 论坛沉淀接口
```

- [ ] **Step 6: 运行测试确认通过**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/script.service.spec.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add server/models/agent/script.ts server/services/agent/script.service.ts server/services/agent/__tests__/script.service.spec.ts server/admin/src/client/routes/agent-control/ScriptTemplateTable.tsx docs/superpowers/specs/2026-05-03-role-agent-system-design.md
git commit -m "feat(agent): add script template and forum sink skeleton"
```

---

## 计划自检

### Spec coverage

- 蓝图中的四层产品栈已分别映射到 Task 1-7：
  - 群剧本单元：Task 7
  - 角色 Agent 资产：Task 4
  - 行业模板：Task 7
  - 论坛 / 社区沉淀：Task 7
- “角色消息样式系统”已覆盖：Task 1-3
- “Agent 总控后台 + OpenClaw Bridge”已覆盖：Task 4-6

### Placeholder scan

- 已移除 TBD / TODO 占位
- 每个任务都包含文件、测试、命令和提交动作

### Type consistency

- 统一使用 `GroupPanelRoleStyle` 承担消息样式
- 统一使用 `AgentDefinition` / `AgentRoleBinding` / `AgentScriptTemplate`
- 统一使用 `openclaw-bridge` 作为 runtimeMode 值

## 执行建议

推荐按以下顺序实施：

1. Task 1-3：先把“角色消息样式系统”打通，让群角色人格先可见
2. Task 4-5：再建立系统级 Agent 控平面和绑定能力
3. Task 6-7：最后接 OpenClaw Bridge 与剧本模板骨架

这样能先快速跑出前台感知价值，再逐步接入更重的运行时和模板化运营体系。
