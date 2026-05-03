'use client';

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ClipboardCheck, X, Loader2, User, CheckCircle2, AlertCircle, Box, ShieldCheck } from "lucide-react";

export default function TriageRequestForm({ inventory, onClose, onSuccess }) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    materialId: "",
    quantity: 1, // Default quantity
    department: "Triage Units"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialId || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const res = await fetch("/api/inventory/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.error || "Vault: Requisition Denied.");
      }
    } catch (err) {
      setError("Vault: Network Sync Failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-900">
      {/* Header */}
      <div className="bg-slate-900 px-10 py-12 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-blue-500" /> Triage Req
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Unified Asset Requisition</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <X size={24} />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-10 space-y-10 overflow-y-auto">
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-600 text-[11px] font-black uppercase flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Identity */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specialist</label>
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700">
            <div className="p-2 bg-blue-600 rounded-lg text-white"><User size={14} /></div>
            {session?.user?.name || "Authenticating..."}
          </div>
        </div>

        {/* Dynamic Material Dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Item</label>
          <div className="relative">
            <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              required
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
              value={formData.materialId}
              onChange={(e) => setFormData({...formData, materialId: e.target.value})}
            >
              <option value="">-- Browse Full Inventory --</option>
              {inventory && inventory.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} [{item.category || 'General'}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Info & Submit */}
        <div className="mt-auto pt-10 space-y-6">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck size={16} className="text-blue-600 mt-1" />
            <p className="text-[9px] font-bold text-blue-900 uppercase leading-relaxed">
              By confirming, this asset will be logged under your ID for the duration of the current mission.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !formData.materialId}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
            ) : (
                <CheckCircle2 size={18} />
            )}
            <span>Confirm Requisition</span>
          </button>
        </div>
      </form>
    </div>
  );
}