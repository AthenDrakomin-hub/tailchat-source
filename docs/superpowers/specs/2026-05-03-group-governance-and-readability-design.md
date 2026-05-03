# 群聊发言治理与阅读优化设计

## 背景
当前群聊已有两类基础能力：

- 面板级发言权限：`GroupPanel.fallbackPermissions` 与 `permissionMap` 已经可以控制某个群面板内哪些角色具备 `PERMISSION.core.message`
- 成员级禁言：成员对象已有 `muteUntil`，服务端 `chat.message.sendMessage` 已在群消息路径中检查该字段

但当前缺口也很明显：

- 输入框旁的“禁言/全群禁言”入口只是一层快捷操作，没有和角色级配置形成统一心智
- 没有角色级发言频率限制，无法防止刷屏
- 没有机器人单独的限流策略
- 群消息过多时，缺少更清晰的角色识别与爬楼辅助
- 不同角色的消息缺少稳定的可配置视觉区分

本设计目标是在不推翻现有群权限体系的前提下，补齐群面板级“发言治理”和高消息密度场景下的“阅读友好性”。

## 目标

### 功能目标

1. 支持针对每个群面板，为默认成员和各个角色分别配置：
   - 是否允许发言
   - 时间窗口长度
   - 时间窗口内允许发言次数
   - 是否允许发送富媒体消息
2. 支持机器人单独限流
3. 支持基础防刷屏策略：
   - 高频发言限制
   - 短时间重复消息拦截
4. 让当前输入框旁的禁言按钮成为“默认发言规则快捷开关”
5. 在群聊消息密度较高时，增强角色识别与爬楼友好度
6. 为不同角色提供可配置的消息识别样式，而不是整块气泡染色

### 非目标

- 本轮不做 AI 自动摘要
- 本轮不做真正线程化楼中楼
- 本轮不做跨群统一治理后台
- 本轮不做整气泡自由染色系统
- 本轮不做复杂消息折叠算法与自动聚类摘要

## 方案选择

### 方案 A：只补前端权限 UI
优点：

- 改动小
- 上线快

缺点：

- 没有真正频率限制
- 防刷屏只能依赖“是否有权限发言”
- 机器人刷屏问题仍然存在

### 方案 B：基于面板权限扩展“面板级发言治理”
优点：

- 与现有 `GroupPanel` 数据结构最贴合
- 能复用既有面板权限模型
- 适合按角色、按面板治理
- 前后端职责清晰，便于逐步扩展

缺点：

- 需要补充面板配置结构
- 服务端需要新增限流与防刷逻辑

### 方案 C：全局群级消息治理中心
优点：

- 能力最完整
- 便于未来扩展摘要、机器人治理、审计与智能折叠

缺点：

- 范围过大
- 超出本轮需要的最小可用目标

### 结论
采用方案 B。

原因：

- 当前系统已有群面板权限体系
- 面板是 Tailchat 群聊的天然治理边界
- 现有“禁言按钮”就位于面板聊天输入区，适合接成快捷入口
- 能最快形成可上线的“权限 + 频率 + 阅读优化”闭环

## 数据模型设计

### 面板级发言治理配置
在 `GroupPanel.meta` 下新增一组治理配置，避免修改现有 `fallbackPermissions` 语义：

```ts
interface GroupPanelSpeakPolicy {
  enabled?: boolean;
  defaultRule?: SpeakRule;
  roleRules?: Record<string, SpeakRule>;
  botRule?: SpeakRule;
  floodControl?: FloodControlRule;
  readability?: ReadabilityRule;
}

interface SpeakRule {
  allowText?: boolean;
  allowRichContent?: boolean;
  rateLimitWindowSec?: number;
  rateLimitCount?: number;
}

interface FloodControlRule {
  enabled?: boolean;
  duplicateWindowSec?: number;
  duplicateLimit?: number;
}

interface ReadabilityRule {
  roleStyleMode?: 'none' | 'nickname' | 'avatar-ring' | 'side-accent' | 'combined';
  roleStyleMap?: Record<string, {
    nicknameColor?: string;
    avatarRingColor?: string;
    sideAccentColor?: string;
  }>;
}
```

### 与现有权限模型的关系

- `fallbackPermissions` / `permissionMap` 仍然是第一层门禁
- `speakPolicy` 是第二层治理
- 判定顺序：
  1. 是否拥有 `PERMISSION.core.message`
  2. 成员是否被个人禁言 `muteUntil`
  3. 是否命中 `speakPolicy` 中的角色/默认规则
  4. 是否触发频率限制
  5. 是否触发重复消息拦截

这样可以保证：

- 老权限模型不被破坏
- 快捷禁言与高级治理仍落在同一面板上下文

## 服务端设计

### 入口
改造 `server/services/core/chat/message.service.ts` 中的 `sendMessage()`

仅在群消息路径下生效：

- `groupId` 存在时读取群信息与当前面板信息
- 对当前发送者执行治理策略校验

### 服务端校验顺序

1. 现有会话权限校验
2. 现有成员 `muteUntil` 校验
3. 面板发言治理规则匹配
4. 发言频率限制
5. 重复消息拦截

### 规则匹配

对当前成员收集其角色列表，优先级如下：

1. 若是机器人，优先应用 `botRule`
2. 若命中多个角色规则，取“最严格”规则
3. 若没有角色规则，回退到 `defaultRule`
4. 若 `speakPolicy.enabled !== true`，则不启用治理逻辑

“最严格”定义：

- `allowText` 为 `false` 优先
- `allowRichContent` 为 `false` 优先
- `rateLimitWindowSec` 取更长窗口
- `rateLimitCount` 取更小次数

### 频率限制实现

推荐使用 Redis 计数，而不是进程内内存：

- key: `speak:group:{groupId}:panel:{panelId}:user:{userId}:window:{bucket}`
- bot key 同理

实现策略：

- 以 `rateLimitWindowSec` 作为窗口长度
- 每次发送时自增窗口计数
- 若计数超过 `rateLimitCount` 则拒绝发送

错误文案：

- `发送过于频繁，请在 {{seconds}} 秒后再试`

### 重复消息拦截

在 Redis 中额外记录最近短窗口的消息内容摘要：

- key: `speak:dup:group:{groupId}:panel:{panelId}:user:{userId}`

策略：

- 取 `plain`，没有则取 `content`
- 连续在 `duplicateWindowSec` 内发送完全相同文本
- 达到 `duplicateLimit` 后拒绝发送

错误文案：

- `请勿短时间重复发送相同内容`

### 富媒体限制
通过简单判断 `content` 的 decorators/markdown 结构或 `meta` 内容区分：

- 纯文本
- 图片/文件/card/插件富消息

若规则中 `allowRichContent === false`，则仅允许纯文本消息

## 前端设计

### 面板设置
在 `client/web/src/components/modals/GroupPanel/ModifyGroupPanel.tsx` 中新增“发言治理”配置区：

- 启用发言治理：开关
- 默认成员规则
- 各角色规则
- 机器人规则
- 防刷屏规则
- 阅读辅助样式

建议使用折叠分区：

- 基础发言规则
- 角色规则
- 机器人规则
- 防刷屏
- 消息识别样式

### 当前禁言按钮的定位
`ChatInputBox/MuteAllButton.tsx` 不再只是“直接改 fallbackPermissions”

改造为：

- 作为“默认发言规则快捷开关”
- 若当前未启用 `speakPolicy`，点击时自动创建默认治理配置
- 按钮含义：
  - 开：默认成员允许发言
  - 关：默认成员不允许发言

若存在角色级例外，按钮下的 tooltip 明确说明：

- `当前仅切换默认成员发言状态，角色例外请到面板设置中调整`

### 面板高级权限与发言治理关系
页面上要明确：

- “谁能发言”首先取决于权限
- “能发言的人多久能发几次”取决于发言治理

避免用户误以为二者是重复功能

## 阅读优化设计

### 角色识别样式
不做整块气泡染色，采用轻识别方案：

1. 昵称颜色
2. 头像环颜色
3. 气泡侧边细色条

默认推荐 `combined`：

- 昵称轻色
- 头像环轻色
- 气泡侧边细色条

不建议直接更改整个气泡背景色，原因：

- 群消息多时会导致阅读噪音
- 深色模式难以统一
- 容易让聊天区变成彩色看板

### 落地位置
前端聊天渲染层主要改造：

- `ChatMessageList/Item.tsx`
- 角色颜色从群角色配置中读取
- 若用户有多个角色，取群内最高优先级角色或第一个命中显示角色

### 爬楼友好度
本轮做轻量优化：

1. 搜索跳转到消息后，目标消息高亮更明显
2. 时间块分隔更清晰
3. 长时间未读区间视觉区分更明显
4. 群聊中昵称与角色识别更稳定，减少“看不出是谁说的”

本轮不做：

- 线程化楼层
- 自动折叠消息簇
- AI 摘要桥接

## 机器人治理设计

### 统一纳入面板级发言治理
机器人消息不走单独 UI 体系，而是进入同一套 `speakPolicy`：

- 单独 `botRule`
- 更严的默认频率限制
- 可禁止机器人发送富媒体

### 后续兼容
若后续需要更复杂机器人策略，可在 `botRule.meta` 中继续扩展：

- 白名单机器人
- 每个机器人单独额度
- 机器人消息是否默认折叠

本轮不实现这些高级项

## 测试设计

### 服务端

1. 权限允许但频率超限，应拒绝发送
2. 权限允许但重复消息超限，应拒绝发送
3. 被个人禁言成员仍应优先被拦截
4. 不同角色命中规则时，应取最严格规则
5. 机器人命中 `botRule`
6. 富媒体被禁时，应阻止图片/文件/card 发送

### 前端

1. 面板设置可正确保存 `speakPolicy`
2. 快捷禁言按钮可切换默认发言规则
3. 角色样式配置能反映到群聊消息 UI
4. 搜索落点消息高亮能正常显示

## 兼容性与迁移

### 旧群兼容

- 没有 `speakPolicy` 的旧面板默认保持现状
- 不强制迁移历史数据
- 快捷禁言第一次使用时才创建最小配置

### 发布策略

建议分两步：

1. 先发后端能力与前端设置
2. 再发阅读优化与角色样式增强

但本轮实现可以在一个分支中完成，逻辑上仍保持两层独立改动

## 实现范围

### 本轮实现

1. 群面板 `speakPolicy` 数据结构
2. 群消息发送前的角色级频率限制
3. 机器人频率限制
4. 重复消息防刷屏
5. 面板设置中的发言治理配置 UI
6. 输入框旁快捷禁言按钮接到默认发言规则
7. 群聊角色识别样式增强
8. 搜索落点消息高亮增强

### 本轮不实现

1. AI 摘要
2. 自动折叠长楼层
3. 线程化楼中楼
4. 跨群统一治理后台
5. 全气泡背景色自由配置系统

## 风险与控制

### 风险 1：规则过多导致用户难理解
控制：

- 快捷入口只负责默认规则
- 高级设置分组折叠
- UI 文案明确区分“权限”和“治理”

### 风险 2：频率限制误伤正常聊天
控制：

- 默认限流值较宽松
- 仅在启用治理时生效
- 错误文案明确剩余等待时间

### 风险 3：角色视觉样式过重影响阅读
控制：

- 默认只开轻识别
- 不做整气泡背景染色
- 深色模式单独校正

## 结论
本方案在不推翻 Tailchat 既有群面板权限模型的前提下，补齐了：

- 面板级发言治理
- 角色级频率限制
- 机器人限流
- 防刷屏
- 高消息密度场景下的角色识别与基础爬楼友好性

它既能解决你当前提到的“禁言按钮不好用”“分组能不能说话”“刷屏怎么办”“机器人太多怎么办”“看不清是谁发的”等问题，也为后续更重的群治理能力留下了稳定扩展位。
