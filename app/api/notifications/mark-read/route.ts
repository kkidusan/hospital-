import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await request.json();

  await prisma.labResultNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}