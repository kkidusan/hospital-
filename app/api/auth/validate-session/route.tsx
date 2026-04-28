// app/api/auth/validate-session/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId, sessionToken } = await req.json();

  if (userId !== session.user.id) {
    return Response.json({ message: "Invalid session" }, { status: 403 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentSessionToken: true },
  });

  if (!user || user.currentSessionToken !== sessionToken) {
    return Response.json({
      message: "Your session has been terminated. You were logged out from another device."
    }, { status: 403 });
  }

  return Response.json({ valid: true });
}