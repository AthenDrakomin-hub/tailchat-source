/**
 * The TrackReference type is a logical grouping of participant publication and/or subscribed track.
 *
 */
import type { Participant, Track, TrackPublication } from 'livekit-client';
export type TrackReferencePlaceholder = {
    participant: Participant;
    publication?: never;
    source: Track.Source;
};
export type TrackReference = {
    participant: Participant;
    publication: TrackPublication;
    source: Track.Source;
};
export type TrackReferenceOrPlaceholder = TrackReference | TrackReferencePlaceholder;
export declare function isTrackReference(trackReference: unknown): trackReference is TrackReference;
export declare function isTrackReferencePlaceholder(trackReference?: TrackReferenceOrPlaceholder): trackReference is TrackReferencePlaceholder;
//# sourceMappingURL=track-reference.types.d.ts.map