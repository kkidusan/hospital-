"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Search, FileCheck, ArrowLeft, Loader2, 
  ShieldAlert, Activity, ChevronRight, Calendar, Clock, FileText
} from 'lucide-react';

export default function MortalityReportPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 3) performSearch(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setPatientData(data);
    } catch (err) {
      setError("Patient record not found.");
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPatientData(null);
    setSearchQuery('');
    setIsSubmitted(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    const payload = {
      patientId: patientData.id,
      admissionId: patientData.admissions?.[0]?.id || null,
      reportedById: session?.user?.id || "unknown",
      primaryCause: formData.get('primaryCause'),
      dateOfDeath: formData.get('dateOfDeath'),
      timeOfDeath: formData.get('timeOfDeath'),
      clinicalSummary: formData.get('clinicalSummary'),
      within24Hours: false 
    };

    try {
      const response = await fetch('/api/mortality/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response. Please check API route.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save report");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6">
          <FileCheck size={48} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Report Finalized</h2>
        <p className="text-slate-500 font-medium mt-2">The mortality record has been securely archived.</p>
        <button onClick={handleReset} className="mt-8 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all">
          Create New Entry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {!patientData ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Critical Documentation
          </div>
          <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tighter">
            MORTALITY <span className="text-slate-400 font-light">REPORT</span>
          </h1>
          
          <div className="w-full max-w-2xl relative group">
            <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full" />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-2 flex items-center border border-slate-200">
              <Search className="ml-6 text-slate-300" size={24} />
              <input 
                type="text" 
                placeholder="Search by MRN or Patient Name..." 
                className="w-full p-6 text-xl font-bold outline-none bg-transparent"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {loading && <Loader2 className="mr-6 animate-spin text-red-600" size={24} />}
            </div>
          </div>
          {error && <p className="mt-4 text-red-500 font-bold text-xs uppercase tracking-widest">{error}</p>}
        </div>
      ) : (
        <div>
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button onClick={handleReset} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl">
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{patientData.fullName}</h2>
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold rounded uppercase">{patientData.mrn}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {patientData.age}Y • {patientData.gender} • <span className="text-red-500">Subject Clinical Profile</span>
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Latest Diagnosis</p>
                   <p className="text-sm font-bold text-slate-700">{patientData.lastDiagnosis}</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Activity size={20} />
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-4xl mx-auto px-6 py-12">
            <form onSubmit={handleSubmit} className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                    <ShieldAlert size={24} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Report Particulars</h3>
                    <p className="text-sm text-slate-400 font-medium">Official certification of clinical mortality</p>
                 </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Primary Cause of Death</label>
                  <div className="relative">
                    <select name="primaryCause" required className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl outline-none font-bold text-sm appearance-none">
                      <option value="">Select Cause...</option>
                      {patientData.lastDiagnosis && patientData.lastDiagnosis !== "N/A" && (
                         <option value={patientData.lastDiagnosis}>[LAST DIAGNOSIS] {patientData.lastDiagnosis}</option>
                      )}
                      <option value="Septic Shock">Septic Shock</option>
                      <option value="Cardiopulmonary Arrest">Cardiopulmonary Arrest</option>
                      <option value="Multiple Organ Failure">Multiple Organ Failure</option>
                    </select>
                    <ChevronRight size={20} className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Calendar size={12} /> Date of Occurrence
                    </label>
                    <input name="dateOfDeath" type="date" required className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl font-bold text-sm outline-none" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                      <Clock size={12} /> Time of Occurrence
                    </label>
                    <input name="timeOfDeath" type="time" required className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl font-bold text-sm outline-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    <FileText size={12} /> Narrative Summary
                  </label>
                  <textarea 
                    name="clinicalSummary"
                    rows={5} 
                    required
                    placeholder="Provide a detailed clinical summary..."
                    className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-[2rem] outline-none text-sm font-medium"
                  />
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-4 p-6 bg-slate-900 text-white rounded-3xl mb-6">
                    <input type="checkbox" id="urgent" className="w-5 h-5 accent-red-500" required />
                    <label htmlFor="urgent" className="text-xs font-bold uppercase tracking-tight cursor-pointer">
                      I certify that the information above is accurate.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />}
                    Authorize & Save Report
                  </button>
                </div>
              </div>
            </form>
          </main>
        </div>
      )}
    </div>
  );
}