// app/api/notifications/lab-unread-count/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';                    // ← Use this (v5 style)
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();   // ← Modern v5 way

    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    const count = await prisma.labResultNotification.count({
      where: {
        // Choose one:
        // completedById: session.user.id,        // Lab technician sees their own completed labs
        // OR
        labRequest: { requestedById: session.user.id }, // Doctor sees labs they requested

        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread lab notifications:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}