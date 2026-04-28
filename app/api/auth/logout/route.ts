// app/api/auth/logout/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const userAgent = req.headers.get("user-agent") || "unknown";
    const clientIP = (req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown")
      .split(',')[0]
      .trim();

    // Log the logout action to AuditLog
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: "LOGOUT",
        ipAddress: clientIP,
        userAgent: userAgent,
        details: {
          role: session.user.role,
          reason: "User initiated logout",
        },
      },
    });

    // Optional: Invalidate current session token in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentSessionToken: null,   // This helps with real-time invalidation
      },
    });

    return Response.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ 
      message: "Logout failed" 
    }, { status: 500 });
  }
}