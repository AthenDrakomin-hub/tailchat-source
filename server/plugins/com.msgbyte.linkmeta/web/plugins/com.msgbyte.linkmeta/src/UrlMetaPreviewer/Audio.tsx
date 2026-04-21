import React from 'react';
import type { LinkMeta } from './types';

export const UrlMetaAudio: React.FC<{
  meta: LinkMeta;
}> = React.memo(({ meta }) => {
  return <audio src={meta.url} controls={true} />;
});
UrlMetaAudio.displayName = 'UrlMetaAudio';
