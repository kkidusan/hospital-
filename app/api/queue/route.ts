import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { auth } from "@/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Get current doctor session
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doctorId = session.user.id;

    // 2. Fetch ONLY patients assigned to this doctor
    const queue = await prisma.queue.findMany({
      where: { 
        assignedDoctorId: doctorId,
        status: {
          in: ['TRIAGED', 'WAITING'] // Only active statuses
        }
      },
      include: {
        patient: {
          include: { 
            triage: {
              orderBy: { createdAt: 'desc' },
              take: 1
            } 
          }
        }
      },
      orderBy: { enteredAt: 'asc' }
    });

    return NextResponse.json(queue);
  } catch (error) {
    console.error("Queue fetch error:", error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}