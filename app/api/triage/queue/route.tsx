// app/api/triage/queue/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust this to your actual prisma client path

export const dynamic = 'force-dynamic'; // Prevent caching so the queue is always fresh

export async function GET() {
  try {
    const queue = await prisma.patient.findMany({
      where: {
        queue: {
          // Only show patients waiting for triage
          status: 'IN_TRIAGE' 
        }
      },
      select: {
        id: true,
        mrn: true,
        fullName: true,
        gender: true,
        phoneNumber: true,
        queue: {
          select: {
            enteredAt: true,
            status: true
          }
        }
      },
      orderBy: {
        queue: {
          enteredAt: 'asc' // Oldest first (FIFO)
        }
      }
    });

    return NextResponse.json({ queue });
  } catch (error) {
    console.error("Queue API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 });
  }
}