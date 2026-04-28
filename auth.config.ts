import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

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

        const currentSessionToken = crypto.randomUUID();

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

        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN_SUCCESS",
            ipAddress: clientIP,
            userAgent,
            details: { role: user.role },
          },
        });

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
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.specialty = user.specialty;
        token.sessionToken = (user as any).sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.id || !session?.user) return session;

      session.user.id = token.id as string;
      session.user.role = token.role as string;
      (session.user as any).specialty = token.specialty;
      (session.user as any).sessionToken = token.sessionToken;

      if (token.sessionToken) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { currentSessionToken: true },
        });

        if (!dbUser || dbUser.currentSessionToken !== token.sessionToken) {
          return null as any;
        }
      }

      return session;
    },
  },
} satisfies NextAuthConfig;