import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { 
      patientId, diagnoses, notes, 
      followUpDate, followUpTime, followUpType, followUpReason 
    } = body;

    if (!patientId) return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current context (Triage & Completed Labs/Radiology for this session)
      const [triage, labs, radiology] = await Promise.all([
        tx.triage.findUnique({ where: { patientId } }),
        tx.labRequest.findMany({ 
          where: { patientId, status: 'COMPLETED' }, 
          include: { tests: true } 
        }),
        tx.radiologyRequest.findMany({ 
          where: { patientId, status: 'COMPLETED' } 
        })
      ]);

      // 2. Create the Consultation Record
      const consultation = await tx.consultation.create({
        data: {
          patientId,
          createdById: session.user.id,
          clinicalNotes: notes,
          diagnoses: diagnoses,
          vitals: triage ? {
            temp: triage.temperature,
            bp: triage.bloodPressure,
            pulse: triage.pulse,
            spo2: triage.spo2,
            weight: triage.weight
          } : {},
          followUpDate: followUpDate ? new Date(followUpDate) : null,
          followUpTime,
          followUpType,
          followUpReason,
          chiefComplaint: triage?.chiefComplaint || "Consultation",
        },
      });

      // 3. GENERATE THE TIMELINE ENTRY (The "Modern" Way)
      const historyEntry = {
        visitId: consultation.id,
        date: new Date().toISOString(),
        doctor: session.user.name,
        diagnoses: diagnoses, 
        notes: notes,
        vitals: triage || {},
        // Capture what happened in the labs during THIS visit
        labs: labs.map(l => ({
          requestDate: l.createdAt,
          results: l.tests.map(t => ({ name: t.testName, result: t.result, flag: t.flag }))
        })),
        radiology: radiology.map(r => ({
          type: r.scanType || r.xrayType,
          impression: r.impression
        }))
      };

      // 4. Update Patient History (Atomic Push)
      // Note: Using 'push' ensures we don't overwrite previous history
      const existingHistory = await tx.patientHistory.findFirst({ where: { patientId } });
      
      if (existingHistory) {
        await tx.patientHistory.update({
          where: { id: existingHistory.id },
          data: {
            historyEntries: { push: historyEntry },
            latestDiagnosis: diagnoses[0]?.name || "Follow-up",
            latestNotes: notes
          }
        });
      } else {
        await tx.patientHistory.create({
          data: {
            patientId,
            historyEntries: [historyEntry],
            latestDiagnosis: diagnoses[0]?.name || "Initial Visit",
            latestNotes: notes
          }
        });
      }

      // 5. Patient Master Update
      await tx.patient.update({
        where: { id: patientId },
        data: {
          lastDiagnosis: diagnoses[0]?.name,
          lastSummary: notes,
          lastVisitDate: new Date(),
        }
      });

      // 6. Workflow Cleanup
      await tx.queue.deleteMany({ where: { patientId } });
      await tx.triage.deleteMany({ where: { patientId } });

      return consultation;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error: any) {
    console.error("[CRITICAL_FINALIZE_ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}