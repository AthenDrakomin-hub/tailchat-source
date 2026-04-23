import { postRequest, getGlobalState } from '@capital/common';
import type { UseTokenOptions } from '@livekit/components-react';
import { useEffect, useState } from 'react';

export function useToken(roomName: string, options: UseTokenOptions = {}) {
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const tokenFetcher = async () => {
      const user = getGlobalState()?.user;
      const isGuest = !user || !user.info;

      const params = new URLSearchParams({ ...options.userInfo, roomName });

      if (isGuest) {
        const nickname = options.userInfo?.name || options.userInfo?.identity || '';
        const { data } = await postRequest(
          `/plugin:com.msgbyte.livekit/generateGuestToken`,
          { roomName, nickname }
        );
        setToken(data.accessToken);
      } else {
        const { data } = await postRequest(
          `/plugin:com.msgbyte.livekit/generateToken?${params.toString()}`
        );
        setToken(data.accessToken);
      }
    };

    tokenFetcher();
  }, [roomName, options]);

  return token;
}
