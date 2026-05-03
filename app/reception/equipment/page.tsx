'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, Clock, CheckCircle2, XCircle, 
  PackageCheck, Loader2, Hand, ArrowRight 
} from 'lucide-react';
import ReceptionWithdrawalForm from './ReceptionWithdrawalForm';

type WithdrawalRequest = {
  id: string;
  createdAt: string;
  requestedBy: string;
  quantity: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAW_REQUESTED" | "WITHDRAWN" | "CANCELLED";
  material: { name: string };
};

export default function ReceptionEquipmentDashboard() {
  const { data: session } = useSession();
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
    } catch (e) { 
      console.error("Sync failed", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filter to show only requests made by the current Triage staff member
  const myRequests = useMemo(() => {
    if (!session?.user?.name) return [];
    return withdrawals.filter(req => req.requestedBy === session.user?.name);
  }, [withdrawals, session?.user?.name]);

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
      WITHDRAW_REQUESTED: { color: "bg-teal-50 text-teal-600 border-teal-200 animate-pulse", icon: Hand },
      WITHDRAWN: { color: "bg-slate-50 text-slate-600 border-slate-100", icon: PackageCheck },
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
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 px-10 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">
            Triage<span className="text-teal-600">Vault</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Reception Supply Log</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-teal-600 transition-all active:scale-95 shadow-lg shadow-teal-100"
        >
          <Plus size={16} /> Request Supplies
        </button>
      </header>

      <main className="p-10 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center py-40 gap-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Syncing personal records...</span>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
                <tr>
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Supply Item</th>
                  <th className="px-8 py-5 text-right">Status & Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myRequests.length > 0 ? (
                  myRequests.map((log) => (
                    <tr key={log.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-8 py-5 text-[11px] font-bold text-slate-400">
                        {new Date(log.createdAt).toLocaleDateString()} <br />
                        <span className="font-medium opacity-60">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-800">{log.material?.name}</div>
                        <div className="text-[10px] font-black text-teal-600 uppercase italic">Quantity: {log.quantity}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end items-center gap-4">
                          {processingId === log.id ? (
                            <div className="flex items-center gap-2 px-4 py-2 text-teal-600 font-black text-[10px] uppercase">
                              <Loader2 size={14} className="animate-spin" /> Updating
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              {log.status === "APPROVED" && (
                                <button 
                                  onClick={() => handleStatusUpdate(log.id, "WITHDRAW_REQUESTED")}
                                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-[10px] font-black uppercase rounded-lg hover:bg-slate-900 transition-all"
                                >
                                  Withdraw <ArrowRight size={12} />
                                </button>
                              )}
                            </div>
                          )}
                          <StatusBadge status={log.status} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center">
                       <div className="flex flex-col items-center opacity-20">
                          <Clock size={40} className="mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">No Supply Requests Found</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300">
             <ReceptionWithdrawalForm 
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