import { request } from '../api/request';

export interface WxNotifyStatus {
  available: boolean;
  provider: 'wxpusher';
  isBound: boolean;
  isEnabled: boolean;
  uid: string;
  pending?: boolean;
}

export interface WxNotifyBindSession {
  code: string;
  qrcodeUrl: string;
  expiresAt?: string;
}

export async function getWxNotifyStatus(): Promise<WxNotifyStatus> {
  const { data } = await request.get('/api/wxnotify/status');
  return data;
}

export async function createWxNotifyBindSession(): Promise<WxNotifyBindSession> {
  const { data } = await request.post('/api/wxnotify/session', {});
  return data;
}

export async function checkWxNotifyBindSession(
  code: string
): Promise<WxNotifyStatus> {
  const { data } = await request.get(`/api/wxnotify/session/${code}`);
  return data;
}

export async function unbindWxNotify(): Promise<{ success: boolean }> {
  const { data } = await request.post('/api/wxnotify/unbind', {});
  return data;
}

export async function sendWxNotifyTestMessage(): Promise<{ success: boolean }> {
  const { data } = await request.post('/api/wxnotify/test-message', {});
  return data;
}
