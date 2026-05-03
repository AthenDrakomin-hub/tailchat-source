import React from 'react';
import { MobileMenuBtn } from './MobileMenuBtn';
import { SettingBtn } from './SettingBtn';
import { PersonalNav } from './PersonalNav';
import { InboxNav } from './InboxNav';
import { GroupsNav } from './GroupsNav';
import { InstallBtn } from './InstallBtn';
import { ReactQueryDevBtn } from './ReactQueryDevBtn';
import { pluginCustomPanel } from '@/plugin/common';
import { NavbarCustomNavItem } from './CustomNavItem';
import { QuickSwitcherNav } from './QuickSwitcherNav';
import { FeedNav } from './FeedNav';
import { DownloadNav } from './DownloadNav';

/**
 * 导航栏组件
 */
export const Navbar: React.FC = React.memo(() => {
  return (
    <div
      data-tc-role="navbar"
      className="w-18 mobile:zoom-4/5 bg-navbar-light dark:bg-navbar-dark border-r border-black border-opacity-10 dark:border-white dark:border-opacity-10 flex flex-col justify-start items-center pt-4 pb-4"
    >
      <MobileMenuBtn />

      {/* Navbar */}
      <div className="flex-1 w-full overflow-hidden flex flex-col">
        <div className="space-y-2">
          <PersonalNav />

          <InboxNav />

          <GroupsNav />

          <FeedNav />

          <DownloadNav />

          <QuickSwitcherNav />

          {pluginCustomPanel
            .filter((p) => ['navbar-personal', 'navbar-group'].includes(p.position))
            .map((p) => (
              <NavbarCustomNavItem key={p.name} panelInfo={p} withBg={true} />
            ))}
        </div>
      </div>

      <div
        data-tc-role="navbar-settings"
        className="flex flex-col items-center space-y-2 pt-3"
      >
        {pluginCustomPanel
          .filter((p) => p.position === 'navbar-more')
          .map((p) => (
            <NavbarCustomNavItem key={p.name} panelInfo={p} withBg={false} />
          ))}

        {/* React Query 的调试面板 */}
        <ReactQueryDevBtn />

        {/* 应用(PWA)安装按钮 */}
        <InstallBtn />

        {/* 设置按钮 */}
        <SettingBtn />
      </div>
    </div>
  );
});
Navbar.displayName = 'Navbar';
