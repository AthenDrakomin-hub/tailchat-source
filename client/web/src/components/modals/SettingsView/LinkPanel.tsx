import React from 'react';

interface SettingsLinkPanelProps {
  title: string;
  description: string;
  href: string;
}

export const SettingsLinkPanel: React.FC<SettingsLinkPanelProps> = React.memo(
  ({ title, description, href }) => {
    return (
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] p-4">
        <div className="text-base font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </div>
        <div className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {description}
        </div>
        <a
          className="mt-4 inline-flex items-center text-sm font-medium text-tc-primary underline underline-offset-4"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          打開頁面
        </a>
      </div>
    );
  }
);
SettingsLinkPanel.displayName = 'SettingsLinkPanel';
