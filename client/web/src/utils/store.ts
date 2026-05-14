import create from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  token: string | null;
  userInfo: any;
  rememberMe: boolean;
  setToken: (token: string, rememberMe?: boolean) => void;
  setUserInfo: (info: any) => void;
  clearUser: () => void;
}

// Fix: Token persistence with localStorage "remember me" functionality
export const useUserStore = create<UserState>(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      rememberMe: false,
      setToken: (token, rememberMe = false) => set({ token, rememberMe }),
      setUserInfo: (info) => set({ userInfo: info }),
      clearUser: () => set({ token: null, userInfo: null, rememberMe: false }),
    }),
    {
      name: 'tailchat-user-storage',
      getStorage: () => localStorage,
    }
  )
);
// Fix: Token persistence store
// Fix: Token persistence store
