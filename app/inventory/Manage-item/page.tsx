"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Plus, Search, X, MapPin, MoreVertical, Loader2, Trash2, Edit3, 
  Filter as FilterIcon, Inbox, Layers, Check, AlertTriangle, ShieldCheck
} from "lucide-react";

type UoM = "Carton" | "Box" | "Packet" | "Piece" | "Vial" | "Bottle";
type StockTab = "All" | "Critical" | "Low" | "In Stock";

export default function InventoryManagementSystem() {
  // --- STATE MANAGEMENT ---
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StockTab>("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);

  const categories = ["Consumables", "Laboratory", "Emergency Drugs", "Surgical"];
  const zones = useMemo(() => 
    Array.from(new Set(materials.map(m => m.zone))).filter(Boolean) as string[], 
    [materials]
  );

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "Consumables",
    selectedUnit: "Piece" as UoM,
    conversionRate: 1,
    initialQty: 0,
    zone: "",
    expiry: ""
  });

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (e) { 
      setMaterials([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    const closeMenu = () => setOpenMenuId(null);
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  // --- LOGIC ---
  const entryTotalBase = useMemo(() => {
    return formData.initialQty * formData.conversionRate;
  }, [formData.initialQty, formData.conversionRate]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchesSearch = !searchQuery || 
                           item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const qty = item.totalInBaseUnits;
      let matchesTab = true;
      if (activeTab === "Critical") matchesTab = qty <= 10;
      else if (activeTab === "Low") matchesTab = qty > 10 && qty <= 50;
      else if (activeTab === "In Stock") matchesTab = qty > 50;

      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
      const matchesZone = selectedZones.length === 0 || selectedZones.includes(item.zone);

      return matchesSearch && matchesTab && matchesCategory && matchesZone;
    });
  }, [materials, searchQuery, activeTab, selectedCategories, selectedZones]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalInBaseUnits: entryTotalBase, baseUnit: "Piece" }),
      });
      if (res.ok) {
        await fetchData();
        setIsSidebarOpen(false);
        setFormData({ name: "", sku: "", category: "Consumables", selectedUnit: "Piece", conversionRate: 1, initialQty: 0, zone: "", expiry: "" });
      }
    } finally { 
      setSubmitting(false); 
    }
  };

  const triggerAction = async (method: string, payload: any) => {
    try {
      const res = await fetch("/api/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) fetchData();
    } catch (e) { 
      console.error(e); 
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-[60]">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">BIRUH TECH | <span className="text-indigo-600">HMS LOGISTICS</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Stock Protocol</p>
        </div>
        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg">BT</div>
      </header>

      {/* --- NAVIGATION & SEARCH --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-[81px] z-50">
        <div className="flex items-center gap-8">
          {(["All", "Critical", "Low", "In Stock"] as StockTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-1 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${
                activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-indigo-600" />}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xl mx-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Quick search SKU or Material..."
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100/50 border border-transparent focus:border-indigo-100 focus:bg-white rounded-xl text-sm font-medium transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`p-3 border rounded-xl transition-all flex items-center gap-2 ${
                (selectedCategories.length > 0 || selectedZones.length > 0) 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <FilterIcon size={18} />
            <span className="text-[10px] font-black uppercase">Filters</span>
            {(selectedCategories.length > 0 || selectedZones.length > 0) && (
                <span className="bg-white text-indigo-600 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">
                    {selectedCategories.length + selectedZones.length}
                </span>
            )}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
          >
            <Plus size={18} /> New Entry
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="p-8 grow relative">
        {loading && <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}
        
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-5">Material Detail</th>
                <th className="px-6 py-5">Inventory Status</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-slate-800 uppercase tracking-tight">{item.name}</div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase mt-0.5">{item.sku} • {item.category}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-sm text-slate-800">{item.totalInBaseUnits} Units</div>
                    <div className={`text-[9px] font-bold uppercase mt-1 flex items-center gap-1 ${item.totalInBaseUnits <= 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {item.totalInBaseUnits <= 10 ? <AlertTriangle size={10}/> : <Layers size={10}/>}
                      {item.totalInBaseUnits <= 10 ? 'Attention Required' : 'Stock Valid'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg w-fit border border-slate-200">
                        <MapPin size={12} className="text-rose-500" /> {item.zone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={(e) => {e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id)}} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-slate-400 group-hover:text-slate-900" />
                    </button>
                    {openMenuId === item.id && (
                        <div className="absolute right-8 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] py-2 animate-in fade-in zoom-in-95">
                          <button className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-indigo-50 flex items-center gap-3 transition-colors"><Edit3 size={14}/> Edit Record</button>
                          <button onClick={() => triggerAction("DELETE", { id: item.id })} className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"><Trash2 size={14}/> Delete Entry</button>
                        </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMaterials.length === 0 && (
            <div className="p-24 text-center flex flex-col items-center">
                <Inbox size={48} className="text-slate-200 mb-4" />
                <p className="text-slate-400 font-black text-[10px] tracking-[0.2em] uppercase">No Material Synchronized</p>
                <button onClick={() => {setSelectedCategories([]); setSelectedZones([]); setActiveTab("All");}} className="mt-4 text-indigo-600 text-[10px] font-black uppercase border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">Clear Active Filters</button>
            </div>
          )}
        </div>
      </main>

      {/* --- SMART FILTER SIDEBAR --- */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <FilterIcon size={16} className="text-indigo-600"/>
                    <h2 className="text-sm font-black uppercase tracking-widest">Filter Choice</h2>
                </div>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-8 space-y-10 grow overflow-y-auto">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</h3>
                        {selectedCategories.length > 0 && <button onClick={() => setSelectedCategories([])} className="text-[9px] font-black text-rose-500 uppercase">Clear</button>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                    selectedCategories.includes(cat) 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Nodes</h3>
                        {selectedZones.length > 0 && <button onClick={() => setSelectedZones([])} className="text-[9px] font-black text-rose-500 uppercase">Clear</button>}
                    </div>
                    <div className="space-y-2">
                        {zones.length > 0 ? zones.map(zone => (
                            <button 
                                key={zone}
                                onClick={() => setSelectedZones(prev => prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone])}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                    selectedZones.includes(zone) ? "bg-indigo-50 border-indigo-200" : "bg-slate-50 border-transparent hover:bg-slate-100"
                                }`}
                            >
                                <span className="text-xs font-bold text-slate-700">{zone}</span>
                                {selectedZones.includes(zone) ? <Check size={16} className="text-indigo-600"/> : <div className="w-5 h-5 rounded-full border-2 border-slate-200"/>}
                            </button>
                        )) : <p className="text-[10px] font-bold text-slate-300 italic">No zones detected yet</p>}
                    </div>
                </div>
            </div>

            <div className="p-8 bg-slate-50">
                <button onClick={() => setIsFilterOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">
                    Show {filteredMaterials.length} Results
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ENTRY SIDEBAR (Material Registration) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-full max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="px-8 py-8 bg-indigo-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase">Material Entry</h2>
                <p className="text-[10px] font-bold opacity-70 tracking-widest">COMMIT NEW DATA</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="hover:rotate-90 transition-transform">
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto grow">
              
              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Name</label>
                  <input 
                    required 
                    placeholder="e.g. Disposable Syringe 5ml" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / ID</label>
                    <input 
                      placeholder="PROD-001" 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase" 
                      value={formData.sku} 
                      onChange={(e) => setFormData({...formData, sku: e.target.value})} 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                      value={formData.category} 
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Inventory Logistics Section */}
              <div className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={14} className="text-indigo-600" />
                  <h3 className="text-[11px] font-black text-indigo-900 uppercase tracking-wider">Unit Configuration</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Incoming Unit</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold" 
                      value={formData.selectedUnit} 
                      onChange={(e) => setFormData({...formData, selectedUnit: e.target.value as UoM})}
                    >
                      <option value="Carton">Carton</option>
                      <option value="Box">Box</option>
                      <option value="Piece">Piece</option>
                      <option value="Vial">Vial</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Conversion (Qty per Unit)</label>
                    <input 
                      type="number"
                      placeholder="1"
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      value={formData.conversionRate}
                      onChange={(e) => setFormData({...formData, conversionRate: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[9px] font-bold text-indigo-400 uppercase">Total Units Received</label>
                    <input 
                      required 
                      type="number" 
                      placeholder="0" 
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-lg text-indigo-600 shadow-sm" 
                      onChange={(e) => setFormData({...formData, initialQty: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                  <div className="bg-indigo-600 text-white px-5 py-3.5 rounded-xl font-black text-xs min-w-[120px] text-center shadow-lg shadow-indigo-200">
                    <div className="text-[8px] opacity-60 uppercase">Base Units</div>
                    {entryTotalBase} PCS
                  </div>
                </div>
              </div>

              {/* Location & Expiry Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Storage Zone</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      placeholder="e.g. WING-A" 
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase" 
                      onChange={(e) => setFormData({...formData, zone: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Date</label>
                  <input 
                    required 
                    type="date" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" 
                    onChange={(e) => setFormData({...formData, expiry: e.target.value})} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full py-5 mt-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
                {submitting ? "Synchronizing..." : "Commit Entry to Vault"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}