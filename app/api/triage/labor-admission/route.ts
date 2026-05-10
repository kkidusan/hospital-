import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      patientName, 
      age, 
      obstetricHistory, 
      laborProgress, 
      triageLevel, 
      bedNumber, 
      vitals 
    } = body;

    // 1. Prepare Date Segments for MRN
    const now = new Date();
    const year = now.getFullYear() % 100; // 2026 -> 26
    const month = now.getMonth() + 1;    // 0-11 -> 1-12
    const day = now.getDate();           // 10

    const yearStr = year.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const datePrefix = `${yearStr}-${monthStr}-${dayStr}`;

    const result = await prisma.$transaction(async (tx) => {
      
      // 2. Manage Sequential Numbering using PatientSequence table
      const sequenceRecord = await tx.patientSequence.upsert({
        where: {
          loc_year_month: {
            loc: "MATERNITY",
            year: now.getFullYear(),
            month: month,
          },
        },
        update: {
          lastSeq: { increment: 1 },
        },
        create: {
          loc: "MATERNITY",
          year: now.getFullYear(),
          month: month,
          lastSeq: 1,
        },
      });

      // 3. Construct Final MRN: MAT-26-05-10-0001
      const sequenceStr = sequenceRecord.lastSeq.toString().padStart(4, '0');
      const formattedMRN = `MAT-${datePrefix}-${sequenceStr}`;

      // 4. Create Patient Record
      const patient = await tx.patient.create({
        data: {
          fullName: patientName,
          age: parseInt(age) || 0,
          gender: "FEMALE",
          mrn: formattedMRN,
        },
      });

      // 5. Verify and Reserve Bed
      const bed = await tx.bed.findFirst({
        where: { bedNumber: bedNumber },
      });

      if (!bed) throw new Error(`Bed ${bedNumber} not found.`);
      if (bed.isOccupied) throw new Error(`Bed ${bedNumber} is already occupied.`);

      // 6. Create Triage Assessment
      await tx.triage.create({
        data: {
          patientId: patient.id,
          triageLevel: triageLevel,
          chiefComplaint: `MATERNITY ADMISSION: G${obstetricHistory.gravida}P${obstetricHistory.para}`,
          bloodPressure: vitals.bp,
          pulse: parseInt(vitals.pulse) || null,
          temperature: parseFloat(vitals.temp) || null,
          spo2: parseInt(vitals.spo2) || null,
          assessmentNotes: JSON.stringify(laborProgress),
        },
      });

      // 7. Create Active Admission
      const admission = await tx.admission.create({
        data: {
          patientId: patient.id,
          bedId: bed.id,
          source: "LABOR_TRIAGE", 
          status: "ACTIVE", // Keeps patient in active flow
          admissionDate: new Date(),
          notes: "Admitted via Maternity Triage"
        },
      });

      // 8. Mark Bed as Occupied
      await tx.bed.update({
        where: { id: bed.id },
        data: { isOccupied: true },
      });

      // 9. Update Queue Status to MATERNITY
      // This ensures they appear in the specialized Maternity dashboard
      await tx.queue.upsert({
        where: { patientId: patient.id },
        update: { status: "MATERNITY" }, 
        create: {
          patientId: patient.id,
          status: "MATERNITY",
        }
      });

      return { 
        patientId: patient.id, 
        mrn: formattedMRN, 
        admissionId: admission.id 
      };
    });

    return NextResponse.json({ 
      success: true, 
      message: "Maternity admission completed successfully",
      data: result 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Maternity Admission Error:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}