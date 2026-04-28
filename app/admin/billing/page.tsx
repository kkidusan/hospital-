"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, ShieldCheck, Search, RefreshCw, X, Loader2, Edit3,
  Stethoscope, Bed, Scissors, FlaskConical, 
  Activity, Truck, Tag 
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const DEFAULT_SERVICES = [
  { name: "CBC", category: "LABORATORY", billingMethod: "FIXED", basePrice: 250 },
  { name: "ESR", category: "LABORATORY", billingMethod: "FIXED", basePrice: 180 },
  { name: "Blood group & RH", category: "LABORATORY", billingMethod: "FIXED", basePrice: 220 },
  { name: "Peripheral morphology", category: "LABORATORY", billingMethod: "FIXED", basePrice: 300 },
  { name: "Blood film", category: "LABORATORY", billingMethod: "FIXED", basePrice: 200 },
  { name: "HCG (PT)", category: "LABORATORY", billingMethod: "FIXED", basePrice: 150 },
  { name: "WIDAL / O&H", category: "LABORATORY", billingMethod: "FIXED", basePrice: 180 },
  { name: "HBsAg", category: "LABORATORY", billingMethod: "FIXED", basePrice: 220 },
  { name: "HCV Ab", category: "LABORATORY", billingMethod: "FIXED", basePrice: 250 },
  { name: "RF", category: "LABORATORY", billingMethod: "FIXED", basePrice: 240 },
  { name: "ANA", category: "LABORATORY", billingMethod: "FIXED", basePrice: 450 },
  { name: "RBS", category: "LABORATORY", billingMethod: "FIXED", basePrice: 120 },
  { name: "FBS", category: "LABORATORY", billingMethod: "FIXED", basePrice: 130 },
  { name: "ALT/SGOT", category: "LABORATORY", billingMethod: "FIXED", basePrice: 160 },
  { name: "ALP", category: "LABORATORY", billingMethod: "FIXED", basePrice: 170 },
  { name: "Creatinine", category: "LABORATORY", billingMethod: "FIXED", basePrice: 170 },
  { name: "BUN/Urea", category: "LABORATORY", billingMethod: "FIXED", basePrice: 160 },
  { name: "Cholesterol", category: "LABORATORY", billingMethod: "FIXED", basePrice: 180 },
  { name: "Triglyceride", category: "LABORATORY", billingMethod: "FIXED", basePrice: 180 },
  { name: "HDL", category: "LABORATORY", billingMethod: "FIXED", basePrice: 190 },
  { name: "LDL", category: "LABORATORY", billingMethod: "FIXED", basePrice: 190 },
  { name: "Urinalysis (Physical + Chemical + Micro)", category: "LABORATORY", billingMethod: "FIXED", basePrice: 140 },
  { name: "Urine Pregnancy Test", category: "LABORATORY", billingMethod: "FIXED", basePrice: 150 },
  { name: "Stool Examination", category: "LABORATORY", billingMethod: "FIXED", basePrice: 130 },
  { name: "AFB", category: "LABORATORY", billingMethod: "FIXED", basePrice: 220 },
  { name: "KOH Preparation", category: "LABORATORY", billingMethod: "FIXED", basePrice: 180 },
  { name: "Gram Stain", category: "LABORATORY", billingMethod: "FIXED", basePrice: 160 },
  { name: "TSH", category: "LABORATORY", billingMethod: "FIXED", basePrice: 350 },
  { name: "Free T3", category: "LABORATORY", billingMethod: "FIXED", basePrice: 420 },
  { name: "Free T4", category: "LABORATORY", billingMethod: "FIXED", basePrice: 420 },
  { name: "Total T3", category: "LABORATORY", billingMethod: "FIXED", basePrice: 380 },
  { name: "Total T4", category: "LABORATORY", billingMethod: "FIXED", basePrice: 380 },
  { name: "Abdominal Ultrasound", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 450 },
  { name: "Pelvic Ultrasound", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 450 },
  { name: "Abdominopelvic Ultrasound", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 550 },
  { name: "Chest X-ray", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 300 },
  { name: "Abdominal X-ray", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 320 },
  { name: "Knee X-ray", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 280 },
  { name: "Thyroid Ultrasound", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 500 },
  { name: "Breast Ultrasound", category: "RADIOLOGY", billingMethod: "FIXED", basePrice: 550 },
  { name: "General Consultation", category: "CONSULTATION", billingMethod: "FIXED", basePrice: 300 },
  { name: "Specialist Consultation", category: "CONSULTATION", billingMethod: "FIXED", basePrice: 500 },
  { name: "Inpatient Daily Bed Charge", category: "INPATIENT", billingMethod: "PER_DAY", basePrice: 800 },
  { name: "Minor Procedure", category: "PROCEDURE", billingMethod: "FIXED", basePrice: 1200 },
  { name: "Ambulance Service (within city)", category: "AMBULANCE", billingMethod: "FIXED", basePrice: 600 }
];

export default function MedicalServiceRegistry() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);

  const [categoryType, setCategoryType] = useState<'predefined' | 'custom'>('predefined');
  const [customCategory, setCustomCategory] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultServices = async () => {
    setIsInitializing(true);
    try {
      const res = await fetch('/api/services/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services: DEFAULT_SERVICES }),
      });

      if (res.ok) {
        toast.success("Default medical services initialized successfully!");
        await loadData();
      } else {
        const error = await res.text();
        toast.error(`Failed: ${error}`);
      }
    } catch (err) {
      toast.error("Network error during initialization");
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(s => 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const openAddOrEdit = (service?: any) => {
    if (service) {
      setEditingService(service);
      const isCustom = !['LABORATORY','RADIOLOGY','CONSULTATION','INPATIENT','PROCEDURE','AMBULANCE','PHARMACY'].includes(service.category);
      setCategoryType(isCustom ? 'custom' : 'predefined');
      setCustomCategory(isCustom ? service.category : '');
    } else {
      setEditingService(null);
      setCategoryType('predefined');
      setCustomCategory('');
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      category: formData.get('category'),
      customCategory: categoryType === 'custom' ? customCategory : undefined,
      billingMethod: formData.get('billingMethod'),
      basePrice: formData.get('basePrice'),
    };

    try {
      const url = editingService 
        ? `/api/services/${editingService.id}` 
        : '/api/services';
      
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowForm(false);
        setEditingService(null);
        setCustomCategory('');
        await loadData();
        
        toast.success(editingService 
          ? "Service updated successfully!" 
          : "Service added successfully!"
        );
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Operation failed");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (service: any) => {
    setServiceToDelete(service);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!serviceToDelete) return;
    try {
      const res = await fetch(`/api/services/${serviceToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadData();
        toast.success("Service deleted successfully!");
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setShowDeleteDialog(false);
      setServiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setServiceToDelete(null);
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingService(null);
    setCustomCategory('');
  };

  const getCategoryIcon = (cat: string) => {
    const props = { size: 15, strokeWidth: 2.8 };
    switch (cat?.toUpperCase()) {
      case 'LABORATORY': return <FlaskConical {...props} className="text-blue-600" />;
      case 'RADIOLOGY': return <Activity {...props} className="text-red-500" />;
      case 'CONSULTATION': return <Stethoscope {...props} className="text-amber-600" />;
      case 'INPATIENT': return <Bed {...props} className="text-emerald-600" />;
      case 'PROCEDURE': return <Scissors {...props} className="text-rose-500" />;
      case 'AMBULANCE': return <Truck {...props} className="text-slate-600" />;
      default: return <Tag {...props} className="text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-6 md:p-8">
      <Toaster position="top-center" richColors />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShieldCheck size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[2px]">Master Registry</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Medical Services</h1>
          <p className="text-sm text-slate-500 mt-1">Manage billing categories and base pricing</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search services..." 
              className="bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            onClick={initializeDefaultServices}
            disabled={isInitializing}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-[0.98]"
          >
            <RefreshCw size={16} className={isInitializing ? "animate-spin" : ""} />
            Initialize Defaults
          </button>

          <button 
            onClick={() => openAddOrEdit()}
            className="bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-2xl transition-all active:scale-[0.98]"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="animate-spin mb-4" size={28} />
          <p className="text-xs font-bold tracking-widest uppercase">Loading services...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-100 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#f8fafc]">
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Service Name</th>
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Billing</th>
                <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Base Price (ETB)</th>
                <th className="py-4 px-6 w-20 bg-[#f8fafc]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredServices.length > 0 ? (
                filteredServices.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900 text-[14.5px]">{s.name}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(s.category)}
                        <span className="text-xs font-semibold uppercase tracking-tight text-slate-600">
                          {s.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block text-[10px] font-black px-3.5 py-1 bg-white border border-slate-200 text-slate-500 rounded-full">
                        {s.billingMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-semibold text-slate-800 text-[14.5px]">
                      {Number(s.basePrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openAddOrEdit(s)} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(s)} 
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 text-sm">
                    No services found. Use "Initialize Defaults" to populate the registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="flex justify-between items-center mb-7">
              <h3 className="text-xl font-bold text-slate-900">
                {editingService ? "Edit Service" : "Add New Service"}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Service Name</label>
                <input 
                  name="name" 
                  required 
                  defaultValue={editingService?.name || ''} 
                  placeholder="e.g. Chest X-ray" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Category</label>
                
                <select 
                  name="category" 
                  required 
                  defaultValue={editingService?.category || 'LABORATORY'}
                  onChange={(e) => {
                    if (e.target.value === 'OTHER') {
                      setCategoryType('custom');
                    } else {
                      setCategoryType('predefined');
                      setCustomCategory('');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none"
                >
                  <option value="LABORATORY">Laboratory</option>
                  <option value="RADIOLOGY">Radiology</option>
                  <option value="CONSULTATION">Consultation</option>
                  <option value="INPATIENT">Inpatient</option>
                  <option value="PROCEDURE">Procedure</option>
                  <option value="AMBULANCE">Ambulance</option>
                  <option value="PHARMACY">Pharmacy</option>
                  <option value="OTHER">Other (Custom)</option>
                </select>

                {categoryType === 'custom' && (
                  <input 
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category name"
                    className="mt-3 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-blue-500"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Billing Method</label>
                  <select 
                    name="billingMethod" 
                    required 
                    defaultValue={editingService?.billingMethod || 'FIXED'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="FIXED">Fixed</option>
                    <option value="PER_DAY">Per Day</option>
                    <option value="HOURLY">Hourly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Base Price (ETB)</label>
                  <input 
                    name="basePrice" 
                    type="number" 
                    step="0.01" 
                    required 
                    defaultValue={editingService?.basePrice || ''}
                    placeholder="0.00" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono outline-none" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white py-3.5 rounded-2xl font-semibold text-sm transition-all"
              >
                {isSubmitting 
                  ? (editingService ? "Updating Service..." : "Adding Service...") 
                  : (editingService ? "Update Service" : "Add Service")
                }
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteDialog && serviceToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-6">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Trash2 size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Service?</h3>
              <p className="text-slate-600 mb-8">
                Are you sure you want to permanently delete<br />
                <span className="font-semibold text-slate-800">"{serviceToDelete.name}"</span>?
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={cancelDelete}
                  className="flex-1 py-4 border border-slate-300 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteConfirmed}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-2xl transition-all active:scale-[0.98]"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}