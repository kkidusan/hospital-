'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Clock, ArrowRight, Activity, Loader2 } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getEsiColor(level: string) {
  switch (level) {
    case '1': return 'bg-red-50 text-red-700 border-red-100';
    case '2': return 'bg-orange-50 text-orange-700 border-orange-100';
    case '3': return 'bg-amber-50 text-amber-700 border-amber-100';
    default: return 'bg-blue-50 text-blue-700 border-blue-100';
  }
}

export default function QueueList({ initialData }: { initialData: any[] }) {
  // refreshInterval: 2000 means fetch every 2 seconds
  const { data: queue, isValidating } = useSWR('/api/queue', fetcher, {
    fallbackData: initialData,
    refreshInterval: 2000, 
    revalidateOnFocus: true
  });

  return (
    <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Activity size={16} className={isValidating ? "text-blue-500 animate-pulse" : "text-blue-500"} /> 
          Waiting List
        </h3>
        <div className="flex items-center gap-3">
          {isValidating && <Loader2 size={12} className="animate-spin text-slate-400" />}
          <span className="text-xs font-medium text-slate-400">{queue?.length || 0} Patients waiting</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
              <th className="px-6 py-4">Patient Information</th>
              <th className="px-6 py-4">Clinical Priority</th>
              <th className="px-6 py-4">Check-In</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {queue?.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-sm">{item.patient.fullName}</span>
                    <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-tight">
                      MRN: {item.patient.mrn}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.patient.triage ? (
                    <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${getEsiColor(item.patient.triage.triageLevel)}`}>
                      ESI Level {item.patient.triage.triageLevel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500 border border-slate-200">
                      Direct Entry
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium text-xs">
                    <Clock size={12} />
                    {new Date(item.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/specialist/consultation/${item.patientId}`}>
                    <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
                      Attend <ArrowRight size={14} />
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
            {queue?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm font-medium">
                  No patients currently in queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}