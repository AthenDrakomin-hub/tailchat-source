import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { DynamicSizeList } from './DynamicSizeList';

// Fix: Error boundary fallback for white screen crash
const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 text-center">
    <p>列表渲染出错，请刷新页面重试</p>
  </div>
);

export const DynamicVirtualizedList: React.FC = (props) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DynamicSizeList {...props} />
    </ErrorBoundary>
  );
};

export default DynamicVirtualizedList;
