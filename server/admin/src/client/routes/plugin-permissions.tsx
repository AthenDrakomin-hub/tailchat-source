import { PageHeader, useAsync, Table } from 'tushan';
import axios from 'axios';

export const PluginPermissions: React.FC = () => {
  const { value: registryData, loading } = useAsync(async () => {
    try {
      // 必须用绝对路径或原始 axios 绕过 /admin/api 的 baseUrl 限制
      const { data } = await axios.get('/registry-be.json');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  }, []);

  return (
    <div>
      <PageHeader title="插件权限管理" />
      <div style={{ padding: 20 }}>
        <p style={{ marginBottom: 16 }}>当前仅展示服务端加载的插件注册表 (registry-be.json)，如需修改权限请直接编辑该文件或通过环境变量控制。</p>
        <Table
          loading={loading}
          data={registryData || []}
          rowKey="name"
          columns={[
            {
              title: '标识 (name)',
              dataIndex: 'name',
            },
            {
              title: '显示名 (label)',
              dataIndex: 'label',
              render: (val, record: any) => record['label.zh-CN'] || val,
            },
            {
              title: '版本 (version)',
              dataIndex: 'version',
            },
            {
              title: '描述 (description)',
              dataIndex: 'description',
              render: (val, record: any) => record['description.zh-CN'] || val,
            },
          ]}
        />
      </div>
    </div>
  );
};
