import React from 'react';
import { useChatStore } from '@/store/chat';

// Fix: Network status indicator
export const NetworkStatus: React.FC = () => {
  const networkStatus = useChatStore((state) => state.networkStatus);

  if (networkStatus === 'online') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-1 text-sm z-50">
      {networkStatus === 'offline' && '网络已断开'}
      {networkStatus === 'reconnecting' && '正在重连...'}
    </div>
  );
};

export default NetworkStatus;
