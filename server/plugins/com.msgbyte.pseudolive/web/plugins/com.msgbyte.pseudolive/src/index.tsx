import React from 'react';
import {
  regMessageExtraParser,
  regPluginPanelAction,
  showErrorToasts,
} from '@capital/common';
import { closeModal, openModal } from '@capital/component';
import { UploadAndStartModal } from './upload/UploadAndStartModal';
import { LiveCard } from './view/LiveCard';

regPluginPanelAction({
  name: 'plugin:com.msgbyte.pseudolive/start',
  label: '发起直播',
  position: 'group',
  icon: 'mdi:video',
  onClick: ({ groupId, panelId }) => {
    const key = openModal(
      <UploadAndStartModal
        groupId={groupId}
        panelId={panelId}
        onSuccess={() => closeModal(key)}
      />
    );
  },
});

regMessageExtraParser({
  name: 'plugin:com.msgbyte.pseudolive/liveCard',
  render: (payload) => {
    const pseudolive = (payload.meta as any)?.pseudolive;
    if (!pseudolive?.hlsUrl) {
      return null;
    }

    try {
      return <LiveCard payload={payload as any} pseudolive={pseudolive} />;
    } catch (e) {
      showErrorToasts(String(e));
      return null;
    }
  },
});
