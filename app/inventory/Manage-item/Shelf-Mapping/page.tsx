"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, Grid3X3, Plus, Trash2, Edit3, 
  Search, Archive, ChevronRight,
  Layers, Loader2, AlertTriangle, X, Save
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Shelf {
  id: string;
  code: string;
  level: string;
  capacity: number;
  items_count: number;
  status: string;
}

interface Zone {
  id: string;
  name: string;
}

export default function ShelfMapping() {
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [zones, setZones] = useState<Zone[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [loading, setLoading] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    zoneName: "",
    level: "L1",
    capacity: "100"
  });

  const fetchZones = async () => {
    try {
      setZonesLoading(true);
      const res = await fetch("/api/inventory/zones");
      const data = await res.json();
      setZones(data);
      if (data.length > 0) {
        setSelectedZone(data[0].name);
        setFormData(prev => ({ ...prev, zoneName: data[0].name }));
      }
    } catch (error) {
      console.error("Zone fetch error:", error);
    } finally {
      setZonesLoading(false);
    }
  };

  const fetchShelves = useCallback(async () => {
    if (!selectedZone) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/inventory/shelves?zone=${encodeURIComponent(selectedZone)}`);
      const data = await res.json();
      setShelves(Array.isArray(data) ? data : []);
    } catch (error) {
      setShelves([]);
    } finally {
      setLoading(false);
    }
  }, [selectedZone]);

  useEffect(() => { fetchZones(); }, []);
  useEffect(() => { fetchShelves(); }, [fetchShelves]);

  const handleSaveShelf = async () => {
    if (!formData.code || !formData.zoneName) return alert("Please fill all fields");
    
    try {
      setIsSaving(true);
      const res = await fetch("/api/inventory/shelves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const result = await res.json();

      if (res.ok) {
        setIsDrawerOpen(false);
        // Reset code but keep zone/level for batch entry
        setFormData(prev => ({ ...prev, code: "" })); 
        fetchShelves();
      } else {
        alert(result.error || "Failed to save shelf");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredShelves = shelves.filter(s => 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/inventory" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Shelf Mapping</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Spatial Inventory Architecture</p>
            </div>
          </div>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
          >
            <Plus size={18} /> Add New Unit
          </button>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* LEFT: ZONE FILTER */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Location Filter</h3>
              <div className="space-y-2">
                {zonesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                ) : zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => {
                        setSelectedZone(zone.name);
                        setFormData(prev => ({ ...prev, zoneName: zone.name }));
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-xs transition-all ${
                      selectedZone === zone.name 
                      ? "bg-slate-900 text-white shadow-md" 
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {zone.name}
                    {selectedZone === zone.name && <ChevronRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: SHELF GRID */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Grid3X3 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{selectedZone} Grid</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{shelves.length} Total Units Found</p>
                  </div>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" placeholder="Search ID..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500 transition-all" 
                  />
                </div>
              </div>

              <div className="p-6 min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Updating Map...</p>
                  </div>
                ) : filteredShelves.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredShelves.map((shelf) => (
                      <ShelfCard key={shelf.id} shelf={shelf} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl">
                    <AlertTriangle className="text-slate-300 mb-2" size={40} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Active Units in {selectedZone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DRAWER FORM */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white z-[70] shadow-2xl flex flex-col">
              <div className="p-8 border-b flex items-center justify-between">
                <h2 className="text-xl font-black uppercase">Add Shelf</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg"><X /></button>
              </div>
              
              <div className="p-8 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Shelf Code (Unique ID)</label>
                  <input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none focus:ring-2 ring-indigo-500/20" placeholder="ZA-AISLE-101" />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Zone Assignment</label>
                  <select value={formData.zoneName} onChange={(e) => setFormData({...formData, zoneName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none">
                    {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Level</label>
                        <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none">
                            <option value="L1">Level 1 (Bottom)</option>
                            <option value="L2">Level 2</option>
                            <option value="L3">Level 3</option>
                            <option value="L4">Level 4 (Top)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Capacity (%)</label>
                        <input type="number" value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl text-sm font-bold outline-none" />
                    </div>
                </div>
              </div>

              <div className="p-8 border-t bg-slate-50/50">
                <button 
                  onClick={handleSaveShelf} 
                  disabled={isSaving} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16}/>} 
                  {isSaving ? "Finalizing Map..." : "Confirm & Save Unit"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShelfCard({ shelf }: { shelf: Shelf }) {
  return (
    <div className="group border border-slate-100 rounded-2xl p-5 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all shadow-sm bg-white relative">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white border transition-all">
          <Archive size={18} className="text-slate-400 group-hover:text-indigo-600" />
        </div>
        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${shelf.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {shelf.status}
        </span>
      </div>
      
      <h4 className="text-lg font-black text-slate-900 mb-1">{shelf.code}</h4>
      
      <div className="flex items-center gap-3 text-slate-400 mb-4">
        <div className="flex items-center gap-1">
            <Layers size={12} />
            <span className="text-[10px] font-bold uppercase">{shelf.level}</span>
        </div>
        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
        <span className="text-[10px] font-bold uppercase">Cap: {shelf.capacity}%</span>
      </div>

      <div className="mt-4 pt-4 border-t flex justify-between items-center text-[10px] font-bold text-indigo-600 uppercase">
        <span>{shelf.items_count} Materials Linked</span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button title="Edit" className="p-1 hover:text-indigo-600"><Edit3 size={14} /></button>
          <button title="Delete" className="p-1 hover:text-rose-500"><Trash2 size={14} /></button>
        </div>
      </div>
    </div>
  );
}