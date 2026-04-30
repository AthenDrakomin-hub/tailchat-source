# 管理端第三轮统一能力探测与错误处理设计

## 目标

在前两轮基础上，继续把管理端的“可用性判断”和“错误展示/错误返回”收敛成统一模式，减少剩余零散的 500/503、裸字符串错误以及各页面各自为战的降级逻辑。

## 本轮范围

- 为前端新增统一能力状态类型 `FeatureState`
- 让 `站点配置` 接入 `FeatureState` 与 `formatAdminError`
- 让后端 `auth` 中间件、`file` 上传路由、`config` 路由返回更一致的结构化错误
- 补第三轮回归测试

## 非目标

- 不重写整个 Admin 后端错误处理框架
- 不一次性改造所有资源页的接口协议
- 不处理工作区历史类型问题

## 设计结论

### 1. 统一能力状态

新增：

- `server/admin/src/client/utils/feature-state.ts`

定义：

- `available`
- `reason`
- `actionHint`

作用：

- 让自定义页面共享同一套可用性语义

### 2. 站点配置页收口

当前问题：

- 仍残留 `Message.error(String(err))`
- 页面可用性语义没有显式类型

改法：

- 使用 `FeatureState`
- 所有保存/上传错误统一改为 `formatAdminError`

### 3. 后端结构化错误

当前问题：

- `auth.ts` 直接 `res.status(401).end(...)`
- `file.ts` 存在字符串或对象原样输出
- `config.ts` 虽然部分结构化，但 `actionHint` 缺失

改法：

- 全部统一至少返回：
  - `success: false`
  - `error`
  - 按场景补 `available` / `actionHint`

### 4. 验证方式

- `node --test server/admin/tests/admin-hardening.test.mjs`
- `pnpm --filter tailchat-admin build:client`
