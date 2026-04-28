// app/specialist/consultation/[patientId]/page.tsx
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { auth } from '@/auth';
import type { Session } from 'next-auth';
import ConsultationForm from './ConsultationForm';

export default async function ConsultationPage(props: { params: Promise<{ patientId: string }> }) {
  const params = await props.params;
  const patientId = params.patientId;

  const session: Session | null = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const currentDoctorId = session.user.id;
  const currentDoctorName = session.user.name || "Dr. Birku Belete";

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { 
      triage: true, 
      labRequests: { 
        include: { tests: true },
        orderBy: { createdAt: 'desc' } 
      }, 
      radiologyRequests: { 
        orderBy: { createdAt: 'desc' } 
      }
    },
  });

  if (!patient) redirect('/specialist');

  async function handleLabSubmit(formData: FormData) {
    'use server';

    const patientIdFromForm = formData.get('patientId') as string;
    const clinicalIndication = (formData.get('clinicalIndication') as string)?.trim() || "Not specified";
    const labNotes = (formData.get('labNotes') as string)?.trim() || null;
    const selectedTestNames = formData.getAll('labTests') as string[];

    if (selectedTestNames.length === 0) {
      throw new Error("Please select at least one laboratory test.");
    }

    let newLabRequestId: string = '';

    await prisma.$transaction(async (tx) => {
      const labRequest = await tx.labRequest.create({
        data: {
          patientId: patientIdFromForm,
          requestedById: currentDoctorId,
          requestedByName: currentDoctorName,
          clinicalIndication,
          labNotes,
          status: "PENDING_PAYMENT",
          tests: {
            create: selectedTestNames.map((testName) => ({
              testName: testName.trim(),
              category: getTestCategory(testName) as any,
            })),
          },
        },
      });

      newLabRequestId = labRequest.id;

      let subTotal = 0;
      const invoiceItems: any[] = [];

      for (const testName of selectedTestNames) {
        const service = await tx.serviceDefinition.findFirst({
          where: { 
            name: { equals: testName.trim(), mode: 'insensitive' },
            category: 'LABORATORY'
          }
        });

        const price = service?.basePrice || 150;
        invoiceItems.push({
          serviceName: testName,
          category: 'LABORATORY',
          quantity: 1,
          total: price,
          labRequestId: labRequest.id,
        });
        subTotal += price;
      }

      if (invoiceItems.length > 0) {
        const taxRate = 0.15;
        const taxAmount = subTotal * taxRate;

        await tx.invoice.create({
          data: {
            patientId: patientIdFromForm,
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

    const labUsers = await prisma.user.findMany({
      where: { role: 'LABORATORY' },
      select: { id: true },
    });

    for (const user of labUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "New Laboratory Request",
          message: `${currentDoctorName} requested lab tests for ${patient.fullName}`,
          type: 'LAB_REQUEST',
          relatedId: newLabRequestId,
          relatedType: 'LAB_REQUEST',
          paymentStatus: 'PENDING',
        },
      });
    }

    const billingUsers = await prisma.user.findMany({
      where: { role: 'BILLING' },
      select: { id: true },
    });

    for (const user of billingUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "New Lab Invoice Generated",
          message: `Laboratory request invoice created for ${patient.fullName}`,
          type: 'LAB_REQUEST',
          relatedId: newLabRequestId,
          relatedType: 'LAB_REQUEST',
          paymentStatus: 'PENDING',
        },
      });
    }

    revalidatePath(`/specialist/consultation/${patientId}`);
  }

  async function handleRadSubmit(formData: FormData) {
    'use server';

    const patientIdFromForm = formData.get('patientId') as string;
    const clinicalData = (formData.get('clinicalData') as string)?.trim();
    const xrayType = (formData.get('xrayType') as string)?.trim() || null;
    const ultrasoundJson = formData.get('ultrasound') as string | null;

    let ultrasound: string[] = [];
    if (ultrasoundJson) {
      try {
        ultrasound = JSON.parse(ultrasoundJson);
      } catch (_) {}
    }

    if (!clinicalData?.trim()) {
      throw new Error("Clinical data is required for radiology request.");
    }

    const scanType = ultrasound.length > 0 && xrayType 
      ? 'Ultrasound + X-Ray' 
      : ultrasound.length > 0 ? 'Ultrasound' 
      : xrayType ? 'X-Ray' 
      : 'Radiology';

    let newRadiologyRequestId: string = '';

    await prisma.$transaction(async (tx) => {
      const radRequest = await tx.radiologyRequest.create({
        data: {
          patientId: patientIdFromForm,
          requestedById: currentDoctorId,
          requestedByName: currentDoctorName,
          clinicalData: clinicalData.trim(),
          xrayType,
          ultrasound,
          scanType,
          status: "PENDING_PAYMENT",
        },
      });

      newRadiologyRequestId = radRequest.id;

      const service = await tx.serviceDefinition.findFirst({
        where: { 
          name: { contains: scanType, mode: 'insensitive' },
          category: 'RADIOLOGY'
        }
      });

      const radiologyPrice = service?.basePrice || 300;
      const taxRate = 0.15;
      const taxAmount = radiologyPrice * taxRate;

      await tx.invoice.create({
        data: {
          patientId: patientIdFromForm,
          createdById: currentDoctorId,
          subTotal: radiologyPrice,
          taxRate,
          taxAmount,
          totalAmount: radiologyPrice + taxAmount,
          status: 'PENDING',
          relatedRequestId: radRequest.id,
          relatedRequestType: 'RADIOLOGY_REQUEST',
          items: {
            create: [{
              serviceName: scanType,
              category: 'RADIOLOGY',
              quantity: 1,
              total: radiologyPrice,
              radiologyRequestId: radRequest.id,
            }]
          },
        },
      });
    });

    const radiologyUsers = await prisma.user.findMany({
      where: { role: 'RADIOLOGY' },
      select: { id: true },
    });

    for (const user of radiologyUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "New Radiology Request",
          message: `${currentDoctorName} requested ${scanType} for ${patient.fullName}`,
          type: 'RADIOLOGY_REQUEST',
          relatedId: newRadiologyRequestId,
          relatedType: 'RADIOLOGY_REQUEST',
          paymentStatus: 'PENDING',
        },
      });
    }

    const billingUsers = await prisma.user.findMany({
      where: { role: 'BILLING' },
      select: { id: true },
    });

    for (const user of billingUsers) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "New Radiology Invoice Generated",
          message: `Radiology request invoice created for ${patient.fullName}`,
          type: 'RADIOLOGY_REQUEST',
          relatedId: newRadiologyRequestId,
          relatedType: 'RADIOLOGY_REQUEST',
          paymentStatus: 'PENDING',
        },
      });
    }

    revalidatePath(`/specialist/consultation/${patientIdFromForm}`);
  }

  async function handlePaymentStatusUpdate(formData: FormData) {
    'use server';

    const notificationId = formData.get('notificationId') as string;
    const newPaymentStatus = formData.get('paymentStatus') as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    const relatedId = formData.get('relatedId') as string | null;
    const relatedType = formData.get('relatedType') as string | null;

    if (!notificationId || !newPaymentStatus) {
      throw new Error("Invalid payment update data");
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { paymentStatus: newPaymentStatus },
    });

    if (relatedId && relatedType) {
      const newRequestStatus = newPaymentStatus === 'PAID' ? 'PAID' : 'PENDING_PAYMENT';

      if (relatedType === 'LAB_REQUEST') {
        await prisma.labRequest.update({
          where: { id: relatedId },
          data: { status: newRequestStatus },
        });
      } else if (relatedType === 'RADIOLOGY_REQUEST') {
        await prisma.radiologyRequest.update({
          where: { id: relatedId },
          data: { status: newRequestStatus },
        });
      }
    }

    revalidatePath(`/specialist/consultation/${patientId}`);
  }

  async function handleFinalize(formData: FormData) {
    'use server';

    const pId = formData.get('patientId') as string;
    const diagnosis = ((formData.get('description') as string) || "Consultation Completed").trim();
    const notes = ((formData.get('notes') as string) || "").trim();

    const followUpDateStr = formData.get('followUpDate') as string | null;
    const followUpTimeStr = formData.get('followUpTime') as string | null;
    const followUpReason = (formData.get('followUpReason') as string)?.trim() || null;
    const followUpPriority = (formData.get('followUpPriority') as string) || 'ROUTINE';
    const followUpTypeRaw = formData.get('followUpType') as string | null;

    let followUpCategory: 'RECALL' | 'CHRONIC_CARE' | 'POST_OP' | 'FOLLOW_UP' = 'FOLLOW_UP';

    if (followUpTypeRaw) {
      const typeUpper = followUpTypeRaw.toUpperCase();
      if (typeUpper.includes('RECALL') || typeUpper.includes('SCREENING') || typeUpper.includes('ROUTINE CHECK')) {
        followUpCategory = 'RECALL';
      } else if (typeUpper.includes('CHRONIC') || typeUpper.includes('DIABETES') || typeUpper.includes('HYPERTENSION') || typeUpper.includes('ASTHMA')) {
        followUpCategory = 'CHRONIC_CARE';
      } else if (typeUpper.includes('POST-OP') || typeUpper.includes('POSTOP') || typeUpper.includes('SURGERY') || typeUpper.includes('PROCEDURE')) {
        followUpCategory = 'POST_OP';
      }
    }

    await prisma.$transaction(async (tx) => {
      const currentTriage = await tx.triage.findUnique({ where: { patientId: pId } });

      const currentLabRequests = await tx.labRequest.findMany({
        where: { patientId: pId },
        include: { tests: true },
        orderBy: { createdAt: 'desc' }
      });

      const currentRadiologyRequests = await tx.radiologyRequest.findMany({
        where: { patientId: pId },
        orderBy: { createdAt: 'desc' }
      });

      const vitalsData = currentTriage 
        ? {
            temperature: currentTriage.temperature,
            pulse: currentTriage.pulse,
            bloodPressure: currentTriage.bloodPressure,
            spo2: currentTriage.spo2,
            weight: currentTriage.weight,
          } 
        : undefined;

      const newConsultation = await tx.consultation.create({
        data: {
          patientId: pId,
          createdById: currentDoctorId,
          diagnosis,
          clinicalNotes: notes,
          chiefComplaint: currentTriage?.chiefComplaint ?? "Direct Consultation",
          vitals: vitalsData,
        }
      });

      const currentSession = {
        sessionDate: new Date().toISOString(),
        consultationId: newConsultation.id,
        diagnosis,
        clinicalNotes: notes,
        chiefComplaint: currentTriage?.chiefComplaint ?? "Direct Consultation",
        doctorName: currentDoctorName,
        triage: currentTriage ? { ...currentTriage, createdAt: currentTriage.createdAt.toISOString(), updatedAt: currentTriage.updatedAt.toISOString() } : null,
        labRequests: currentLabRequests.map((req: any) => ({ ...req, createdAt: req.createdAt.toISOString(), updatedAt: req.updatedAt.toISOString() })),
        radiologyRequests: currentRadiologyRequests.map((req: any) => ({ ...req, createdAt: req.createdAt.toISOString(), updatedAt: req.updatedAt.toISOString() })),
      };

      const existingHistory = await tx.patientHistory.findFirst({ where: { patientId: pId } });

      let historyArray: any[] = existingHistory?.historyEntries 
        ? (Array.isArray(existingHistory.historyEntries) ? [...existingHistory.historyEntries] : []) 
        : [];

      historyArray.unshift(currentSession);

      if (existingHistory) {
        await tx.patientHistory.update({
          where: { id: existingHistory.id },
          data: { historyEntries: historyArray, latestDiagnosis: diagnosis, latestNotes: notes, archivedAt: new Date() }
        });
      } else {
        await tx.patientHistory.create({
          data: { patientId: pId, historyEntries: historyArray, latestDiagnosis: diagnosis, latestNotes: notes }
        });
      }

      await tx.patient.update({
        where: { id: pId },
        data: { lastDiagnosis: diagnosis, lastSummary: notes || diagnosis, lastVisitDate: new Date() }
      });

      if (followUpDateStr && followUpTimeStr) {
        const followUpDateTime = new Date(`${followUpDateStr}T${followUpTimeStr}`);
        await tx.appointment.create({
          data: {
            patientId: pId,
            doctorId: currentDoctorId,
            doctorName: currentDoctorName,
            appointmentDate: followUpDateTime,
            reason: followUpReason || `Follow-up after consultation: ${diagnosis}`,
            type: 'FOLLOW_UP',
            priority: followUpPriority as 'ROUTINE' | 'URGENT',
            status: 'SCHEDULED',
            notes: `Created from consultation on ${new Date().toLocaleDateString()}. Category: ${followUpCategory}`,
            followUpCategory,
          }
        });
      }

      await tx.queue.deleteMany({ where: { patientId: pId } });
      await tx.triage.deleteMany({ where: { patientId: pId } });
      await tx.labRequest.deleteMany({ where: { patientId: pId } });
      await tx.radiologyRequest.deleteMany({ where: { patientId: pId } });
    });

    revalidatePath(`/specialist/consultation/${pId}`);
    redirect('/specialist');
  }

  return (
    <div style={pageContainer}>
      <header style={headerStyle}>
        <div style={patientInfoWrapper}>
          <span style={infoTextStyle}>
            <strong>Name:</strong> {patient.fullName}
          </span>
          <span style={detailSeparator}>•</span>
          <span style={infoTextStyle}>
            <strong>Sex:</strong> {patient.gender || patient.sex || '—'}
          </span>
          <span style={detailSeparator}>•</span>
          <span style={infoTextStyle}>
            <strong>Age:</strong> {patient.age || '—'}
          </span>
          <span style={detailSeparator}>•</span>
          <span style={infoTextStyle}>
            <strong>Card No / MRN:</strong> {patient.mrn || '—'}
          </span>
        </div>

        <Link href={`/specialist/history/${patientId}`} style={historyBtnStyle}>
          View History
        </Link>
      </header>

      <ConsultationForm 
        patient={patient}
        onLabSubmit={handleLabSubmit}
        onRadSubmit={handleRadSubmit}
        onFinalize={handleFinalize}
        onPaymentUpdate={handlePaymentStatusUpdate}
      />
    </div>
  );
}

function getTestCategory(testName: string): string {
  const name = testName.toUpperCase();
  if (["CBC", "ESR", "BLOOD FILM", "PERIPHERAL MORPHOLOGY", "BLOOD GROUP"].some(t => name.includes(t))) return "HEMATOLOGY";
  if (["HCG", "WIDAL", "HBSAG", "HCV", "RF", "ANA"].some(t => name.includes(t))) return "SEROLOGY";
  if (["RBS", "FBS", "ALT", "SGOT", "ALP", "CREATININE", "BUN", "UREA", "CHOLESTEROL", "TRIGLYCERIDE", "HDL", "LDL"].some(t => name.includes(t))) return "CHEMISTRY";
  if (name.includes("URINE") || name.includes("PREGNANCY")) return "URINALYSIS";
  if (["STOOL", "AFB", "KOH", "GRAM STAIN"].some(t => name.includes(t))) return "MICROBIOLOGY";
  if (["TSH", "T3", "T4", "FREE T"].some(t => name.includes(t))) return "HORMONAL";
  return "OTHERS";
}

const pageContainer = { 
  maxWidth: '1100px', 
  margin: '0 auto', 
  padding: '30px 20px', 
  backgroundColor: '#f8fafc', 
  minHeight: '100vh' 
};

const headerStyle = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '35px', 
  borderBottom: '1px solid #e2e8f0', 
  paddingBottom: '20px', 
  flexWrap: 'wrap' as const, 
  gap: '20px' 
};

const patientInfoWrapper = { 
  display: 'flex', 
  alignItems: 'center', 
  flexWrap: 'wrap' as const, 
  gap: '8px', 
  flex: 1 
};

const infoTextStyle = { 
  fontSize: '1.05rem', 
  color: '#1e293b', 
  fontWeight: 400, 
  whiteSpace: 'nowrap' as const 
};

const detailSeparator = { 
  color: '#cbd5e1', 
  margin: '0 4px', 
  fontSize: '1rem' 
};

const historyBtnStyle = { 
  padding: '8px 16px', 
  borderRadius: '8px', 
  border: '1px solid #003087', 
  background: '#ffffff', 
  color: '#003087', 
  fontWeight: 600, 
  textDecoration: 'none', 
  fontSize: '0.9rem', 
  whiteSpace: 'nowrap' as const 
};