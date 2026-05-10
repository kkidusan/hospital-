'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { ArrowRight, Activity, Loader2, CheckCircle2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getEsiColor(level: string) {
  switch (level) {
    case '1': return 'bg-red-100 text-red-700 border-red-200';
    case '2': return 'bg-orange-100 text-orange-700 border-orange-200';
    case '3': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-blue-100 text-blue-700 border-blue-200';
  }
}

export default function QueueList({ initialData }: { initialData: any[] }) {
  const { data: queue, isValidating } = useSWR('/api/queue', fetcher, {
    fallbackData: initialData,
    refreshInterval: 3000, 
    revalidateOnFocus: true
  });

  return (
    <div className="w-full">
      {/* Sub-header for the table context */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Activity size={16} className={isValidating ? "text-blue-600 animate-pulse" : "text-blue-600"} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Assigned Queue</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Real-time update active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isValidating && <Loader2 size={14} className="animate-spin text-blue-400" />}
          <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase">
            {queue?.length || 0} Total
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
              <th className="px-1 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Triage / Priority</th>
              <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Queue Time & Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {queue?.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-100/50 transition-colors group">
                {/* Patient Details Column */}
                <td className="px-2 py-3 md:py-5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${item.patient.mrn.startsWith('TEP_') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.patient.mrn}
                      </span>
                      <span className="font-bold text-slate-900 text-[13px] md:text-[15px]">{item.patient.fullName}</span>
                    </div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-1 font-medium italic">
                      {item.patient.age} {item.patient.ageUnit} • {item.patient.sex}
                    </div>
                  </div>
                </td>

                {/* Priority Column */}
                <td className="px-1 py-3 text-center">
                  {item.patient.triage ? (
                    <span className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-tight ${getEsiColor(item.patient.triage.triageLevel)}`}>
                      ESI Level {item.patient.triage.triageLevel}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2.5 py-1 rounded-xl border border-slate-200 uppercase">
                      Direct
                    </span>
                  )}
                </td>

                {/* Action Column */}
                <td className="px-2 py-3">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      Entered: {new Date(item.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Link href={`/specialist/consultation/${item.patientId}`}>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition-all flex items-center gap-1">
                        Attend <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}

            {/* Empty State */}
            {(!queue || queue.length === 0) && (
              <tr>
                <td colSpan={3} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <CheckCircle2 size={32} className="text-slate-400" />
                    <p className="text-sm font-bold text-slate-500 tracking-tight">Queue clear. No patients assigned.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}