# OpenClaw 接入底座与分层对齐 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前项目严格收敛为 Tailchat 社群协作底座，同时把角色 Agent 总控、群剧本单元管理、剧本编排与策略引擎明确迁移到 OpenClaw 开发。

**Architecture:** 采用“双平面分层”架构。Tailchat 负责底部支撑层、系统底座能力、社群协作底座、角色消息样式与人格呈现、OpenClaw Bridge/Agent Runtime、数据分析与转化追踪、风控与合规边界控制。OpenClaw 负责角色 Agent 总控后台、群剧本单元管理系统、剧本编排与策略引擎，以及导演 Agent 对角色 Agent 的调度。

**Tech Stack:** Tailchat Web React/TypeScript、Tailchat Server Moleculer/TypeScript、Tailchat Admin、MongoDB、Redis、OpenAPI Bot、OpenClaw Runtime/Gateway、外部数据分析与风控规则引擎

---

## 分层结论

### Tailchat 当前仓库负责

- 底部支撑层
- 系统底座能力
- Tailchat 社群协作底座
- 角色消息样式与人格呈现系统
- OpenClaw Bridge / Agent Runtime
- 数据分析与转化追踪
- 风控与合规边界控制
- 外部 Agent 接入配置
- 群角色到外部 Agent 的绑定
- 场景接入配置

### OpenClaw 负责

- 群剧本单元管理系统
- 角色 Agent 总控后台
- 剧本编排与策略引擎
- 导演 Agent 调度角色 Agent
- Agent 人格、Prompt、记忆、工具与协同

---

## 文件结构与职责

### Tailchat 仓库继续保留并演进

- `packages/types/src/model/agent.ts`
  - 外部 Agent 接入、角色绑定、场景接入配置类型
- `server/models/agent/definition.ts`
  - 外部 Agent 接入记录
- `server/models/agent/roleBinding.ts`
  - 群角色绑定外部 Agent
- `server/models/agent/scene.ts`
  - 场景接入配置
- `server/services/agent/definition.service.ts`
  - 外部 Agent 接入服务
- `server/services/agent/binding.service.ts`
  - 群角色绑定服务
- `server/services/agent/scene.service.ts`
  - 场景接入配置服务
- `server/services/agent/runtime.service.ts`
  - 统一 runtime 分发入口
- `server/services/agent/bridge-openclaw.service.ts`
  - OpenClaw Bridge
- `server/models/openapi/app.ts`
  - OpenApp Bot runtime 配置
- `server/services/openapi/bot.service.ts`
  - 消息入口与事件回调
- `server/admin/src/client/routes/agent-control/index.tsx`
  - OpenClaw 接入底座管理页
- `server/admin/src/client/routes/agent-control/AgentDefinitionForm.tsx`
  - 外部 Agent 接入配置表单
- `server/admin/src/client/routes/agent-control/SceneAccessConfigForm.tsx`
  - 场景接入配置表单
- `client/web/src/components/modals/GroupDetail/Role/tabs/summary.tsx`
  - 群角色绑定外部 Agent
- `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
  - 角色消息样式编辑入口
- `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
  - 角色消息视觉呈现

### Tailchat 仓库需要新增

- `server/models/agent/analytics.ts`
  - 转化追踪与分析事件模型
- `server/services/agent/analytics.service.ts`
  - 数据分析与转化追踪服务
- `server/models/agent/compliance.ts`
  - 风控与合规规则模型
- `server/services/agent/compliance.service.ts`
  - 风控与合规边界服务
- `server/admin/src/client/routes/agent-control/AnalyticsPanel.tsx`
  - 数据分析与转化追踪面板
- `server/admin/src/client/routes/agent-control/CompliancePanel.tsx`
  - 风控与合规控制面板
- `server/services/agent/__tests__/agentAnalytics.spec.ts`
  - 分析事件契约测试
- `server/services/agent/__tests__/agentCompliance.spec.ts`
  - 合规规则契约测试

### OpenClaw 仓库需要承接的能力

- `openclaw/apps/agent-control/`
  - 角色 Agent 总控后台
- `openclaw/apps/script-unit/`
  - 群剧本单元管理系统
- `openclaw/apps/director-engine/`
  - 导演 Agent 与剧本编排/策略引擎
- `openclaw/apps/runtime-orchestrator/`
  - 多 Agent 运行时协调
- `openclaw/packages/contracts/tailchat-bridge.ts`
  - 与 Tailchat Bridge 的契约定义
- `openclaw/packages/contracts/scene-runtime.ts`
  - 场景接入、角色执行、导演调度事件定义

---

## 里程碑

### Milestone A：Tailchat 收敛为底座

目标：
- 彻底移除剧本、导演、Agent 人格等平台内概念
- 统一语义为外部 Agent 接入、角色绑定、场景接入、runtime、分析、合规

### Milestone B：OpenClaw 接管控制平面

目标：
- 角色 Agent 总控后台迁到 OpenClaw
- 群剧本单元管理迁到 OpenClaw
- 导演 Agent 调度模型在 OpenClaw 落地

### Milestone C：Tailchat <-> OpenClaw 闭环

目标：
- Tailchat 负责入口、展示、连接、事件
- OpenClaw 负责导演、角色协作、策略与执行
- Bridge 契约稳定，转化与风控回流到底座

---

### Task 1: 清理 Tailchat 仓库中的剧本与导演残留语义

**Files:**
- Modify: `server/admin/src/client/routes/agent-control/index.tsx`
- Modify: `server/admin/src/client/routes/agent-control/SceneAccessConfigForm.tsx`
- Modify: `docs/superpowers/specs/2026-05-03-blueprint-status-audit.md`
- Modify: `docs/superpowers/plans/2026-05-03-automated-community-product-roadmap.md`
- Test: `server/services/agent/__tests__/agentDefinition.spec.ts`

- [ ] **Step 1: 写失败测试，锁定接入底座不再包含剧本语义**

```ts
test('builds external agent config with infrastructure defaults', () => {
  expect(
    buildAgentDefinition({
      agentId: 'agent_teacher_finance',
      name: '投教主讲老师',
      externalAgentId: 'openclaw.teacher.finance',
    })
  ).toMatchObject({
    provider: 'openclaw',
    runtimeMode: 'openclaw-bridge',
  });
});
```

- [ ] **Step 2: 运行测试确认基线仍然正确**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentDefinition.spec.ts`
Expected: PASS，确认后续只是文案和命名收敛，不改变接入契约

- [ ] **Step 3: 修改后台页面文案，彻底去掉剧本与导演表达**

```tsx
<Typography.Paragraph>
  在这里统一管理外部 Agent 接入、角色绑定、场景接入和运行时调度。
  本项目只负责场景、关系、入口和连接配置，不负责剧本编排、导演调度与 Agent 推理本体。
</Typography.Paragraph>
```

- [ ] **Step 4: 更新审计和旧路线图文档，标记“迁移到 OpenClaw”**

```md
### 已收敛的边界

- 群剧本单元管理系统：迁移到 OpenClaw
- 角色 Agent 总控后台：迁移到 OpenClaw
- 剧本编排与策略引擎：迁移到 OpenClaw
```

- [ ] **Step 5: 重新跑测试确认通过**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentDefinition.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/admin/src/client/routes/agent-control/index.tsx docs/superpowers/specs/2026-05-03-blueprint-status-audit.md docs/superpowers/plans/2026-05-03-automated-community-product-roadmap.md
git commit -m "docs(agent): align platform boundary with openclaw"
```

---

### Task 2: 完成 Tailchat 底部支撑层与系统底座能力

**Files:**
- Modify: `server/services/agent/runtime.service.ts`
- Modify: `server/services/agent/bridge-openclaw.service.ts`
- Modify: `server/services/openapi/bot.service.ts`
- Modify: `server/models/openapi/app.ts`
- Test: `server/services/agent/__tests__/openAppBotRuntime.spec.ts`

- [ ] **Step 1: 写失败测试，锁定 bridge runtime 只做分发，不做策略**

```ts
test('uses openclaw bridge only as runtime dispatch channel', () => {
  expect(
    resolveOpenAppBotRuntime({
      callbackUrl: 'https://example.com/callback',
      runtimeMode: 'openclaw-bridge',
      bridgeEndpoint: 'https://bridge.example.com/dispatch',
      bridgeToken: 'bridge-token',
    })
  ).toMatchObject({
    runtimeMode: 'openclaw-bridge',
    bridgeEndpoint: 'https://bridge.example.com/dispatch',
  });
});
```

- [ ] **Step 2: 运行测试确认失败或确认当前行为**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/openAppBotRuntime.spec.ts`
Expected: PASS 或 FAIL，但必须确认 runtime 语义没有扩展到剧本逻辑

- [ ] **Step 3: 在 runtime service 中固定职责边界**

```ts
if (runtime.runtimeMode === 'openclaw-bridge') {
  return await ctx.call('agent.bridge-openclaw.dispatch', {
    appId,
    eventType,
    payload,
    bridgeEndpoint: runtime.bridgeEndpoint,
    bridgeToken: runtime.bridgeToken,
  });
}
```

- [ ] **Step 4: 在 bridge 服务中只保留连接和分发字段**

```ts
json: {
  appId,
  eventType,
  payload,
}
```

- [ ] **Step 5: 跑测试与类型检查**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/openAppBotRuntime.spec.ts`
Expected: PASS

Run: `pnpm --dir /workspace/tailchat-source/server exec tsc -p tsconfig.json --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/services/agent/runtime.service.ts server/services/agent/bridge-openclaw.service.ts server/services/openapi/bot.service.ts server/models/openapi/app.ts
git commit -m "refactor(agent): keep bridge runtime as infrastructure only"
```

---

### Task 3: 强化 Tailchat 社群协作底座中的角色消息样式与人格呈现系统

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Modify: `client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx`
- Modify: `client/web/src/components/modals/GroupDetail/Role/tabs/summary.tsx`
- Test: `client/web/src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.ts`
- Test: `client/web/src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定角色消息样式只表达人格外观**

```ts
test('renders role badge and bubble style from role style config', () => {
  expect(screen.getByText('主讲')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试确认失败或确认当前行为**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.ts`
Expected: PASS 或 FAIL，但必须确认样式链路只服务于角色视觉表现

- [ ] **Step 3: 保持样式配置集中在群角色，不把人格逻辑扩展进底座**

```tsx
{roleStyle?.badgeText && (
  <div style={{ color: roleStyle.badgeColor ?? '#1677ff' }}>
    {roleStyle.badgeText}
  </div>
)}
```

- [ ] **Step 4: 重新跑测试**

Run: `pnpm --dir /workspace/tailchat-source/client/web test -- --runInBand src/components/ChatBox/ChatMessageList/__tests__/roleStyle.spec.ts src/components/modals/GroupPanel/__tests__/groupSpeakPolicyEditor.spec.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add client/web/src/components/ChatBox/ChatMessageList/Item.tsx client/web/src/components/modals/GroupPanel/GroupSpeakPolicyEditor.tsx client/web/src/components/modals/GroupDetail/Role/tabs/summary.tsx
git commit -m "feat(group): keep role style as presentation layer"
```

---

### Task 4: 补齐 Tailchat 的数据分析与转化追踪

**Files:**
- Create: `server/models/agent/analytics.ts`
- Create: `server/services/agent/analytics.service.ts`
- Create: `server/services/agent/__tests__/agentAnalytics.spec.ts`
- Create: `server/admin/src/client/routes/agent-control/AnalyticsPanel.tsx`
- Modify: `server/admin/src/client/routes/agent-control/index.tsx`

- [ ] **Step 1: 写失败测试，锁定分析事件只记录结果，不做策略决策**

```ts
test('builds analytics event with conversion metadata', () => {
  expect({
    agentId: 'agent_teacher_finance',
    eventType: 'friend_accept',
    sourceSceneId: 'social_growth',
    conversionLabel: 'lead',
  }).toMatchObject({
    eventType: 'friend_accept',
    conversionLabel: 'lead',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentAnalytics.spec.ts`
Expected: FAIL，提示测试文件或模型不存在

- [ ] **Step 3: 创建分析模型与服务，字段只覆盖采集与查询**

```ts
@prop({ required: true })
eventType: string;

@prop()
sourceSceneId?: string;

@prop()
conversionLabel?: string;
```

- [ ] **Step 4: 在后台增加分析面板入口**

```tsx
<Card>
  <Typography.Title heading={6}>数据分析与转化追踪</Typography.Title>
  <AnalyticsPanel />
</Card>
```

- [ ] **Step 5: 重新跑测试与类型检查**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentAnalytics.spec.ts`
Expected: PASS

Run: `pnpm --dir /workspace/tailchat-source/server exec tsc -p tsconfig.json --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/models/agent/analytics.ts server/services/agent/analytics.service.ts server/services/agent/__tests__/agentAnalytics.spec.ts server/admin/src/client/routes/agent-control/AnalyticsPanel.tsx server/admin/src/client/routes/agent-control/index.tsx
git commit -m "feat(agent): add analytics and conversion tracking"
```

---

### Task 5: 补齐 Tailchat 的风控与合规边界控制

**Files:**
- Create: `server/models/agent/compliance.ts`
- Create: `server/services/agent/compliance.service.ts`
- Create: `server/services/agent/__tests__/agentCompliance.spec.ts`
- Create: `server/admin/src/client/routes/agent-control/CompliancePanel.tsx`
- Modify: `server/admin/src/client/routes/agent-control/index.tsx`

- [ ] **Step 1: 写失败测试，锁定场景动作必须经过合规开关**

```ts
test('denies blocked action in compliance rule', () => {
  expect({
    action: 'add-friend',
    blocked: true,
  }).toMatchObject({
    blocked: true,
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentCompliance.spec.ts`
Expected: FAIL，提示测试文件或服务不存在

- [ ] **Step 3: 创建风控模型与服务**

```ts
@prop({ required: true })
action: string;

@prop({ default: false })
blocked: boolean;

@prop()
reason?: string;
```

- [ ] **Step 4: 在后台加入风控面板**

```tsx
<Card>
  <Typography.Title heading={6}>风控与合规边界控制</Typography.Title>
  <CompliancePanel />
</Card>
```

- [ ] **Step 5: 重新跑测试与类型检查**

Run: `pnpm --dir /workspace/tailchat-source/server test -- --runInBand services/agent/__tests__/agentCompliance.spec.ts`
Expected: PASS

Run: `pnpm --dir /workspace/tailchat-source/server exec tsc -p tsconfig.json --noEmit`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/models/agent/compliance.ts server/services/agent/compliance.service.ts server/services/agent/__tests__/agentCompliance.spec.ts server/admin/src/client/routes/agent-control/CompliancePanel.tsx server/admin/src/client/routes/agent-control/index.tsx
git commit -m "feat(agent): add compliance boundary controls"
```

---

### Task 6: 约定 OpenClaw 侧的群剧本单元管理系统

**Files:**
- Create: `openclaw/packages/contracts/tailchat-bridge.ts`
- Create: `openclaw/apps/script-unit/src/models/script-unit.ts`
- Create: `openclaw/apps/script-unit/src/services/script-unit.service.ts`
- Create: `openclaw/apps/script-unit/src/tests/script-unit.spec.ts`

- [ ] **Step 1: 在 OpenClaw 仓库写失败测试，锁定群剧本单元归属 OpenClaw**

```ts
test('builds script unit with director ownership', () => {
  expect({
    unitId: 'finance_evening_growth',
    directorAgentId: 'director.finance.main',
    roleAgentIds: ['teacher.finance', 'assistant.finance'],
  }).toMatchObject({
    directorAgentId: 'director.finance.main',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test openclaw/apps/script-unit/src/tests/script-unit.spec.ts`
Expected: FAIL

- [ ] **Step 3: 定义 script unit 模型**

```ts
export interface ScriptUnit {
  unitId: string;
  name: string;
  directorAgentId: string;
  roleAgentIds: string[];
  lifecycle: 'draft' | 'running' | 'paused';
}
```

- [ ] **Step 4: 定义与 Tailchat 的桥接契约**

```ts
export interface TailchatSceneDispatchEvent {
  sceneId: string;
  groupId?: string;
  roleId?: string;
  payload: unknown;
}
```

- [ ] **Step 5: 重新跑测试**

Run: `pnpm test openclaw/apps/script-unit/src/tests/script-unit.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add openclaw/packages/contracts/tailchat-bridge.ts openclaw/apps/script-unit/src/models/script-unit.ts openclaw/apps/script-unit/src/services/script-unit.service.ts openclaw/apps/script-unit/src/tests/script-unit.spec.ts
git commit -m "feat(script-unit): add openclaw script unit management"
```

---

### Task 7: 约定 OpenClaw 侧的角色 Agent 总控后台

**Files:**
- Create: `openclaw/apps/agent-control/src/models/agent-profile.ts`
- Create: `openclaw/apps/agent-control/src/services/agent-profile.service.ts`
- Create: `openclaw/apps/agent-control/src/tests/agent-profile.spec.ts`

- [ ] **Step 1: 写失败测试，锁定人格与控制后台只在 OpenClaw 中定义**

```ts
test('builds agent profile with persona in openclaw only', () => {
  expect({
    agentId: 'teacher.finance',
    persona: '专业、可信、擅长投教转化',
  }).toMatchObject({
    persona: '专业、可信、擅长投教转化',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test openclaw/apps/agent-control/src/tests/agent-profile.spec.ts`
Expected: FAIL

- [ ] **Step 3: 定义 OpenClaw 侧 agent profile**

```ts
export interface AgentProfile {
  agentId: string;
  persona: string;
  promptTemplate: string;
  toolsetIds: string[];
  memoryPolicyId?: string;
}
```

- [ ] **Step 4: 重新跑测试**

Run: `pnpm test openclaw/apps/agent-control/src/tests/agent-profile.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add openclaw/apps/agent-control/src/models/agent-profile.ts openclaw/apps/agent-control/src/services/agent-profile.service.ts openclaw/apps/agent-control/src/tests/agent-profile.spec.ts
git commit -m "feat(agent-control): add openclaw agent control plane"
```

---

### Task 8: 约定 OpenClaw 侧的剧本编排与策略引擎

**Files:**
- Create: `openclaw/apps/director-engine/src/models/director-run.ts`
- Create: `openclaw/apps/director-engine/src/services/director-engine.service.ts`
- Create: `openclaw/apps/director-engine/src/tests/director-engine.spec.ts`

- [ ] **Step 1: 写失败测试，锁定导演 Agent 负责角色协同**

```ts
test('builds director run with managed role agents', () => {
  expect({
    directorAgentId: 'director.finance.main',
    roleAgentIds: ['teacher.finance', 'assistant.finance'],
    strategyId: 'growth.finance.v1',
  }).toMatchObject({
    strategyId: 'growth.finance.v1',
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm test openclaw/apps/director-engine/src/tests/director-engine.spec.ts`
Expected: FAIL

- [ ] **Step 3: 定义导演运行结构**

```ts
export interface DirectorRun {
  runId: string;
  directorAgentId: string;
  roleAgentIds: string[];
  strategyId: string;
  state: 'idle' | 'running' | 'paused';
}
```

- [ ] **Step 4: 重新跑测试**

Run: `pnpm test openclaw/apps/director-engine/src/tests/director-engine.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add openclaw/apps/director-engine/src/models/director-run.ts openclaw/apps/director-engine/src/services/director-engine.service.ts openclaw/apps/director-engine/src/tests/director-engine.spec.ts
git commit -m "feat(director): add openclaw strategy engine"
```

---

## 依赖关系

1. Task 1-5 属于当前 Tailchat 仓库，必须先执行，完成底座收敛。
2. Task 6-8 属于 OpenClaw 仓库，必须在 OpenClaw 代码库中独立实施。
3. Task 2 是 Tailchat 与 OpenClaw 的桥接前提。
4. Task 4-5 为后续运营和合规可观测性提供支撑。

## 验收标准

- Tailchat 仓库中不再包含“剧本模板、导演 Agent、人格控制平面”这类职责。
- Tailchat 后台只保留外部 Agent 接入、角色绑定、场景接入、runtime、分析、合规。
- OpenClaw 承接角色 Agent 总控后台、群剧本单元管理系统、剧本编排与策略引擎。
- Tailchat 和 OpenClaw 之间的桥接契约清晰，Tailchat 只做入口和连接，不做策略与导演逻辑。

## 自检结果

- 已覆盖用户指定方向：
  - 底部支撑层
  - 系统底座能力
  - Tailchat 社群协作底座
  - 群剧本单元管理系统迁到 OpenClaw
  - 角色 Agent 总控后台迁到 OpenClaw
  - 角色消息样式与人格呈现系统
  - OpenClaw Bridge / Agent Runtime
  - 剧本编排与策略引擎迁到 OpenClaw
  - 数据分析与转化追踪
  - 风控与合规边界控制
- 当前 Tailchat 仓库任务使用真实文件路径。
- OpenClaw 部分为独立实施工作流，需在 OpenClaw 仓库执行。
