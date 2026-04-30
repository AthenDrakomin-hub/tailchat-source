import {
  AuthProvider,
  createAuthHttpClient,
  createAuthProvider,
  HTTPClient,
} from 'tushan';

export const authStorageKey = 'tailchat:admin:auth';

export function clearAdminAuthStorage() {
  window.localStorage.removeItem(authStorageKey);
}

export function redirectToAdminLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/admin/login') {
    window.location.href = '/admin/login';
  }
}

export const authProvider: AuthProvider = createAuthProvider({
  authStorageKey,
  loginUrl: '/admin/api/login',
});

const baseAuthHTTPClient = createAuthHttpClient(authStorageKey);

export const authHTTPClient: HTTPClient = async (...args) => {
  try {
    return await baseAuthHTTPClient(...args);
  } catch (err: any) {
    const status = err?.status;
    if (status === 401 || status === 403) {
      clearAdminAuthStorage();
      redirectToAdminLogin();
    }

    throw err;
  }
};
