# 財訊 - 高质量金融交流IM

基于 [TailChat](https://tailchat.msgbyte.com/) 二次开发的高质量金融交流即时通讯平台。

## 项目概述

**財訊 IM** 是一款专为金融行业打造的高质量即时通讯解决方案，提供安全、稳定、高效的团队协作与沟通体验。

### 主要功能

- 💬 **即时通讯** - 支持一对一私聊、群组聊天
- 📁 **文件传输** - 快速安全的文件分享
- 🎥 **音视频会议** - 集成 LiveKit 视频通话
- 🔔 **实时通知** - 即时的消息提醒
- 🎨 **主题定制** - 微信风格界面设计
- 🌙 **暗色模式** - 舒适的夜间使用体验
- 📱 **PWA 支持** - 可安装为桌面/移动应用

### 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI 组件 | TDesign + Tailwind CSS |
| 后端服务 | Node.js + MongoDB + Redis |
| 实时通讯 | WebSocket + LiveKit |
| 部署方式 | Docker Compose |
| 域名 | goodspage.cn |

## 当前版本修改记录

### P0 - 核心体验修复
- ✅ **消息气泡对齐修复** - 修复 Item.tsx 中 justify-content 和 order 顺序问题

### P1 - 登录页重构
- ✅ **删除登录页文字** - 精简登录界面
- ✅ **删除底部链接竖线** - 优化视觉体验
- ✅ **Logo 修复** - 优化品牌标识显示
- ✅ **奢华金融氛围** - 整体视觉风格升级
- ✅ **偷看密码动画** - PeekingCharacters 组件
- ✅ **右侧面板** - LuxuryFinancePanel 奢华金融信息面板

### P2 - 品牌内容清理
- ✅ **繁简统一** - 统一使用繁体中文
- ✅ **删除 Alpha 开关** - 移除测试功能入口
- ✅ **删除服务与支持页面** - 简化导航
- ✅ **删除下载客户端入口** - Navbar 中移除 DownloadNav 组件
- ✅ **微信式会话改名** - 会话列表改为"对话"

### P3 - 功能体验优化
- ✅ **明亮模式白色文字修复** - 修复暗色文字在亮色背景显示问题
- ✅ **ProfilePanel 重新设计** - 用户资料面板全新设计
- ✅ **动态功能 REST 路由** - 优化内部 API 调用
- ✅ **内部链接跳转** - 修复内部导航链接

## 部署说明

### 环境要求
- Docker & Docker Compose
- 最低 4GB RAM
- 20GB 可用磁盘空间

### 启动服务

```bash
# 拉取代码
git clone <repository-url>
cd tailchat-source

# 构建镜像
docker compose build --no-cache

# 启动服务
docker compose up -d

# 查看状态
docker compose ps
```

### 服务端口
- Web UI: `http://goodspage.cn:11000`
- API: `http://goodspage.cn:13030`

## 项目结构

```
tailchat-source/
├── client/              # 前端客户端
│   └── web/            # Web 应用
├── server/             # 后端服务
│   ├── admin/         # 管理后台
│   └── plugins/       # 插件系统
├── docker-compose.yml  # Docker 编排配置
└── README.md          # 项目文档
```

## 注意事项

1. 本项目基于 TailChat 开源项目进行二次开发
2. 生产环境部署请确保正确配置环境变量
3. 定期更新依赖和 Docker 镜像以获得安全更新

## 许可证

基于 TailChat 原有许可证，遵循开源协议。
