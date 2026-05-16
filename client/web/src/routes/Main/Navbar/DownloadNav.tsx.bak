import { Icon } from 'tailchat-design';
import React from 'react';
import { t, useEvent } from 'tailchat-shared';
import { NavbarNavItem } from './NavItem';

export const DownloadNav: React.FC = React.memo(() => {
  const handleOpenDownloads = useEvent(() => {
    window.open('/downloads', '_blank', 'noopener,noreferrer');
  });

  return (
    <div data-tc-role="navbar-downloads">
      <NavbarNavItem
        name={t('下载客户端')}
        showPill={true}
        onClick={handleOpenDownloads}
        data-testid="navbar-downloads"
      >
        <Icon className="text-3xl text-white" icon="mdi:download-circle-outline" />
      </NavbarNavItem>
    </div>
  );
});
DownloadNav.displayName = 'DownloadNav';
