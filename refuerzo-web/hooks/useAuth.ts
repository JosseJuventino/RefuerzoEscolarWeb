import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { user, token, isInitialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return { 
    user: isMounted ? user : null,
    token: isMounted ? token : null,
    isAuthenticated: isMounted ? !!token : false,
    isInitialized
  };
};