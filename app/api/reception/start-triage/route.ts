import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

async function generateVisitId(tx: any) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate().toString().padStart(2, '0');
  const monthStr = month.toString().padStart(2, '0');
  const loc = 'VI'; 

  const sequence = await tx.patientSequence.upsert({
    where: { loc_year_month: { loc, year, month } },
    update: { lastSeq: { increment: 1 } },
    create: { loc, year, month, lastSeq: 1 }
  });

  const seqNum = sequence.lastSeq.toString().padStart(4, '0');
  return `${loc}-${year}-${monthStr}-${day}-${seqNum}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, isDirect = false, assignedDoctorId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate a unique Visit ID for this session
      const newVisitId = await generateVisitId(tx);
      
      // 2. Determine target status
      // If direct, they go straight to 'TRIAGED' status (available for doctor)
      const targetStatus = isDirect ? 'TRIAGED' : 'IN_TRIAGE';

      // 3. Upsert Queue entry
      // We explicitly map the assignedDoctorId if isDirect is true
      const queueEntry = await tx.queue.upsert({
        where: { patientId: patientId },
        update: { 
          status: targetStatus,
          visitId: newVisitId,
          assignedDoctorId: isDirect ? assignedDoctorId : null,
          updatedAt: new Date() 
        },
        create: {
          patientId: patientId,
          visitId: newVisitId,
          status: targetStatus,
          assignedDoctorId: isDirect ? assignedDoctorId : null,
        },
      });

      // 4. Update the Patient record to show recent activity
      await tx.patient.update({
        where: { id: patientId },
        data: { 
          lastVisitDate: new Date(),
          updatedAt: new Date() 
        }
      });

      return queueEntry;
    });

    return NextResponse.json({ 
      success: true, 
      visitId: result.visitId,
      status: result.status 
    });

  } catch (error: any) {
    console.error('Triage/Direct Start Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}