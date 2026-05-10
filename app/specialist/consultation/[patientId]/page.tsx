import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation'; // Fixed import path
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import ConsultationForm from './ConsultationForm';
import ConsultationLayout from './ConsultationClientWrapper';

export default async function ConsultationPage(props: { params: Promise<{ patientId: string }> }) {
  const params = await props.params;
  const patientId = params.patientId;

  const session: Session | null = await auth();
  if (!session?.user?.id) redirect('/login');

  const currentDoctorId = session.user.id;
  const currentDoctorName = session.user.name || "Specialist";

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { 
      triage: true, 
      queue: true, 
      labRequests: { include: { tests: true }, orderBy: { createdAt: 'desc' } }, 
      radiologyRequests: { orderBy: { createdAt: 'desc' } }
    },
  });

  if (!patient) redirect('/specialist');
  const visitId = patient.queue?.visitId || "No Active Visit";

  // --- SERVER ACTIONS ---

  async function handleLabSubmit(formData: FormData) {
    'use server';
    const pId = formData.get('patientId') as string;
    const clinicalIndication = (formData.get('clinicalIndication') as string)?.trim() || "Not specified";
    const labNotes = (formData.get('labNotes') as string)?.trim() || null;
    const selectedTestNames = formData.getAll('labTests') as string[];
    
    if (selectedTestNames.length === 0) throw new Error("Please select at least one laboratory test.");

    let newLabRequestId: string = '';
    await prisma.$transaction(async (tx) => {
      const labRequest = await tx.labRequest.create({
        data: {
          patientId: pId,
          requestedById: currentDoctorId,
          requestedByName: currentDoctorName,
          clinicalIndication,
          labNotes,
          status: "PENDING_PAYMENT",
          tests: {
            create: selectedTestNames.map((testName) => ({
              testName: testName.trim(),
              category: "OTHERS",
            })),
          },
        },
      });
      newLabRequestId = labRequest.id;

      let subTotal = 0;
      const invoiceItems: any[] = [];
      for (const testName of selectedTestNames) {
        const service = await tx.serviceDefinition.findFirst({
          where: { name: { equals: testName.trim(), mode: 'insensitive' }, category: 'LABORATORY' }
        });
        const price = service?.basePrice || 150;
        invoiceItems.push({ 
          serviceName: testName, 
          category: 'LABORATORY', 
          quantity: 1, 
          total: price, 
          labRequestId: labRequest.id 
        });
        subTotal += price;
      }

      if (invoiceItems.length > 0) {
        const taxRate = 0.15;
        const taxAmount = subTotal * taxRate;
        await tx.invoice.create({
          data: {
            patientId: pId,
            createdById: currentDoctorId,
            subTotal, 
            taxRate, 
            taxAmount,
            totalAmount: subTotal + taxAmount,
            status: 'PENDING',
            relatedRequestId: labRequest.id,
            relatedRequestType: 'LAB_REQUEST',
            items: { create: invoiceItems },
          },
        });
      }
    });

    const roles = ['LABORATORY', 'BILLING'];
    for (const role of roles) {
      const users = await prisma.user.findMany({ where: { role: role as any }, select: { id: true } });
      for (const user of users) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: role === 'LABORATORY' ? "New Laboratory Request" : "New Lab Invoice Generated",
            message: `${currentDoctorName} requested lab tests for ${patient?.fullName}`,
            type: 'LAB_REQUEST',
            relatedId: newLabRequestId,
            relatedType: 'LAB_REQUEST',
            paymentStatus: 'PENDING',
          },
        });
      }
    }
    revalidatePath(`/specialist/consultation/${patientId}`);
  }

  async function handleRadSubmit(formData: FormData) {
    'use server';
    const pId = formData.get('patientId') as string;
    const clinicalData = (formData.get('clinicalData') as string)?.trim();
    const xrayType = (formData.get('xrayType') as string)?.trim() || null;
    const ultrasoundJson = formData.get('ultrasound') as string | null;
    
    let ultrasound: string[] = [];
    if (ultrasoundJson) {
      try { ultrasound = JSON.parse(ultrasoundJson); } catch (_) {}
    }

    if (!clinicalData?.trim()) throw new Error("Clinical data is required.");

    const scanType = ultrasound.length > 0 && xrayType ? 'Ultrasound + X-Ray' : ultrasound.length > 0 ? 'Ultrasound' : xrayType ? 'X-Ray' : 'Radiology';
    
    let newRadId: string = '';
    await prisma.$transaction(async (tx) => {
      const radRequest = await tx.radiologyRequest.create({
        data: { 
          patientId: pId, 
          requestedById: currentDoctorId, 
          requestedByName: currentDoctorName, 
          clinicalData, 
          xrayType, 
          ultrasound, 
          status: "PENDING_PAYMENT" 
        },
      });
      newRadId = radRequest.id;

      const service = await tx.serviceDefinition.findFirst({ 
        where: { name: { contains: scanType, mode: 'insensitive' }, category: 'RADIOLOGY' } 
      });
      const price = service?.basePrice || 300;
      const taxAmount = price * 0.15;
      
      await tx.invoice.create({
        data: {
          patientId: pId,
          createdById: currentDoctorId,
          subTotal: price, 
          taxRate: 0.15, 
          taxAmount, 
          totalAmount: price + taxAmount, 
          status: 'PENDING',
          relatedRequestId: radRequest.id, 
          relatedRequestType: 'RADIOLOGY_REQUEST',
          items: { 
            create: [{ 
              serviceName: scanType, 
              category: 'RADIOLOGY', 
              quantity: 1, 
              total: price, 
              radiologyRequestId: radRequest.id 
            }] 
          },
        },
      });
    });

    const roles = ['RADIOLOGY', 'BILLING'];
    for (const role of roles) {
      const users = await prisma.user.findMany({ where: { role: role as any }, select: { id: true } });
      for (const user of users) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "New Radiology Request",
            message: `${currentDoctorName} requested ${scanType} for ${patient?.fullName}`,
            type: 'RADIOLOGY_REQUEST', 
            relatedId: newRadId, 
            relatedType: 'RADIOLOGY_REQUEST', 
            paymentStatus: 'PENDING',
          },
        });
      }
    }
    revalidatePath(`/specialist/consultation/${patientId}`);
  }

  async function handleFinalize(formData: FormData) {
    'use server';
    let success = false;
    try {
      const pId = formData.get('patientId') as string;
      const diagnosesJson = formData.get('diagnoses') as string;
      const notes = (formData.get('notes') as string) || "";
      const followUpDateStr = formData.get('followUpDate') as string | null;
      const followUpTimeStr = formData.get('followUpTime') as string | null;
      const diagnoses = diagnosesJson ? JSON.parse(diagnosesJson) : [];

      await prisma.$transaction(async (tx) => {
        const [currentTriage, currentQueue, labs, rads] = await Promise.all([
          tx.triage.findUnique({ where: { patientId: pId } }),
          tx.queue.findUnique({ where: { patientId: pId } }),
          tx.labRequest.findMany({ where: { patientId: pId }, include: { tests: true } }),
          tx.radiologyRequest.findMany({ where: { patientId: pId } })
        ]);

        const activeVisitId = currentQueue?.visitId || "MANUAL_ENTRY";

        const newConsultation = await tx.consultation.create({
          data: { 
            patientId: pId, 
            createdById: currentDoctorId,
            diagnoses: diagnoses,
            clinicalNotes: notes, 
            chiefComplaint: currentTriage?.chiefComplaint ?? "Direct Consultation", 
            vitals: currentTriage ? { 
              temperature: currentTriage.temperature, 
              pulse: currentTriage.pulse, 
              bloodPressure: currentTriage.bloodPressure, 
              spo2: currentTriage.spo2, 
              weight: currentTriage.weight 
            } : {} 
          }
        });

        const historySnapshot = { 
          sessionDate: new Date().toISOString(), 
          consultationId: newConsultation.id, 
          visitId: activeVisitId,
          doctorName: currentDoctorName,
          diagnosis: diagnoses.length > 0 ? diagnoses[0].name : "Consultation Completed", 
          clinicalNotes: notes, 
          vitals: currentTriage || null,
          labResults: labs.map(l => ({
            clinicalIndication: l.clinicalIndication,
            tests: l.tests.map(t => ({ name: t.testName, result: t.result || "Pending" }))
          })),
          radiologyResults: rads.map(r => ({
            type: r.xrayType || r.ultrasound.join(", ") || "Radiology",
            findings: r.findings || "Pending"
          }))
        };

        const existingHistory = await tx.patientHistory.findFirst({ where: { patientId: pId } });
        let historyArray = existingHistory?.historyEntries && Array.isArray(existingHistory.historyEntries) 
          ? [...existingHistory.historyEntries] 
          : [];
        historyArray.unshift(historySnapshot);

        if (existingHistory) {
          await tx.patientHistory.update({ 
            where: { id: existingHistory.id }, 
            data: { historyEntries: historyArray, latestDiagnosis: diagnoses[0]?.name || "Completed", latestNotes: notes } 
          });
        } else {
          await tx.patientHistory.create({ 
            data: { patientId: pId, historyEntries: historyArray, latestDiagnosis: diagnoses[0]?.name || "Completed", latestNotes: notes } 
          });
        }

        await tx.patient.update({ 
          where: { id: pId }, 
          data: { lastDiagnosis: diagnoses[0]?.name || "Completed", lastSummary: notes, lastVisitDate: new Date() } 
        });
        
        if (followUpDateStr && followUpTimeStr) {
          await tx.appointment.create({ 
            data: { 
              patientId: pId, 
              doctorId: currentDoctorId, 
              doctorName: currentDoctorName, 
              appointmentDate: new Date(`${followUpDateStr}T${followUpTimeStr}`), 
              reason: `Follow-up: ${diagnoses[0]?.name || "Consultation"}`, 
              type: 'FOLLOW_UP', 
              status: 'SCHEDULED' 
            } 
          });
        }

        await tx.queue.deleteMany({ where: { patientId: pId } });
        await tx.triage.deleteMany({ where: { patientId: pId } });
        await tx.labRequest.deleteMany({ where: { patientId: pId } });
        await tx.radiologyRequest.deleteMany({ where: { patientId: pId } });
      });
      success = true;
    } catch (error) {
      console.error("Finalize Error:", error);
      throw error;
    }

    if (success) {
      revalidatePath('/specialist');
      redirect('/specialist');
    }
  }

  async function handlePaymentStatusUpdate(formData: FormData) {
    'use server';
    const notificationId = formData.get('notificationId') as string;
    const newStatus = formData.get('paymentStatus') as any;
    const relatedId = formData.get('relatedId') as string | null;
    const relatedType = formData.get('relatedType') as string | null;
    
    await prisma.notification.update({ where: { id: notificationId }, data: { paymentStatus: newStatus } });
    
    if (relatedId && relatedType) {
      const dbStatus = newStatus === 'PAID' ? 'PAID' : 'PENDING_PAYMENT';
      if (relatedType === 'LAB_REQUEST') {
        await prisma.labRequest.update({ where: { id: relatedId }, data: { status: dbStatus } });
      } else if (relatedType === 'RADIOLOGY_REQUEST') {
        await prisma.radiologyRequest.update({ where: { id: relatedId }, data: { status: dbStatus } });
      }
    }
    revalidatePath(`/specialist/consultation/${patientId}`);
  }

  return (
    <ConsultationLayout patient={patient} patientId={patientId} visitId={visitId}>
      <ConsultationForm 
        patient={patient}
        onLabSubmit={handleLabSubmit}
        onRadSubmit={handleRadSubmit}
        onFinalize={handleFinalize}
        onPaymentUpdate={handlePaymentStatusUpdate}
      />
    </ConsultationLayout>
  );
}