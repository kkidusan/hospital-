"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, MapPin, Plus, Trash2, Edit3, 
  Search, LayoutGrid, Database, ChevronRight, X, 
  Loader2, AlertCircle, CheckCircle2 
} from "lucide-react";
import Link from "next/link";

interface Zone {
  id: string;
  name: string;
  description: string;
  shelves: number;
  status: string;
}

export default function ZoneManagement() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shelves: 0,
    status: "Active"
  });

  const fetchZones = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inventory/zones");
      const data = await res.json();
      setZones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Database fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inventory/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsDrawerOpen(false);
        setFormData({ name: "", description: "", shelves: 0, status: "Active" });
        await fetchZones();
      }
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredZones = zones.filter(z => 
    z.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans selection:bg-indigo-100">
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-all"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        
        <header className="bg-white border border-slate-200 rounded-2xl p-3 mb-6 shadow-sm flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <Link 
              href="/inventory/Manage-item" 
              className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </Link>
            <div className="leading-tight">
              <h1 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                ZONE ARCHITECTURE
                <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] rounded uppercase">Pro</span>
              </h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Global Positioning</p>
            </div>
          </div>

          <div className="flex-1 max-w-xl relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> Add New Zone
            </button>
          </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Infrastructure</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={24} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Syncing...</p>
                    </td>
                  </tr>
                ) : filteredZones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-[10px] font-black border border-indigo-100">
                          {zone.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs uppercase">{zone.name}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1 font-medium">{zone.description || "No description assigned"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700">{zone.shelves} Units</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Capacity</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        zone.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${zone.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        {zone.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-all shadow-sm">
                          <Edit3 size={14} />
                        </button>
                        <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all shadow-sm">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`fixed top-0 right-0 h-full bg-white z-50 shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isDrawerOpen ? "w-full md:w-[500px]" : "w-0 overflow-hidden"}`}>
        <div className="h-full flex flex-col w-[500px]">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Initialize Zone</h2>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Access: Administrative</p>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Zone Designation</label>
              <input 
                required
                placeholder="e.g., SECTOR-7G"
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose</label>
              <textarea 
                rows={3}
                placeholder="Utility description..."
                className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Shelf Count</label>
                <input 
                  type="number"
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  value={formData.shelves}
                  onChange={(e) => setFormData({...formData, shelves: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
                <select 
                  className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all appearance-none"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Restricted">Restricted</option>
                  <option value="Locked">Locked</option>
                </select>
              </div>
            </div>

            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
              <AlertCircle className="text-indigo-600 shrink-0" size={16} />
              <p className="text-[10px] font-bold text-indigo-700 leading-snug">
                Data will be synced to the global registry. Ensure physical markers align with digital record.
              </p>
            </div>
          </form>

          <div className="p-8 border-t border-slate-100 bg-slate-50/50">
            <button 
              disabled={isSubmitting}
              onClick={handleSave}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} /> Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} /> Commit Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}