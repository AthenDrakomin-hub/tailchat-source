import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginView } from './LoginView';
import clsx from 'clsx';
import styles from './index.module.less';
import { RegisterView } from './RegisterView';
import { useRecordMeasure } from '@/utils/measure-helper';
import { GuestView } from './GuestView';
import { ForgetPasswordView } from './ForgetPasswordView';
import { LanguageSelect } from '@/components/LanguageSelect';
import { BeidouStars } from './components/BeidouStars';

const EntryRoute = React.memo(() => {
  useRecordMeasure('appEntryRenderStart');

  return (
    <div className="h-full flex flex-row">
      <div
        className={clsx(
          styles.entryLeft,
          'entry-left relative overflow-hidden w-[560px] mobile:w-full px-10 mobile:px-6 bg-[rgba(11,25,44,0.96)] text-slate-100 min-h-full flex items-center justify-center z-10 border-r border-[rgba(255,255,255,0.10)]'
        )}
      >
        <div className="absolute top-6 right-6 z-20">
          <LanguageSelect />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(255,255,255,0.05)] via-transparent to-[rgba(0,0,0,0.40)]" />
        <div className="pointer-events-none absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full bg-[rgba(212,175,55,0.16)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-56 -right-56 w-[720px] h-[720px] rounded-full bg-[rgba(255,255,255,0.05)] blur-3xl" />
        <div className="relative z-10 w-full max-w-[420px] pb-14">
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegisterView />} />
            <Route path="/guest" element={<GuestView />} />
            <Route path="/forget" element={<ForgetPasswordView />} />
            <Route
              path="/"
              element={<Navigate to="/entry/login" replace={true} />}
            />
          </Routes>
        </div>
      </div>

      <div className="flex-1 mobile:hidden tc-background relative overflow-hidden">
        <BeidouStars />
      </div>
    </div>
  );
});
EntryRoute.displayName = 'EntryRoute';

export default EntryRoute;
