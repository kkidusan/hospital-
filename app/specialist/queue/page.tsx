// app/specialist/queue/page.tsx
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { 
  Clock, 
  ArrowRight, 
  Activity, 
  History, 
  Calendar 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SpecialistQueuePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const doctorId = session.user.id;

  const waitingPatients = await prisma.queue.findMany({
    where: {
      assignedDoctorId: doctorId,
      status: { in: ['TRIAGED', 'EMERGENCY', 'WAITING'] }
    },
    include: {
      patient: {
        include: {
          triage: true 
        }
      }
    },
    orderBy: [
      { status: 'desc' },
      { enteredAt: 'asc' }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section - Clean Minimalist Version */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">
              Consultation Queue
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">
              Managing your assigned patient list for today
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/specialist/appointments" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Calendar size={14} className="text-blue-500" /> Appointments
            </Link>
            <Link href="/specialist/history" className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <History size={14} className="text-blue-500" /> Find Patient
            </Link>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <Activity size={16} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Patient Priority List</h3>
          </div>
          <span className="text-[10px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
            {waitingPatients.length} Active
          </span>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Vitals Snapshot</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {waitingPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 text-sm font-bold opacity-50 uppercase tracking-widest">
                    The queue is currently empty
                  </td>
                </tr>
              ) : (
                waitingPatients.map((entry) => {
                  const waitMinutes = Math.floor(
                    (new Date().getTime() - new Date(entry.enteredAt).getTime()) / 60000
                  );
                  const isEmerg = entry.status === 'EMERGENCY';

                  return (
                    <tr key={entry.id} className={`${isEmerg ? 'bg-red-50/40' : 'hover:bg-slate-100/50'} transition-colors group`}>
                      {/* Priority Tag */}
                      <td className="px-2 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-tight border ${
                          isEmerg ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}>
                          {entry.status}
                        </span>
                      </td>

                      {/* Patient Info */}
                      <td className="px-2 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">
                              {entry.patient.mrn}
                            </span>
                            <span className="font-bold text-slate-900 text-[14px]">{entry.patient.fullName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-medium">
                            <span>{entry.patient.sex} / {entry.patient.age}Y</span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={10} /> {waitMinutes}m wait
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vitals Snapshot */}
                      <td className="px-2 py-4 text-center">
                        <div className="inline-flex gap-3 text-[10px] font-bold text-slate-600">
                          <div className="flex flex-col items-center">
                            <span className="text-slate-400 text-[8px] uppercase">Temp</span>
                            <span>{entry.patient.triage?.temperature || '--'}°</span>
                          </div>
                          <div className="flex flex-col items-center border-x border-slate-200 px-3">
                            <span className="text-slate-400 text-[8px] uppercase">BP</span>
                            <span>{entry.patient.triage?.bloodPressure || '--'}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-slate-400 text-[8px] uppercase">SPO2</span>
                            <span>{entry.patient.triage?.spo2 || '--'}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-2 py-4 text-right">
                        <Link 
                          href={`/specialist/consultation/${entry.patientId}`} 
                          className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            isEmerg 
                              ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' 
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                          }`}
                        >
                          Examine <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}