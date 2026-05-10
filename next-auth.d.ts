import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `auth`, and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'RECEPTION' | 'TRIAGE' | 'SPECIALIST' | 'LABORATORY' | 'RADIOLOGY' | 'BILLING' | 'FINANCIAL' | 'PHARMACIST' | 'INVENTORY';
      specialty?: string | null;
      sessionToken?: string;
    } & DefaultSession["user"];
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `jwt` callback.
   */
  interface User {
    id?: string;
    role: string;
    specialty?: string | null;
    sessionToken?: string;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    role: string;
    specialty?: string | null;
    sessionToken?: string;
  }
}