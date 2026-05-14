import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginView } from './LoginView';
import clsx from 'clsx';
import styles from './index.module.less';
import { RegisterView } from './RegisterView';
import { useRecordMeasure } from '@/utils/measure-helper';
import { GuestView } from './GuestView';
import { ForgetPasswordView } from './ForgetPasswordView';
import { BeidouStars } from './components/BeidouStars';
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
          'entry-left relative overflow-hidden w-[520px] mobile:w-full px-10 mobile:px-6 bg-tc-bg-elevated text-slate-900 min-h-full flex items-center justify-center z-10 border-r border-black/5'
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-tc-bg-base via-tc-bg-elevated to-tc-bg-sunken" />
        <div className="pointer-events-none absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-[rgba(7,193,96,0.08)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-56 -right-56 w-[720px] h-[720px] rounded-full bg-[rgba(0,0,0,0.04)] blur-3xl" />
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

      <div className="flex-1 mobile:hidden tc-background relative overflow-hidden bg-[#f2f2f2]">
        <BeidouStars />
      </div>
    </div>
  );
});
EntryRoute.displayName = 'EntryRoute';

export default EntryRoute;
