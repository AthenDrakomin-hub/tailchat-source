import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Message,
  Switch,
  Table,
  Typography,
  useAsyncRequest,
} from 'tushan';
import { request } from '../../request';

export const OpsControlPanel: React.FC = React.memo(() => {
  const [form] = Form.useForm();
  const [livekitStatus, setLivekitStatus] = useState<any>(null);

  const [{ loading: loadingConfig }, fetchConfig] = useAsyncRequest(async () => {
    const { data } = await request.get('/ops/config');
    return data;
  });

  const [{ loading: saving }, saveConfig] = useAsyncRequest(async (values) => {
    await request.post('/ops/config', values);
  });

  const [{ loading: loadingStatus }, refreshLivekitStatus] = useAsyncRequest(async () => {
    const { data } = await request.get('/ops/livekit/status');
    setLivekitStatus(data);
    return data;
  });

  const [{ loading: starting }, startLivekit] = useAsyncRequest(async () => {
    await request.post('/ops/livekit/start');
  });
  const [{ loading: stopping }, stopLivekit] = useAsyncRequest(async () => {
    await request.post('/ops/livekit/stop');
  });
  const [{ loading: restarting }, restartLivekit] = useAsyncRequest(async () => {
    await request.post('/ops/livekit/restart');
  });

  const livekitErrorText = useMemo(() => {
    if (!livekitStatus) return '';
    if (typeof livekitStatus?.error === 'string') return livekitStatus.error;
    if (livekitStatus?.ok === false) return JSON.stringify(livekitStatus, null, 2);
    return '';
  }, [livekitStatus]);

  const livekitRows = useMemo(() => {
    if (!livekitStatus) return [];
    if (livekitStatus?.ok === false) return [];
    return [livekitStatus];
  }, [livekitStatus]);

  const copyText = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      Message.success('已复制');
    } catch (err) {
      Message.error(String(err));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchConfig();
        form.setFieldsValue({
          pseudoliveEnabled: data?.pseudoliveEnabled ?? true,
          botEnabled: data?.bot?.enabled ?? false,
          botIntervalSec: data?.bot?.intervalSec ?? 30,
          botUserId: data?.bot?.userId ?? '',
          botGroupId: data?.bot?.groupId ?? '',
          botPanelId: data?.bot?.panelId ?? '',
          botMessages: Array.isArray(data?.bot?.messages)
            ? data.bot.messages.join('\n')
            : '',
        });
      } catch (err) {
        Message.error(String(err));
      }
      refreshLivekitStatus().catch(() => {});
    })();
  }, []);

  const onSubmit = async (values: any) => {
    try {
      await saveConfig({
        pseudoliveEnabled: !!values.pseudoliveEnabled,
        bot: {
          enabled: !!values.botEnabled,
          intervalSec: Number(values.botIntervalSec || 0),
          userId: String(values.botUserId || ''),
          groupId: String(values.botGroupId || ''),
          panelId: String(values.botPanelId || ''),
          messages: String(values.botMessages || ''),
        },
      });
      Message.success('已保存');
    } catch (err) {
      Message.error(String(err));
    }
  };

  return (
    <Card>
      <Typography.Title heading={4}>系统控制台</Typography.Title>
      <Typography.Paragraph>
        用于在 Admin 中集中处理常用运维开关与运行状态。LiveKit 的启停通过宿主机受控执行器完成。
      </Typography.Paragraph>

      <Divider />
      <Typography.Title heading={6}>LiveKit 一键启停</Typography.Title>
      <Typography.Paragraph>
        如果操作无响应或报错，请检查执行器服务与日志（systemd/journalctl）。
      </Typography.Paragraph>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button
          type="primary"
          loading={starting}
          onClick={async () => {
            try {
              await startLivekit();
              Message.success('已发送启动指令');
              refreshLivekitStatus();
            } catch (err) {
              Message.error(String(err));
            }
          }}
        >
          启动 LiveKit
        </Button>
        <Button
          status="danger"
          loading={stopping}
          onClick={async () => {
            try {
              await stopLivekit();
              Message.success('已发送停止指令');
              refreshLivekitStatus();
            } catch (err) {
              Message.error(String(err));
            }
          }}
        >
          停止 LiveKit
        </Button>
        <Button
          loading={restarting}
          onClick={async () => {
            try {
              await restartLivekit();
              Message.success('已发送重启指令');
              refreshLivekitStatus();
            } catch (err) {
              Message.error(String(err));
            }
          }}
        >
          重启 LiveKit
        </Button>
        <Button
          loading={loadingStatus}
          onClick={() => {
            refreshLivekitStatus().catch((err) => Message.error(String(err)));
          }}
        >
          刷新状态
        </Button>
      </div>

      <Table
        columns={[
          {
            title: '运行状态',
            dataIndex: 'state',
            render: (val) => {
              const v = String(val || '');
              const type = v === 'running' ? 'success' : v === 'exited' ? 'danger' : 'secondary';
              return <Typography.Text type={type}>{v || '-'}</Typography.Text>;
            },
          },
          { title: '容器名', dataIndex: 'containerName' },
          { title: '镜像', dataIndex: 'image' },
          {
            title: '端口',
            dataIndex: 'ports',
            render: (val) => {
              if (!Array.isArray(val)) return '-';
              return <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{val.join('\n')}</pre>;
            },
          },
          { title: '运行时长', dataIndex: 'uptime' },
          {
            title: '最近日志入口',
            dataIndex: 'logCommand',
            render: (val) => (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography.Text style={{ maxWidth: 520 }} ellipsis>
                  {String(val || '-')}
                </Typography.Text>
                <Button size="small" onClick={() => copyText(String(val || ''))}>
                  复制
                </Button>
              </div>
            ),
          },
        ]}
        data={livekitRows}
        rowKey={(row: any) => row.containerName || 'livekit'}
        pagination={false}
      />

      {livekitErrorText ? (
        <>
          <Divider />
          <Typography.Title heading={6}>错误信息</Typography.Title>
          <Input.TextArea value={livekitErrorText} rows={4} readOnly />
        </>
      ) : null}

      <Divider />
      <Form form={form} layout="vertical" onSubmit={onSubmit} disabled={loadingConfig}>
        <Typography.Title heading={6}>伪直播开关</Typography.Title>
        <Form.Item label="允许启用伪直播" field="pseudoliveEnabled">
          <Switch />
        </Form.Item>

        <Divider />
        <Typography.Title heading={6}>机器人小号轮播</Typography.Title>
        <Form.Item label="启用机器人轮播" field="botEnabled">
          <Switch />
        </Form.Item>
        <Form.Item label="轮播间隔（秒）" field="botIntervalSec">
          <InputNumber min={5} />
        </Form.Item>
        <Form.Item label="机器人 userId" field="botUserId">
          <Input />
        </Form.Item>
        <Form.Item label="groupId" field="botGroupId">
          <Input />
        </Form.Item>
        <Form.Item label="panelId" field="botPanelId">
          <Input />
        </Form.Item>
        <Form.Item label="话术列表（一行一条，按顺序轮播）" field="botMessages">
          <Input.TextArea rows={6} placeholder="第一句\n第二句\n第三句" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
});

OpsControlPanel.displayName = 'OpsControlPanel';
