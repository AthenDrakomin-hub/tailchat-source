# Fix MinIO Undefined Bucket Name Initialization Spec

## Why
在 `service-core` 启动过程中，`minio.mixin.js` 的 `started()` 生命周期钩子会调用 `ping()` 方法来检测 MinIO 后端是否连通。如果在 `ping()` 的具体实现中涉及到对 `bucketName` 的使用，且此时由于 Moleculer 服务初始化顺序或上下文参数未绑定导致传入的是 `undefined`，就会抛出 `Invalid bucket name : undefined` 并导致 `MinioInitializationError`。
之前我们修复了 `file.service.ts` 的 `bucketName` getter 以及 `bucketExists` 的处理，但从日志看，崩溃是在 `minio.mixin.js` 的 `started()` -> `ping()` 链路中抛出的，需要彻底排查 `ping()` 中为什么会缺少 `bucketName`。

## What Changes
- 定位 `minio.mixin.ts` 中 `ping()` 函数的实现。
- 修复 `ping()` 方法中获取 `bucketName` 或使用 `bucketName` 时的 `undefined` 问题（添加环境变量 fallback 或默认值 `'tailchat'`）。
- 确保在 `started()` 钩子调用 `ping()` 时，不会因为缺失 `bucketName` 参数导致整个微服务节点崩溃。

## Impact
- Affected specs: 核心服务启动时的 MinIO 健康检查与初始化逻辑。
- Affected code: `server/packages/sdk/src/services/mixins/minio.mixin.ts` (以及编译后的 `.js` 文件)。

## MODIFIED Requirements
### Requirement: MinIO Health Check Initialization
在服务启动和定时的健康检查中，调用的 `ping()` 方法必须能够正确识别 `bucketName`，不应再抛出 `Invalid bucket name : undefined` 错误。

#### Scenario: Success case
- **WHEN** 容器启动，执行 `minio.mixin` 的 `started()` 钩子
- **THEN** `ping()` 成功执行，如果没有外部传入的 `bucketName`，默认使用环境变量 `process.env.MINIO_BUCKET_NAME` 或 `'tailchat'`，服务成功启动不报错。
