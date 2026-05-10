"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle2, Search, X, Plus, Calendar, Loader2 } from 'lucide-react';
import { useConsultationStore } from '../../../lib/store/useConsultationStore';
import icdData from './icd11_full.json';

interface FinalizeFormProps {
  patient: any;
  onFinalize: (formData: FormData) => Promise<void>;
}

export function FinalizeConsultationForm({ patient, onFinalize }: FinalizeFormProps) {
  const { finalizeDraft, setFinalizeDraft, resetAllDrafts } = useConsultationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredICD = useMemo(() => {
    if (searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return (icdData as any[])
      .filter(item => item.name.toLowerCase().includes(term) || item.icdCode.toLowerCase().includes(term))
      .slice(0, 10);
  }, [searchTerm]);

  const addDiagnosis = (item: any) => {
    const current = finalizeDraft.diagnoses || [];
    if (!current.find((d: any) => d.icdCode === item.icdCode)) {
      setFinalizeDraft({ diagnoses: [...current, item] });
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const removeDiagnosis = (code: string) => {
    const updated = (finalizeDraft.diagnoses || []).filter((d: any) => d.icdCode !== code);
    setFinalizeDraft({ diagnoses: updated });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (finalizeDraft.diagnoses.length === 0) {
      alert("Please add at least one diagnosis.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('patientId', patient.id);
    formData.append('diagnoses', JSON.stringify(finalizeDraft.diagnoses));
    formData.append('notes', finalizeDraft.notes);

    try {
      await onFinalize(formData);
      // If we reach here, the server action completed without a redirect throw
      resetAllDrafts();
    } catch (error: any) {
      // Handle Next.js Redirect "Error" - this is actually success
      if (error.message?.includes('NEXT_REDIRECT') || error.digest?.includes('NEXT_REDIRECT')) {
        resetAllDrafts();
        return; 
      }
      
      console.error("Submission error:", error);
      alert(error.message || "An unexpected error occurred while finalizing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-20">
      <div className="space-y-12">
        <header className="border-b border-gray-100 pb-6">
          <h3 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            Complete Consultation
          </h3>
          <p className="text-gray-500 mt-2">Finalize findings for {patient.fullName}.</p>
        </header>

        {/* Diagnosis Search */}
        <section className="space-y-4">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Final Diagnoses (ICD-11)</label>
          <div className="flex flex-wrap gap-2 min-h-[40px]">
            {finalizeDraft.diagnoses?.map((diag: any) => (
              <div key={diag.icdCode} className="flex items-center gap-2 bg-white border-2 border-emerald-100 pl-3 pr-2 py-1.5 rounded-xl shadow-sm">
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded">{diag.icdCode}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-800">{diag.name}</span>
                </div>
                <button type="button" onClick={() => removeDiagnosis(diag.icdCode)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="relative" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                placeholder="Search codes or conditions..."
                className="w-full pl-12 pr-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 bg-gray-50 outline-none"
              />
            </div>
            {showDropdown && searchTerm.length >= 2 && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                {filteredICD.map((item: any) => (
                  <button key={item.icdCode} type="button" onClick={() => addDiagnosis(item)} className="w-full text-left px-5 py-4 hover:bg-emerald-50 flex items-center justify-between border-b border-gray-50 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-600">{item.icdCode}</span>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <Plus size={18} className="text-gray-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Clinical Advice */}
        <section className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Clinical Advice & Notes</label>
          <textarea 
            value={finalizeDraft.notes}
            onChange={(e) => setFinalizeDraft({ notes: e.target.value })}
            rows={4}
            className="w-full px-5 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-500 bg-gray-50 outline-none resize-none"
            placeholder="Medications, lifestyle changes, and general advice..."
          />
        </section>

        {/* Follow up */}
        <section className="pt-8 border-t border-gray-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl">
              <Calendar size={24} className="text-indigo-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">Schedule Follow-up</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="date" name="followUpDate" className="w-full px-5 py-3.5 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none" />
            <input type="time" name="followUpTime" className="w-full px-5 py-3.5 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none" />
          </div>
        </section>

        <div className="flex gap-4 pt-6">
          <button type="button" onClick={resetAllDrafts} className="flex-1 py-4 text-gray-400 font-bold hover:bg-gray-100 rounded-2xl">Discard Draft</button>
          <button 
            type="submit" 
            disabled={isSubmitting || finalizeDraft.diagnoses.length === 0}
            className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Finalize & Save Record"}
          </button>
        </div>
      </div>
    </form>
  );
}