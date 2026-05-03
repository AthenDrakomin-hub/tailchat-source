import {
  Category,
  createTextField,
  CustomRoute,
  jsonServerProvider,
  ListTable,
  Resource,
  Tushan,
} from 'tushan';
import {
  IconDashboard,
  IconEmail,
  IconExperiment,
  IconFile,
  IconMessage,
  IconNotification,
  IconSafe,
  IconSettings,
  IconStorage,
  IconUser,
  IconUserGroup,
  IconWifi,
} from 'tushan/icon';
import { authHTTPClient, authProvider } from './auth';
import { Dashboard } from './components/Dashboard';
import { mailFields, messageFields } from './fields';
import { i18n } from './i18n';
import { GroupList } from './resources/group';
import { UserList } from './resources/user';
import { FileList } from './resources/file';
import { Analytics } from './routes/analytics';
import { CacheManager } from './routes/cache';
import { Network } from './routes/network';
import { SocketIOAdmin } from './routes/socketio';
import { SystemConfig } from './routes/system';
import { SystemNotify } from './routes/system/notify';
import { DefenseControlPanel } from './routes/defense-control';
import { PluginPermissions } from './routes/plugin-permissions';
import { OpsControlPanel } from './routes/ops-control';
import { OpenClawGatewayPanel } from './routes/agent-control';

const dataProvider = jsonServerProvider('/admin/api', authHTTPClient);

function App() {
  return (
    <Tushan
      basename="/admin"
      header={'財訊 Admin'}
      footer={'Build with Ridou'}
      dashboard={<Dashboard />}
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18n={i18n}
    >
      <Category name="operations">
        <CustomRoute name="ops-control" icon={<IconDashboard />}>
          <OpsControlPanel />
        </CustomRoute>
        <CustomRoute name="agent-control" icon={<IconUserGroup />}>
          <OpenClawGatewayPanel />
        </CustomRoute>
        <CustomRoute name="system-notify" icon={<IconNotification />}>
          <SystemNotify />
        </CustomRoute>
        <CustomRoute name="site-config" icon={<IconSettings />}>
          <SystemConfig />
        </CustomRoute>
      </Category>

      <Category name="content">
        <Resource name="users" icon={<IconUser />} list={<UserList />} />
        <Resource
          name="messages"
          icon={<IconMessage />}
          list={
            <ListTable
              filter={[
                createTextField('q', {
                  label: 'Search',
                }),
              ]}
              showSizeChanger={true}
              fields={messageFields}
              action={{
                detail: true,
                edit: true,
                delete: true,
                export: true,
                refresh: true,
              }}
              batchAction={{ delete: true }}
            />
          }
        />
        <Resource name="groups" icon={<IconUserGroup />} list={<GroupList />} />
        <Resource name="file" icon={<IconFile />} list={<FileList />} />
        <Resource name="mail" icon={<IconEmail />} list={<ListTable fields={mailFields} />} />
      </Category>

      <Category name="diagnostics">
        <CustomRoute name="defense-control" icon={<IconSafe />}>
          <DefenseControlPanel />
        </CustomRoute>
        <CustomRoute name="network" icon={<IconWifi />}>
          <Network />
        </CustomRoute>
        <CustomRoute name="socketio-diagnostic" icon={<IconDashboard />}>
          <SocketIOAdmin />
        </CustomRoute>
        <CustomRoute name="analytics" icon={<IconExperiment />}>
          <Analytics />
        </CustomRoute>
        <CustomRoute name="cache" icon={<IconStorage />}>
          <CacheManager />
        </CustomRoute>
        <CustomRoute name="plugin-registry" icon={<IconExperiment />}>
          <PluginPermissions />
        </CustomRoute>
      </Category>
    </Tushan>
  );
}

export default App;
