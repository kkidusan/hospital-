"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, ShieldCheck, Search, ChevronRight, 
  Stethoscope, Bed, Scissors, Thermometer, FlaskConical, 
  Pill, Activity, Truck, X, Loader2, Tag
} from 'lucide-react';

export default function MedicalServiceRegistry() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredServices = useMemo(() => {
    return services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      category: formData.get('category'),
      billingMethod: formData.get('billingMethod'),
      basePrice: parseFloat(formData.get('basePrice') as string),
    };

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        setShowForm(false);
        loadData();
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Confirm deletion?")) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-white text-slate-900 font-sans">
      
      {/* MINIMAL HEADER (No Card Background) */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600">
            <ShieldCheck size={18} strokeWidth={2.5} />
            <span className="text-[11px] font-black uppercase tracking-widest">Master Registry</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-950">Medical Services</h1>
          <p className="text-slate-500 font-medium">Manage hospital billing categories and base pricing.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm w-full md:w-72 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-slate-950 hover:bg-slate-800 text-white p-3.5 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      {/* CLEAN BORDERLESS TABLE */}
      <div className="w-full">
        {loading ? (
          <div className="flex flex-col items-center py-20 text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-bold tracking-widest uppercase">Fetching Records...</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-left">Service Name</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-left">Category</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-left">Billing Model</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Price (ETB)</th>
                <th className="pb-5 px-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {s.name}
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getCategoryIcon(s.category)}
                        <span className="text-xs font-bold uppercase tracking-tight">{s.category}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded uppercase">
                        {s.billingMethod}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <span className="font-mono font-bold text-slate-800">
                        {Number(s.basePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-right">
                      <button 
                        onClick={() => handleDelete(s.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 text-sm font-medium italic">
                    No results match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MINIMAL MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-md p-10 border border-slate-200 rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-950 tracking-tight">Add Service</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-950 transition-colors">
                <X size={24}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Service Name</label>
                <input name="name" required placeholder="Service name..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                <select name="category" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold">
                  <option value="LABORATORY">Laboratory</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="INPATIENT">Inpatient</option>
                  <option value="PHARMACY">Pharmacy</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="AMBULANCE">Ambulance</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Billing</label>
                  <select name="billingMethod" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-bold">
                    <option value="FIXED">Fixed</option>
                    <option value="PER_DAY">Daily</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Price (ETB)</label>
                  <input name="basePrice" type="number" step="0.01" required placeholder="0.00" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-mono font-bold" />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-950 text-white py-4 rounded-xl font-bold transition-all hover:bg-blue-600 disabled:opacity-50">
                {isSubmitting ? "Processing..." : "Register Service"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(cat: string) {
  const props = { size: 14, strokeWidth: 2.5 };
  switch(cat) {
    case 'LABORATORY': return <FlaskConical {...props} className="text-blue-500"/>;
    case 'RADIOLOGY': return <Activity {...props} className="text-red-500"/>;
    case 'CONSULTATION': return <Stethoscope {...props} className="text-amber-500"/>;
    case 'INPATIENT': return <Bed {...props} className="text-emerald-500"/>;
    case 'PHARMACY': return <Pill {...props} className="text-purple-500"/>;
    case 'PROCEDURE': return <Scissors {...props} className="text-pink-500"/>;
    case 'AMBULANCE': return <Truck {...props} className="text-slate-500"/>;
    default: return <Tag {...props} className="text-slate-400"/>;
  }
}