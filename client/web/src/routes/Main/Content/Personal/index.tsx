import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useUserSessionPreference } from '@/hooks/useUserPreference';
import { pluginCustomPanel } from '@/plugin/common';
import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageContent } from '../PageContent';
import { PersonalConverse } from './Converse';
import { FriendPanel } from './Friends';
import { PluginsPanel } from './Plugins';
import { PersonalSidebar } from './Sidebar';
import { useDMConverseList, useGlobalConfigStore } from 'tailchat-shared';
import { getPersonalChatPath } from '@/utils/personal-route';

const LegacyPersonalConverseRedirect: React.FC = React.memo(() => {
  const { converseId } = useParams<{ converseId: string }>();

  return (
    <Navigate
      to={converseId ? getPersonalChatPath(converseId) : '/main/personal/contacts'}
      replace={true}
    />
  );
});
LegacyPersonalConverseRedirect.displayName = 'LegacyPersonalConverseRedirect';

export const Personal: React.FC = React.memo(() => {
  const [lastVisitPanelUrl, setLastVisitPanelUrl] = useUserSessionPreference(
    'personLastVisitPanelUrl'
  );
  const location = useLocation();
  const disablePluginStore = useGlobalConfigStore(
    (state) => state.disablePluginStore
  );
  const converseList = useDMConverseList();
  const firstConverseId = converseList[0]?._id;

  useEffect(() => {
    setLastVisitPanelUrl(location.pathname);
  }, [location.pathname]);

  return (
    <PageContent data-tc-role="content-personal" sidebar={<PersonalSidebar />}>
      <Routes>
        <Route
          path="/friends"
          element={<Navigate to="/main/personal/contacts" replace={true} />}
        />
        <Route
          path="/converse/:converseId"
          element={<LegacyPersonalConverseRedirect />}
        />
        <Route path="/contacts" element={<FriendPanel />} />
        {!disablePluginStore && (
          <Route path="/plugins" element={<PluginsPanel />} />
        )}
        <Route path="/chats/:converseId" element={<PersonalConverse />} />
        {pluginCustomPanel
          .filter((p) => p.position === 'personal')
          .map((p) => (
            <Route
              key={p.name}
              path={`/custom/${p.name}`}
              element={
                <ErrorBoundary>{React.createElement(p.render)}</ErrorBoundary>
              }
            />
          ))}

        <Route
          path="/"
          element={
            <Navigate
              to={
                lastVisitPanelUrl && lastVisitPanelUrl !== '/main/personal'
                  ? lastVisitPanelUrl
                  : firstConverseId
                    ? getPersonalChatPath(firstConverseId)
                    : '/main/personal/contacts'
              }
            />
          }
        />
      </Routes>
    </PageContent>
  );
});
Personal.displayName = 'Personal';
