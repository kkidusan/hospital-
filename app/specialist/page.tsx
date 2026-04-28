// app/specialist/page.tsx
import { prisma } from '@/lib/db';
import { Users, AlertCircle, CheckCircle } from 'lucide-react';
import QueueList from './QueueList';

export const dynamic = 'force-dynamic';

async function getInitialData() {
  const [queue, stats] = await Promise.all([
    prisma.queue.findMany({
      where: { 
        OR: [{ status: 'TRIAGED' }, { status: 'WAITING' }] 
      },
      include: { 
        patient: { 
          include: { 
            triage: true 
          } 
        } 
      },
      orderBy: { enteredAt: 'asc' }
    }),
    prisma.queue.groupBy({
      by: ['status'],
      _count: { _all: true }
    })
  ]);

  return { queue, stats };
}

export default async function SpecialistDashboard() {
  const { queue, stats } = await getInitialData();

  const summaryCards = [
    { 
      label: "In Queue", 
      value: queue.length, 
      color: "text-blue-600", 
      bg: "bg-blue-50", 
      icon: <Users size={18} /> 
    },
    { 
      label: "Emergency", 
      value: queue.filter(q => q.patient?.triage?.triageLevel === '1').length, 
      color: "text-red-600", 
      bg: "bg-red-50", 
      icon: <AlertCircle size={18} /> 
    },
    { 
      label: "Completed", 
      value: stats.find(s => s.status === 'COMPLETED')?._count._all || 0, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50", 
      icon: <CheckCircle size={18} /> 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Specialist Console
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Manage active consultations
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200">
            Station Alpha
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((card, idx) => (
            <div 
              key={idx} 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4"
            >
              <div className={`${card.bg} ${card.color} p-2.5 rounded-xl`}>
                {card.icon}
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-xl font-black text-slate-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time List Component */}
        <QueueList initialData={queue} />
      </div>
    </div>
  );
}