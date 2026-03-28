import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import ConsultationForm from './ConsultationForm';

export default async function ConsultationPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { 
      triage: true,
      labRequests: { orderBy: { createdAt: 'desc' } },
      radiologyRequests: { orderBy: { createdAt: 'desc' } }
    },
  });

  if (!patient) redirect('/specialist');

  async function sendLabRequest(formData: FormData) {
    'use server';
    const labs = formData.getAll('labName') as string[];
    const pId = formData.get('patientId') as string;
    
    await prisma.$transaction(async (tx) => {
      const items = [];
      for (const name of labs) {
        if (!name.trim()) continue;
        const req = await (tx as any).labRequest.create({ 
          data: { patientId: pId, testName: name, status: 'PENDING_PAYMENT' } 
        });
        items.push({ serviceName: name, serviceType: 'LAB', price: 200, serviceId: req.id });
      }
      if (items.length) {
        await (tx as any).invoice.create({ 
          data: { patientId: pId, totalAmount: items.length * 200, items: { create: items } } 
        });
      }
    });
    revalidatePath(`/specialist/consultation/${pId}`);
  }

  async function sendRadiologyRequest(formData: FormData) {
    'use server';
    const scans = formData.getAll('radiologyName') as string[];
    const pId = formData.get('patientId') as string;
    
    await prisma.$transaction(async (tx) => {
      const items = [];
      for (const name of scans) {
        if (!name.trim()) continue;
        const req = await (tx as any).radiologyRequest.create({ 
          data: { patientId: pId, scanType: name, status: 'PENDING_PAYMENT' } 
        });
        items.push({ serviceName: name, serviceType: 'RADIOLOGY', price: 500, serviceId: req.id });
      }
      if (items.length) {
        await (tx as any).invoice.create({ 
          data: { patientId: pId, totalAmount: items.length * 500, items: { create: items } } 
        });
      }
    });
    revalidatePath(`/specialist/consultation/${pId}`);
  }

  async function finalizeConsultation(formData: FormData) {
    'use server';
    const pId = formData.get('patientId') as string;
    
    await prisma.$transaction(async (tx) => {
      await (tx as any).consultation.create({
        data: {
          patientId: pId,
          diagnosis: formData.get('description')?.toString() || "Completed",
          clinicalNotes: formData.get('notes')?.toString() || "",
          chiefComplaint: patient?.triage?.chiefComplaint ?? "Direct Consultation",
          vitals: { 
            temp: patient?.triage?.temperature ?? "N/A", 
            bp: patient?.triage?.bloodPressure ?? "N/A", 
            pulse: patient?.triage?.pulse ?? "N/A", 
            spo2: patient?.triage?.spo2 ?? "N/A", 
            weight: patient?.triage?.weight ?? "N/A" 
          }
        }
      });
      await tx.queue.deleteMany({ where: { patientId: pId } });
      await tx.triage.deleteMany({ where: { patientId: pId } });
    });
    
    redirect('/specialist');
  }

  return (
    <div style={pageContainer}>
      <header style={cleanHeader}>
        <div>
          <div style={statusRow}>
            <span style={idBadge}>ACTIVE CONSULTATION</span>
            {!patient.triage && <span style={directTag}>DIRECT SEND</span>}
          </div>
          <h1 style={titleStyle}>{patient.fullName}</h1>
          <p style={subTitle}>
            MRN: {patient.mrn} • {patient.sex} • {patient.age} {patient.ageUnit}
          </p>
        </div>
        
        <div style={headerActions}>
          <Link href={`/specialist/history/${patientId}`} style={historyBtn}>
            📋 View Medical History
          </Link>
          <Link href="/specialist" style={exitBtn}>
            Exit Session
          </Link>
        </div>
      </header>

      <div style={formWrapper}>
        <ConsultationForm 
          patient={patient} 
          onLabSubmit={sendLabRequest} 
          onRadSubmit={sendRadiologyRequest}
          onFinalize={finalizeConsultation}
        />
      </div>
    </div>
  );
}

const pageContainer = { 
  maxWidth: '1100px', 
  margin: '0 auto', 
  padding: '40px 20px',
  minHeight: '100vh',
  backgroundColor: '#f8fafc' 
};

const cleanHeader = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '35px',
  paddingBottom: '25px',
  borderBottom: '2px solid #e2e8f0'
};

const statusRow = { display: 'flex', gap: '10px', marginBottom: '6px' };
const idBadge = { fontSize: '0.7rem', fontWeight: 900, color: '#2563eb', letterSpacing: '0.05em' };
const directTag = { fontSize: '0.7rem', fontWeight: 900, color: '#e11d48', background: '#fff1f2', padding: '2px 8px', borderRadius: '5px' };
const titleStyle = { margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' };
const subTitle = { margin: 0, color: '#64748b', fontSize: '1rem', fontWeight: 500 };
const headerActions = { display: 'flex', gap: '15px' };

const historyBtn = { 
  padding: '12px 24px', 
  borderRadius: '12px', 
  border: '1px solid #cbd5e1', 
  textDecoration: 'none', 
  color: '#334155', 
  fontSize: '0.9rem', 
  fontWeight: 700, 
  background: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const exitBtn = { 
  padding: '12px 20px', 
  borderRadius: '12px', 
  background: '#e2e8f0', 
  textDecoration: 'none', 
  color: '#64748b', 
  fontSize: '0.9rem', 
  fontWeight: 700 
};

const formWrapper = {
  background: 'transparent',
  borderRadius: '0',
  boxShadow: 'none',
  padding: '0'
};