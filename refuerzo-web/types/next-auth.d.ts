import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: string;
    accessToken: string;
    emailVerified?: Date | null;
    isActive?: boolean;
  }

  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role?: string;
      emailVerified?: Date | null;
      isActive?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      role?: string;
      emailVerified?: Date | null;
      isActive?: boolean;
    };
  }
}
