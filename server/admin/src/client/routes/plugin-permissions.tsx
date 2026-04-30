import { PageHeader, useAsync, Table } from 'tushan';
import axios from 'axios';
import { FeatureStatusCard } from '../components/FeatureStatusCard';

export const PluginPermissions: React.FC = () => {
  const { value, loading } = useAsync(async () => {
    try {
      const { data } = await axios.get('/registry-be.json');
      return {
        registryData: Array.isArray(data) ? data : [],
        registryUnavailable: false,
        registryError: '',
      };
    } catch (err: any) {
      return {
        registryData: [],
        registryUnavailable: true,
        registryError: err?.message ? String(err.message) : 'registry-be.json not found',
      };
    }
  }, []);

  if (value?.registryUnavailable) {
    return (
      <FeatureStatusCard
        title="插件注册表"
        summary="当前无法读取后端插件注册表，因此此页面只能进入降级态。"
        actionHint="请确认构建产物中存在 /registry-be.json，并确保 Admin 静态资源路径正确。"
        detail={value.registryError}
      />
    );
  }

  return (
    <div>
      <PageHeader title="插件注册表" />
      <div style={{ padding: 20 }}>
        <p style={{ marginBottom: 16 }}>
          当前页面仅用于查看服务端加载的插件注册表，不提供在线发布或权限编辑能力。
        </p>
        <Table
          loading={loading}
          data={value?.registryData || []}
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
