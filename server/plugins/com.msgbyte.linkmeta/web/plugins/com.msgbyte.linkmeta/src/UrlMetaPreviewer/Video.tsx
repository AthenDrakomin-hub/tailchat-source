import React from 'react';
import type { LinkMeta } from './types';

export const UrlMetaVideo: React.FC<{
  meta: LinkMeta;
}> = React.memo(({ meta }) => {
  return <video src={meta.url} controls={true} />;
});
UrlMetaVideo.displayName = 'UrlMetaVideo';
