"use client";

import { format, isValid } from 'date-fns';
import { useState } from 'react';
import { 
  X, 
  Activity, 
  ArrowRight,
  Hash
} from 'lucide-react';

export default function HistoryClient({ 
  sortedHistory, 
  patientName 
}: { 
  sortedHistory: any[]; 
  patientName: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedEntry = selectedIndex !== null ? sortedHistory[selectedIndex] : null;

  const formatDate = (dateStr?: string, fmt: string = 'dd MMM yyyy') => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isValid(date) ? format(date, fmt) : "N/A";
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'dd MMM yyyy • hh:mm a') : "N/A";
  };

  return (
    <>
      {/* MAIN TABLE LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date / Visit ID</th>
              <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Diagnosis</th>
              <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedHistory.map((entry, index) => (
              <tr
                key={index}
                className="group hover:bg-indigo-50/30 cursor-pointer transition-all"
                onClick={() => setSelectedIndex(index)}
              >
                <td className="py-4 px-6">
                  <p className="font-bold text-slate-900 text-sm">{formatDate(entry.sessionDate || entry.date)}</p>
                  <p className="text-[10px] text-indigo-500 font-mono font-bold uppercase">
                    {entry.visitId || "N/A"}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                    {entry.diagnoses?.[0]?.name || entry.diagnosis || "Consultation"}
                  </p>
                </td>
                <td className="py-4 px-6 text-sm text-slate-600">
                  Dr. {entry.doctorName || entry.doctor || 'Specialist'}
                </td>
                <td className="py-4 px-6 text-right">
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors inline" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DETAIL SIDEBAR */}
      {selectedIndex !== null && selectedEntry && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" 
            onClick={() => setSelectedIndex(null)} 
          />

          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <button 
              onClick={() => setSelectedIndex(null)} 
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6 pt-10 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-1">Patient Record</p>
                        <h2 className="text-xl font-black text-slate-900 leading-tight">Visit Summary</h2>
                    </div>
                    {/* VISIT ID BADGE */}
                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm shadow-indigo-200">
                        <Hash size={12} className="text-indigo-200"/>
                        <span className="text-[11px] font-mono font-bold tracking-tight">
                            {selectedEntry.visitId || "MANUAL"}
                        </span>
                    </div>
                </div>
                
                <p className="text-slate-500 text-sm font-medium">{patientName}</p>
                
                <div className="mt-6 flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Practitioner</p>
                    <p className="font-bold text-slate-800">Dr. {selectedEntry.doctorName || selectedEntry.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Timestamp</p>
                    <p className="text-xs font-medium text-slate-600">{formatDateTime(selectedEntry.sessionDate || selectedEntry.date)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* DIAGNOSES */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 pb-1 border-b border-slate-200">Diagnoses</h3>
                  <div className="space-y-2">
                    {selectedEntry.diagnoses?.map((d: any, i: number) => (
                      <div key={i} className="flex justify-between items-start text-sm">
                        <div className="pr-4">
                          <p className="font-bold text-slate-800">{d.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-medium">{d.category}</p>
                        </div>
                        <span className="font-mono text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {d.icdCode}
                        </span>
                      </div>
                    )) || (
                      <div className="flex justify-between items-start text-sm">
                        <p className="font-bold text-slate-800">{selectedEntry.diagnosis || "No specific diagnosis recorded"}</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* VITALS */}
                {selectedEntry.vitals && (
                  <section>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 pb-1 border-b border-slate-200">Physical Vitals</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(selectedEntry.vitals).map(([key, value]: [string, any]) => 
                        value && (
                          <div key={key} className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-black text-slate-800">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* LAB FINDINGS */}
                <section>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-3 pb-1 border-b border-slate-200">Lab Findings</h3>
                  <div className="space-y-2">
                    {selectedEntry.labResults?.flatMap((lab: any) => lab.tests || []).map((test: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                        <span className="font-medium text-slate-700">{test.name}</span>
                        <span className={`font-mono font-black text-[11px] ${test.result === 'Pending' ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {test.result}
                        </span>
                      </div>
                    )) || <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Clear</p>}
                  </div>
                </section>

                {/* CLINICAL NOTES */}
                {(selectedEntry.clinicalNotes || selectedEntry.notes) && (
                  <section className="pb-6">
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Clinical Advice</h3>
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                         "{selectedEntry.clinicalNotes || selectedEntry.notes}"
                       </p>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">End of Record</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}