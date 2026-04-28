'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';

type Props = {
  data: {
    labRequests: any[];
    radiologyRequests: any[];
    labInvoiceMap: Record<string, string>;
    radInvoiceMap: Record<string, string>;
    userId: string;
  };
};

export default function RecordsClient({ data }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lab' | 'rad'>('lab');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { labRequests, radiologyRequests, labInvoiceMap, radInvoiceMap, userId } = data;

  const handleViewLab = async (labRequestId: string, patientId: string) => {
    if (loadingId) return;
    setLoadingId(labRequestId);

    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labRequestId, userId }),
      });
    } catch (err) {
      console.error('Mark read failed:', err);
    } finally {
      router.push(`/specialist/consultation/${patientId}`);
      setTimeout(() => router.refresh(), 400);
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Today's Records</h1>
          <p className="text-slate-600 mt-1">
            Lab & Radiology Requests — {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>
        <Link
          href="/specialist"
          className="px-6 py-3 bg-[#003087] hover:bg-[#00246b] text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex border-b border-slate-300">
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-8 py-4 text-lg font-medium transition-all duration-200 ${
              activeTab === 'lab'
                ? 'text-[#003087] border-b-4 border-[#003087] font-semibold'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Laboratory ({labRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('rad')}
            className={`px-8 py-4 text-lg font-medium transition-all duration-200 ${
              activeTab === 'rad'
                ? 'text-[#003087] border-b-4 border-[#003087] font-semibold'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Radiology ({radiologyRequests.length})
          </button>
        </div>
      </div>

      {activeTab === 'lab' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-slate-800">Laboratory Requests</h2>
          </div>

          {labRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 text-lg">
              No laboratory requests today.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MRN / Age / Sex</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tests Requested</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {labRequests.map((req) => {
                      const invoiceStatus = labInvoiceMap[req.id];
                      const isPaid = invoiceStatus === 'PAID' || req.status === 'PAID' || req.status === 'COMPLETED';
                      const isCompleted = req.status === 'COMPLETED';

                      return (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-900">{req.patient.fullName}</div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {req.patient.mrn || '—'} • {req.patient.age || '—'}y • {req.patient.gender || '—'}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {req.tests.map((test: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full whitespace-nowrap"
                                >
                                  {test.testName}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">{req.requestedByName || '—'}</td>
                          <td className="px-6 py-5 text-center">
                            <StatusBadge status={isCompleted ? 'completed' : isPaid ? 'paid' : 'pending'} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => handleViewLab(req.id, req.patientId)}
                              disabled={loadingId === req.id}
                              className="inline-flex items-center px-6 py-2.5 bg-[#003087] hover:bg-[#00246b] disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                            >
                              {loadingId === req.id ? 'Marking & Opening...' : 'View'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'rad' && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1.5 bg-indigo-600 rounded-full"></div>
            <h2 className="text-2xl font-semibold text-slate-800">Radiology Requests</h2>
          </div>

          {radiologyRequests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 text-lg">
              No radiology requests today.
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MRN / Age / Sex</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Scan Type</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Requested By</th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {radiologyRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="font-semibold text-slate-900">{req.patient.fullName}</div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {req.patient.mrn || '—'} • {req.patient.age || '—'}y • {req.patient.gender || '—'}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-medium text-indigo-700">{req.scanType || req.xrayType || '—'}</div>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-600">{req.requestedByName || '—'}</td>
                        <td className="px-6 py-5 text-center">
                          <StatusBadge status="pending" />
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/specialist/consultation/${req.patientId}`}
                            className="inline-flex items-center px-6 py-2.5 bg-[#003087] hover:bg-[#00246b] text-white text-sm font-medium rounded-xl transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'paid' | 'completed' }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
        ✅ Completed
      </span>
    );
  }
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        Paid
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
      Pending
    </span>
  );
}