import { create } from 'zustand';
import { UserInfo } from '@/types/types';

interface AuthStore {
  token: string | null;
  user: UserInfo | null;
  isInitialized: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  clearAuth: (redirectPath?: string) => void;
  initializeAuth: () => void;
}

const loadInitialState = () => {
  if (typeof window === 'undefined') return { token: null, user: null };
  
  const token = sessionStorage.getItem('authToken');
  const userInfo = sessionStorage.getItem('userInfo');
  
  return {
    token,
    user: userInfo ? JSON.parse(userInfo) : null,
  };
};


export const useAuthStore = create<AuthStore>((set, get) => {
  let inactivityTimer: NodeJS.Timeout | null = null;

  const setupInactivityTimer = () => {
    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        get().clearAuth('/');
      }, 20 * 60 * 1000);
    };

    const cleanup = () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    resetTimer();

    return cleanup;
  };

  return {
    ...loadInitialState(),
    isInitialized: false,
    
    setAuth: (token, user) => {
      sessionStorage.setItem('authToken', token);
      sessionStorage.setItem('userInfo', JSON.stringify(user));
      set({ token, user, isInitialized: true });
      setupInactivityTimer();
    },


     clearAuth: (redirectPath) => {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('userInfo');
      set({ token: null, user: null, isInitialized: true });
      
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }

      if (redirectPath && typeof window !== 'undefined') {
        window.location.href = redirectPath;
      }
    },
    
    initializeAuth: () => {
      const { token, user } = loadInitialState();
      if (token && user) {
        set({ token, user, isInitialized: true });
        setupInactivityTimer();
      } else {
        set({ isInitialized: true });
      }
    }
  };
});