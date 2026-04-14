# 财富会客厅 (Wealth Lounge)

**财富会客厅** 是一款基于开源即时通讯平台 [Tailchat](https://github.com/msgbyte/tailchat) 深度定制的专属财富管家与交流平台。专为金融社群、投资理财和首席经济学家对话场景打造。

本项目在原开源版的基础上，进行了全方位的品牌重塑、界面优化、注册权限控制以及管理功能增强，以满足高端投资社群的私密性与品牌一致性要求。

---

## 💎 定制化功能特性 (Custom Features)

### 1. 品牌重塑与视觉优化 (Branding & UI)
- **全站品牌更名**：将系统内所有可见的 `Tailchat` 名称、文案替换为 `财富会客厅`。
- **专属主题色**：摒弃原有的紫色主题，采用符合金融属性的**暗金与深蓝**配色（主色调 `#0b192c`，高亮/悬浮色 `#d4af37`）。
- **登录页深度定制**：
  - 使用高清的首席经济学家海报（`caifuhuike.png` -> `bg.webp` 压缩优化至 67KB）作为右侧全屏背景。
  - 调整登录表单宽度（420px），修复了宽屏下的视觉失衡。
  - 移除了左下角多余的“服务端地址设置”和“中英切换”按钮。
  - 移除了所有开源组件 Logo（如 GitHub, Docker, React 等）。

### 2. 注册与身份控制 (Authentication & Registration)
- **多方式登录/注册**：在登录、注册及忘记密码页面，增加了美观的 **手机号 / 邮箱** 标签切换栏。
- **免验证码注册**：移除了原版强制的邮箱验证码（OTP）环节。
- **组织代码强制校验**：为保证社群私密性，注册页面新增必填的“组织代码”字段。**仅支持输入 `0813` 或 `朝闻道` 方可注册成功**，否则后端接口将直接拦截并返回错误。
- **移除游客模式**：关闭并移除了“游客访问”按钮，所有用户必须实名/注册登录。

### 3. 社群与频道管理 (Community Management)
- **一键全群禁言**：
  - 在聊天界面的输入框右侧（表情按钮旁）增加了一个“麦克风”快捷开关。
  - **仅频道管理员可见**。点击后可瞬间移除该频道普通用户的发送消息权限（`core.message`），按钮变红即代表“全员禁言中”；再次点击即可解除禁言。
- **插件中心权限隔离**：侧边栏的“插件中心”仅对拥有管理员权限的账号可见，普通用户无法浏览或安装插件。

### 4. 国际化与 SEO 优化 (I18n & SEO)
- **强制全局中文**：修改了系统底层的多语言嗅探逻辑（`language.ts`），无视用户浏览器的系统语言和本地缓存，强制应用永远以简体中文（`zh-CN`）渲染。
- **SEO 标签清理**：修改了底层的 HTML 模板（`template.html`）和 PWA 配置（`manifest.json`），移除了所有关于 Slack、Discord 和 Tailchat 的默认描述。将关键词替换为“财富会客厅,投资,理财,经济学家,宏观趋势,社群”。

---

## 🚀 部署指南 (Deployment Guide)

本项目采用前后端一体化的 Docker 镜像部署。

### 1. 获取最新代码
```bash
git clone https://github.com/您的用户名/tailchat-source.git my-tailchat-source
cd my-tailchat-source
```

### 2. 构建定制版 Docker 镜像
由于本项目对后端微服务（如注册逻辑、权限拦截）及前端构建产物均有深度修改，必须完整构建 Docker 镜像：
```bash
# 务必添加 --no-cache 防止使用旧版缓存
docker build --no-cache -t caifu-chat:latest .
```

### 3. 修改 docker-compose 配置并启动
在您的部署目录（例如 `/var/www/tailchat`）下，将 `docker-compose.yml` 中的镜像源替换为您刚打包的镜像：
```yaml
services:
  tailchat:
    image: caifu-chat:latest
    # ...其他配置保持不变
```
然后启动/重启容器：
```bash
docker compose up -d --force-recreate
```

---

## 🛡️ 管理后台访问 (Admin Dashboard)

管理后台是独立的模块，需额外启动 `admin.yml` 配置：

1. 下载管理端配置：
   ```bash
   wget https://raw.githubusercontent.com/msgbyte/tailchat/master/docker/admin.yml -O admin.yml
   ```
2. 在 `docker-compose.env` 中设置管理员账号密码：
   ```env
   ADMIN_USER=admin
   ADMIN_PASS=caifuhuike123
   ```
3. 启动后台服务：
   ```bash
   docker compose -f docker-compose.yml -f admin.yml up -d
   ```
4. 浏览器访问 `https://您的域名/admin/` 进行管理。

---
*Powered by Tailchat, Customized for 财富会客厅.*
