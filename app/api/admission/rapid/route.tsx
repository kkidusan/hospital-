import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AdmissionStatus, AdmissionSource, QueueStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      fullName, age, gender, isAnonymous, 
      selectedBed, triageLevel, complaint, vitals 
    } = body;

    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Find the Bed in the registry using the bedNumber (e.g., "03-B1")
      const bedRecord = await tx.bed.findFirst({
        where: { bedNumber: selectedBed },
      });

      if (!bedRecord) {
        throw new Error(`Bed ${selectedBed} not found in registry.`);
      }

      if (bedRecord.isOccupied) {
        throw new Error(`Bed ${selectedBed} is already occupied.`);
      }

      // 2. Generate TEP ID
      const seq = await tx.patientSequence.upsert({
        where: { loc_year_month: { loc: "TEMP", year: 0, month: 0 } },
        update: { lastSeq: { increment: 1 } },
        create: { loc: "TEMP", year: 0, month: 0, lastSeq: 1 },
      });

      const generatedTEP = `TEP_${String(seq.lastSeq).padStart(4, '0')}`;

      // 3. Create Patient
      const patient = await tx.patient.create({
        data: {
          mrn: generatedTEP,
          fullName: isAnonymous ? `UNKNOWN PATIENT (${generatedTEP})` : fullName,
          age: parseInt(age) || 0,
          gender: gender || "Unknown",
          lastVisitDate: new Date(),
          lastSummary: "FLAG_TEMPORARY_ID",
        },
      });

      // 4. Create Triage
      await tx.triage.create({
        data: {
          patientId: patient.id,
          triageLevel: triageLevel,
          chiefComplaint: complaint,
          bloodPressure: vitals?.bp || null,
          pulse: parseInt(vitals?.pulse) || null,
          temperature: parseFloat(vitals?.temp) || null,
          spo2: parseInt(vitals?.spo2) || null,
        },
      });

      // 5. Create Admission
      // REMOVED 'ward' and 'bedNumber' as they are not fields in your Admission model
      const admission = await tx.admission.create({
        data: {
          patientId: patient.id,
          bedId: bedRecord.id, // Link via the internal ID
          source: AdmissionSource.ER,
          status: AdmissionStatus.ACTIVE,
          notes: `Rapid ER Admission for bed ${selectedBed}`,
        },
      });

      // 6. Update Bed Registry Status
      // This is crucial for your "Ward Management" capacity monitor
      await tx.bed.update({
        where: { id: bedRecord.id },
        data: { isOccupied: true }
      });

      // 7. Add to Emergency Queue
      await tx.queue.create({
        data: {
          patientId: patient.id,
          status: QueueStatus.EMERGENCY,
          position: 1, 
        }
      });

      return { patient, admission };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error: any) {
    console.error("ADMISSION_ERROR:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to process admission" 
    }, { status: 500 });
  }
}