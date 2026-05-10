import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

// --- Custom Error Classes ---
class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
    this.code = "invalid_credentials";
  }
}

class TooManyAttemptsError extends AuthError {
  constructor(remainingMinutes: number) {
    super(`Too many failed attempts. Account locked for ${remainingMinutes} minutes.`);
    this.name = "TooManyAttemptsError";
    this.code = "too_many_attempts";
  }
}

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const email = (credentials.email as string).toLowerCase().trim();
        
        // IP and User Agent detection for Audit Logs
        const forwardedFor = req?.headers?.get("x-forwarded-for");
        const realIP = req?.headers?.get("x-real-ip");
        const clientIP = (forwardedFor || realIP || "unknown").split(',')[0].trim();
        const userAgent = req?.headers?.get("user-agent") || "unknown";

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            specialty: true,
            failedLoginAttempts: true,
            lastFailedLogin: true,
            currentSessionToken: true,
          },
        });

        if (!user) throw new InvalidCredentialsError();

        // Security: Brute Force Protection (Server-side)
        const now = new Date();
        const blockDurationMs = 15 * 60 * 1000;
        if (
          user.failedLoginAttempts >= 5 &&
          user.lastFailedLogin &&
          now.getTime() - user.lastFailedLogin.getTime() < blockDurationMs
        ) {
          const remainingMs = user.lastFailedLogin.getTime() + blockDurationMs - now.getTime();
          throw new TooManyAttemptsError(Math.ceil(remainingMs / 60000));
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lastFailedLogin: now,
            },
          });
          throw new InvalidCredentialsError();
        }

        // Generate a unique token for this specific login session
        const currentSessionToken = crypto.randomUUID();

        // Update User Metadata
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lastFailedLogin: null,
            currentSessionToken,
            lastLoginAt: now,
            lastLoginIP: clientIP,
            lastLoginUserAgent: userAgent,
          },
        });

        // Audit Logging
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN_SUCCESS",
            ipAddress: clientIP,
            userAgent,
            details: { role: user.role },
          },
        });

        // Return user object (this goes to the JWT callback)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          specialty: user.specialty,
          sessionToken: currentSessionToken,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      // If user exists, it means we just logged in. 
      // We persist the ID and Role into the encrypted JWT cookie.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.specialty = user.specialty;
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Map data from the JWT token to the Session object
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.role = token.role;
        session.user.specialty = token.specialty;
        session.user.sessionToken = token.sessionToken;
      }

      // SECURITY: Check if this session is still the "active" one in the DB
      if (token.id && token.sessionToken) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { currentSessionToken: true },
        });

        // If the token in the cookie doesn't match the DB, the session is invalid
        if (!dbUser || dbUser.currentSessionToken !== token.sessionToken) {
          return null as any; 
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;