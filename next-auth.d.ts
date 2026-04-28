import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      specialty?: string | null;
      sessionToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    specialty?: string | null;
    sessionToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    specialty?: string | null;
    sessionToken?: string;
  }
}