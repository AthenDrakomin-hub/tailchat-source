# 管理端第四轮运行时加固设计

## 目标

继续收口剩余高风险页面与接口，优先处理：

- `network`
- `analytics`
- `system-notify`
- 与它们直接相关的后端接口错误协议

## 设计要点

1. 前端页面继续沿用 `FeatureStatusCard` 与 `formatAdminError`
2. `network` 页面在接口失败时进入统一降级态
3. `analytics` 页面不再默认假设所有图表接口都可用，至少在主面板层给出降级提示
4. `system-notify` 页面提交失败时使用统一错误提示
5. 后端 `login`、`callAction`、`users/system/notify`、`network` 相关路由改为更一致的结构化错误返回

## 验收

- 第四轮新增回归测试通过
- `pnpm --filter tailchat-admin build:client` 通过
