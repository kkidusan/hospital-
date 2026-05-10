import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    // 1. Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    // 2. Count unread notifications where the lab request was made by this doctor
    const count = await prisma.labResultNotification.count({
      where: {
        // Filter: The original lab request must have been requested by this user
        labRequest: { 
          requestedById: session.user.id 
        },
        isRead: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching unread lab notifications:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}