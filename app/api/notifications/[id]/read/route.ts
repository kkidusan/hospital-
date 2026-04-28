import { prisma } from '@/lib/db';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Define as Promise
) {
  try {
    const session = await auth();
    
    // 1. Session Check
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Await the params (Crucial for Next.js 14.2/15+)
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    // 3. Update the notification
    // We include userId in where clause to ensure users can't mark others' notifications as read
    const notification = await prisma.notification.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error("[NOTIFICATION_READ_POST]", error);
    
    // Handle Prisma "Record not found" error specifically
    if (error.code === 'P2025') {
       return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}