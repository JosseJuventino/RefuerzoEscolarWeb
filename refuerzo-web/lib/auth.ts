import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "@/lib/api";
import { AuthResponse } from "@/types/types";

declare module "next-auth" {
  interface User {
    accessToken: string;
    emailVerified?: Date | null;
  }

  interface Session {
    accessToken: string;
    user: {
      id?: string | null;
      name?: string | null;
      email?: string;
      image?: string | null;
      emailVerified?: Date | null;
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: {
      id?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      emailVerified?: Date | null;
      role?: string | null;
    };
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await api.post<AuthResponse>("auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { data } = response.data;
          if (!data?.token || !data?.info) return null;

          return {
            id: data.info.email,
            email: data.info.email,
            name: data.info.nombreCompleto,
            image: data.info.image,
            accessToken: data.token,
            emailVerified: null,
            role: data.info.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string; }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({
      token,
      user,
    }: {
      token: import("next-auth/jwt").JWT;
      user?: import("next-auth").User;
    }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.user = {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          emailVerified: user.emailVerified,
          role: user.role,
        };
        
        token.exp = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: import("next-auth/jwt").JWT;
    }) {
      session.accessToken = token.accessToken;
      session.user = {
        id: token.user?.id || "",
        name: token.user?.name || null,
        email: token.user?.email || "",
        image: token.user?.image || null,
        emailVerified: token.user?.emailVerified || null,
        role: token.user?.role || null
      };
      
      session.expires = token.exp ? new Date(token.exp * 1000).toISOString() : new Date().toISOString();
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt" as const,
    maxAge: 2 * 60 * 60
  },
  jwt: {
    maxAge: 2 * 60 * 60, 
  },
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
};

