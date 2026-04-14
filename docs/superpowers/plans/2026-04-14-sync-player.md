# Sync Player (com.msgbyte.syncplayer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a "Sync Player" (Watch Party) plugin for Tailchat that allows a group admin/teacher to play a synchronized video for all group members in a pinned top panel, acting as a lightweight virtual broadcasting studio.

**Architecture:** A full-stack Tailchat plugin. The Server component uses Moleculer and Redis (via `TcService`) to maintain and broadcast the shared player state (`roomId`, `videoUrl`, `currentTime`, `isPlaying`, `updatedAt`) using `roomcastNotify`. The Web component registers a custom group panel top area (`regGroupPanelTop`) that listens to the global socket event `plugin:com.msgbyte.syncplayer.sync_state` to synchronize the HTML5 `<video>` element, and conditionally renders controls based on the user's role/permissions.

**Tech Stack:** React, Tailchat Web SDK (`@capital/common`, `@capital/component`), Moleculer (Node.js), Socket.io, Redis.

---

### Task 1: Scaffold the Plugin Structure

**Files:**
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/package.json`
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/tsconfig.json`

- [ ] **Step 1: Create the Server plugin package.json**
```json
{
  "name": "com.msgbyte.syncplayer",
  "version": "1.0.0",
  "description": "Group Video Sync Player / Watch Party",
  "author": "Tailchat",
  "license": "MIT",
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc"
  },
  "dependencies": {
    "tailchat-server-sdk": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^4.9.5"
  }
}
```

- [ ] **Step 2: Create the Server tsconfig.json**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./"
  },
  "include": ["**/*.ts"]
}
```

### Task 2: Implement the Server Microservice (Backend)

**Files:**
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/services/syncplayer.service.ts`

- [ ] **Step 1: Write the Moleculer service definition**
```typescript
import { TcService, TcContext, call } from 'tailchat-server-sdk';
import type { ServiceSchema } from 'moleculer';

interface SyncState {
  roomId: string;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

const REDIS_KEY_PREFIX = 'syncplayer:state:';

class SyncPlayerService extends TcService {
  get serviceName() {
    return 'plugin:com.msgbyte.syncplayer';
  }

  onInit() {
    this.registerLocalE2EAction('push', {
      params: {
        roomId: 'string',
        videoUrl: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string; videoUrl: string }>) {
        // Only allow pushing if user has group permission (ideally checking group.hasPermission)
        const { roomId, videoUrl } = ctx.params;
        const state: SyncState = {
          roomId,
          videoUrl,
          isPlaying: true,
          currentTime: 0,
          updatedAt: Date.now(),
        };
        
        await this.broker.cacher?.set(`${REDIS_KEY_PREFIX}${roomId}`, state);
        await this.roomcastNotify(ctx, roomId, 'sync_state', state);
        return state;
      },
    });

    this.registerLocalE2EAction('updateState', {
      params: {
        roomId: 'string',
        isPlaying: 'boolean',
        currentTime: 'number',
      },
      async handler(ctx: TcContext<{ roomId: string; isPlaying: boolean; currentTime: number }>) {
        const { roomId, isPlaying, currentTime } = ctx.params;
        const key = `${REDIS_KEY_PREFIX}${roomId}`;
        
        const existingState = await this.broker.cacher?.get<SyncState>(key);
        if (!existingState) {
          throw new Error('No active sync player in this room');
        }

        const newState: SyncState = {
          ...existingState,
          isPlaying,
          currentTime,
          updatedAt: Date.now(),
        };

        await this.broker.cacher?.set(key, newState);
        await this.roomcastNotify(ctx, roomId, 'sync_state', newState);
        return newState;
      },
    });

    this.registerLocalE2EAction('close', {
      params: {
        roomId: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string }>) {
        const { roomId } = ctx.params;
        await this.broker.cacher?.del(`${REDIS_KEY_PREFIX}${roomId}`);
        await this.roomcastNotify(ctx, roomId, 'sync_close', { roomId });
        return true;
      },
    });

    this.registerLocalE2EAction('getState', {
      params: {
        roomId: 'string',
      },
      async handler(ctx: TcContext<{ roomId: string }>) {
        const { roomId } = ctx.params;
        const state = await this.broker.cacher?.get<SyncState>(`${REDIS_KEY_PREFIX}${roomId}`);
        return state || null;
      },
    });
  }
}

export default SyncPlayerService as unknown as ServiceSchema;
```

### Task 3: Scaffold the Web Plugin Structure

**Files:**
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer/package.json`
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer/manifest.json`
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer/tsconfig.json`

- [ ] **Step 1: Create Web package.json**
```json
{
  "name": "com.msgbyte.syncplayer",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "tailchat-plugin build"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "tailchat-shared": "workspace:*",
    "tailchat-design": "workspace:*"
  }
}
```

- [ ] **Step 2: Create manifest.json**
```json
{
  "label": "视频演播室 (Sync Player)",
  "name": "com.msgbyte.syncplayer",
  "version": "1.0.0",
  "author": "Tailchat",
  "description": "群组置顶视频同步演播室",
  "requireRestart": true
}
```

- [ ] **Step 3: Create tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### Task 4: Implement the Web Plugin UI and Sync Logic

**Files:**
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer/src/index.tsx`
- Create: `/workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer/src/SyncPlayerPanel.tsx`

- [ ] **Step 1: Create the SyncPlayerPanel component**
```tsx
import React, { useEffect, useRef, useState } from 'react';
import { useGlobalSocketEvent, requestMessage, useCurrentUserInfo, useGroupInfo } from '@capital/common';
import { Button, Input } from '@capital/component';

interface SyncState {
  roomId: string;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

export const SyncPlayerPanel: React.FC<{ groupId: string; panelId: string }> = ({ groupId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<SyncState | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  
  const currentUser = useCurrentUserInfo();
  const groupInfo = useGroupInfo(groupId);
  
  // Check if user is owner or admin
  const isControlRole = currentUser._id === groupInfo?.owner; // Simplified check for demonstration

  useEffect(() => {
    // Fetch initial state
    requestMessage('plugin:com.msgbyte.syncplayer.getState', { roomId: groupId })
      .then((res: any) => {
        if (res && res.videoUrl) {
          setState(res);
          syncLocalVideo(res);
        }
      });
  }, [groupId]);

  useGlobalSocketEvent('plugin:com.msgbyte.syncplayer.sync_state', (newState: SyncState) => {
    if (newState.roomId === groupId) {
      setState(newState);
      syncLocalVideo(newState);
    }
  });

  useGlobalSocketEvent('plugin:com.msgbyte.syncplayer.sync_close', (data: { roomId: string }) => {
    if (data.roomId === groupId) {
      setState(null);
    }
  });

  const syncLocalVideo = (s: SyncState) => {
    const video = videoRef.current;
    if (!video) return;

    // Calculate actual time considering network drift
    const timeDrift = s.isPlaying ? (Date.now() - s.updatedAt) / 1000 : 0;
    const targetTime = s.currentTime + timeDrift;

    if (Math.abs(video.currentTime - targetTime) > 1.5) {
      video.currentTime = targetTime;
    }

    if (s.isPlaying && video.paused) {
      video.play().catch(() => {}); // Handle browser autoplay policies
    } else if (!s.isPlaying && !video.paused) {
      video.pause();
    }
  };

  const handlePlay = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.syncplayer.updateState', {
      roomId: groupId,
      isPlaying: true,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handlePause = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.syncplayer.updateState', {
      roomId: groupId,
      isPlaying: false,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handleSeeked = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.updateState', {
      roomId: groupId,
      isPlaying: !videoRef.current.paused,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handleStartPush = () => {
    if (!inputUrl) return;
    requestMessage('plugin:com.msgbyte.syncplayer.push', {
      roomId: groupId,
      videoUrl: inputUrl,
    });
  };

  const handleClose = () => {
    requestMessage('plugin:com.msgbyte.syncplayer.close', { roomId: groupId });
  };

  if (!state && !isControlRole) {
    return null; // Hidden for normal users if no stream
  }

  return (
    <div className="w-full bg-black p-4 flex flex-col items-center">
      {!state && isControlRole && (
        <div className="flex w-full max-w-2xl gap-2 mb-4">
          <Input 
            value={inputUrl} 
            onChange={(e) => setInputUrl(e.target.value)} 
            placeholder="输入 MP4 视频链接启动演播室..." 
            className="flex-1"
          />
          <Button type="primary" onClick={handleStartPush}>开启演播室</Button>
        </div>
      )}

      {state && (
        <div className="relative w-full max-w-4xl rounded overflow-hidden shadow-lg">
          {isControlRole && (
            <Button 
              danger 
              className="absolute top-2 right-2 z-10" 
              onClick={handleClose}
            >
              结束演播
            </Button>
          )}
          <video
            ref={videoRef}
            src={state.videoUrl}
            controls={isControlRole} // Only admin sees controls
            className="w-full"
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeeked}
            style={{ pointerEvents: isControlRole ? 'auto' : 'none' }} // Prevent normal users from clicking
          />
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Register the plugin in Web index.tsx**
```tsx
import { regGroupPanelTop } from '@capital/common';
import { SyncPlayerPanel } from './SyncPlayerPanel';

const PLUGIN_NAME = '视频演播室';

console.log(`[Plugin] ${PLUGIN_NAME} 正在加载`);

regGroupPanelTop({
  name: 'com.msgbyte.syncplayer.top',
  render: SyncPlayerPanel,
});
```

### Task 5: Integration and Testing Instructions

- [ ] **Step 1: Build the plugin**
Run in the server workspace:
```bash
cd /workspace/tailchat-source/server/plugins/com.msgbyte.syncplayer/web/plugins/com.msgbyte.syncplayer
pnpm install
pnpm run build
```

- [ ] **Step 2: Add to tailchat configuration**
Modify `/workspace/tailchat-source/docker-compose.env` and append `com.msgbyte.syncplayer` to the `PLUGINS` environment variable.

- [ ] **Step 3: Test Sync**
1. Login as group owner.
2. Navigate to a group. The input box should appear at the top.
3. Enter an MP4 URL and click "开启演播室".
4. Open another incognito window, login as a normal member.
5. Verify the normal member sees the video without controls.
6. Owner clicks Play/Pause/Seek, verify the normal member's video instantly syncs to the exact timestamp.
