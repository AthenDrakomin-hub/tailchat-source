# 专属虚拟电话局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现一个免登录、防微信风控、阅后即焚（单次一对一）的极简专属语音通话链接功能。

**Architecture:** 
1. 后端 `LivekitService` 增加 Redis 短链生成与解析 API，控制 24 小时过期与单次读取销毁。
2. 核心网关 `gateway.service.ts` 拦截 `/t/:code`，如果是微信则返回静态防封页面，否则 302 重定向到前端接听页。
3. 前端新增 `GuestCallView` 路由，呈现极简接听 UI，并实现双向挂断联动。
4. 前端通话面板新增【生成专属通话链接】按钮。

**Tech Stack:** Node.js, Moleculer (gateway), Redis (ioredis), React, LiveKit, TailwindCSS.

---

### Task 1: 后端 - 短链存储与 API 实现

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/services/livekit.service.ts`

- [ ] **Step 1: 引入 Redis 并在 `onInit` 中初始化**
在 `livekit.service.ts` 顶部引入 `ioredis`，在 `LivekitService` 类中声明 `redisClient`。

```typescript
import Redis from 'ioredis';
// ... existing imports

export default class LivekitService extends TcService {
  redisClient: Redis;

  onInit() {
    this.redisClient = new Redis(config.redisUrl, {
      keyPrefix: 'tailchat:livekit:shortlink:',
    });
    // ... existing onInit
```

- [ ] **Step 2: 注册新 API 并加入白名单**
在 `onInit` 方法中注册 `generateShortLink` 和 `getAndBurnShortLink`，并将后者加入免登录白名单。

```typescript
    this.registerAction('generateShortLink', this.generateShortLink, {
      params: {
        roomId: 'string',
      },
    });

    this.registerAction('getAndBurnShortLink', this.getAndBurnShortLink, {
      params: {
        code: 'string',
      },
    });

    this.registerAuthWhitelist([
      '/webhook',
      '/generateGuestToken',
      '/getAndBurnShortLink', // 允许访客免登录获取
    ]);
```

- [ ] **Step 3: 实现 `generateShortLink` 方法**
生成 6 位随机短码，将房间信息、邀请人昵称和头像存入 Redis，TTL 设为 24 小时。

```typescript
  async generateShortLink(
    ctx: TcContext<{ roomId: string }>
  ) {
    const { roomId } = ctx.params;
    const userId = ctx.meta.userId;
    
    // 获取邀请人信息
    const user = await ctx.call('user.getUserInfo', { userId });
    const inviterName = user?.nickname || '未知用户';
    const inviterAvatar = user?.avatar || '';

    // 生成 6 位随机短码
    const code = Math.random().toString(36).substring(2, 8);
    const data = JSON.stringify({ roomId, inviterName, inviterAvatar });

    // 存入 Redis，24 小时过期
    await this.redisClient.set(code, data, 'EX', 24 * 60 * 60);

    return { code };
  }
```

- [ ] **Step 4: 实现 `getAndBurnShortLink` 方法 (阅后即焚)**
读取短链信息，如果存在则立即从 Redis 中删除（保证一对一单次有效）。

```typescript
  async getAndBurnShortLink(
    ctx: TcContext<{ code: string }>
  ) {
    const { code } = ctx.params;
    
    // 原子操作：读取并删除（阅后即焚）
    // 注意：如果是较老版本的 redis 可能不支持 GETDEL，我们可以用 multi 或分开执行
    const data = await this.redisClient.get(code);
    if (!data) {
      throw new Error('通话链接已失效或已被他人接听');
    }
    
    await this.redisClient.del(code);

    return JSON.parse(data);
  }
```

### Task 2: 网关层 - 微信防封拦截与重定向

**Files:**
- Modify: `server/services/core/gateway.service.ts`

- [ ] **Step 1: 在 `getRoutes()` 中添加 `/t/:code` 拦截路由**
找到 `getRoutes()` 方法，在最后面的 `path: '/'` (静态文件代理) **之前**，插入新的路由对象。

```typescript
// ... 找到 // static (这部分代码之前)
      {
        path: '/t/:code',
        authentication: false,
        authorization: false,
        aliases: {
          async 'GET /'(
            this: TcService,
            req: any,
            res: any
          ) {
            const code = req.$params.code;
            const userAgent = String(req.headers['user-agent'] || '').toLowerCase();

            // 微信环境防封拦截
            if (userAgent.includes('micromessenger')) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.write(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                    <title>专属语音通话</title>
                    <style>
                      body { background-color: #333; color: white; font-family: sans-serif; text-align: center; padding-top: 50px; margin: 0; }
                      .arrow { font-size: 40px; text-align: right; padding-right: 30px; margin-top: -30px; color: #07c160; }
                      .box { background: #444; padding: 30px 20px; margin: 20px; border-radius: 12px; }
                      h2 { font-size: 20px; margin-bottom: 10px; }
                      p { font-size: 15px; color: #aaa; line-height: 1.5; }
                    </style>
                  </head>
                  <body>
                    <div class="arrow">↗</div>
                    <div class="box">
                      <h2>为保证通话质量与隐私安全</h2>
                      <p>请点击右上角【...】<br/>选择在<strong>系统浏览器</strong>中打开</p>
                    </div>
                  </body>
                </html>
              `);
              res.end();
              return;
            }

            // 非微信环境，302 重定向到前端真正的接听页
            res.writeHead(302, { Location: \`/#/plugin/com.msgbyte.livekit/guest/\${code}\` });
            res.end();
          },
        },
        mappingPolicy: 'restrict',
      },
// ... 原有的 path: '/'
```

### Task 3: 前端 - 极简拟真来电 UI (`GuestCallView`)

**Files:**
- Create: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/GuestCallView.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx`

- [ ] **Step 1: 创建 `GuestCallView.tsx`**
实现数据获取、极简接听界面（不输入昵称，只显邀请人）、双向挂断联动。

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { request, LoadingSpinner, Avatar, Icon, showToasts } from '@capital/common';
import { LiveKitRoom, RoomAudioRenderer, useRoomContext, useParticipants } from '@livekit/components-react';
import { useToken } from '../utils/useToken';
import { useLivekitConfig } from '../utils/useLivekitConfig';

interface LinkInfo {
  roomId: string;
  inviterName: string;
  inviterAvatar: string;
}

const IncomingCallUI: React.FC<{ info: LinkInfo; onAccept: () => void }> = ({ info, onAccept }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
    <div className="mb-12 flex flex-col items-center">
      <div className="relative">
        <Avatar src={info.inviterAvatar} name={info.inviterName} size={100} className="relative z-10" />
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping z-0 scale-150" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">{info.inviterName}</h2>
      <p className="mt-2 text-gray-400">邀请您进行专属语音通话</p>
    </div>
    
    <div className="flex gap-16 mt-12">
      <button 
        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        onClick={() => window.close()}
      >
        <Icon icon="mdi:phone-hangup" className="text-3xl" />
      </button>
      <button 
        className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-bounce hover:bg-green-600 transition-colors"
        onClick={onAccept}
      >
        <Icon icon="mdi:phone" className="text-3xl" />
      </button>
    </div>
  </div>
);

const ActiveCallUI: React.FC<{ info: LinkInfo }> = ({ info }) => {
  const room = useRoomContext();
  const participants = useParticipants();

  // 双向挂断检测：如果房间里只剩自己（邀请人离线了），自动挂断
  useEffect(() => {
    if (room.state === 'connected' && participants.length <= 1) {
      showToasts('对方已结束通话');
      room.disconnect();
    }
  }, [participants.length, room.state]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
      <div className="mb-12 flex flex-col items-center">
        <Avatar src={info.inviterAvatar} name={info.inviterName} size={100} />
        <h2 className="mt-6 text-xl">{info.inviterName}</h2>
        <p className="mt-2 text-green-400 font-mono">00:00 通话中...</p>
      </div>
      <div className="mt-12">
        <button 
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          onClick={() => room.disconnect()}
        >
          <Icon icon="mdi:phone-hangup" className="text-3xl" />
        </button>
      </div>
      <RoomAudioRenderer />
    </div>
  );
};

export const GuestCallView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const livekitConfig = useLivekitConfig();
  
  // 随机生成固定访客昵称（免输入）
  const [guestName] = useState(() => \`Guest_\${Math.floor(Math.random() * 10000)}\`);
  const token = useToken(info?.roomId || '', { userInfo: { name: guestName } });

  useEffect(() => {
    request.post('plugin:com.msgbyte.livekit/getAndBurnShortLink', { code })
      .then(({ data }) => setInfo(data))
      .catch((err) => setError(err.message || '链接已失效或已被使用'));
  }, [code]);

  if (error || callState === 'ended') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
        <Icon icon="mdi:phone-off" className="text-6xl text-gray-500 mb-4" />
        <p className="text-xl">{error || '通话已结束'}</p>
      </div>
    );
  }

  if (!info) return <LoadingSpinner />;

  if (callState === 'incoming') {
    return <IncomingCallUI info={info} onAccept={() => setCallState('connected')} />;
  }

  if (!token || !livekitConfig.url) return <LoadingSpinner />;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitConfig.url}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={() => setCallState('ended')}
    >
      <ActiveCallUI info={info} />
    </LiveKitRoom>
  );
};
```

- [ ] **Step 2: 注册路由**
在 `index.tsx` 引入并注册根路由。

```tsx
// 在 server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx
import { GuestCallView } from './components/GuestCallView';

// ... 在 existing regPluginRootRoute 旁边添加
regPluginRootRoute({
  name: 'guest-call',
  path: '/guest/:code',
  component: GuestCallView,
});
```

### Task 4: 前端 - 增加生成链接的按钮

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/ControlBar.tsx`

- [ ] **Step 1: 在 `ControlBar` 中添加【生成专属短链】按钮**
找到现有的 `handleShare` 逻辑，将其替换或新增一个专属短链生成的逻辑。

```tsx
// 在 ControlBar.tsx 中
import { request, copyToClipboard, showToasts } from '@capital/common';

// ... 找到 const handleShare = () => {
  const handleShareShortLink = async () => {
    try {
      const { data } = await request.post('plugin:com.msgbyte.livekit/generateShortLink', {
        roomId: room.name,
      });
      const link = \`\${window.location.origin}/t/\${data.code}\`;
      copyToClipboard(link);
      showToasts('专属通话链接(单次有效)已复制！', 'success');
    } catch (err) {
      showToasts('生成失败: ' + err.message, 'error');
    }
  };

// ... 在 return JSX 中的按钮部分，替换或新增：
      <button className="lk-button" onClick={handleShareShortLink} title="生成阅后即焚通话链接">
        {showIcon && <Icon icon="mdi:link-variant" />}
        {showText && '专属通话链接'}
      </button>
```

- [ ] **Step 2: 编译前后端**
完成上述所有修改后，分别在 `server` 和 `client/web` 目录下执行构建。
```bash
cd server && pnpm tsc --noEmit
cd client/web && pnpm tsc --noEmit
```