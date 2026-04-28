import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const queue = await prisma.queue.findMany({
      where: { 
        OR: [
          { status: 'TRIAGED' },
          { status: 'WAITING' } 
        ]
      },
      include: {
        patient: {
          include: { triage: true }
        }
      },
      orderBy: { enteredAt: 'asc' }
    });

    return NextResponse.json(queue);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}