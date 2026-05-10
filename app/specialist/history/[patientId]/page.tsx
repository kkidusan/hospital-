import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ChevronLeft, Fingerprint, CalendarDays } from 'lucide-react';
import HistoryClient from './HistoryClient';
import Link from 'next/link';

export default async function PatientHistoryPage({ 
  params 
}: { 
  params: Promise<{ patientId: string }> 
}) {
  const { patientId } = await params;
  const session = await auth();
  
  if (!session?.user?.id) redirect('/login');

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { 
      id: true, 
      fullName: true, 
      gender: true, 
      age: true, 
      mrn: true 
    }
  });

  if (!patient) redirect('/specialist');

  // Fetch the specific PatientHistory record for this patient
  const historyRecord = await prisma.patientHistory.findFirst({
    where: { patientId: patientId },
  });

  // Safely extract the array from the JSON field
  const rawEntries = Array.isArray(historyRecord?.historyEntries) 
    ? (historyRecord.historyEntries as any[]) 
    : [];

  // Sort entries by date (newest first)
  const sortedHistory = [...rawEntries].sort((a: any, b: any) => {
    const dateA = new Date(a.sessionDate || a.date || 0).getTime();
    const dateB = new Date(b.sessionDate || b.date || 0).getTime();
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-[#F1F5F9] pb-20">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center">
          <div className="flex-1">
            <Link 
              href="/specialist" 
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all group"
            >
              <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex-[2] flex flex-col items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{patient.fullName}</h1>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-[10px] font-bold uppercase">
                {patient.gender}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-slate-500 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Fingerprint size={14}/> {patient.mrn || 'NO-MRN'}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span>{patient.age} Years Old</span>
            </div>
          </div>

          <div className="flex-1 text-right">
            <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-400">
              CLINICAL HISTORY ARCHIVE
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Clinical Timeline</h2>
            <p className="text-slate-500 mt-1 font-medium">
              Complete record of consultations, labs, and radiology
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
            {sortedHistory.length} Encounters
          </div>
        </div>

        {sortedHistory.length === 0 ? (
          <div className="bg-white rounded-[32px] p-24 text-center border border-slate-200 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <CalendarDays size={40} className="text-slate-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">No history yet</h3>
            <p className="text-slate-500 mt-2">Completed consultations for this patient will appear here.</p>
          </div>
        ) : (
          <HistoryClient 
            sortedHistory={sortedHistory} 
            patientName={patient.fullName} 
          />
        )}
      </main>
    </div>
  );
}