import { api } from "@/lib/api";
import { AuthResponse } from "@/types/types";
import { useAuthStore } from "@/stores/authStore";

export const AuthService = {
  async login(credentials: { email: string; password: string }) {
    const response = await api.post<AuthResponse>("auth/login", credentials);


    console.log(response);
    console.log("prueba")

    if (response.data.statusCode === 200) {
      const { token, info: user } = response.data.data;
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userInfo", JSON.stringify(user));
      
      useAuthStore.getState().setAuth(token, user);
      return response.data.data;
    }
    throw new Error("Error de autenticación");
  },
  async checkAuth(): Promise<boolean> {
    const token = sessionStorage.getItem("authToken"); 

    if (!token) return false;

    return true;
  },

};

api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    try {
      const token = sessionStorage.getItem("authToken");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        useAuthStore.getState().clearAuth(); 
      }
    } catch (error) {
      console.error('Error en interceptor:', error);
      useAuthStore.getState().clearAuth();
    }
  }
  return config;
});