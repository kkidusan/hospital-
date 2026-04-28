"use client";

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  ClipboardCheck, Package, ArrowDownCircle, AlertCircle, 
  CheckCircle2, X, ShieldCheck, Loader2, User 
} from "lucide-react";

interface LabMaterial {
  id: string;
  name: string;
  totalInBaseUnits: number;
}

interface LabWithdrawalFormProps {
  materials: LabMaterial[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function LabWithdrawalForm({ materials = [], onClose, onSuccess }: LabWithdrawalFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    materialId: "",
    quantity: 1,
    department: "Laboratory",
  });

  const selectedMaterial = useMemo(() => 
    materials.find(m => m.id === formData.materialId), 
  [formData.materialId, materials]);

  const isInvalidQty = selectedMaterial && formData.quantity > selectedMaterial.totalInBaseUnits;
  const isFormIncomplete = !formData.materialId || formData.quantity <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalidQty || isFormIncomplete || isSubmitting) return;

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
        const result = await res.json();
        setError(result.error || "Disbursement failed.");
      }
    } catch (err) {
      setError("Network error. Could not sync with Vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl font-sans text-slate-900">
      <div className="bg-slate-900 px-10 py-12 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-indigo-500" /> Withdrawal
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Official Disbursement Form
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-10 space-y-8 overflow-y-auto">
        {error && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-600 text-[11px] font-black uppercase flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requesting Personnel</label>
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700">
            <div className="p-2 bg-indigo-600 rounded-lg text-white"><User size={14} /></div>
            {session?.user?.name || "Verifying identity..."}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material</label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              required
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
              value={formData.materialId}
              onChange={(e) => setFormData({...formData, materialId: e.target.value})}
            >
              <option value="">-- Select Material --</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Available: {m.totalInBaseUnits})</option>
              ))}
            </select>
            <ArrowDownCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</label>
          <input 
            type="number"
            min="1"
            className={`w-full px-6 py-5 border rounded-[1.5rem] font-black text-3xl outline-none transition-all ${
              isInvalidQty ? "bg-rose-50 border-rose-300 text-rose-600" : "bg-white border-slate-200 text-indigo-600 focus:border-indigo-600"
            }`}
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
          />
          {isInvalidQty && <p className="text-[10px] font-black text-rose-500 uppercase italic">Error: Stock Limit Exceeded</p>}
        </div>

        <div className="mt-auto pt-10 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <ShieldCheck size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Authorized Action Logged to Audit</span>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isInvalidQty || isFormIncomplete}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? <><Loader2 className="animate-spin" size={18} /><span>Syncing...</span></> : <><CheckCircle2 size={18} /><span>Confirm Request</span></>}
          </button>
        </div>
      </form>
    </div>
  );
}