import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  // 1. User tipini kengaytiramiz
  interface User {
    id: string;
    username: string;
    role: string;
    accessToken: string;
    fullName?: string;
  }

  // 2. Session tipini kengaytiramiz
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      accessToken: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  // 3. JWT token tipini kengaytiramiz
  interface JWT {
    id: string;
    username: string;
    role: string;
    accessToken: string;
  }
}