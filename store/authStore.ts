import { create } from 'zustand';
import api from '../lib/api';

export type UserRole = 'Admin' | 'Owner' | 'Agent' | 'Buyer';

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('urbaniq_token', token);
      localStorage.setItem('urbaniq_user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('urbaniq_token');
        localStorage.removeItem('urbaniq_user');
      }
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('urbaniq_token');
      const userStr = localStorage.getItem('urbaniq_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isAuthenticated: true });
        } catch (e) {
          localStorage.removeItem('urbaniq_token');
          localStorage.removeItem('urbaniq_user');
        }
      }
    }
  }
}));

export default useAuthStore;
