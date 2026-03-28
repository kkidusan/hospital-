import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  req: NextRequest, 
  { params }: { params: Promise<{ patientId: string }> } // 1. Define params as a Promise
) {
  try {
    // 2. Unwrap the params Promise (Critical for Next.js 15)
    const { patientId } = await params;
    
    const body = await req.json();

    // 3. Validation
    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is missing' }, { status: 400 });
    }

    // 4. Atomic Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // Create Triage Record (Vitals + Assessment)
      const triageRecord = await tx.triage.create({
        data: {
          patientId, // Now correctly defined
          temperature: body.temperature ? parseFloat(body.temperature) : null,
          pulse: body.heartRate ? parseInt(body.heartRate) : null,
          bloodPressure: body.bloodPressure || null,
          spo2: body.spo2 ? parseInt(body.spo2) : null,
          respiratoryRate: body.respiratoryRate ? parseInt(body.respiratoryRate) : null,
          chiefComplaint: body.chiefComplaint,
          triageLevel: body.triageLevel,
          notes: body.notes || "",
        }
      });

      // Update Queue Status to TRIAGED
      await tx.queue.update({
        where: { patientId },
        data: { status: 'TRIAGED' }
      });

      return triageRecord;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (err: any) {
    console.error("Triage Submission Error:", err);
    
    // Check if it's a Prisma error for a non-existent patient
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Triage already exists for this patient' }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to complete triage. Check server logs." }, 
      { status: 500 }
    );
  }
}