import React from 'react';
import { Card, Typography, Input } from 'tushan';

export type FeatureStatusCardProps = {
  title: string;
  summary: string;
  detail?: string;
  actionHint?: string;
};

export const FeatureStatusCard: React.FC<FeatureStatusCardProps> = React.memo(
  ({ title, summary, detail = '', actionHint = '' }) => {
    return (
      <Card>
        <Typography.Title heading={4}>{title}</Typography.Title>
        <Typography.Paragraph>{summary}</Typography.Paragraph>
        {actionHint ? (
          <Typography.Paragraph type="secondary">{actionHint}</Typography.Paragraph>
        ) : null}
        {detail ? <Input.TextArea value={detail} rows={4} readOnly /> : null}
      </Card>
    );
  }
);

FeatureStatusCard.displayName = 'FeatureStatusCard';
