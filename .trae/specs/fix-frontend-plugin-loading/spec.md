# Fix Frontend Plugin Loading Error Spec

## Why
用户在访问应用时，浏览器控制台抛出了大量类似 `Uncaught SyntaxError: Unexpected token '<'` 和 `Error: Cannot load script: @plugins/com.msgbyte.meeting` 的错误。
这说明前端在尝试加载特定的 JavaScript 文件（如插件 JS 文件 `hls.js`、`com.msgbyte.meeting.js` 等）时，由于路径映射不正确或缺少 Nginx/Traefik 配置，服务器返回了 `index.html` 的内容（它的第一个字符是 `<`），而不是实际的 JS 代码，从而导致 JS 引擎解析失败。

## What Changes
- 调查前端构建目录中的插件文件存放路径。
- 确认 Traefik/网关 在处理 `/plugins/` 或者动态资源的路由是否被 fallback 到了前端的 `index.html`。
- 如果需要，修复或配置 Nginx/Traefik 确保前端插件和静态资源 JS 请求被正确代理到实际的文件。

## Impact
- Affected specs: 静态资源和前端插件文件的路由代理规则。
- Affected code: 可能是 `docker-compose.yml` 中的 Traefik label，或是服务端的静态文件挂载路径配置。

## ADDED Requirements
### Requirement: Frontend Static Resource Routing
静态文件（如 `.js`, `.css`, 插件文件）应当被正确返回其自身的内容，不应 fallback 到 `index.html`。

#### Scenario: Success case
- **WHEN** 浏览器请求 `https://chat.yefeng.us.cc/plugins/com.msgbyte.meeting.js` 或类似脚本
- **THEN** 返回 `application/javascript` 类型的脚本内容，而不是 `text/html` 的页面。