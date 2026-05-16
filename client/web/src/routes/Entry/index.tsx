import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginView } from './LoginView';
import clsx from 'clsx';
import styles from './index.module.less';
import { RegisterView } from './RegisterView';
import { useRecordMeasure } from '@/utils/measure-helper';
import { GuestView } from './GuestView';
import { ForgetPasswordView } from './ForgetPasswordView';
import { LuxuryFinancePanel } from './components/LuxuryFinancePanel';
import { AboutView } from './AboutView';
import { LegalView } from './LegalView';
import { TrustView } from './TrustView';

const EntryRoute = React.memo(() => {
  useRecordMeasure('appEntryRenderStart');

  return (
    <div className="h-full flex flex-row">
      <div
        className={clsx(
          styles.entryLeft,
          'entry-left relative overflow-hidden w-[520px] mobile:w-full px-10 mobile:px-6 min-h-full flex items-center justify-center z-10',
          // 奢华金融深色风格背景
          'bg-gradient-to-b from-[#0d1420] via-[#0a0f1a] to-[#080b12]'
        )}
      >
        {/* 左侧金色光晕装饰 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[rgba(212,175,55,0.08)] to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -right-20 w-[300px] h-[300px] rounded-full bg-gradient-to-tl from-[rgba(212,175,55,0.05)] to-transparent blur-3xl" />
        </div>
        
        <div className="relative z-20 w-full max-w-[420px] pb-14">
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/guest" element={<GuestView />} />
            <Route path="/forget" element={<ForgetPasswordView />} />
            <Route path="/about" element={<AboutView />} />
            <Route path="/privacy" element={<LegalView />} />
            <Route path="/terms" element={<LegalView />} />
            <Route path="/community" element={<LegalView />} />
            <Route path="/trust" element={<TrustView />} />
            <Route
              path="/"
              element={<Navigate to="/entry/login" replace={true} />}
            />
          </Routes>
        </div>
      </div>

      <div className="flex-1 mobile:hidden relative overflow-hidden">
        <LuxuryFinancePanel />
      </div>
    </div>
  );
});
EntryRoute.displayName = 'EntryRoute';

export default EntryRoute;
