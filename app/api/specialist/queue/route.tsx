import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const queue = await prisma.queue.findMany({
      where: { status: 'TRIAGED' },
      include: {
        patient: {
          include: {
            triage: true // Get the vitals from the triage step
          }
        }
      },
      orderBy: { enteredAt: 'asc' }
    });

    return NextResponse.json(queue);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch queue" }, { status: 500 });
  }
}