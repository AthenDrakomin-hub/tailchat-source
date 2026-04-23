# ⭐️⭐️ 日斗投资财富交流会（2.0.0 版本） ⭐️⭐️

全新升级的面向价值投资交流的私密社区系统：移除了冗余插件，细节打磨，专注于核心插件【伪直播授课模式】【机器人小号活跃群】【语音视频选股诊股个性主体化】【web网页端/PWA多端】【插件扩展】集成构建。

本项目基于开源即时通讯底座 Tailchat 深度定制与精简，目标是“可长期维护、可从仓库一键复现部署、功能聚焦、合规表达清晰”。

## 1. 项目定位（你能用它做什么）

搭建一个「价值投资/宏观/风控」主题的交流社区：群组（Guild）+ 频道（Panel）+ 私信（DM）。
*   **用“语录/金句”塑造氛围**：登录/注册、侧栏、聊天空态都会出现“今日一句/每日一句”。
*   **把合规提醒放在正确位置**：应用内 **关于页** 提供《投资风险安全宣言》全文；注册时必须勾选确认（不勾选无法注册）。
*   **免验证便捷注册**：为降低门槛并兼顾社群运营私密性（通过组织代码拦截），本项目默认**不做邮箱强制验证，也不做手机号强制验证**，用户填入账号和密码即可快速加入。

## 2. 精简版保留的核心能力（免费方案优先）

### 2.1 私信语音通话（LiveKit）
使用开源免费方案 LiveKit 作为 RTC 能力基础。
*   **产品策略**：偏“语音沟通”，避免变成视频会议（可配置强制语音/禁用摄像头入口）。

### 2.2 伪直播（MP4 → HLS）
管理员/运营可发起“伪直播”：上传 MP4 后转为 HLS 分片流推送观看。
*   **适用场景**：复盘讲解、课程回放、固定时段直播间等场景。

### 2.3 机器人小号（Bot）
支持机器人接入与小号运营（强调：不强绑付费 AI，不走烧钱路线）。

## 3. 项目已做过的关键工程治理（从“能跑”到“稳定可复现”）

以下是本项目迭代过程中真实发生过的工程问题与处理方向（便于维护者理解“为什么这样改”）。

*   **MinIO / 文件服务启动期异常**：对启动期 bucket 检查做了容错处理，避免未捕获异常导致服务退出。
*   **插件容器反复重启**：对 SDK 与插件版本兼容问题做了向后兼容补齐，保证精简版仍能稳定启动。
*   **精简插件体系**：移除不需要/付费/三方依赖重的插件；采用白名单方式加载需要的插件服务，降低维护面。
*   **反代与静态资源链路**：修复过静态 chunk 缓存/缺失导致的白屏问题；部署层面支持 Traefik/Nginx 组合反代。

## 4. 技术架构概览

*   **后端**：Node.js + TypeScript + Moleculer 微服务
*   **缓存/通信**：Redis (Transporter / Cacher)
*   **数据库**：MongoDB (主数据存储)
*   **对象存储**：MinIO (文件/上传)
*   **前端**：Web（Tailchat Web 客户端），支持 PWA（manifest、icons、service worker）
*   **主题**：沉稳暖金（支持 light/dark 两套 Logo 自动切换）
*   **音视频**：LiveKit Server（开源）

## 5. 快速开始（Docker Compose 推荐）

### 5.1 服务器环境要求
*   Docker & Docker Compose
*   建议 **2C4G** 起（首次构建前端/后端镜像时更稳）

### 5A. 一键部署（从 GitHub 拉取即部署）
**目标**：新服务器只需要复制一条命令，即可完成：安装 Docker（Ubuntu/Debian）→ 拉取仓库 → 构建镜像 → 启动服务。
**原则**：代码进 GitHub，敏感配置不进 GitHub（真实密钥只放在服务器的 `docker-compose.env`）。

**在新服务器上一键部署（复制以下命令执行）：**
```bash
curl -fsSL https://raw.githubusercontent.com/AthenDrakomin-hub/tailchat-source/main/scripts/deploy.sh | bash
```

如果脚本提示你需要编辑 `docker-compose.env`，请执行：
```bash
nano /var/www/tailchat-source/docker-compose.env
```
填好 API_URL / SECRET / ADMIN / MINIO / LIVEKIT_* 后再启动：
```bash
cd /var/www/tailchat-source && docker compose up -d && docker compose ps
```

### 5B. 手动拉取与配置部署
#### 5B.1 拉取代码
```bash
git clone "https://github.com/AthenDrakomin-hub/tailchat-source.git"
cd tailchat-source
```

#### 5B.2 配置环境变量
编辑根目录 docker-compose.env（至少确认这些字段）：
*   SECRET：JWT 签名密钥（建议随机长字符串）
*   API_URL：外部访问地址（例如 "https://chat.example.com" 或 "http://<server-ip>:11000"）
*   `ADMIN_USER` / `ADMIN_PASS`：管理端账号密码
*   `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`：MinIO 管理账号密码
*   `LiveKit` 相关（如启用私信语音）：`LIVEKIT_URL` / `LIVEKIT_PUBLIC_URL` / `LIVEKIT_KEYS` 等

> **说明**：`API_URL` 不正确会导致上传文件/图片访问异常，这是部署中最常见的“看似能登录但图片打不开”问题。

#### 5B.3 “永远不踩坑”的固定发版流程
为了避免新服务器性能不足导致编译卡死，以及“不知道现在跑的是不是最新版”的焦虑，后续的标准流程固定为：“**GitHub = 源码真相 / 老服务器 = 构建机 / 新服务器 = 只拉镜像运行**”。

**第一步：代码推送到 GitHub（源码真相）**
在您修改代码的机器上执行：
```bash
cd /var/www/tailchat-source && git add -A && git commit -m "chore: update" && git push origin main
```

**第二步：老服务器（构建并推镜像）**
老服务器永远先拉最新代码再 build + push。只要跑这条一键命令即可：
```bash
cd /var/www/tailchat-source && git pull --rebase && bash scripts/build-push.sh
```
*(执行完毕后会输出一行类似 NEW_IMAGE=athendrakomin/caifu-chat:20260423-1045，请复制这个 tag 值)*

**第三步：新服务器（换 tag 并拉起）**
新服务器只做 pull + up（不编译），把刚才生成的 TAG 替换到命令中执行：
```bash
cd /var/www/tailchat-source && IMAGE_TAG="20260423-1045" bash scripts/pull-up.sh
```

**默认入口（示例）：**
*   **Web**：http://<server-ip>:11000/
*   **Admin**：http://<server-ip>:11000/admin/

## 6. 日常运维与自检 (Ops & Healthcheck)

为了方便快速判断：证书、端口、容器、反代、页面是否还正常，可以直接在服务器（如 payforme）上复制执行以下“一键自检”命令：

```bash
bash -lc 'set -e;
echo "=== TIME/OS ==="; date; uname -a; echo;
echo "=== DISK/MEM ==="; df -h / | tail -n 1; free -h; echo;
echo "=== NGINX TEST ==="; nginx -t; echo;
echo "=== CERT EXPIRE (wm + goodspage) ===";
for c in /etc/letsencrypt/live/wm.goodspage.cn/fullchain.pem /etc/nginx/ssl/goodspage.cn.fullchain.pem; do
  echo "--- $c";
  [ -f "$c" ] && openssl x509 -in "$c" -noout -subject -dates 2>/dev/null || echo "MISSING";
done; echo;
echo "=== PORTS (80/443/11000/7880) ===";
ss -lntp | egrep ":80 |:443 |:11000 |:7880 " || true; echo;
echo "=== DOCKER COMPOSE PS ===";
cd /var/www/tailchat-source && docker compose ps; echo;
echo "=== HEALTHCHECK ===";
curl -I "https://goodspage.cn" | head -n 5 || true;
curl -I "https://wm.goodspage.cn" | head -n 5 || true;
curl -I "http://127.0.0.1:11000" | head -n 5 || true;
curl -I "http://127.0.0.1:7880" | head -n 5 || true;
echo;
echo "=== RECENT ERRORS (nginx) ===";
tail -n 30 /var/log/nginx/error.log || true;
'
```

> **建议**：强烈建议您在每次更新后访问 "https://goodspage.cn" 时，在页面的 HTML 源码或某个接口中预留版本标识（如 commit hash 或上述的时间戳 TAG），这样能一眼看出当前运行的是否为最新版本。

## 7. 品牌与内容体系（沉稳暖金 / 中英同显 / 语录随处可见）

### 7.1 品牌命名
*   **中文**：日斗投资财富交流会
*   **英文**：RIDOU INVESTMENT
*   **展示策略**：中英同显（例如 “日斗投资财富交流会 · RIDOU INVESTMENT”）

### 7.2 双 Logo
根据明暗主题自动切换：
*   **light**：浅底版本
*   **dark**：黑底金字版本

### 7.3 语录体系
**展示位置（当前默认）**：
*   **登录/注册页**：品牌标题下方展示“每日一句”
*   **主界面侧栏**：底部展示“今日一句”
*   **聊天空态**：无消息时显示引导语 + 语录
*   **语录来源**：以项目内置语录库为基础，可按运营需求迭代替换。

## 8. 合规与风险提示

本项目强调“交流学习”属性：
*   应用内 **关于页** 提供《投资风险安全宣言》全文。
*   注册流程要求用户勾选确认（未勾选不允许注册）。
*   **提醒**：任何观点、语录、案例仅用于交流氛围与价值观表达，不构成投资建议。

## 9. 常见问题（FAQ）

### 9.1 服务起来了但页面还是旧的/白屏
大概率是 PWA/service worker 缓存导致。建议在浏览器 DevTools：
1.  Application → Clear storage → Clear site data
2.  Service Workers → 勾选 Update on reload 然后强制刷新（Ctrl+F5 / Cmd+Shift+R）。

### 9.2 插件服务日志提示找不到某些 services 文件
精简版采用白名单/按需加载，若看到 “no matched file for pattern …” 的警告，请先确认：
1.  你期望启用的插件是否已在后端镜像中构建并安装
2.  `docker-compose` 是否加载了正确的服务目录/白名单配置

## 10. 版权与鸣谢
*   **底座项目**：Tailchat（MsgByte）
*   本项目为二次开发与定制版本，保留原项目许可与声明。
