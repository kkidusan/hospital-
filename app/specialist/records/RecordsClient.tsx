'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Activity, Beaker, Radio, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

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
      console.error('Notification error:', err);
    } finally {
      router.push(`/specialist/consultation/${patientId}`);
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-slate-900">Today's Records</h1>
            <p className="text-slate-500 text-sm italic font-medium mt-1">
              {format(new Date(), 'EEEE, dd MMMM yyyy')}
            </p>
          </div>
          <Link href="/specialist" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-8 bg-slate-200/50 p-1 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('lab')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'lab' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Beaker size={14} /> Lab ({labRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('rad')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'rad' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Radio size={14} /> Radiology ({radiologyRequests.length})
          </button>
        </div>

        {/* Table Content */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeTab === 'lab' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
            <Activity size={16} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {activeTab === 'lab' ? 'Laboratory Queue' : 'Imaging Queue'}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Current workflow status</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {activeTab === 'lab' ? 'Tests Requested' : 'Imaging Type'}
                </th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Requested By</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment/Status</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'lab' ? (
                labRequests.length === 0 ? <EmptyRow span={5} text="No lab requests for today" /> :
                labRequests.map((req) => {
                  const invoiceStatus = labInvoiceMap[req.id];
                  const isPaid = invoiceStatus === 'PAID' || req.status === 'PAID' || req.status === 'COMPLETED';
                  const isCompleted = req.status === 'COMPLETED';
                  return (
                    <tr key={req.id} className="hover:bg-slate-100/50 transition-colors group">
                      <td className="px-2 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 uppercase">
                              {req.patient.mrn}
                            </span>
                            <span className="font-bold text-slate-900 text-[14px]">{req.patient.fullName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-1 font-medium">{req.patient.gender} / {req.patient.age}Y</span>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[300px]">
                          {req.tests.map((test: any, idx: number) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter border border-slate-200">
                              {test.testName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {req.requestedByName}
                      </td>
                      <td className="px-2 py-4 text-center">
                        <StatusBadge status={isCompleted ? 'completed' : isPaid ? 'paid' : 'pending'} />
                      </td>
                      <td className="px-2 py-4 text-right">
                        <button
                          onClick={() => handleViewLab(req.id, req.patientId)}
                          disabled={loadingId === req.id}
                          className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:bg-slate-300"
                        >
                          {loadingId === req.id ? <Loader2 size={14} className="animate-spin" /> : 'View'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                radiologyRequests.length === 0 ? <EmptyRow span={5} text="No radiology requests for today" /> :
                radiologyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-100/50 transition-colors group">
                    <td className="px-2 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 uppercase">
                            {req.patient.mrn}
                          </span>
                          <span className="font-bold text-slate-900 text-[14px]">{req.patient.fullName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 font-medium">{req.patient.gender} / {req.patient.age}Y</span>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-tighter">
                        {req.scanType || req.xrayType}
                      </span>
                    </td>
                    <td className="px-2 py-4 text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                      {req.requestedByName}
                    </td>
                    <td className="px-2 py-4 text-center">
                      <StatusBadge status="pending" />
                    </td>
                    <td className="px-2 py-4 text-right">
                      <Link
                        href={`/specialist/consultation/${req.patientId}`}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'paid' | 'completed' }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paid: "bg-blue-100 text-blue-700 border-blue-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200"
  };
  
  const labels = {
    completed: "Completed",
    paid: "Paid",
    pending: "Pending"
  };

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-tight ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function EmptyRow({ span, text }: { span: number, text: string }) {
  return (
    <tr>
      <td colSpan={span} className="px-6 py-20 text-center">
        <div className="flex flex-col items-center gap-2 opacity-40">
          <CheckCircle2 size={32} className="text-slate-400" />
          <p className="text-sm font-bold text-slate-500 tracking-tight uppercase">{text}</p>
        </div>
      </td>
    </tr>
  );
}