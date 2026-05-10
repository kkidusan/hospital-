"use client";

import { useState } from 'react';
import { generateFullHisPdf } from '../../lib/generateHisPdf';
import { FileDown, Loader2 } from 'lucide-react';

export default function HisReportButton({ month, year }: { month: number; year: number }) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/reports/his?month=${month}&year=${year}`);
      
      if (!response.ok) throw new Error("Server error");
      
      const data = await response.json();
      generateFullHisPdf(data);
    } catch (error) {
      console.error(error);
      alert("Export Failed: Ensure API route exists and database is connected.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={busy}
      className="flex items-center gap-4 bg-slate-900 text-white px-10 py-5 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl"
    >
      {busy ? <Loader2 className="animate-spin" size={24} /> : <FileDown size={24} />}
      <div className="text-left">
        <span className="block text-[10px] font-black uppercase text-slate-400">Monthly Report</span>
        <span className="block font-bold">Generate HIS v0.9.30</span>
      </div>
    </button>
  );
}