import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      infantName, 
      motherMrn, 
      triageLevel, 
      selectedBedId, 
      vitals, 
      assessment 
    } = body;

    if (!infantName || !selectedBedId || !triageLevel) {
      return NextResponse.json({ error: "Missing required fields: Name, Bed, or Level" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // 1. Generate Sequence
      const sequence = await tx.patientSequence.upsert({
        where: { 
          loc_year_month: { loc: 'NEO', year, month } 
        },
        update: { lastSeq: { increment: 1 } },
        create: { loc: 'NEO', year, month, lastSeq: 1 }
      });

      const mrn = `NEO-${year}${month.toString().padStart(2, '0')}-${sequence.lastSeq.toString().padStart(4, '0')}`;

      // 2. Create Patient
      const patient = await tx.patient.create({
        data: {
          mrn,
          fullName: infantName,
          age: 0,
          ageUnit: "days",
          emergencyName: `Mother: ${motherMrn}`,
          address: `Maternal Link: ${motherMrn}`,
        }
      });

      // 3. FIXED: Update Bed (Using updateMany to avoid P2025 if ID doesn't exist)
      const bedUpdate = await tx.bed.updateMany({
        where: { id: selectedBedId },
        data: { isOccupied: true }
      });

      // 4. Create Admission
      const admission = await tx.admission.create({
        data: {
          patientId: patient.id,
          bedId: selectedBedId,
          source: 'LABOR_TRIAGE',
          status: 'ACTIVE',
          notes: `Gestation: ${assessment.gestation}, Weight: ${assessment.weight}g. Bed update status: ${bedUpdate.count > 0 ? 'Success' : 'Bed ID not in DB'}`,
        }
      });

      // 5. Create Triage
      await tx.triage.create({
        data: {
          patientId: patient.id,
          temperature: parseFloat(vitals.temp) || null,
          pulse: parseInt(vitals.hr) || null,
          respiratoryRate: parseInt(vitals.rr) || null,
          spo2: parseInt(vitals.spo2) || null,
          weight: parseFloat(assessment.weight) || null,
          chiefComplaint: "NICU Admission",
          triageLevel: triageLevel,
          assessmentNotes: JSON.stringify({
            apgar: assessment.apgar,
            respSupport: assessment.respSupport
          })
        }
      });

      return { mrn, patientId: patient.id };
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error: any) {
    console.error("NICU_TRIAGE_POST_ERROR", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal Server Error" 
    }, { status: 500 });
  }
}