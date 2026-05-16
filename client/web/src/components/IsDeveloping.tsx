import React from 'react';
import { useTranslation } from 'react-i18next';

export const IsDeveloping: React.FC = React.memo(() => {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex items-center justify-center flex-col text-tc-text-secondary">
      <div className="text-6xl mb-4">🚧</div>
      <div className="text-xl font-semibold">{t('功能开发中')}</div>
    </div>
  );
});
IsDeveloping.displayName = 'IsDeveloping';
