import { PageHeader } from 'tushan';

export const PluginPermissions: React.FC = () => {
  return (
    <div>
      <PageHeader title="插件权限管理" />
      <div style={{ padding: 20 }}>
        暂无可用配置，或请在服务端 registry-be.json 进行配置。
      </div>
    </div>
  );
};
