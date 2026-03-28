import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { patientId, description, notes } = await req.json();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Diagnosis record
      const diagnosis = await tx.diagnosis.create({
        data: { patientId, description, notes }
      });

      // 2. Update Queue to COMPLETED
      await tx.queue.update({
        where: { patientId },
        data: { status: 'COMPLETED' }
      });

      return diagnosis;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}