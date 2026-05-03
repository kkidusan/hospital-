"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, X, MapPin, MoreVertical, Loader2, Trash2, 
  Layers, ShieldCheck, PackagePlus, 
  Eye, Hash, Tag, 
  Warehouse, Store, ChevronDown, Grid3X3, Ruler,
  ShieldAlert, Sliders, Box as BoxIcon, Calendar, Info,
  Package, Archive, AlertTriangle, CheckCircle2, TrendingUp,
  Settings
} from "lucide-react";

type UoM = "Carton" | "Box" | "Piece";
type StockTab = "All" | "Critical" | "Low" | "In Stock";
type SidebarMode = "ADD" | "VIEW" | "MANAGE" | "ADD_STOCK" | "SETTINGS";

export default function InventoryManagementSystem() {
  // --- STATE MANAGEMENT ---
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("ADD");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<StockTab>("All");
  const [activePackTab, setActivePackTab] = useState<UoM>("Piece");
  const [zones, setZones] = useState<any[]>([]);
  const [shelves, setShelves] = useState<any[]>([]);

  const categories = ["Consumables", "Laboratory", "Emergency Drugs", "Surgical"];

  const initialFormState = {
    id: "",
    name: "",
    sku: "",
    category: "Consumables",
    qtyPerCarton: 0,
    qtyPerBox: 0,
    inputCartons: 0,
    inputBoxes: 0,
    inputPieces: 0,
    initialQty: 0, 
    currentQty: 0, 
    zoneId: "",
    shelfId: "",
    expiry: "",
    minThreshold: 10,
    maxQuotaPerRequest: 0,
    requiresApproval: false,
    unitType: "Piece", 
  };

  const [formData, setFormData] = useState(initialFormState);
  const basePath = "/inventory/Manage-item";

  // --- AUTO CALCULATION LOGIC ---
  useEffect(() => {
    const boxInPieces = formData.qtyPerBox || 1;
    const cartonInPieces = (formData.qtyPerCarton || 1) * boxInPieces;

    const addedTotal = 
      (Number(formData.inputCartons) * cartonInPieces) + 
      (Number(formData.inputBoxes) * boxInPieces) + 
      Number(formData.inputPieces);

    const finalTotal = sidebarMode === "ADD_STOCK" 
      ? formData.currentQty + addedTotal 
      : addedTotal;

    setFormData(prev => ({ ...prev, initialQty: finalTotal, unitType: activePackTab }));
  }, [formData.inputCartons, formData.inputBoxes, formData.inputPieces, formData.qtyPerCarton, formData.qtyPerBox, activePackTab, sidebarMode, formData.currentQty]);

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory");
      const data = await res.json();
      setMaterials(Array.isArray(data) ? data : []);
      
      const zoneRes = await fetch("/api/inventory/zones");
      const zoneData = await zoneRes.json();
      setZones(zoneData);
    } catch (e) { 
      setMaterials([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    const fetchShelves = async () => {
      if (!formData.zoneId) { setShelves([]); return; }
      try {
        const res = await fetch(`/api/inventory/shelves?zoneId=${formData.zoneId}`);
        const data = await res.json();
        setShelves(data);
      } catch (error) { console.error(error); }
    };
    fetchShelves();
  }, [formData.zoneId]);

  useEffect(() => { fetchData(); }, []);

  // --- SUBMISSION & DELETE ---
  const handleSubmit = async () => {
    try {
      const isUpdate = sidebarMode === "MANAGE" || sidebarMode === "ADD_STOCK" || sidebarMode === "SETTINGS";
      const method = isUpdate ? "PUT" : "POST";
      
      const response = await fetch("/api/inventory", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, sidebarMode }),
      });

      if (response.ok) {
        setIsSidebarOpen(false);
        setFormData(initialFormState);
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save record"}`);
      }
    } catch (error) {
      alert("Network error: Could not reach the server.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this entry?")) return;
    try {
      const res = await fetch("/api/inventory", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchData();
    } catch (e) { console.error(e); }
  };

  const populateForm = (item: any) => {
    setFormData({
      ...initialFormState,
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      currentQty: item.totalInBaseUnits || 0,
      initialQty: item.totalInBaseUnits || 0,
      zoneId: item.zoneId || "",
      shelfId: item.shelfId || "",
      expiry: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : "",
      minThreshold: item.minThreshold ?? 10,
      requiresApproval: item.requiresApproval || false,
      unitType: item.baseUnit || "Piece",
      qtyPerCarton: item.qtyPerCarton || 0,
      qtyPerBox: item.qtyPerBox || 0,
    });
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchesSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      
      const qty = item.totalInBaseUnits;
      const threshold = item.minThreshold || 10;
      let matchesTab = true;
      
      if (activeTab === "Critical") matchesTab = qty <= threshold;
      else if (activeTab === "Low") matchesTab = qty > threshold && qty <= threshold * 3;
      else if (activeTab === "In Stock") matchesTab = qty > threshold * 3;
      
      return matchesSearch && matchesTab;
    });
  }, [materials, searchQuery, activeTab]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-[60]">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Vault Inventory</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Enterprise Management Protocol</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
            className="flex items-center gap-3 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Store size={18} /> Custom Store <ChevronDown size={14} className={`transition-transform duration-300 ${isStoreMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isStoreMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsStoreMenuOpen(false)} />
              <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-5 py-2 mb-2 border-b border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Configuration Hub</p>
                </div>
                <Link href={`${basePath}/Zone-Management`} className="w-full px-5 py-3 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Warehouse size={16} className="text-indigo-500" /> Zone Management
                </Link>
                <Link href={`${basePath}/Shelf-Mapping`} className="w-full px-5 py-3 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Grid3X3 size={16} className="text-emerald-500" /> Shelf Mapping
                </Link>
                <Link href={`${basePath}/Store-Locations`} className="w-full px-5 py-3 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <MapPin size={16} className="text-rose-500" /> Store Locations
                </Link>
                <Link href={`${basePath}/Unit-Definitions`} className="w-full px-5 py-3 text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                    <Ruler size={16} className="text-amber-500" /> Unit Definitions (UoM)
                </Link>
              </div>
            </>
          )}
        </div>
      </header>

      {/* --- TOOLBAR --- */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-[82px] z-50">
        <div className="flex items-center gap-8">
          {(["All", "Critical", "Low", "In Stock"] as StockTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative py-1 text-[11px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
              {tab}
              {activeTab === tab && <span className="absolute -bottom-4 left-0 w-full h-[2px] bg-indigo-600" />}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xl mx-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Filter by SKU or Material Name..." className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border border-transparent rounded-xl text-sm font-medium transition-all outline-none focus:bg-white focus:border-slate-200 focus:shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <button onClick={() => { setSidebarMode("ADD"); setFormData(initialFormState); setIsSidebarOpen(true); }} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:translate-y-0.5">
          <Plus size={18} /> New Entry
        </button>
      </div>

      {/* --- TABLE --- */}
      <main className="p-8 grow">
        {loading ? (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
             <Loader2 className="animate-spin" />
             <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing Vault...</span>
           </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-visible">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6">Material Detail</th>
                  <th className="px-8 py-6">Current Stock</th>
                  <th className="px-8 py-6">Location Mapping</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((item) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-5">
                      <div className="font-bold text-sm text-slate-800 uppercase flex items-center gap-2">
                        {item.name}
                        {item.requiresApproval && <ShieldAlert size={14} className="text-amber-500" />}
                      </div>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase border border-slate-200 mt-1 inline-block tracking-tighter">{item.sku}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-black text-sm text-slate-800">{item.totalInBaseUnits} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Pieces</span></div>
                      <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${item.totalInBaseUnits <= (item.minThreshold || 10) ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${Math.min((item.totalInBaseUnits / ((item.minThreshold || 10) * 5)) * 100, 100)}%`}}></div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-[11px] font-bold text-slate-600 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg w-fit border border-slate-200 shadow-sm">
                          <MapPin size={12} className="text-rose-500" /> {item.zone?.name || "Unassigned"} • {item.shelf?.code || "No Shelf"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right relative">
                      <button onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} className={`p-2 rounded-xl transition-all ${openMenuId === item.id ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-400'}`}>
                        <MoreVertical size={20} />
                      </button>
                      {openMenuId === item.id && (
                        <>
                          <div className="fixed inset-0 z-[10]" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-8 top-14 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-20 py-4 text-left animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
                            <button onClick={() => { populateForm(item); setSidebarMode("ADD_STOCK"); setIsSidebarOpen(true); setOpenMenuId(null); }} className="w-full px-5 py-3 text-[11px] font-black text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors"><PackagePlus size={16}/> INBOUND STOCK</button>
                            <button onClick={() => { populateForm(item); setSidebarMode("VIEW"); setIsSidebarOpen(true); setOpenMenuId(null); }} className="w-full px-5 py-3 text-[11px] font-black text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"><Eye size={16}/> VIEW SPECIFICATIONS</button>
                            <button onClick={() => { populateForm(item); setSidebarMode("MANAGE"); setIsSidebarOpen(true); setOpenMenuId(null); }} className="w-full px-5 py-3 text-[11px] font-black text-indigo-600 hover:bg-indigo-50 flex items-center gap-3 transition-colors"><Sliders size={16}/> UPDATE DATA</button>
                            
                            {/* --- NEW SETTINGS OPTION --- */}
                            <button onClick={() => { populateForm(item); setSidebarMode("SETTINGS"); setIsSidebarOpen(true); setOpenMenuId(null); }} className="w-full px-5 py-3 text-[11px] font-black text-slate-500 hover:bg-slate-100 flex items-center gap-3 transition-colors">
                              <Settings size={16}/> MATERIAL SETTINGS
                            </button>

                            <div className="h-px bg-slate-100 my-2" />
                            <button onClick={() => { handleDelete(item.id); setOpenMenuId(null); }} className="w-full px-5 py-3 text-[11px] font-black text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"><Trash2 size={16}/> REMOVE ENTRY</button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* --- SIDEBAR --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
          
          <div className={`relative h-full bg-white shadow-2xl flex flex-col transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${sidebarMode === "VIEW" ? "w-full max-w-md" : "w-full max-w-xl"}`}>
            
            {/* Sidebar Header */}
            <div className={`text-white flex justify-between items-center transition-all px-8 py-8 ${
              sidebarMode === "VIEW" ? 'bg-slate-800' : 
              sidebarMode === "ADD_STOCK" ? 'bg-emerald-600' :
              sidebarMode === "SETTINGS" ? 'bg-slate-600' :
              sidebarMode === "MANAGE" ? 'bg-indigo-600' : 'bg-slate-900'
            }`}>
              <div>
                <h2 className="font-black uppercase tracking-tight text-xl">
                  {sidebarMode === "ADD" && "New Material"}
                  {sidebarMode === "VIEW" && "Specifications"}
                  {sidebarMode === "ADD_STOCK" && "Inbound Stock Adjustment"}
                  {sidebarMode === "MANAGE" && "Update Material Data"}
                  {sidebarMode === "SETTINGS" && "Material Policies"}
                </h2>
                <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-1">SKU Ref: {sidebarMode === "ADD" ? "PENDING AUTO-SEQ" : formData.sku}</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-white/10 rounded-full hover:rotate-90 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="overflow-y-auto grow p-8">
              {sidebarMode === "VIEW" ? (
                <div className="space-y-10">
                   <section>
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Info size={12}/> Core Identity</p>
                    <div className="space-y-4">
                      {[
                        { label: "Designation", value: formData.name },
                        { label: "SKU / Code", value: formData.sku, mono: true },
                        { label: "Category", value: formData.category },
                        { label: "Base Unit", value: formData.unitType },
                      ].map((row, i) => (
                        <div key={i} className="flex justify-between items-end border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{row.label}</span>
                          <span className={`text-xs font-black text-slate-800 uppercase ${row.mono ? "font-mono text-indigo-600" : ""}`}>{row.value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <form className="space-y-8">
                  {/* Summary Card for Add Stock Mode */}
                  {sidebarMode === "ADD_STOCK" && (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Current Ledger Balance</p>
                            <p className="text-3xl font-black text-slate-900">{formData.currentQty} <span className="text-xs text-slate-400 ml-1">PCS</span></p>
                        </div>
                        <TrendingUp size={32} className="text-emerald-500 opacity-40" />
                    </div>
                  )}

                  {/* Settings / Policies Mode UI */}
                  {sidebarMode === "SETTINGS" && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                            <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block">Compliance & Approvals</label>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><ShieldAlert size={18}/></div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800">Requires Approval</p>
                                        <p className="text-[9px] text-slate-500">Inventory release requires supervisor sign-off</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setFormData({...formData, requiresApproval: !formData.requiresApproval})} className={`w-12 h-6 rounded-full transition-all relative ${formData.requiresApproval ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.requiresApproval ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Min Threshold</label>
                                <input type="number" className="w-full bg-transparent text-xl font-black outline-none" value={formData.minThreshold} onChange={(e) => setFormData({...formData, minThreshold: parseInt(e.target.value) || 0})} />
                                <p className="text-[9px] text-slate-400 mt-1 uppercase">Trigger Alert</p>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Max Request</label>
                                <input type="number" className="w-full bg-transparent text-xl font-black outline-none" value={formData.maxQuotaPerRequest} onChange={(e) => setFormData({...formData, maxQuotaPerRequest: parseInt(e.target.value) || 0})} />
                                <p className="text-[9px] text-slate-400 mt-1 uppercase">Per Transaction</p>
                            </div>
                        </div>
                    </div>
                  )}

                  {sidebarMode !== "SETTINGS" && (
                    <div className="grid gap-6">
                        <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Tag size={12}/> Material Name</label>
                        <input 
                            disabled={sidebarMode === "ADD_STOCK"}
                            className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none transition-all ${sidebarMode === "ADD_STOCK" ? "opacity-60 cursor-not-allowed" : "focus:bg-white focus:border-indigo-500"}`} 
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        />
                        </div>
                    </div>
                  )}

                  {/* Packaging Config (Visible in ADD, MANAGE, STOCK) */}
                  {(sidebarMode === "ADD" || sidebarMode === "MANAGE" || sidebarMode === "ADD_STOCK") && (
                    <div className="p-1 bg-slate-100 border border-slate-200 rounded-3xl overflow-hidden">
                        <div className="flex p-1">
                            {(["Carton", "Box", "Piece"] as UoM[]).map((tab) => (
                                <button key={tab} type="button" onClick={() => setActivePackTab(tab)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all ${activePackTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
                                    {tab === "Carton" && <Archive size={14}/>}
                                    {tab === "Box" && <BoxIcon size={14}/>}
                                    {tab === "Piece" && <Package size={14}/>}
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="p-6 bg-white rounded-b-2xl border-t border-slate-100 space-y-6">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{sidebarMode === "ADD_STOCK" ? "Define Added Quantity" : "Initial Packaging Structure"}</p>
                            
                            {activePackTab === "Carton" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Pieces per Ctn</label>
                                        <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black" value={formData.qtyPerCarton} onChange={(e)=>setFormData({...formData, qtyPerCarton: parseInt(e.target.value) || 0})}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Cartons Added</label>
                                        <input type="number" className="w-full px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-black text-indigo-600" value={formData.inputCartons} onChange={(e)=>setFormData({...formData, inputCartons: parseInt(e.target.value) || 0})}/>
                                    </div>
                                </div>
                            )}
                            {activePackTab === "Box" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Pieces per Box</label>
                                        <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black" value={formData.qtyPerBox} onChange={(e)=>setFormData({...formData, qtyPerBox: parseInt(e.target.value) || 0})}/>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase">Boxes Added</label>
                                        <input type="number" className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-black text-emerald-600" value={formData.inputBoxes} onChange={(e)=>setFormData({...formData, inputBoxes: parseInt(e.target.value) || 0})}/>
                                    </div>
                                </div>
                            )}
                            {activePackTab === "Piece" && (
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-slate-400 uppercase">Loose Pieces Added</label>
                                    <input type="number" className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black text-amber-700" value={formData.inputPieces} onChange={(e)=>setFormData({...formData, inputPieces: parseInt(e.target.value) || 0})}/>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-dashed border-slate-200 flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Adjustment Amount:</span>
                                    <span className="text-sm font-black text-emerald-600">+{formData.initialQty - formData.currentQty} <small className="text-[9px] ml-1">PCS</small></span>
                                </div>
                                <div className="flex justify-between items-center bg-slate-900 p-3 rounded-2xl">
                                    <span className="text-[10px] font-black text-white/50 uppercase">New Ledger Total:</span>
                                    <span className="text-sm font-black text-white">{formData.initialQty} <small className="text-[9px] text-white/50 ml-1">PIECES</small></span>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {/* Location & Policies (Visible only in Manage/Add Mode) */}
                  {(sidebarMode === "ADD" || sidebarMode === "MANAGE") && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Warehouse size={12}/> Zone</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" value={formData.zoneId} onChange={(e) => setFormData({...formData, zoneId: e.target.value})}>
                            <option value="">Select Zone</option>
                            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Grid3X3 size={12}/> Shelf</label>
                        <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold" value={formData.shelfId} onChange={(e) => setFormData({...formData, shelfId: e.target.value})} disabled={!formData.zoneId}>
                            <option value="">Select Shelf</option>
                            {shelves.map(s => <option key={s.id} value={s.id}>{s.code}</option>)}
                        </select>
                        </div>
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={handleSubmit} 
                    className={`w-full py-5 mt-12 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
                        sidebarMode === "ADD_STOCK" ? 'bg-emerald-600 hover:bg-emerald-700' : 
                        sidebarMode === "SETTINGS" ? 'bg-slate-700 hover:bg-slate-800' :
                        'bg-slate-900 hover:bg-indigo-600'
                    }`}
                  >
                    <ShieldCheck size={18} /> 
                    {sidebarMode === "ADD_STOCK" ? "Authorize Adjustment" : 
                     sidebarMode === "SETTINGS" ? "Update Policy Settings" :
                     "Commit to Ledger"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}