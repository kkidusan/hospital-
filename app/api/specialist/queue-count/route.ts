import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();

    // 1. Check if user is logged in
    if (!session?.user?.id) {
      return NextResponse.json({ count: 0 }, { status: 401 });
    }

    // 2. Count only patients assigned to THIS specialist
    const count = await prisma.queue.count({
      where: {
        assignedDoctorId: session.user.id, // Filter by the specialist's ID
        status: { in: ['TRIAGED', 'EMERGENCY'] }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Queue count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}