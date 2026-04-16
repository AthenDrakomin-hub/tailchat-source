# Tasks
- [ ] Task 1: 检查前端静态插件目录结构和 Traefik 路由规则
  - [ ] SubTask 1.1: 确认前端构建目录（`client/web/dist` 或相关插件打包输出目录）中是否包含这些报错的插件文件。
  - [ ] SubTask 1.2: 检查 Traefik 的 `docker-compose.yml` 配置，确认针对 `/plugins` 或相关静态资源路径是否有配置专门的路由或者导致了意外拦截。
- [ ] Task 2: 修复 Nginx 或 Traefik 代理规则
  - [ ] SubTask 2.1: 在 Nginx 或 Traefik 层面增加针对前端动态插件文件的正确转发或挂载。
- [ ] Task 3: 重新部署和验证
  - [ ] SubTask 3.1: 应用新的配置文件，并验证 `hls.js` 等脚本能否正常加载。