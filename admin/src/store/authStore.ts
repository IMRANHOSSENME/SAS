import { create } from 'zustand';
import { User } from '../types/common';
import { setSessionToken, clearSession } from '../lib/auth/session';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: (user, token) => {
    setSessionToken(token);
    set({ user, isAuthenticated: true, isLoading: false });
  },
  logout: () => {
    clearSession();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
}));
