// app/specialist/history/[patientId]/page.tsx
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Calendar } from 'lucide-react';
import HistoryClient from './HistoryClient';

export default async function PatientHistoryPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      fullName: true,
      gender: true,
      age: true,
      mrn: true,
    }
  });

  if (!patient) {
    redirect('/specialist');
  }

  const patientHistory = await prisma.patientHistory.findFirst({
    where: { patientId },
    select: { historyEntries: true }
  });

  const historyEntries = patientHistory?.historyEntries 
    ? (Array.isArray(patientHistory.historyEntries) ? patientHistory.historyEntries : [])
    : [];

  const sortedHistory = [...historyEntries].sort((a: any, b: any) => 
    new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Patient Information - Single Flex Row */}
        <div className="flex flex-wrap items-center gap-x-10 gap-y-3 mb-10 text-base">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Full Name:</span>
            <span className="font-semibold text-gray-900">{patient.fullName}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Gender:</span>
            <span className="font-medium text-gray-900">{patient.gender || '—'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Age:</span>
            <span className="font-medium text-gray-900">{patient.age ? `${patient.age} years` : '—'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">MRN:</span>
            <span className="font-medium text-gray-900">{patient.mrn || '—'}</span>
          </div>
        </div>

        {/* Consultation History Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <Calendar size={24} className="text-gray-700" />
            <h2 className="text-xl font-semibold text-gray-900">Consultation History</h2>
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border border-gray-100">
            <Calendar size={60} className="mx-auto text-gray-300 mb-6" />
            <p className="text-xl text-gray-500">No consultation history available yet</p>
            <p className="text-gray-400 mt-2">History will appear here after completing consultations</p>
          </div>
        ) : (
          <HistoryClient sortedHistory={sortedHistory} />
        )}
      </div>
    </div>
  );
}