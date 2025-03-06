import { api } from "@/lib/api";
import { signIn, signOut, getSession } from "next-auth/react";
import { Session } from "next-auth";

export const AuthService = {
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await getSession();
      return session?.accessToken || null;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  },

  async login(credentials: { email: string; password: string }): Promise<Session | null> {
    const response = await signIn("credentials", {
      redirect: false,
      ...credentials,
    });
    console.log(response);
    if (response?.error) throw new Error(response.error);
    
    const session = await getSession();
    return session;
  },

  async logout(): Promise<void> {
    await signOut({ redirect: false });
  },

};

api.interceptors.request.use(async (config) => {
  console.log("Request interceptor")
  if (typeof window !== "undefined") {
    try {
      const token = await AuthService.getAccessToken();
      console.log("Token:", token);
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Interceptor error:", error);
    }
  }
  return config;
});