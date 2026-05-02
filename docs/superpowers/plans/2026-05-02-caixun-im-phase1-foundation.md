# 財訊 IM Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 Tailchat 代码基础上，把 `財訊 IM` 推到第一阶段可交付状态：主导航形成“聊天 / 联系人 / 群组 / 动态 / 我的”骨架，动态成为一级入口并具备最小内容流能力，同时开放第一批标准化账号控制接口基础。

**Architecture:** 本计划不做高风险整体重构，而是在现有 `client/web` 主导航、`client/shared` 数据模型、`server/services/core` 现有 chat/group/friend 能力上增量扩展。动态系统先以最小可运营 MVP 落地到 core service 与 client route，再基于现有 openapi 体系增加统一的账号控制 action facade，为后续完整模型接入打底。

**Tech Stack:** React、React Router、Redux Toolkit、Tailwind、Jest、Moleculer-style TcService、Mongo/Mongoose models、现有 openapi bot service、pnpm monorepo

---

## Scope Decomposition

原始规格同时覆盖：

- IM 主界面深化
- 动态系统
- 完整账号控制 API
- 更深层群剧本运营支撑

这四条线如果一次性塞进单个实施计划，风险过高。本计划只交付 **Phase 1**：

- 主导航与主界面骨架深化
- 动态一级入口与 MVP 内容流
- 动态与账号/群组的基础关联
- 第一批账号控制接口 facade

以下内容明确不在本计划内：

- 全量联系人/群管理自动化接口
- 全量动态推荐算法
- 群剧本调度系统
- 模型人格训练
- 全量移动端专项手感打磨

这些会进入后续 Phase 2 / Phase 3 计划。

## File Structure Map

### Create

- `client/shared/model/feed.ts`
  - 动态实体、评论实体、点赞实体类型定义
- `client/shared/api/feed.ts`
  - 客户端动态 API 请求封装
- `client/shared/redux/slices/feed.ts`
  - 动态流状态、当前用户动态状态
- `client/shared/redux/hooks/useFeed.ts`
  - 动态流读写 hooks
- `client/web/src/routes/Main/Navbar/FeedNav.tsx`
  - 动态一级导航入口
- `client/web/src/routes/Main/Content/Feed/index.tsx`
  - 动态主页面
- `client/web/src/routes/Main/Content/Feed/FeedSidebar.tsx`
  - 动态页侧栏
- `client/web/src/routes/Main/Content/Feed/FeedList.tsx`
  - 动态流列表
- `client/web/src/routes/Main/Content/Feed/FeedComposer.tsx`
  - 动态发布器
- `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`
  - 动态卡片
- `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`
  - 动态详情 / 评论区
- `client/web/src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx`
  - 动态路由与一级入口测试
- `client/web/src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx`
  - 主导航结构测试
- `server/models/feed/post.ts`
  - 动态主模型
- `server/models/feed/comment.ts`
  - 动态评论模型
- `server/services/core/feed/feed.service.ts`
  - 动态 CRUD、评论、点赞、按账号查询
- `server/services/openapi/account.service.ts`
  - 标准化账号控制 facade，承接 profile / conversation / group / feed
- `server/test/integration/feed/feed.spec.ts`
  - 动态服务集成测试
- `server/test/integration/openapi/account.spec.ts`
  - 账号控制 facade 集成测试

### Modify

- `client/shared/model/__all__.ts`
  - 导出新 feed 类型
- `client/shared/index.tsx`
  - 暴露 feed model/api/hooks
- `client/shared/redux/slices/index.ts`
  - 注册 feed slice
- `client/shared/redux/rootReducer.ts`
  - 挂接 feed reducer
- `client/shared/redux/setup.ts`
  - 初始化动态流与监听 feed 事件
- `client/web/src/routes/Main/Navbar/index.tsx`
  - 插入 FeedNav
- `client/web/src/routes/Main/index.tsx`
  - 挂载 `/main/feed/*`
- `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
  - 减弱联系人页在“消息”主轴中的割裂感
- `client/web/src/routes/Main/Content/Group/Sidebar.tsx`
  - 增加“关联动态”入口预留
- `client/shared/utils/brand.ts`
  - 增加动态页与账号控制相关标题常量（仍保持全局简体）
- `server/services/openapi/bot.service.ts`
  - 复用登录与账号发现能力，必要时导向新的 account facade
- `server/services/core/index.ts` 或等效服务装载入口
  - 注册 feed service
- `CHANGELOG.md`
- `docs/2026-05-01-structure-capability-audit.md`

### Verify

- `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx --runInBand`
- `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx --runInBand`
- `pnpm --dir /workspace/tailchat-source/client/web check:type`
- `pnpm --dir /workspace/tailchat-source/client/web build:ci`
- `pnpm --dir /workspace/tailchat-source/server test -- filter feed`
- `pnpm --dir /workspace/tailchat-source build`

---

### Task 1: 统一 Phase 1 词汇与导航骨架测试

**Files:**
- Modify: `client/shared/utils/brand.ts`
- Create: `client/web/src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx`
- Modify: `client/web/src/routes/Main/Navbar/index.tsx`

- [ ] **Step 1: 写主导航失败测试，锁定五个一级入口**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Navbar } from '../index';
import { store } from 'tailchat-shared';

describe('caixun main navbar', () => {
  test('contains chat contacts groups feed and mine entry points', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('消息')).toBeTruthy();
    expect(screen.getByText('群组')).toBeTruthy();
    expect(screen.getByText('动态')).toBeTruthy();
  });
});
```

- [ ] **Step 2: 运行测试，确认当前因缺少 FeedNav 失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx --runInBand`  
Expected: FAIL because `动态` nav item is missing

- [ ] **Step 3: 在品牌常量里补充动态与主界面标题常量**

```ts
export const MAIN_TAB_CHAT = '消息';
export const MAIN_TAB_CONTACTS = '联系人';
export const MAIN_TAB_GROUPS = '群组';
export const MAIN_TAB_FEED = '动态';
export const MAIN_TAB_MINE = '我的';
export const FEED_PAGE_TITLE = '动态 - 財訊';
```

- [ ] **Step 4: 创建 FeedNav 并接入 Navbar**

```tsx
// client/web/src/routes/Main/Navbar/FeedNav.tsx
import { Icon } from 'tailchat-design';
import React from 'react';
import { MAIN_TAB_FEED } from 'tailchat-shared';
import { NavbarNavItem } from './NavItem';

export const FeedNav: React.FC = React.memo(() => (
  <div data-tc-role="navbar-feed">
    <NavbarNavItem name={MAIN_TAB_FEED} to="/main/feed" showPill={true}>
      <Icon className="text-3xl text-white" icon="mdi:post-outline" />
    </NavbarNavItem>
  </div>
));
```

- [ ] **Step 5: 重新运行测试，确认主导航通过**

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx --runInBand`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/shared/utils/brand.ts client/web/src/routes/Main/Navbar
git commit -m "feat(client): add feed entry to main navbar"
```

### Task 2: 动态数据模型与服务测试先行

**Files:**
- Create: `client/shared/model/feed.ts`
- Create: `server/models/feed/post.ts`
- Create: `server/models/feed/comment.ts`
- Create: `server/services/core/feed/feed.service.ts`
- Create: `server/test/integration/feed/feed.spec.ts`
- Modify: `client/shared/model/__all__.ts`

- [ ] **Step 1: 写动态服务失败测试，锁定最小能力**

```ts
test('feed service can create and list posts for current user', async () => {
  const created = await broker.call('feed.createPost', {
    content: '早盘观察：市场情绪有所修复',
  }, { meta: { userId: String(userId) } });

  const list = await broker.call('feed.listPosts', {}, { meta: { userId: String(userId) } });

  expect(created.content).toBe('早盘观察：市场情绪有所修复');
  expect(list[0].content).toBe('早盘观察：市场情绪有所修复');
});
```

- [ ] **Step 2: 运行服务测试，确认因为 `feed` service 不存在而失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- feed/feed.spec.ts`  
Expected: FAIL with unknown service/action like `feed.createPost`

- [ ] **Step 3: 定义客户端与服务端共享的最小 Feed 类型**

```ts
export interface FeedPost {
  _id: string;
  author: string;
  content: string;
  images?: string[];
  groupId?: string;
  commentsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FeedComment {
  _id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}
```

- [ ] **Step 4: 实现最小动态模型与 service action**

```ts
// actions
this.registerAction('createPost', this.createPost, {
  params: {
    content: 'string',
    images: { type: 'array', optional: true },
    groupId: { type: 'string', optional: true },
  },
});
this.registerAction('listPosts', this.listPosts);
this.registerAction('commentPost', this.commentPost, {
  params: { postId: 'string', content: 'string' },
});
this.registerAction('likePost', this.likePost, {
  params: { postId: 'string' },
});
```

- [ ] **Step 5: 重新运行服务测试，确认动态最小能力通过**

Run: `pnpm --dir /workspace/tailchat-source/server test -- feed/feed.spec.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/shared/model server/models/feed server/services/core/feed server/test/integration/feed/feed.spec.ts
git commit -m "feat(server): add feed service foundation"
```

### Task 3: 客户端动态页路由与发布流

**Files:**
- Create: `client/shared/api/feed.ts`
- Create: `client/shared/redux/slices/feed.ts`
- Create: `client/shared/redux/hooks/useFeed.ts`
- Create: `client/web/src/routes/Main/Content/Feed/index.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/FeedSidebar.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/FeedList.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/FeedComposer.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx`
- Modify: `client/shared/index.tsx`
- Modify: `client/shared/redux/slices/index.ts`
- Modify: `client/shared/redux/rootReducer.ts`
- Modify: `client/web/src/routes/Main/index.tsx`

- [ ] **Step 1: 写动态页失败测试，锁定入口和最小发布器**

```tsx
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import MainRoute from '@/routes/Main';
import { store } from 'tailchat-shared';

test('main feed route renders composer and feed heading', () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/main/feed']}>
        <MainRoute />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByText('动态')).toBeTruthy();
  expect(screen.getByPlaceholderText('分享今天的市场观察或活动预告')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试，确认当前因 `/main/feed` 不存在而失败**

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx --runInBand`  
Expected: FAIL because route and components do not exist

- [ ] **Step 3: 实现 feed API 和 slice**

```ts
export async function listFeedPosts() {
  const { data } = await request.get('/api/feed/posts');
  return data;
}

export async function createFeedPost(payload: {
  content: string;
  images?: string[];
  groupId?: string;
}) {
  const { data } = await request.post('/api/feed/posts', payload);
  return data;
}
```

```ts
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    setPosts(state, action: PayloadAction<FeedPost[]>) {
      state.posts = action.payload;
    },
    prependPost(state, action: PayloadAction<FeedPost>) {
      state.posts.unshift(action.payload);
    },
  },
});
```

- [ ] **Step 4: 实现动态页面与发布器**

```tsx
export const FeedComposer: React.FC = () => {
  const [content, setContent] = useState('');
  const { handleCreatePost } = useFeed();

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 p-4">
      <textarea
        placeholder="分享今天的市场观察或活动预告"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={() => handleCreatePost({ content })}>发布动态</button>
    </div>
  );
};
```

- [ ] **Step 5: 挂载 `/main/feed` 路由并回跑测试**

```tsx
<Route path="/feed/*" element={<FeedPage />} />
```

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx --runInBand`  
Expected: PASS

- [ ] **Step 6: 再跑类型检查**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add client/shared client/web/src/routes/Main
git commit -m "feat(client): add feed route and composer foundation"
```

### Task 4: 群组与动态基础关联

**Files:**
- Modify: `client/web/src/routes/Main/Content/Group/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedComposer.tsx`
- Modify: `server/services/core/feed/feed.service.ts`
- Test: `server/test/integration/feed/feed.spec.ts`

- [ ] **Step 1: 先补失败测试，锁定动态可绑定群组**

```ts
test('feed post can be linked to a group', async () => {
  const created = await broker.call('feed.createPost', {
    content: '今晚八点专题分享开始',
    groupId: String(groupId),
  }, { meta: { userId: String(userId) } });

  expect(created.groupId).toBe(String(groupId));
});
```

- [ ] **Step 2: 运行服务测试确认失败**

Run: `pnpm --dir /workspace/tailchat-source/server test -- feed/feed.spec.ts`  
Expected: FAIL because `groupId` is not persisted or validated

- [ ] **Step 3: 在 feed service 中接入 groupId 校验与存储**

```ts
if (isValidStr(groupId)) {
  await ctx.call('group.getGroupInfo', { groupId });
}

const doc = await this.adapter.insert({
  author: userId,
  content,
  groupId: groupId ?? null,
  images: images ?? [],
});
```

- [ ] **Step 4: 在前端动态卡片中增加群组来源展示**

```tsx
{post.groupId && (
  <Link to={`/main/group/${post.groupId}`} className="text-xs text-[#0b4a8b]">
    查看关联群组
  </Link>
)}
```

- [ ] **Step 5: 在群侧栏增加“关联动态”预留入口**

```tsx
{
  key: 'related-feed',
  label: t('关联动态'),
  to: `/main/feed?groupId=${groupId}`,
}
```

- [ ] **Step 6: 重新运行服务与客户端测试**

Run: `pnpm --dir /workspace/tailchat-source/server test -- feed/feed.spec.ts && pnpm --dir /workspace/tailchat-source/client/web check:type`  
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add client/web/src/routes/Main/Content/Group client/web/src/routes/Main/Content/Feed server/services/core/feed server/test/integration/feed/feed.spec.ts
git commit -m "feat(feed): link feed posts with groups"
```

### Task 5: 标准化账号控制 facade

**Files:**
- Create: `server/services/openapi/account.service.ts`
- Create: `server/test/integration/openapi/account.spec.ts`
- Modify: `server/services/openapi/bot.service.ts`

- [ ] **Step 1: 写 facade 失败测试，锁定统一账号控制入口**

```ts
test('openapi account facade can list conversations and publish feed post', async () => {
  const conversations = await broker.call('openapi.account.listConversations', {}, { meta: { userId: String(userId) } });
  const post = await broker.call('openapi.account.publishFeedPost', {
    content: '测试动态',
  }, { meta: { userId: String(userId) } });

  expect(Array.isArray(conversations)).toBe(true);
  expect(post.content).toBe('测试动态');
});
```

- [ ] **Step 2: 运行测试，确认 `openapi.account` 尚不存在**

Run: `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`  
Expected: FAIL with unknown service/action for `openapi.account.*`

- [ ] **Step 3: 实现 facade 最小 action 集**

```ts
this.registerAction('getProfile', this.getProfile);
this.registerAction('updateProfile', this.updateProfile, {
  params: {
    nickname: { type: 'string', optional: true },
    avatar: { type: 'string', optional: true },
    bio: { type: 'string', optional: true },
  },
});
this.registerAction('listConversations', this.listConversations);
this.registerAction('sendConversationMessage', this.sendConversationMessage, {
  params: { converseId: 'string', content: 'string' },
});
this.registerAction('listGroups', this.listGroups);
this.registerAction('publishFeedPost', this.publishFeedPost, {
  params: { content: 'string', groupId: { type: 'string', optional: true } },
});
```

- [ ] **Step 4: 在 facade 中复用现有 core service，而不是重写逻辑**

```ts
async publishFeedPost(ctx: TcContext<{ content: string; groupId?: string }>) {
  return ctx.call('feed.createPost', ctx.params, { meta: ctx.meta });
}

async listConversations(ctx: TcContext) {
  return ctx.call('chat.converse.findUserConverseList', {}, { meta: ctx.meta });
}
```

- [ ] **Step 5: 回跑账号控制测试**

Run: `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add server/services/openapi server/test/integration/openapi/account.spec.ts
git commit -m "feat(openapi): add account control facade"
```

### Task 6: 客户端主界面收口为“熟悉型 IM”

**Files:**
- Modify: `client/web/src/routes/Main/Content/Personal/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Friends/index.tsx`
- Modify: `client/web/src/routes/Main/Content/PageContent.tsx`
- Test: `client/web/src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx`

- [ ] **Step 1: 写失败测试，锁定“消息 / 联系人 / 群组 / 动态”骨架不互相混淆**

```tsx
test('personal area keeps chats as primary and contacts as secondary', () => {
  render(...);
  expect(screen.getByText('最近聊天')).toBeTruthy();
  expect(screen.getByText('联系人')).toBeTruthy();
});
```

- [ ] **Step 2: 运行测试确认当前个人区文案和结构未达标**

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx --runInBand`  
Expected: FAIL or missing expected headings

- [ ] **Step 3: 收口个人区侧栏结构**

```tsx
<SectionHeader title="最近聊天" />
<SidebarDMList />
<SectionHeader title="联系人" />
<ContactsShortcut />
```

- [ ] **Step 4: 保持 PageContent 的桌面三栏体验可继续承接更高信息密度**

```tsx
className={clsx(
  'flex min-w-0 flex-auto bg-content-light dark:bg-content-dark overflow-hidden',
  'supports-[backdrop-filter]:backdrop-blur-sm'
)}
```

- [ ] **Step 5: 运行类型检查与构建**

Run: `pnpm --dir /workspace/tailchat-source/client/web check:type && pnpm --dir /workspace/tailchat-source/client/web build:ci`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add client/web/src/routes/Main/Content client/web/src/routes/Main/Navbar
git commit -m "refactor(client): tighten familiar im shell"
```

### Task 7: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`
- Modify: `docs/superpowers/specs/2026-05-02-caixun-im-ecosystem-design.md` (only if wording drift discovered)

- [ ] **Step 1: 更新变更记录**

```md
- 启动財訊 IM 第一阶段：主导航引入动态一级入口，落地财富论坛动态 MVP 与账号控制 facade 基础
```

- [ ] **Step 2: 更新结构审计**

```md
- 当前仓库已经从“品牌与信任展示完成”推进到“財訊 IM 三核骨架开始形成，动态系统与标准化账号控制层进入实际落地阶段”
```

- [ ] **Step 3: 执行最终测试**

Run: `pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Navbar/__tests__/feed-nav.spec.tsx --runInBand && pnpm --dir /workspace/tailchat-source/client/web test src/routes/Main/Content/Feed/__tests__/feed-route.spec.tsx --runInBand && pnpm --dir /workspace/tailchat-source/client/web check:type && pnpm --dir /workspace/tailchat-source/client/web build:ci && pnpm --dir /workspace/tailchat-source/server test -- feed/feed.spec.ts && pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts && pnpm --dir /workspace/tailchat-source/website build && pnpm --dir /workspace/tailchat-source build`  
Expected: PASS

- [ ] **Step 4: 检查工作区无临时垃圾**

Run: `git -C /workspace/tailchat-source status --short`  
Expected: only intended tracked changes before final commit, no temp/debug files

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md docs/2026-05-01-structure-capability-audit.md
git commit -m "chore: close out caixun im phase 1 foundation"
```
