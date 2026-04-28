"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Database, User, Clock, CheckCircle2, 
  XCircle, AlertCircle, PackageCheck, Loader2, Hand, ArrowRight 
} from "lucide-react";
import LabWithdrawalForm from "./LabWithdrawalForm";

type WithdrawalRequest = {
  id: string;
  createdAt: string;
  requestedBy: string;
  quantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAW_REQUESTED" | "WITHDRAWN" | "CANCELLED";
  material: { name: string };
};

export default function LabEquipmentDashboard() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [invRes, histRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/inventory/withdraw/history")
      ]);
      setMaterials(await invRes.json());
      setWithdrawals(await histRes.json());
    } catch (e) { console.error("Sync failed", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (id: string, nextStatus: string) => {
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

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any }> = {
      PENDING: { color: "bg-amber-50 text-amber-600 border-amber-100", icon: Clock },
      APPROVED: { color: "bg-emerald-50 text-emerald-600 border-emerald-100", icon: CheckCircle2 },
      WITHDRAW_REQUESTED: { color: "bg-purple-50 text-purple-600 border-purple-200 animate-pulse", icon: Hand },
      WITHDRAWN: { color: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: PackageCheck },
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

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-10 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Lab<span className="text-indigo-600">Vault</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Asset Management Engine</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-100"
        >
          <Plus size={16} /> New Request
        </button>
      </header>

      <main className="p-10 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Ledger...</span>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5">User</th>
                  <th className="px-8 py-5">Material</th>
                  <th className="px-8 py-5 text-right">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((log) => (
                  <tr key={log.id} className="group transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-5 text-[11px] font-bold text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString()} <br />
                      <span className="font-medium opacity-60">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-8 py-5 font-black text-xs uppercase text-slate-700">{log.requestedBy}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-800">{log.material?.name}</div>
                      <div className="text-[10px] font-black text-indigo-500 uppercase italic">Qty: {log.quantity}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex justify-end items-center gap-4">
                        {processingId === log.id ? (
                          <div className="flex items-center gap-2 px-4 py-2 text-indigo-600 font-black text-[10px] uppercase">
                            <Loader2 size={14} className="animate-spin" /> Processing
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            {/* Only show Withdraw button if status is APPROVED */}
                            {log.status === "APPROVED" && (
                              <button 
                                onClick={() => handleStatusUpdate(log.id, "WITHDRAW_REQUESTED")}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-slate-900 transition-all"
                              >
                                Withdraw <ArrowRight size={12} />
                              </button>
                            )}
                            
                            {/* Confirm Handover button removed from here */}
                          </div>
                        )}
                        <StatusBadge status={log.status} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DRAWER COMPONENT */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
             <LabWithdrawalForm 
                materials={materials} 
                onClose={() => setIsDrawerOpen(false)} 
                onSuccess={() => { setIsDrawerOpen(false); fetchData(); }} 
             />
          </div>
        </div>
      )}
    </div>
  );
}