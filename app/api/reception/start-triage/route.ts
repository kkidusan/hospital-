// app/api/reception/start-triage/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Ensure this matches your prisma client path

export async function POST(request: Request) {
  try {
    // 1. EXTRACT patientId from the incoming request body
    const body = await request.json();
    const { patientId } = body;

    // 2. VALIDATE that the ID exists
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // 3. RUN the transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update or Create the Queue entry
      const queueEntry = await tx.queue.upsert({
        where: { patientId: patientId },
        update: { 
          status: 'IN_TRIAGE', 
          updatedAt: new Date() 
        },
        create: {
          patientId: patientId,
          status: 'IN_TRIAGE',
        },
      });

      // Update the patient timestamp
      await tx.patient.update({
        where: { id: patientId },
        data: { updatedAt: new Date() }
      });

      return queueEntry;
    });

    return NextResponse.json({ success: true, queue: result });

  } catch (error: any) {
    console.error('Triage Start Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}