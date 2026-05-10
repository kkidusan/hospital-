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
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [invRes, histRes] = await Promise.all([
        fetch("/api/inventory"),
        fetch("/api/inventory/withdraw/history")
      ]);

      if (invRes.ok) setMaterials(await invRes.json());
      if (histRes.ok) setWithdrawals(await histRes.json());
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const myRequests = useMemo(() => {
    if (!session?.user?.name) return [];
    return withdrawals.filter(req => 
      req.requestedBy?.toLowerCase() === session.user?.name?.toLowerCase()
    );
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
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { color: string; icon: any }> = {
      PENDING: { color: "bg-amber-50 text-amber-600", icon: Clock },
      APPROVED: { color: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
      WITHDRAW_REQUESTED: { color: "bg-teal-50 text-teal-600 animate-pulse", icon: Hand },
      WITHDRAWN: { color: "bg-slate-50 text-slate-600", icon: PackageCheck },
      REJECTED: { color: "bg-rose-50 text-rose-600", icon: XCircle },
    };

    const style = config[status] || config.PENDING;
    const Icon = style.icon;

    return (
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tight ${style.color}`}>
        <Icon size={10} /> {status.replace("_", " ")}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-900">
      
      {/* HEADER - COMPLETELY NO BACKGROUND CARD */}
      <header className="px-4 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900">
              Triage<span className="text-teal-600">Vault</span>
            </h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Supply Log</p>
          </div>

          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="bg-slate-900 hover:bg-teal-600 active:scale-95 transition-all text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"
          >
            <Plus size={15} /> NEW REQ
          </button>
        </div>
      </header>

      <main className="px-4 pt-4">
        {(loading || refreshing) && (
          <div className="flex flex-col items-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
            <p className="text-[10px] font-bold text-slate-400">LOADING...</p>
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header - No Background */}
              <thead>
                <tr className="border-b border-slate-300">
                  <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Item</th>
                  <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                  <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {myRequests.length > 0 ? (
                  myRequests.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-3 py-4 text-[10px] text-slate-500 font-medium leading-tight">
                        {new Date(log.createdAt).toLocaleDateString('en-GB')}<br />
                        <span className="text-[9px] text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="px-3 py-4 font-medium text-slate-800 text-[13px]">
                        {log.material?.name}
                      </td>
                      <td className="px-3 py-4 text-right font-bold text-teal-600 text-base">
                        {log.quantity}
                      </td>
                      <td className="px-3 py-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                          {processingId === log.id ? (
                            <div className="text-teal-600 text-[9px] font-bold flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin" /> UPDATING
                            </div>
                          ) : (
                            log.status === "APPROVED" && (
                              <button 
                                onClick={() => handleStatusUpdate(log.id, "WITHDRAW_REQUESTED")}
                                className="bg-teal-600 hover:bg-slate-900 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all"
                              >
                                WITHDRAW <ArrowRight size={12} />
                              </button>
                            )
                          )}
                          <StatusBadge status={log.status} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <Clock size={36} className="mb-3" />
                        <p className="text-sm font-medium">No requests yet</p>
                        <p className="text-[10px] mt-1">Tap "NEW REQ" above</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsDrawerOpen(false)} 
          />
          <div className="relative w-full max-w-md h-full bg-white">
            <ReceptionWithdrawalForm 
              materials={materials} 
              onClose={() => setIsDrawerOpen(false)} 
              onSuccess={() => {
                setIsDrawerOpen(false);
                fetchData();
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}