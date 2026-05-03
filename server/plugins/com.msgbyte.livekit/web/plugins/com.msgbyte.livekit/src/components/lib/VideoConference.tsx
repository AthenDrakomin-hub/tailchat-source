/**
 * Fork <VideoConference /> from "@livekit/components-react"
 */

import React, { useEffect, useRef } from 'react';
import {
  isEqualTrackRef,
  isTrackReference,
  log,
  isWeb,
} from '@livekit/components-core';
import { RoomEvent, Track } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import {
  ConnectionStateToast,
  FocusLayoutContainer,
  GridLayout,
  LayoutContextProvider,
  MessageFormatter,
  RoomAudioRenderer,
  useCreateLayoutContext,
  useRoomContext,
  usePinnedTracks,
  useTracks,
} from '@livekit/components-react';
import { ParticipantTile } from './ParticipantTile';
import { CarouselLayout } from './CarouselLayout';
import { ControlBar } from './ControlBar';
import { Chat } from './Chat';
import { FocusLayout } from './FocusLayout';
import { useMeetingContextState } from '../../context/MeetingContext';
import { Member } from './Member';
import { UserAvatar } from '@capital/component';
import { Translate } from '../../translate';
import styled from 'styled-components';

export interface VideoConferenceProps
  extends React.HTMLAttributes<HTMLDivElement> {
  autoInviteIds?: string[];
  chatMessageFormatter?: MessageFormatter;
}

const IsCallingContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  position: absolute;
  left: 50%;
  top: 20px;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  min-width: 260px;
  z-index: 4;

  .tc-call-status-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .tc-call-status-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.94);
  }

  .tc-call-status-tip {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.72);
  }

  .tc-call-status-users {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
  }
`;

/**
 * This component is the default setup of a classic LiveKit video conferencing app.
 * It provides functionality like switching between participant grid view and focus view.
 *
 * @remarks
 * The component is implemented with other LiveKit components like `FocusContextProvider`,
 * `GridLayout`, `ControlBar`, `FocusLayoutContainer` and `FocusLayout`.
 *
 * @example
 * ```tsx
 * <LiveKitRoom>
 *   <VideoConference />
 * <LiveKitRoom>
 * ```
 * @public
 */
export const VideoConference: React.FC<VideoConferenceProps> = React.memo(
  ({ autoInviteIds, chatMessageFormatter, ...props }) => {
    const lastAutoFocusedScreenShareTrack =
      React.useRef<TrackReferenceOrPlaceholder | null>(null);
    const rightPanel = useMeetingContextState((state) => state.rightPanel);
    const invitingUserIds = useMeetingContextState(
      (state) => state.invitingUserIds
    );
    useMeetingInit({ autoInviteIds });

    const tracks = useTracks(
      [
        { source: Track.Source.Camera, withPlaceholder: true },
        { source: Track.Source.ScreenShare, withPlaceholder: false },
      ],
      { updateOnlyOn: [RoomEvent.ActiveSpeakersChanged] }
    );

    const layoutContext = useCreateLayoutContext();

    const screenShareTracks = tracks
      .filter(isTrackReference)
      .filter((track) => track.publication.source === Track.Source.ScreenShare);

    const focusTrack = usePinnedTracks(layoutContext)?.[0];
    const carouselTracks = tracks.filter(
      (track) => !isEqualTrackRef(track, focusTrack)
    );

    useEffect(() => {
      // If screen share tracks are published, and no pin is set explicitly, auto set the screen share.
      if (
        screenShareTracks.length > 0 &&
        lastAutoFocusedScreenShareTrack.current === null
      ) {
        log.debug('Auto set screen share focus:', {
          newScreenShareTrack: screenShareTracks[0],
        });
        layoutContext.pin.dispatch?.({
          msg: 'set_pin',
          trackReference: screenShareTracks[0],
        });
        lastAutoFocusedScreenShareTrack.current = screenShareTracks[0];
      } else if (
        lastAutoFocusedScreenShareTrack.current &&
        !screenShareTracks.some(
          (track) =>
            track.publication.trackSid ===
            lastAutoFocusedScreenShareTrack.current?.publication?.trackSid
        )
      ) {
        log.debug('Auto clearing screen share focus.');
        layoutContext.pin.dispatch?.({ msg: 'clear_pin' });
        lastAutoFocusedScreenShareTrack.current = null;
      }
    }, [
      screenShareTracks.map((ref) => ref.publication.trackSid).join(),
      focusTrack?.publication?.trackSid,
    ]);

    return (
      <div className="lk-video-conference" {...props}>
        {isWeb() && (
          <LayoutContextProvider value={layoutContext}>
            <div className="lk-video-conference-inner">
              {!focusTrack ? (
                <div className="lk-grid-layout-wrapper">
                  <GridLayout tracks={tracks}>
                    <ParticipantTile />
                  </GridLayout>
                </div>
              ) : (
                <div className="lk-focus-layout-wrapper">
                  <FocusLayoutContainer>
                    <CarouselLayout tracks={carouselTracks}>
                      <ParticipantTile />
                    </CarouselLayout>

                    {focusTrack && <FocusLayout track={focusTrack} />}
                  </FocusLayoutContainer>
                </div>
              )}

              {Array.isArray(invitingUserIds) && invitingUserIds.length > 0 && (
                <IsCallingContainer>
                  <div className="tc-call-status-main">
                    <span className="tc-call-status-label">
                      {Translate.isCalling}
                    </span>
                    <span className="tc-call-status-tip">等待对方接听…</span>
                  </div>
                  <div className="tc-call-status-users">
                    {invitingUserIds.map((userId) => (
                      <UserAvatar key={userId} userId={userId} />
                    ))}
                  </div>
                </IsCallingContainer>
              )}

              <ControlBar controls={{ camera: false, screenShare: false }} />
            </div>

            {rightPanel === 'chat' && (
              <Chat messageFormatter={chatMessageFormatter} />
            )}

            {rightPanel === 'member' && <Member />}
          </LayoutContextProvider>
        )}

        <RoomAudioRenderer />

        <ConnectionStateToast />
      </div>
    );
  }
);
VideoConference.displayName = 'VideoConference';

function useMeetingInit({ autoInviteIds }: { autoInviteIds?: string[] }) {
  const inviteUsers = useMeetingContextState((state) => state.inviteUsers);
  const inviteUserCompleted = useMeetingContextState(
    (state) => state.inviteUserCompleted
  );
  const room = useRoomContext();
  const hasBeenSendInviteRef = useRef(false);

  useEffect(() => {
    room.addListener('participantConnected', (p) => {
      inviteUserCompleted(p.identity);
    });
  }, []);

  useEffect(() => {
    if (hasBeenSendInviteRef.current === true) {
      return;
    }

    hasBeenSendInviteRef.current = true;

    // Auto invite user on start
    if (Array.isArray(autoInviteIds) && autoInviteIds.length > 0) {
      inviteUsers(autoInviteIds);
    }
  }, []);
}
