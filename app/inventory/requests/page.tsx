"use client";

import React, { useState, useEffect } from "react";
import { 
  MoreHorizontal, CheckCircle2, XCircle, 
  Package, Loader2, RefreshCw, Search,
  ShieldCheck, ArrowRight
} from "lucide-react";

export default function WithdrawalLedger() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/withdraw/history");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const handleAction = async (id: string, status: string) => {
    setProcessingId(id);
    setOpenMenuId(null);
    try {
      const res = await fetch(`/api/inventory/withdraw/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        await fetchRequests();
      } else {
        const err = await res.json();
        alert(err.error || "Update failed");
      }
    } catch (e) {
      alert("Network Error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-sans antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              Disbursement <span className="text-indigo-600">Control</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">
              Final Verification & Stock Deduction
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filter by name..."
                className="pl-11 pr-6 py-3.5 bg-white rounded-2xl text-xs font-bold shadow-sm w-72 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={fetchRequests} className="p-4 bg-white rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
              <RefreshCw size={18} className={loading ? "animate-spin text-indigo-600" : "text-slate-600"} />
            </button>
          </div>
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-10 py-7 text-left">Requester</th>
                <th className="px-10 py-7 text-left">Item Details</th>
                <th className="px-10 py-7 text-center">Qty</th>
                <th className="px-10 py-7 text-left">Status</th>
                <th className="px-10 py-7 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.filter(r => r.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())).map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-6">
                    <div className="font-black text-sm text-slate-800 uppercase italic tracking-tight">{req.requestedBy}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{req.department || "Lab Staff"}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="font-bold text-sm text-slate-700">{req.material?.name}</div>
                    <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-tighter italic">Stock Sync Active</div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className="bg-slate-900 text-white px-4 py-1 rounded-lg font-black text-xs">
                      {req.quantity}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <StatusBadge status={req.status} />
                  </td>
                  
                  <td className="px-10 py-6 text-right relative overflow-visible">
                    <div className="flex items-center justify-end gap-3">
                      
                      {/* ACTION LOGIC */}
                      {processingId === req.id ? (
                        <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase">
                          <Loader2 size={14} className="animate-spin" /> Processing
                        </div>
                      ) : (
                        <>
                          {/* STEP 1: If PENDING -> Show Approve */}
                          {req.status === "PENDING" && (
                            <button 
                              onClick={() => handleAction(req.id, "APPROVED")}
                              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-emerald-100"
                            >
                              Approve
                            </button>
                          )}

                          {/* STEP 3: If REQUESTED -> Show CONFIRM (Final Deduction) */}
                          {req.status === "WITHDRAW_REQUESTED" && (
                            <button 
                              onClick={() => handleAction(req.id, "WITHDRAWN")}
                              className="bg-orange-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all animate-pulse shadow-lg shadow-orange-100"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck size={14} /> Confirm 
                              </div>
                            </button>
                          )}

                          {/* Optional Menu for Reject/Delete */}
                          {req.status !== "WITHDRAWN" && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(req.id); }}
                              className="p-2.5 bg-slate-100 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all"
                            >
                              <MoreHorizontal size={18} />
                            </button>
                          )}
                        </>
                      )}

                      {/* Dropdown for Rejection */}
                      {openMenuId === req.id && (
                        <div className="absolute right-10 top-16 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 py-2 animate-in slide-in-from-top-2">
                           <button 
                            onClick={() => handleAction(req.id, "REJECTED")}
                            className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50 flex items-center gap-2"
                           >
                             <XCircle size={14} /> Reject Request
                           </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: any = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-100",
    APPROVED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    WITHDRAW_REQUESTED: "bg-purple-50 text-purple-600 border-purple-100",
    WITHDRAWN: "bg-slate-100 text-slate-400 border-slate-200 grayscale",
    REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
  };
  
  const labels: any = {
    WITHDRAW_REQUESTED: "IN PROGRESS",
    WITHDRAWN: "COMPLETED",
  };

  return (
    <span className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.1em] ${config[status] || "bg-slate-50"}`}>
      {labels[status] || status}
    </span>
  );
}