# Tasks
- [x] Task 1: 执行全局审计分析：拉起搜索智能体(search agent)扫描整个代码库（如 `client`, `server`, `packages` 等），识别未使用的依赖、死代码、不规范的代码结构以及过期的配置。
- [x] Task 2: 优化依赖和配置文件：根据审计结果，清理或升级根目录以及各子包 `package.json` 中的冗余依赖，并优化 `tsconfig.json` 等配置。
- [x] Task 3: 修复代码规范问题：针对审计发现的具体代码问题（如未使用变量、冗余 import、不符合规范的命名等）进行细节修改，并保证业务逻辑一致。
- [x] Task 4: 清理无用文件与资源：删除审计中确定的已废弃文件、遗留的空文件夹或不再使用的资源。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1
