import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginView } from './LoginView';
import clsx from 'clsx';
import styles from './index.module.less';
import { RegisterView } from './RegisterView';
import { useRecordMeasure } from '@/utils/measure-helper';
import { GuestView } from './GuestView';
import { ForgetPasswordView } from './ForgetPasswordView';

const EntryRoute = React.memo(() => {
  useRecordMeasure('appEntryRenderStart');

  return (
    <div className="h-full flex flex-row">
      <div
        className={clsx(
          styles.entryLeft,
          'entry-left w-[520px] mobile:w-full px-10 bg-white text-gray-800 min-h-full flex items-center justify-center z-10'
        )}
      >
        <div className="w-full pb-20">
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

      <div className="flex-1 mobile:hidden tc-background" />
    </div>
  );
});
EntryRoute.displayName = 'EntryRoute';

export default EntryRoute;
