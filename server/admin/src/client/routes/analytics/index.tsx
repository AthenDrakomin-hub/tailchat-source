import fileSize from 'filesize';
import React from 'react';
import { FeatureStatusCard } from '../../components/FeatureStatusCard';
import {
  Card,
  Grid,
  Spin,
  Tooltip,
  Typography,
  useAsync,
  useTranslation,
} from 'tushan';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'tushan/chart';
import { request } from '../../request';

export const Analytics: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const { value: analyticsHealth, loading } = useAsync(async () => {
    try {
      const { data } = await request.get('/analytics/activeGroups');
      if (data.available === false || data.success === false) {
        return {
          analyticsUnavailable: true,
          analyticsError: String(data.error ?? 'analytics unavailable'),
        };
      }

      return {
        analyticsUnavailable: false,
        analyticsError: '',
      };
    } catch (err: any) {
      return {
        analyticsUnavailable: true,
        analyticsError: err?.message ? String(err.message) : 'analytics unavailable',
      };
    }
  }, []);

  if (loading) {
    return <Spin />;
  }

  if (analyticsHealth?.analyticsUnavailable) {
    return (
      <FeatureStatusCard
        title="分析"
        summary="当前无法读取分析数据，因此页面进入降级态。"
        actionHint="请确认 analytics 相关接口可访问，并检查数据库聚合依赖是否正常。"
        detail={analyticsHealth.analyticsError}
      />
    );
  }

  return (
    <div>
      <Grid.Row gutter={4}>
        <Grid.Col md={12}>
          <Card>
            <Typography.Title heading={4}>
              {t('custom.analytics.activeGroupTop5')}
            </Typography.Title>

            <ActiveGroupChart />
          </Card>
        </Grid.Col>

        <Grid.Col md={12}>
          <Card>
            <Typography.Title heading={4}>
              {t('custom.analytics.activeUserTop5')}
            </Typography.Title>

            <ActiveUserChart />
          </Card>
        </Grid.Col>
      </Grid.Row>

      <Grid.Row gutter={4} style={{ marginTop: 8 }}>
        <Grid.Col md={12}>
          <Card>
            <Typography.Title heading={4}>
              {t('custom.analytics.largeGroupTop5')}
            </Typography.Title>

            <LargeGroupChart />
          </Card>
        </Grid.Col>

        <Grid.Col md={12}>
          <Card>
            <Typography.Title heading={4}>
              {t('custom.analytics.fileStorageUserTop5')}
            </Typography.Title>

            <FileStorageChart />
          </Card>
        </Grid.Col>
      </Grid.Row>
    </div>
  );
});
Analytics.displayName = 'Analytics';

const ActiveGroupChart: React.FC = React.memo(() => {
  const { value } = useAsync(async () => {
    try {
      const { data } = await request.get<{
        activeGroups: {
          groupId: string;
          groupName: string;
          messageCount: number;
        }[];
      }>('/analytics/activeGroups');

      return {
        data: data.activeGroups,
        error: '',
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.message ? String(err.message) : 'analytics unavailable',
      };
    }
  }, []);

  if (value?.error) {
    return (
      <AnalyticsUnavailable
        detail={value.error}
        hint="请确认 /analytics/activeGroups 可访问。"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={value?.data ?? []}
        layout="vertical"
        maxBarSize={40}
        margin={{ left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="messageCount" type="number" />
        <YAxis dataKey="groupName" type="category" />
        <Tooltip />
        <Bar dataKey="messageCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
});
ActiveGroupChart.displayName = 'ActiveGroupChart';

const ActiveUserChart: React.FC = React.memo(() => {
  const { value } = useAsync(async () => {
    try {
      const { data } = await request.get<{
        activeUsers: {
          groupId: string;
          groupName: string;
          messageCount: number;
        }[];
      }>('/analytics/activeUsers');

      return {
        data: data.activeUsers,
        error: '',
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.message ? String(err.message) : 'analytics unavailable',
      };
    }
  }, []);

  if (value?.error) {
    return (
      <AnalyticsUnavailable
        detail={value.error}
        hint="请确认 /analytics/activeUsers 可访问。"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={value?.data ?? []}
        layout="vertical"
        maxBarSize={40}
        margin={{ left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="messageCount" type="number" />
        <YAxis dataKey="userName" type="category" />
        <Tooltip />
        <Bar dataKey="messageCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
});
ActiveUserChart.displayName = 'ActiveUserChart';

const LargeGroupChart: React.FC = React.memo(() => {
  const { value } = useAsync(async () => {
    try {
      const { data } = await request.get<{
        largeGroups: {
          name: string;
          memberCount: number;
        }[];
      }>('/analytics/largeGroups');

      return {
        data: data.largeGroups,
        error: '',
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.message ? String(err.message) : 'analytics unavailable',
      };
    }
  }, []);

  if (value?.error) {
    return (
      <AnalyticsUnavailable
        detail={value.error}
        hint="请确认 /analytics/largeGroups 可访问。"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={value?.data ?? []}
        layout="vertical"
        maxBarSize={40}
        margin={{ left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="memberCount" type="number" />
        <YAxis dataKey="name" type="category" />
        <Tooltip />
        <Bar dataKey="memberCount" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
});
LargeGroupChart.displayName = 'LargeGroupChart';

const FileStorageChart: React.FC = React.memo(() => {
  const { value } = useAsync(async () => {
    try {
      const { data } = await request.get<{
        fileStorageUserTop: {
          userId: string;
          userName: string;
          fileStorageTotal: number;
        }[];
      }>('/analytics/fileStorageUserTop');

      return {
        data: data.fileStorageUserTop,
        error: '',
      };
    } catch (err: any) {
      return {
        data: [],
        error: err?.message ? String(err.message) : 'analytics unavailable',
      };
    }
  }, []);

  if (value?.error) {
    return (
      <AnalyticsUnavailable
        detail={value.error}
        hint="请确认 /analytics/fileStorageUserTop 可访问。"
      />
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={value?.data ?? []}
        layout="vertical"
        maxBarSize={40}
        margin={{ left: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="fileStorageTotal"
          type="number"
          tickFormatter={(val) => fileSize(val)}
        />
        <YAxis dataKey="userName" type="category" />
        <Tooltip />
        <Bar dataKey="fileStorageTotal" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
});
FileStorageChart.displayName = 'FileStorageChart';

const AnalyticsUnavailable: React.FC<{
  detail: string;
  hint: string;
}> = React.memo(({ detail, hint }) => {
  return (
    <FeatureStatusCard
      title="分析图表"
      summary="当前图表数据暂不可用，因此该图表进入降级态。"
      actionHint={hint}
      detail={detail}
    />
  );
});
AnalyticsUnavailable.displayName = 'AnalyticsUnavailable';
