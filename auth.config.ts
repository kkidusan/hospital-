// auth.config.ts (root level)
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { prisma } from "./lib/db"
import bcrypt from "bcryptjs"
import { AuthError } from "next-auth"

class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password")
    this.name = "InvalidCredentialsError"
    this.code = "invalid_credentials"
  }
}

class TooManyAttemptsError extends AuthError {
  constructor(remainingMinutes: number) {
    super(`Too many attempts. Try again in ${remainingMinutes} minutes`)
    this.name = "TooManyAttemptsError"
    this.code = "too_many_attempts"
  }
}

export default {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = (credentials.email as string).toLowerCase().trim()
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user) throw new InvalidCredentialsError()

        const now = new Date()
        const blockDurationMs = 15 * 60 * 1000

        if (
          user.failedLoginAttempts >= 3 &&
          user.lastFailedLogin &&
          now.getTime() - user.lastFailedLogin.getTime() < blockDurationMs
        ) {
          const remainingMs = user.lastFailedLogin.getTime() + blockDurationMs - now.getTime()
          const remainingMin = Math.ceil(remainingMs / 60000)
          throw new TooManyAttemptsError(remainingMin)
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: { increment: 1 },
              lastFailedLogin: now
            }
          })
          throw new InvalidCredentialsError()
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lastFailedLogin: null }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],

  pages: {
    signIn: "/login"
  },

  session: { strategy: "jwt" },

  secret: process.env.AUTH_SECRET,  // ← explicitly read it (helps in some edge cases)

  callbacks: {
    jwt({ token, user }) {
      // On sign in → add role & id to token
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    session({ session, token }) {
      // Make role & id available in useSession() / getServerSession()
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  }
} satisfies NextAuthConfig