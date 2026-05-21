import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

// --- Custom Security Error Classes ---
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

class TwoFactorRequiredError extends AuthError {
  constructor() {
    super("2FA_REQUIRED");
    this.name = "TwoFactorRequiredError";
    this.code = "2fa_required";
  }
}

class InvalidTwoFactorError extends AuthError {
  constructor() {
    super("Security Protocol: Invalid verification token code.");
    this.name = "InvalidTwoFactorError";
    this.code = "invalid_two_factor";
  }
}

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "Two Factor Code", type: "text" },
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

        // Query user table
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

        // Security Check: Brute Force Protection (Server-side)
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

        // STEP 1: Verify primary credentials first
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

        // STEP 2: Credentials are correct. Check if 2FA system rule is active.
        const providedCode = credentials.twoFactorCode as string;

        try {
          const twoFactorSetting = await prisma.systemSetting.findUnique({
            where: { key: "two_factor_auth" }
          });

          if (twoFactorSetting && twoFactorSetting.value === "On") {
            // If the user hasn't provided a code yet, halt login and command client to show 2FA UI
            if (!providedCode) {
              throw new TwoFactorRequiredError();
            }

            // A code was provided, now validate it against the database system code
            const codeSetting = await prisma.systemSetting.findUnique({
              where: { key: "two_factor_code" }
            });

            if (providedCode.trim() !== codeSetting?.value) {
              // Increment failed metrics on incorrect token submission
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  failedLoginAttempts: { increment: 1 },
                  lastFailedLogin: now,
                },
              });
              throw new InvalidTwoFactorError();
            }
          }
        } catch (error) {
          // If it's a specific flow control security error, propagate it directly
          if (error instanceof TwoFactorRequiredError || error instanceof InvalidTwoFactorError) {
            throw error;
          }
          console.error("Configuration system check bypass error context:", error);
        }

        // STEP 3: Complete Authentication Success Matrix
        const currentSessionToken = crypto.randomUUID();

        // Update User Metadata Records
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

        // Write Successful Event to System Logs
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "LOGIN_SUCCESS",
            ipAddress: clientIP,
            userAgent,
            details: { role: user.role },
          },
        });

        // Return user object payload to NextAuth JWT callback mechanics
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
    maxAge: 24 * 60 * 60, // 24 Hours duration metrics
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
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
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email as string;
        session.user.role = token.role;
        session.user.specialty = token.specialty;
        session.user.sessionToken = token.sessionToken;
      }

      if (token.id && token.sessionToken) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
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