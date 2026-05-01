import {
  regCustomPanel,
  regPluginPanelAction,
  regPluginPanelRoute,
  regPluginRootRoute,
  regSocketEventListener,
  getGlobalState,
  showNotification,
  navigate,
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
  onClick: ({ converseId }) => {
    const state = getGlobalState() ?? {};
    const currentUserId = state.user?.info?._id ?? '';
    const members: string[] =
      state.chat?.converses?.[converseId]?.members ?? [];
    const shouldInviteUserIds = members.filter((m) => m !== currentUserId);

    // 统一改为应用内直达，不再优先弹出独立窗口
    useLivekitState.setState({
      currentMeetingId: converseId,
      autoInviteIds: shouldInviteUserIds,
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
