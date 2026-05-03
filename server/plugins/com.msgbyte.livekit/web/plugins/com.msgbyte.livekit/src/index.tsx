import {
  regCustomPanel,
  regPluginPanelAction,
  regPluginPanelRoute,
  regPluginRootRoute,
  regSocketEventListener,
  getGlobalState,
  showNotification,
  showErrorToasts,
  navigate,
} from '@capital/common';
import { Loadable } from '@capital/component';
import { Translate } from './translate';
import React from 'react';
import { useLivekitState } from './store/useLivekitState';
import { PLUGIN_ID } from './consts';
import { request } from './request';

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

const ExternalCallView = Loadable(
  () => import('./components/ExternalCallView'),
  {
    componentName: `${PLUGIN_ID}:ExternalCallView`,
  }
);

const GuestCallView = Loadable(
  () => import('./components/GuestCallView'),
  {
    componentName: `${PLUGIN_ID}:GuestCallView`,
  }
);

regPluginRootRoute({
  name: `${PLUGIN_ID}/externalMeeting`,
  path: `/${PLUGIN_ID}/meeting/:meetingId`,
  component: ExternalCallView,
});

regPluginRootRoute({
  name: 'guest-call',
  path: `/${PLUGIN_ID}/guest/:code`,
  component: GuestCallView,
});

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

// 发起私聊通话
regPluginPanelAction({
  name: `${PLUGIN_ID}/groupAction`,
  label: Translate.startCall,
  position: 'dm',
  icon: 'mdi:phone-in-talk',
  onClick: async ({ converseId }) => {
    const state = getGlobalState() ?? {};
    const currentUserId = state.user?.info?._id ?? '';
    const members: string[] =
      state.chat?.converses?.[converseId]?.members ?? [];
    const shouldInviteUserIds = members.filter((m) => m !== currentUserId);

    if (shouldInviteUserIds.length === 0) {
      showErrorToasts('当前会话中没有可呼叫的对象');
      return;
    }

    try {
      await request.post('inviteCall', {
        roomName: converseId,
        targetUserIds: shouldInviteUserIds,
      });
    } catch (err) {
      showErrorToasts(err);
      return;
    }

    // 点击后先发起邀请，再进入当前应用内通话页
    useLivekitState.setState({
      currentMeetingId: converseId,
      autoInviteIds: [],
    });
    const url = `/main/personal/custom/${PLUGIN_ID}/livekitPersonMeeting`;
    navigate(url);
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
          useLivekitState.setState({
            currentMeetingId: roomName,
            autoInviteIds: [],
          });
          navigate(`/main/personal/custom/${PLUGIN_ID}/livekitPersonMeeting`);
          close();
        }}
      />,
      0
    );
  },
});
