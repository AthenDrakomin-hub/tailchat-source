import React from 'react';
import { useColorScheme } from 'tailchat-shared';
import clsx from 'clsx';

import logoLightUrl from '@assets/images/brand/logo-light.png';
import logoDarkUrl from '@assets/images/brand/logo-dark.png';

type Props = {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export const BrandLogo: React.FC<Props> = React.memo((props) => {
  const { isDarkMode } = useColorScheme();

  return (
    <img
      src={isDarkMode ? logoDarkUrl : logoLightUrl}
      alt={props.alt ?? 'Logo'}
      width={props.width}
      height={props.height}
      className={clsx('object-contain', props.className)}
    />
  );
});
BrandLogo.displayName = 'BrandLogo';
