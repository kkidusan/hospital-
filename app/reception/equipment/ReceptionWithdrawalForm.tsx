'use client';

import React, { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  ClipboardCheck, Package, ArrowDownCircle, AlertCircle, 
  CheckCircle2, X, ShieldCheck, Loader2, User 
} from "lucide-react";

interface Material {
  id: string;
  name: string;
  totalInBaseUnits: number;
}

interface Props {
  materials: Material[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReceptionWithdrawalForm({ materials = [], onClose, onSuccess }: Props) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    materialId: "",
    quantity: 1,
    department: "Reception/Triage",
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
        setError(result.error || "Disbursement request failed.");
      }
    } catch (err) {
      setError("Network error. Could not connect to Vault.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans text-slate-900">
      {/* Header with Teal Branding */}
      <div className="bg-slate-900 px-10 py-12 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <ClipboardCheck className="text-teal-400" /> Supply Req
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Reception & Triage Disbursement
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
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Requesting Staff</label>
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-700">
            <div className="p-2 bg-teal-600 rounded-lg text-white"><User size={14} /></div>
            {session?.user?.name || 'Staff Member'}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <select 
              required
              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-teal-500/10 appearance-none"
              value={formData.materialId}
              onChange={(e) => setFormData({...formData, materialId: e.target.value})}
            >
              <option value="">-- Select Supply --</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Available: {m.totalInBaseUnits})</option>
              ))}
            </select>
            <ArrowDownCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantity</label>
          <input 
            type="number"
            min="1"
            className={`w-full px-6 py-5 border rounded-[1.5rem] font-black text-3xl outline-none transition-all ${
              isInvalidQty ? "bg-rose-50 border-rose-300 text-rose-600" : "bg-white border-slate-200 text-teal-600 focus:border-teal-600"
            }`}
            value={formData.quantity}
            onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
          />
          {isInvalidQty && <p className="text-[10px] font-black text-rose-500 uppercase italic text-center">Stock limit reached</p>}
        </div>

        <div className="mt-auto pt-10 space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <ShieldCheck size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Authorized Request. Session Logged.</span>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || isInvalidQty || isFormIncomplete}
            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-teal-600 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin" size={18} /><span>Processing...</span></>
            ) : (
              <><CheckCircle2 size={18} /><span>Submit Request</span></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}