import { PageHeader, useAsync, Table } from 'tushan';
import axios from 'axios';
import { FeatureStatusCard } from '../components/FeatureStatusCard';

export const PluginPermissions: React.FC = () => {
  const { value, loading } = useAsync(async () => {
    try {
      const { data } = await axios.get('/registry-be.json');
      const registryData = Array.isArray(data) ? data : [];
      const wxpusherPlugin = registryData.find(
        (item: any) => item.name === 'com.msgbyte.wxpusher'
      );
      const livekitPlugin = registryData.find(
        (item: any) => item.name === 'com.msgbyte.livekit'
      );

      return {
        registryData,
        wxpusherPlugin: wxpusherPlugin ?? null,
        livekitPlugin: livekitPlugin ?? null,
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
      <PageHeader title="插件中心" />
      <div style={{ padding: 20 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              当前插件数
            </div>
            <div style={{ fontSize: 28, fontWeight: 600 }}>
              {value?.registryData?.length ?? 0}
            </div>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: value?.livekitPlugin ? '#eff6ff' : '#fff7ed',
          }}
        >
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
            LiveKit 通话能力
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {value?.livekitPlugin ? '当前注册表已包含' : '当前构建未包含'}
          </div>
        </div>
          </div>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: value?.wxpusherPlugin ? '#ecfdf5' : '#fff7ed',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              WxPusher 能力
            </div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {value?.wxpusherPlugin ? '当前注册表已包含' : '当前构建未包含'}
            </div>
          </div>
        </div>

        <p style={{ marginBottom: 16 }}>
          这里用于查看当前构建中可见的插件能力。客户端不再向普通用户暴露插件中心，但管理后台保留插件可见性，方便运营查看、筛选与启用能力。
        </p>
        {!value?.wxpusherPlugin && (
          <p style={{ marginBottom: 16, color: '#b45309' }}>
            提示：当前注册表里没有发现 <code>com.msgbyte.wxpusher</code>，如果你要启用微信提醒，请确认部署产物或环境配置中已包含对应能力。
          </p>
        )}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            borderRadius: 12,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>当前通知链路</div>
          <div style={{ color: '#475569', lineHeight: 1.8 }}>
            <div>1. `wxnotify` 是财讯内置的微信通知服务，负责绑定、默认规则和后台日志。</div>
            <div>2. `com.msgbyte.livekit` 提供语音电话来电事件，微信通知会在服务端邀请动作里接入。</div>
            <div>3. 当前默认微信通知规则固定为：好友私信、语音电话来电、群组 `@所有人`。</div>
          </div>
        </div>
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
