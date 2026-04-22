import {
  regCustomPanel,
  regPluginPanelAction,
  regPluginPanelRoute,
  panelWindowManager,
  regSocketEventListener,
  getGlobalState,
  showNotification,
  navigate,
  isMobile,
} from '@capital/common';
import { Loadable } from '@capital/component';
import { Translate } from './translate';
import React from 'react';
import { useLivekitState } from './store/useLivekitState';
import { PLUGIN_ID } from './consts';

console.log(`Plugin ${PLUGIN_ID} is loaded`);

// 预加载铃声
(() => {
  new Audio('/audio/telephone.mp3').preload = 'auto';
})();

const LivekitMeetingPanel = Loadable(
  () => import('./panel/LivekitMeetingPanel'),
  {
    componentName: `${PLUGIN_ID}:LivekitMeetingPanel`,
  }
);

const InviteCallNotification = Loadable(
  () => import('./components/InviteCallNotification'),
  {
    componentName: `${PLUGIN_ID}:InviteCallNotification`,
  }
);

regPluginPanelRoute({
  name: `${PLUGIN_ID}/livekitPanel`,
  path: `/${PLUGIN_ID}/meeting/:meetingId`,
  component: LivekitMeetingPanel,
});

regCustomPanel({
  position: 'personal',
  icon: 'mingcute:voice-line',
  name: `${PLUGIN_ID}/livekitPersonMeeting`,
  label: Translate.voiceChannel,
  render: LivekitMeetingPanel,
  useIsShow: () => false,
});

// 发起私信会议
regPluginPanelAction({
  name: `${PLUGIN_ID}/groupAction`,
  label: Translate.startCall,
  position: 'dm',
  icon: 'mdi:video-box',
  onClick: ({ converseId }) => {
    const state = getGlobalState() ?? {};
    const currentUserId = state.user?.info?._id ?? '';
    const members: string[] =
      state.chat?.converses?.[converseId]?.members ?? [];
    const shouldInviteUserIds = members.filter((m) => m !== currentUserId);

    if (isMobile()) {
      // 如果是手机端则内嵌显示
      useLivekitState.setState({
        currentMeetingId: converseId,
        autoInviteIds: shouldInviteUserIds,
      });
      const url = `/main/personal/custom/${PLUGIN_ID}/livekitPersonMeeting`;
      navigate(url);
    } else {
      // 如果是桌面端则弹出独立窗口
      const win = panelWindowManager.open(
        `/panel/plugin/${PLUGIN_ID}/meeting/${converseId}`,
        {
          width: 1280,
          height: 768,
        }
      );
      (win.window as any).autoInviteIds = shouldInviteUserIds;
    }
  },
});

regSocketEventListener({
  eventName: `plugin:${PLUGIN_ID}.inviteCall`,
  eventFn: (data) => {
    const { senderUserId, roomName } = data;

    const close = showNotification(
      <InviteCallNotification
        senderUserId={senderUserId}
        onJoin={() => {
          panelWindowManager.open(
            `/panel/plugin/${PLUGIN_ID}/meeting/${roomName}`,
            {
              width: 1280,
              height: 768,
            }
          );
          close();
        }}
      />,
      0
    );
  },
});
