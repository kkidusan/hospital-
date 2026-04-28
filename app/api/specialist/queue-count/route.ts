import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const count = await prisma.queue.count({
      where: {
        status: { in: ['TRIAGED', 'EMERGENCY'] }
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Queue count error:', error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}