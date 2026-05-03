"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Printer, ArrowUpRight, Calendar, 
  User, Bed, FileText, CheckCircle2, RefreshCw, ShieldCheck, CreditCard, Timer
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function BillingRegistry() {
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const DAILY_RATE = 500;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/billing/active-beds');
      if (!res.ok) throw new Error(`Error ${res.status}: Route not found`);
      const data = await res.json();
      setAdmissions(data);
    } catch (err) {
      toast.error("Failed to sync registry. Check API route.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStayDays = (entryDate: string, dischargeDate?: string) => {
    if (!entryDate) return 1;
    const start = new Date(entryDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 1 : diff;
  };

  const handleDischarge = async () => {
    if (!selectedAdmission) return;
    setIsProcessing(true);
    const tId = toast.loading("Processing discharge...");
    
    const finalAmount = calculateStayDays(selectedAdmission.admissionDate) * DAILY_RATE;

    try {
      const res = await fetch('/api/admin/billing/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          admissionId: selectedAdmission.id,
          totalAmount: finalAmount 
        }),
      });
      
      const result = await res.json();
      
      if (result.success) {
        toast.success("Discharge successful", { id: tId });
        setIsDrawerOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Process failed", { id: tId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      <Toaster position="top-right" />
      
      {/* Header */}
      <nav className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-white">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Core</h1>
            <p className="text-xs font-bold text-slate-900">Billing & Discharge Registry</p>
          </div>
        </div>
        <button onClick={fetchData} className="p-2 hover:bg-slate-50 rounded-full transition-all">
          <RefreshCw size={16} className={loading ? "animate-spin text-blue-500" : "text-slate-300"} />
        </button>
      </nav>

      <main className="p-10 max-w-[1500px] mx-auto">
        <div className="overflow-hidden bg-white rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Trace</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Room/Bed</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status Flag</th>
                <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 pr-10">Interaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Synchronizing Records...</td></tr>
              ) : admissions.map((adm) => (
                <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900 tracking-tight">{adm.patient?.fullName || "Unknown Patient"}</div>
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">MRN: {adm.patient?.mrn}</div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-slate-500 text-xs">
                      <Calendar size={14} className="text-slate-300" />
                      {adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString('en-GB') : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-slate-700 uppercase">RM-{adm.bed?.room?.roomNumber || '??'}</div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Bed {adm.bed?.bedNumber}</div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      adm.status === 'ACTIVE' 
                        ? 'bg-amber-50 text-amber-600 border-amber-100' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {adm.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right pr-10">
                    <button 
                      onClick={() => { setSelectedAdmission(adm); setIsDrawerOpen(true); }}
                      className="p-2 border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all shadow-sm bg-white"
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setIsDrawerOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/20">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-900" />
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Billing Protocol</h2>
                  <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest italic leading-none">Confidential Document</p>
                </div>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg transition-all"><X size={18} /></button>
            </div>

            <div className="flex-1 p-8 space-y-12 overflow-y-auto">
              {/* Identification */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Identification</h3>
                <div className="space-y-3 px-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Full Name</span>
                    <span className="text-[11px] font-black text-slate-900 uppercase italic">{selectedAdmission?.patient?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">System MRN</span>
                    <span className="text-[11px] font-black text-blue-600">{selectedAdmission?.patient?.mrn}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary - CLEAN LIST FORMAT */}
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.3em] border-b border-slate-900/10 pb-2">Financial Summary</h3>
                <div className="space-y-4 px-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Admission Date</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-700">{selectedAdmission?.admissionDate ? new Date(selectedAdmission.admissionDate).toLocaleDateString('en-GB') : 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Timer size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Stay Duration</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-700">{calculateStayDays(selectedAdmission?.admissionDate, selectedAdmission?.dischargeDate)} Days</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-slate-400">
                      <CreditCard size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Daily Unit Rate</span>
                    </div>
                    <span className="text-[11px] font-black text-slate-700">{DAILY_RATE} ETB</span>
                  </div>
                  
                  {/* Settlement Total */}
                  <div className="pt-6 mt-4 border-t-2 border-slate-900 border-double flex justify-between items-end">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] pb-1">Settlement</span>
                    <div className="text-right">
                      <p className="text-4xl font-black italic tracking-tighter text-slate-900 leading-none">
                        {(calculateStayDays(selectedAdmission?.admissionDate, selectedAdmission?.dischargeDate) * DAILY_RATE).toLocaleString()}
                      </p>
                      <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mt-1">Ethiopian Birr</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAdmission?.status === 'DISCHARGED' && (
                <div className="border border-emerald-100 bg-emerald-50/50 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 font-black text-[9px] uppercase tracking-widest">
                    <CheckCircle2 size={16} /> Payment Verified
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase rounded-xl hover:bg-emerald-100 transition-all">
                    <Printer size={16} /> Print Receipt
                  </button>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100">
              {selectedAdmission?.status === 'ACTIVE' ? (
                <button 
                  onClick={handleDischarge}
                  disabled={isProcessing}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-slate-200"
                >
                  {isProcessing ? 'Synchronizing...' : 'Execute Discharge'}
                </button>
              ) : (
                <div className="py-4 text-center text-emerald-600 font-black text-[11px] uppercase tracking-[0.3em]">
                  Account Closed
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}