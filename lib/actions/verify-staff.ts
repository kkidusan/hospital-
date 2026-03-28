// lib/actions/verify-staff.ts
"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export async function verifyStaffSession(expectedRole: string) {
  const session = await auth()

  if (!session?.user?.email) {
    return { isAuthorized: false, reason: "no-session" }
  }

  // Real-time Database Check
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, failedLoginAttempts: true }
  })

  // 1. Check if user exists
  // 2. Check if role matches the layout requirement
  // 3. Optional: Check if account was locked since they logged in
  if (!dbUser || dbUser.role !== expectedRole) {
    return { isAuthorized: false, reason: "role-mismatch" }
  }

  return { isAuthorized: true }
}