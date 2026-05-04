import React from 'react';
import {
  Button,
  Input,
  Form,
  useTranslation,
  Typography,
  Card,
  Radio,
  ReferenceFieldEdit,
  useAsyncRequest,
  Tooltip,
  Message,
  Space,
  Table,
  Tag,
} from 'tushan';
import { IconExclamationCircle } from 'tushan/icon';
import { MarkdownEditor } from '../../components/MarkdownEditor';
import { callAction } from '../../request';
import { request } from '../../request';
import { formatAdminError } from '../../utils/admin-error';

/**
 * Tailchat 系统通知
 *
 * 发送markdown格式的消息到指定用户的收件箱
 */
export const SystemNotify: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const scope: 'all' | 'specified' = Form.useWatch('scope', form);

  const [{ loading }, handleSubmit] = useAsyncRequest(async (values) => {
    try {
      const { data } = await request.post('/users/system/notify', {
        scope: values.scope,
        specifiedUser: values.specifiedUser,
        title: values.title,
        content: values.content,
      });

      Message.success(
        t('custom.system-notify.notifySuccess', { count: data.userIds.length })
      );
      form.setFieldsValue({
        title: '',
        content: '',
        specifiedUser: undefined,
      });
    } catch (err) {
      Message.error(formatAdminError(err, '系统通知发送失败'));
    }
  });

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Typography.Title heading={3} style={{ textAlign: 'center' }}>
          {t('custom.system-notify.create')}
        </Typography.Title>
        <Typography.Title
          heading={6}
          style={{ textAlign: 'center', color: '#666' }}
        >
          {t('custom.system-notify.tip')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          该通知会直接进入用户的通知中心。发送给指定用户时，请明确选择目标对象，避免误发。
        </Typography.Paragraph>

        <Form form={form} onSubmit={handleSubmit}>
          <Form.Item label={t('custom.system-notify.title')} field="title">
            <Input name="title" />
          </Form.Item>

          <Form.Item
            label={t('custom.system-notify.content')}
            field="content"
            rules={[{ required: true }]}
          >
            <MarkdownFormInput />
          </Form.Item>

          <Form.Item
            label={t('custom.system-notify.scope')}
            field="scope"
            rules={[{ required: true }]}
            initialValue="all"
          >
            <Radio.Group>
              <Radio value="all">
                {t('custom.system-notify.allUser')}

                <Tooltip content={t('custom.system-notify.allUserTip')}>
                  <IconExclamationCircle
                    style={{ margin: '0 8px', color: 'rgb(var(--arcoblue-6))' }}
                  />
                </Tooltip>
              </Radio>
              <Radio value="specified">
                {t('custom.system-notify.specifiedUser')}
              </Radio>
            </Radio.Group>
          </Form.Item>

          {scope === 'specified' && (
            <Form.Item
              label={t('custom.system-notify.specifiedUser')}
              field="specifiedUser"
              rules={[{ required: true }]}
            >
              <UserSelectedFormInput />
            </Form.Item>
          )}

          <Form.Item label={' '}>
            <Button htmlType="submit" loading={loading}>
              {t('tushan.common.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <WxNotifyAdminPanel />
    </Space>
  );
});
SystemNotify.displayName = 'SystemNotify';

const WxNotifyAdminPanel: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [overview, setOverview] = React.useState<any>(null);
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [targetKeyword, setTargetKeyword] = React.useState('');
  const [daysFilter, setDaysFilter] = React.useState<number>(7);

  const [{ loading: overviewLoading }, fetchOverview] = useAsyncRequest(
    async (params?: {
      type?: string;
      status?: string;
      targetKeyword?: string;
      days?: number;
    }) => {
      const data = await callAction('wxnotify.adminOverview', {
        type: params?.type,
        status: params?.status,
        targetKeyword: params?.targetKeyword,
        days: params?.days,
      });
      setOverview(data);
      return data;
    }
  );

  const [{ loading: sending }, sendTest] = useAsyncRequest(async (values) => {
    await callAction('wxnotify.adminSendTestMessage', {
      userId: values.userId,
    });
  });

  React.useEffect(() => {
    fetchOverview({
      type: typeFilter,
      status: statusFilter,
      targetKeyword,
      days: daysFilter,
    }).catch(() => {});
  }, []);

  return (
    <Card>
      <Typography.Title heading={4}>
        {t('custom.wxnotify.title')}
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        {t('custom.wxnotify.tip')}
      </Typography.Paragraph>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space wrap>
          <Tag color={overview?.available ? 'green' : 'red'}>
            {overview?.available
              ? t('custom.wxnotify.available')
              : t('custom.wxnotify.unavailable')}
          </Tag>
          <Typography.Text>
            {t('custom.wxnotify.token')}: {overview?.appTokenMasked || '-'}
          </Typography.Text>
          <Typography.Text>
            {t('custom.wxnotify.successCount')}: {overview?.successCount ?? 0}
          </Typography.Text>
          <Typography.Text>
            {t('custom.wxnotify.failedCount')}: {overview?.failedCount ?? 0}
          </Typography.Text>
          <Typography.Text>
            {t('custom.wxnotify.boundUserCount')}: {overview?.boundUserCount ?? 0}
          </Typography.Text>
        </Space>

        <div>
          <Typography.Text style={{ fontWeight: 600 }}>
            {t('custom.wxnotify.defaultRules')}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            {(overview?.defaultRules ?? []).map((item: string) => (
              <Tag key={item} style={{ marginBottom: 8 }}>
                {item}
              </Tag>
            ))}
          </div>
        </div>

        <Form
          form={form}
          layout="inline"
          onSubmit={async (values) => {
            try {
              await sendTest(values);
              Message.success(t('custom.wxnotify.testSuccess'));
              await fetchOverview({
                type: typeFilter,
                status: statusFilter,
                targetKeyword,
                days: daysFilter,
              });
              form.resetFields();
            } catch (err) {
              Message.error(formatAdminError(err, '发送微信测试通知失败'));
            }
          }}
        >
          <Form.Item
            label={t('custom.wxnotify.testUser')}
            field="userId"
            rules={[{ required: true }]}
          >
            <UserSelectedFormInput />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" loading={sending}>
              {t('custom.wxnotify.sendTest')}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button loading={overviewLoading} onClick={() => fetchOverview().catch(() => {})}>
              {t('custom.wxnotify.refresh')}
            </Button>
          </Form.Item>
        </Form>

        <Space wrap>
          <Select
            style={{ width: 180 }}
            value={typeFilter}
            onChange={(value) => {
              setTypeFilter(value);
              fetchOverview({
                type: value,
                status: statusFilter,
                targetKeyword,
                days: daysFilter,
              }).catch(() => {});
            }}
            options={[
              { label: t('custom.wxnotify.filterAllType'), value: 'all' },
              { label: 'directMessage', value: 'directMessage' },
              { label: 'voiceCall', value: 'voiceCall' },
              { label: 'mentionAll', value: 'mentionAll' },
              { label: 'test', value: 'test' },
            ]}
          />
          <Select
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              fetchOverview({
                type: typeFilter,
                status: value,
                targetKeyword,
                days: daysFilter,
              }).catch(() => {});
            }}
            options={[
              { label: t('custom.wxnotify.filterAllStatus'), value: 'all' },
              { label: 'success', value: 'success' },
              { label: 'failed', value: 'failed' },
            ]}
          />
          <Select
            style={{ width: 160 }}
            value={daysFilter}
            onChange={(value) => {
              setDaysFilter(value);
              fetchOverview({
                type: typeFilter,
                status: statusFilter,
                targetKeyword,
                days: value,
              }).catch(() => {});
            }}
            options={[
              { label: t('custom.wxnotify.filter7Days'), value: 7 },
              { label: t('custom.wxnotify.filter30Days'), value: 30 },
              { label: t('custom.wxnotify.filter90Days'), value: 90 },
            ]}
          />
          <Input
            style={{ width: 220 }}
            value={targetKeyword}
            onChange={(value) => {
              setTargetKeyword(value);
              fetchOverview({
                type: typeFilter,
                status: statusFilter,
                targetKeyword: value,
                days: daysFilter,
              }).catch(() => {});
            }}
            placeholder={t('custom.wxnotify.filterTarget')}
          />
        </Space>

        <Table
          loading={overviewLoading}
          pagination={false}
          rowKey={(row: any) => row._id ?? row.id ?? `${row.createdAt}-${row.summary}`}
          columns={[
            {
              title: t('custom.wxnotify.logType'),
              dataIndex: 'type',
            },
            {
              title: t('custom.wxnotify.logStatus'),
              dataIndex: 'status',
              render: (status: string) => (
                <Tag color={status === 'success' ? 'green' : 'red'}>{status}</Tag>
              ),
            },
            {
              title: t('custom.wxnotify.logTarget'),
              dataIndex: 'targetUserId',
            },
            {
              title: t('custom.wxnotify.logUid'),
              dataIndex: 'targetUidMasked',
            },
            {
              title: t('custom.wxnotify.logSummary'),
              dataIndex: 'summary',
            },
            {
              title: t('custom.wxnotify.logTime'),
              dataIndex: 'createdAt',
            },
            {
              title: t('custom.wxnotify.logError'),
              dataIndex: 'error',
            },
          ]}
          data={overview?.recentLogs ?? []}
        />
      </Space>
    </Card>
  );
});
WxNotifyAdminPanel.displayName = 'WxNotifyAdminPanel';

export const MarkdownFormInput: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = React.memo((props) => {
  const value = props.value || '';

  const handleChange = (newValue) => {
    props.onChange && props.onChange(newValue);
  };

  return <MarkdownEditor value={value} onChange={handleChange} />;
});
MarkdownFormInput.displayName = 'MarkdownFormInput';

export const UserSelectedFormInput: React.FC<{
  value?: string;
  onChange?: (val: string) => void;
}> = React.memo((props) => {
  const value = props.value || '';

  const handleChange = (newValue) => {
    props.onChange && props.onChange(newValue);
  };

  /**
   * Wait for ReferenceMany
   */
  return (
    <ReferenceFieldEdit
      value={value}
      onChange={handleChange}
      options={{
        reference: 'users',
        displayField: 'nickname',
      }}
    />
  );
});
UserSelectedFormInput.displayName = 'UserSelectedFormInput';
