'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, Clock, CheckCircle2, XCircle, 
  Settings, Loader2, ArrowRight,
  ShieldCheck, Activity, RefreshCw, Box
} from 'lucide-react';
import TriageRequestForm from "./TriageRequestForm";

export default function TriageEquipmentDashboard() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, histRes] = await Promise.all([
        fetch("/api/inventory"), 
        fetch("/api/inventory/withdraw/history")
      ]);
      
      const invData = await invRes.json();
      const histData = await histRes.json();
      
      setInventory(Array.isArray(invData) ? invData : []);
      setRequests(Array.isArray(histData) ? histData : []);
    } catch (e) { 
      console.error("Vault Sync Error:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const myRequests = useMemo(() => {
    if (!session?.user?.name) return [];
    return requests.filter(req => req.requestedBy === session.user?.name);
  }, [requests, session?.user?.name]);

  const handleUpdateStatus = async (id, nextStatus) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/inventory/withdraw/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) await fetchData();
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-10 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Triage<span className="text-blue-600">Assets</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Unified Inventory Ledger</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95"
          >
            <Plus size={16} /> Request Asset
          </button>
        </div>
      </header>

      {/* TABLE CONTENT */}
      <main className="p-10 max-w-7xl mx-auto w-full">
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Vault...</span>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">Asset Detail</th>
                  <th className="px-8 py-5 text-right">Lifecycle Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.length > 0 ? (
                  myRequests.map((req) => (
                    <tr key={req.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()} <br />
                        <span className="font-medium opacity-50">{new Date(req.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-800">{req.equipment?.name}</div>
                        <div className="text-[10px] font-black text-blue-500 uppercase italic">Cat: {req.equipment?.category}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end items-center gap-4">
                           {processingId === req.id ? (
                             <Loader2 size={14} className="animate-spin text-blue-600" />
                           ) : (
                             <div className="flex gap-2">
                               {req.status === "APPROVED" && (
                                 <button 
                                   onClick={() => handleUpdateStatus(req.id, "IN_USE")}
                                   className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-slate-900 transition-all"
                                 >
                                   Deploy
                                 </button>
                               )}
                               {req.status === "IN_USE" && (
                                 <button 
                                   onClick={() => handleUpdateStatus(req.id, "RETURNED")}
                                   className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-lg hover:bg-slate-200 transition-all"
                                 >
                                   Return
                                 </button>
                               )}
                             </div>
                           )}
                           <StatusBadge status={req.status} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <Settings size={48} className="mb-4" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Requisitions</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
             <TriageRequestForm 
                inventory={inventory} 
                onClose={() => setIsDrawerOpen(false)} 
                onSuccess={() => { setIsDrawerOpen(false); fetchData(); }} 
             />
          </div>
        </div>
      )}
    </div>
  );
}

const StatusBadge = ({ status }) => {
  const config = {
    PENDING: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
    APPROVED: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
    IN_USE: { color: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse", icon: Activity },
    RETURNED: { color: "bg-slate-50 text-slate-600 border-slate-100", icon: ShieldCheck },
    REJECTED: { color: "bg-rose-50 text-rose-600 border-rose-100", icon: XCircle },
  };
  const style = config[status] || config.PENDING;
  const Icon = style.icon;
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter ${style.color}`}>
      <Icon size={12} /> {status.replace("_", " ")}
    </div>
  );
};