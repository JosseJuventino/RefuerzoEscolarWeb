// lib/axios-interceptor.ts
import { api } from "@/lib/api";
let isInterceptorSetup = false;

export const setupAxiosInterceptor = () => {
  if (typeof window === "undefined" || isInterceptorSetup) return;

  api.interceptors.request.use(async (config) => {
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error("Interceptor error (client-side only):", error);
    }
    return config;
  });

  isInterceptorSetup = true;
};