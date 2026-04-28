// app/specialist/history/[patientId]/HistoryClient.tsx
"use client";

import { format } from 'date-fns';
import { useState } from 'react';
import { User, Heart, AlertCircle, ClipboardCheck, FileText } from 'lucide-react';

interface HistoryClientProps {
  sortedHistory: any[];
}

export default function HistoryClient({ sortedHistory }: HistoryClientProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openDetail = (index: number) => {
    setSelectedIndex(index);
  };

  const closeSidebar = () => {
    setSelectedIndex(null);
  };

  return (
    <>
      {/* Plain Consultation History Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left py-3.5 px-6 font-medium text-gray-700">Date & Time</th>
              <th className="text-left py-3.5 px-6 font-medium text-gray-700">Diagnosis</th>
              <th className="text-left py-3.5 px-6 font-medium text-gray-700">Visit</th>
              <th className="w-24 text-right pr-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedHistory.map((entry: any, index: number) => (
              <tr 
                key={index}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => openDetail(index)}
              >
                <td className="py-4 px-6">
                  <div className="font-medium text-gray-900">
                    {format(new Date(entry.sessionDate), 'dd MMM yyyy')}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {format(new Date(entry.sessionDate), 'hh:mm a')}
                  </div>
                </td>
                <td className="py-4 px-6 text-gray-700 line-clamp-1">
                  {entry.diagnosis || "Consultation completed"}
                </td>
                <td className="py-4 px-6">
                  <span className="inline-block px-3 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    Visit {sortedHistory.length - index}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-blue-600 hover:text-blue-700 font-medium text-sm">View →</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Sidebar Overlay */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div 
            className="w-1/2 h-full bg-white shadow-2xl overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-base text-gray-900">Consultation Details</h2>
              <button
                onClick={closeSidebar}
                className="text-gray-500 hover:text-red-600 text-2xl leading-none px-3 py-1 rounded hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {(() => {
                const entry = sortedHistory[selectedIndex];
                const index = selectedIndex;

                return (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 pb-3 border-b">
                      <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <User size={18} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {format(new Date(entry.sessionDate), 'dd MMMM yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(entry.sessionDate), 'hh:mm a')} • Dr. {entry.doctorName || "Birku Belete"}
                        </div>
                      </div>
                      <span className="px-3 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        Visit {sortedHistory.length - index}
                      </span>
                    </div>

                    {/* Final Diagnosis */}
                    <div>
                      <h3 className="font-medium text-xs uppercase tracking-widest text-emerald-700 mb-1">Final Diagnosis</h3>
                      <p className="text-gray-900">{entry.diagnosis || "No diagnosis recorded"}</p>
                    </div>

                    {/* Clinical Notes */}
                    {entry.clinicalNotes && (
                      <div>
                        <h3 className="font-medium text-xs uppercase tracking-widest text-gray-800 mb-1">Clinical Notes & Advice</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                          {entry.clinicalNotes}
                        </p>
                      </div>
                    )}

                    {/* Vital Signs */}
                    {entry.triage && (
                      <div>
                        <h3 className="font-medium text-xs uppercase tracking-widest text-red-600 mb-2 flex items-center gap-1.5">
                          <Heart size={16} /> Vital Signs
                        </h3>
                        <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">
                          <div><span className="text-gray-500 text-xs block">Temperature</span> <span className="font-medium">{entry.triage.temperature}°C</span></div>
                          <div><span className="text-gray-500 text-xs block">Blood Pressure</span> <span className="font-medium">{entry.triage.bloodPressure}</span></div>
                          <div><span className="text-gray-500 text-xs block">Pulse</span> <span className="font-medium">{entry.triage.pulse} bpm</span></div>
                          <div><span className="text-gray-500 text-xs block">SpO₂</span> <span className="font-medium">{entry.triage.spo2}%</span></div>
                          <div><span className="text-gray-500 text-xs block">Weight</span> <span className="font-medium">{entry.triage.weight} kg</span></div>
                        </div>
                      </div>
                    )}

                    {/* Chief Complaint */}
                    {entry.chiefComplaint && (
                      <div>
                        <h3 className="font-medium text-xs uppercase tracking-widest text-amber-600 mb-1 flex items-center gap-1.5">
                          <AlertCircle size={16} /> Chief Complaint
                        </h3>
                        <p className="text-gray-700 text-sm">{entry.chiefComplaint}</p>
                      </div>
                    )}

                    {/* Lab Results */}
                    {entry.labRequests?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-xs uppercase tracking-widest text-blue-700 mb-2 flex items-center gap-1.5">
                          <ClipboardCheck size={16} /> Laboratory Results
                        </h3>
                        <div className="space-y-4">
                          {entry.labRequests.map((req: any, i: number) => (
                            <div key={i} className="border border-gray-200 rounded p-3 text-xs">
                              <div className="text-gray-500 mb-1.5">
                                Requested on {format(new Date(req.createdAt), 'dd MMM yyyy')}
                              </div>
                              <table className="w-full">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-1">Test</th>
                                    <th className="text-left py-1">Result</th>
                                    <th className="text-left py-1">Unit</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y text-gray-900">
                                  {req.tests?.map((test: any) => (
                                    <tr key={test.id}>
                                      <td className="py-1.5 font-medium">{test.testName}</td>
                                      <td className="py-1.5">{test.result || '—'}</td>
                                      <td className="py-1.5 text-gray-500">{test.unit || '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Radiology */}
                    {entry.radiologyRequests?.length > 0 && (
                      <div>
                        <h3 className="font-medium text-xs uppercase tracking-widest text-violet-700 mb-2 flex items-center gap-1.5">
                          <FileText size={16} /> Radiology Reports
                        </h3>
                        <div className="space-y-3">
                          {entry.radiologyRequests.map((req: any, i: number) => (
                            <div key={i} className="border border-gray-200 rounded p-3 text-sm">
                              <div className="font-medium">{req.scanType || 'Radiology Request'}</div>
                              {req.clinicalData && <div className="mt-2 text-gray-700"><span className="font-medium">Clinical Data:</span> {req.clinicalData}</div>}
                              {req.ultrasound?.length > 0 && <div className="mt-1"><span className="font-medium">Ultrasound:</span> {req.ultrasound.join(', ')}</div>}
                              {req.xrayType && <div className="mt-1"><span className="font-medium">X-Ray:</span> {req.xrayType}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}