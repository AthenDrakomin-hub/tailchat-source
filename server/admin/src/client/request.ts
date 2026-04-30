import axios from 'axios';
import {
  authStorageKey,
  clearAdminAuthStorage,
  redirectToAdminLogin,
} from './auth';
import _set from 'lodash/set';

/**
 * 创建请求实例
 */
function createRequest() {
  const ins = axios.create({
    baseURL: '/admin/api',
  });

  ins.interceptors.request.use(async (val) => {
    try {
      const { token } = JSON.parse(
        window.localStorage.getItem(authStorageKey) ?? '{}'
      );
      if (typeof token === 'string' && token) {
        _set(val, ['headers', 'Authorization'], `Bearer ${token}`);
      }

      return val;
    } catch (err) {
      throw err;
    }
  });

  ins.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        clearAdminAuthStorage();
        redirectToAdminLogin();
      }

      throw error;
    }
  );

  return ins;
}

export const request = createRequest();

export async function callAction(
  actionName: string,
  params: Record<string, any>
) {
  const { data } = await request.post('/callAction', {
    action: actionName,
    params,
  });

  if (data?.success === false) {
    throw new Error(
      typeof data?.error === 'string' && data.error
        ? data.error
        : 'call action failed'
    );
  }

  return data;
}
