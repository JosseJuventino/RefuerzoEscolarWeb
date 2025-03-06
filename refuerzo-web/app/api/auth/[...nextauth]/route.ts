import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth(authOptions);
