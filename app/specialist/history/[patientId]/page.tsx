import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import HistoryClientView from './HistoryClientView';

export default async function PatientHistoryPage({ 
  params 
}: { 
  params: Promise<{ patientId: string }> 
}) {
  const { patientId } = await params;

  // FIX: Changed 'diagnoses' to 'consultations' as per standard Prisma relation naming
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      consultations: { orderBy: { createdAt: 'desc' } }, // This contains the diagnoses
      prescriptions: { orderBy: { createdAt: 'desc' } },
      labRequests: { 
        where: { status: 'COMPLETED' }, // Only show finished results in history
        orderBy: { updatedAt: 'desc' } 
      },
      radiologyRequests: { 
        where: { status: 'COMPLETED' },
        orderBy: { updatedAt: 'desc' } 
      },
    },
  });

  if (!patient) return notFound();

  // Pass the data to the interactive client component
  return <HistoryClientView patientData={patient} />;
}