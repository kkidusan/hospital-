"use client";

import { useState, useEffect, useRef } from 'react';
import { Settings, Save, Upload, Download, Play, Square, Clock, CheckCircle, AlertCircle, RefreshCw, Usb } from 'lucide-react';

export default function DatabaseSettingsPage() {
  const [isAutoEnabled, setIsAutoEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', type: '' });
  const [nextRun, setNextRun] = useState<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/backup-database');
      const data = await res.json();
      if (data.success) {
        const now = new Date().toLocaleTimeString();
        setStatus({ 
          text: `Latest Data Synced & Encrypted: Dr.birku_belete_backup.sql.enc (Updated at ${now})`, 
          type: 'success' 
        });
      } else throw new Error(data.error);
    } catch (e: any) {
      setStatus({ text: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("Critical: This will overwrite the current database with the selected file. Continue?")) return;

    setLoading(true);
    const fd = new FormData();
    fd.append('backupFile', file);

    try {
      const res = await fetch('/api/restore-database', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        setStatus({ text: "Database successfully decrypted and restored!", type: 'success' });
      } else throw new Error(data.error);
    } catch (e: any) {
      setStatus({ text: e.message, type: 'error' });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (isAutoEnabled) {
      const runAutoBackup = () => {
        handleExport();
        const next = new Date();
        next.setMinutes(next.getMinutes() + Number(intervalMinutes));
        setNextRun(next);
      };

      runAutoBackup();
      timerRef.current = setInterval(runAutoBackup, intervalMinutes * 60 * 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setNextRun(null);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAutoEnabled, intervalMinutes]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-3xl border border-slate-200 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 tracking-tight">SYSTEM BACKUP CENTER</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Biruh Tech Security Protocol</p>
            </div>
          </div>
          {nextRun && (
            <div className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 self-start md:self-center">
              <Clock size={14} />
              NEXT SYNC: {nextRun.toLocaleTimeString()}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={18} className="text-indigo-600"/> Automation Engine
            </h2>
            
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Usb size={20} className="text-slate-400" />
                <span className="font-bold text-sm text-slate-700">Auto-Save to USB</span>
              </div>
              <input 
                type="checkbox" 
                className="w-6 h-6 rounded-lg accent-indigo-600 cursor-pointer"
                checked={isAutoEnabled}
                onChange={(e) => setIsAutoEnabled(e.target.checked)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency (Minutes)</label>
              <input 
                type="number" 
                disabled={isAutoEnabled}
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 focus:ring-2 ring-indigo-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsAutoEnabled(true)} 
                disabled={isAutoEnabled}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition disabled:opacity-20"
              >
                <Play size={16} fill="currentColor"/> START
              </button>
              <button 
                onClick={() => setIsAutoEnabled(false)} 
                disabled={!isAutoEnabled}
                className="flex-1 bg-rose-50 text-rose-600 border border-rose-100 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-rose-100 transition disabled:opacity-20"
              >
                <Square size={16} fill="currentColor"/> STOP
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Save size={18} className="text-emerald-500"/> Manual Overrides
            </h2>
            
            <button 
              onClick={handleExport}
              disabled={loading}
              className="w-full group flex items-center justify-between p-5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition shadow-sm shadow-emerald-50"
            >
              <div className="text-left">
                <div className="font-bold text-sm">Force Instant Export</div>
                <div className="text-[10px] uppercase font-black opacity-50 tracking-tight">Overwrite Recent Backup</div>
              </div>
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Download size={20} />}
            </button>

            <label className="w-full group flex items-center justify-between p-5 bg-white border-2 border-dashed border-slate-200 text-slate-500 rounded-2xl hover:border-indigo-400 hover:text-indigo-600 transition cursor-pointer">
              <div className="text-left">
                <div className="font-bold text-sm">Manual State Restore</div>
                <div className="text-[10px] uppercase font-black opacity-50 tracking-tight">Upload .sql.enc System File</div>
              </div>
              <input type="file" className="hidden" accept=".sql.enc" onChange={handleImport} disabled={loading} />
              <Upload size={20} />
            </label>
            <p className="text-[10px] text-center text-slate-400 font-medium px-4">
              Note: Only upload encrypted .sql.enc backup files. Restoring will completely replace all current clinical records.
            </p>
          </div>
        </div>

        {status.text && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 border shadow-sm animate-in slide-in-from-bottom-4 duration-300 ${
            status.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            {status.type === 'success' ? <CheckCircle size={22} className="shrink-0" /> : <AlertCircle size={22} className="shrink-0" />}
            <p className="text-xs font-black uppercase tracking-wider">{status.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}