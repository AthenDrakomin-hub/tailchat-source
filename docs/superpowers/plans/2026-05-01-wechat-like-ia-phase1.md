# WeChat-Like IA Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前最混乱的消息主路径先收口成更接近微信的结构，让“找消息”和“找联系人”不再反着走。

**Architecture:** 第一阶段不大拆路由体系，只对 `client/web` 的主导航、个人区侧边栏和默认落点做信息架构重排。优先把“消息”放回一级认知位置，把“好友/联系人”下沉为次级入口，同时保持现有 DM、群组和插件能力不被破坏。

**Tech Stack:** React、React Router、Tailwind、tailchat-shared、现有 Main 路由体系

---

### Task 1: 收口个人区为“消息优先”

**Files:**
- Modify: `client/web/src/routes/Main/Navbar/PersonalNav.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/index.tsx`
- Test: `client/web` 现有主导航与个人区手动验证

- [ ] **Step 1: 把一级导航从“我”改成“消息”**

目标：

- 当前 `PersonalNav` 文案为“我”，会误导用户以为这里是个人中心
- 第一阶段改成“消息”，让用户一眼知道这里是会话主入口

- [ ] **Step 2: 调整个人区侧边栏顺序**

目标顺序：

1. 顶部消息分区
2. 私信会话列表
3. 联系人入口
4. 插件入口下沉

- [ ] **Step 3: 修改默认落点**

规则：

- 有最近私信会话时，默认进入第一条会话
- 没有私信会话时，退回联系人页
- 不再默认落到“好友列表优先”的旧逻辑

- [ ] **Step 4: 手动验证**

验证路径：

- 打开 `/main`
- 点击一级导航“消息”
- 确认默认进入最近私信或联系人页
- 确认“联系人”仍可访问
- 确认 DM 列表仍可点击进入会话页

- [ ] **Step 5: Commit**

```bash
git add client/web/src/routes/Main/Navbar/PersonalNav.tsx \
  client/web/src/routes/Main/Content/Personal/Sidebar.tsx \
  client/web/src/routes/Main/Content/Personal/index.tsx
git commit -m "refactor(client): prioritize chats in personal navigation"
```

### Task 2: 降低移动端消息布局溢出风险

**Files:**
- Modify: `client/web/src/routes/Main/Content/Inbox/Sidebar.tsx`
- Modify: `client/web/src/components/CommonSidebarWrapper.tsx`
- Modify: `client/web/src/routes/Main/Content/PageContent.tsx`
- Test: 浏览器移动端视口手动验证

- [ ] **Step 1: 收紧消息预览文本容器**

目标：

- 避免消息预览在窄视口下横向撑破布局
- 减少 `overflow-auto` / `break-all` 带来的出界感

- [ ] **Step 2: 收紧页面与侧栏容器溢出策略**

目标：

- 让主内容区和侧栏在手机宽度下优先纵向滚动
- 避免横向滚动条和内容裁切

- [ ] **Step 3: 手动验证**

验证方式：

- 浏览器切到手机视口
- 打开消息相关页面
- 确认消息预览、侧栏、主内容不再轻易横向出界

- [ ] **Step 4: Commit**

```bash
git add client/web/src/routes/Main/Content/Inbox/Sidebar.tsx \
  client/web/src/components/CommonSidebarWrapper.tsx \
  client/web/src/routes/Main/Content/PageContent.tsx
git commit -m "fix(client): reduce message layout overflow on mobile"
```

### Task 3: 输出第一阶段说明

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] **Step 1: 在 Changelog 记录第一阶段 IA 改造**

- [ ] **Step 2: 在审计文档标记第一阶段已开始执行**

- [ ] **Step 3: Commit**

```bash
git add CHANGELOG.md docs/2026-05-01-structure-capability-audit.md
git commit -m "docs: record phase1 information architecture changes"
```
