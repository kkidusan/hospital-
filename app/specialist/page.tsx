import { prisma } from '@/lib/db';
import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  Search, 
  RefreshCw 
} from 'lucide-react';
import QueueList from './QueueList';
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getInitialData(doctorId: string) {
  const [queue, completedCount] = await Promise.all([
    prisma.queue.findMany({
      where: { 
        assignedDoctorId: doctorId, 
        OR: [{ status: 'TRIAGED' }, { status: 'WAITING' }] 
      },
      include: { 
        patient: { 
          include: { triage: true } 
        } 
      },
      orderBy: { enteredAt: 'asc' }
    }),
    prisma.queue.count({
      where: { 
        assignedDoctorId: doctorId,
        status: 'COMPLETED' 
      }
    })
  ]);

  return { queue, completedCount };
}

export default async function SpecialistDashboard() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const { queue, completedCount } = await getInitialData(userId);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section - Matches Reception */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 md:mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">Specialist Console</h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                <MapPin size={10} /> Station Alpha
               </span>
               <p className="text-slate-500 text-sm italic">Managing assigned patient queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            {/* Search Bar - Visual Consistency */}
            <div className="flex items-center flex-1 md:min-w-[280px] bg-transparent group border-b border-transparent focus-within:border-slate-200 transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search patient in queue..."
                className="w-full bg-transparent border-none pl-3 pr-0 py-2.5 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400"
              />
            </div>

            <button className="flex items-center justify-center min-w-[40px] h-10 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <RefreshCw size={17} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Summary Stats - Minimalist style (No background cards, consistent with Reception) */}
        <div className="grid grid-cols-3 gap-4 mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Patients</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-blue-600">{queue.length}</span>
              <Users size={14} className="text-blue-300" />
            </div>
          </div>
          <div className="flex flex-col border-x border-slate-200 px-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emergencies</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-red-600">
                {queue.filter(q => q.patient?.triage?.triageLevel === '1').length}
              </span>
              <AlertCircle size={14} className="text-red-300" />
            </div>
          </div>
          <div className="flex flex-col pl-6">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{completedCount}</span>
              <CheckCircle size={14} className="text-emerald-300" />
            </div>
          </div>
        </div>

        {/* Patient Table Area */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          {/* Note: Pass the same table styling logic into QueueList */}
          <QueueList initialData={queue} />
        </div>
      </div>
    </div>
  );
}