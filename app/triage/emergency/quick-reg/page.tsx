'use client'

import React, { useState, useEffect } from 'react'
import { 
  UserPlus2, Activity, Bed, X, Heart, Thermometer, 
  Droplets, CheckCircle2, Loader2, AlertCircle,
  UserCheck, ShieldAlert
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RapidAdmission() {
  const [loading, setLoading] = useState(false);
  const [fetchingBeds, setFetchingBeds] = useState(true);
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  // Dynamic Beds State
  const [availableBeds, setAvailableBeds] = useState<any[]>([]);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
  
  const [triageLevel, setTriageLevel] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [complaint, setComplaint] = useState('');
  const [vitals, setVitals] = useState({ bp: '', pulse: '', spo2: '', temp: '' });

  // --- NEW: Fetch Emergency Beds ---
  useEffect(() => {
    const fetchERBeds = async () => {
      try {
        setFetchingBeds(true);
        const res = await fetch('/api/admin/wards/beds');
        const data = await res.json();
        
        // Filter specifically for EMERGENCY_TRIAGE ward
        const erWard = data.find((w: any) => w.type === "EMERGENCY_TRIAGE");
        if (erWard) {
          // Flatten all beds from all rooms in this ward
          const allBeds = erWard.rooms.flatMap((room: any) => 
            room.beds.map((bed: any) => ({
              ...bed,
              displayLabel: `${room.roomNumber}-${bed.bedNumber.split('-').pop()}`
            }))
          );
          setAvailableBeds(allBeds);
        }
      } catch (err) {
        console.error("Failed to load ER beds", err);
      } finally {
        setFetchingBeds(false);
      }
    };
    fetchERBeds();
  }, []);

  const triagePriorities = [
    { id: 'RED', label: 'P1: Immediate', color: 'text-red-600', border: 'border-red-500', bg: 'bg-red-50' },
    { id: 'YELLOW', label: 'P2: Urgent', color: 'text-amber-600', border: 'border-amber-500', bg: 'bg-amber-50' },
    { id: 'GREEN', label: 'P3: Stable', color: 'text-emerald-600', border: 'border-emerald-500', bg: 'bg-emerald-50' }
  ];

  const handleAdmission = async () => {
    if (!selectedBed || !triageLevel) return;
    setLoading(true);
    try {
      const response = await fetch('/api/admission/rapid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: isAnonymous ? "Unknown Patient" : fullName,
          age, gender, isAnonymous,
          selectedBed, // Sending the bedNumber or ID
          triageLevel, complaint, vitals
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`SUCCESS: Patient assigned ID ${result.data.patient.mrn}`);
        window.location.reload(); 
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <ShieldAlert className="text-red-600" size={28} /> 
              RAPID ER REGISTRATION
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Woldia City Specialty Clinic</p>
          </div>
          <button 
            onClick={() => setIsVitalsOpen(true)}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 px-6 py-2 rounded-2xl shadow-sm hover:border-red-500 transition-all group"
          >
            <Activity size={18} className="text-red-500 group-hover:animate-pulse" />
            <span className="font-black text-xs text-slate-700">CAPTURE VITALS</span>
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PATIENT INFO CARD */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm tracking-tighter">
                  <UserPlus2 size={20} className="text-blue-600" /> Patient Identity
                </h3>
                <label className="flex items-center gap-2 cursor-pointer bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)} 
                  />
                  <span className="text-[10px] font-black text-red-600 uppercase">Unknown / Trauma</span>
                </label>
              </div>

              <div className="space-y-6">
                <input 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? "AUTO-GENERATING TEP_ID..." : "Enter Patient Full Name"}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none text-xl font-bold placeholder:text-slate-300"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sex</label>
                    <select 
                      value={gender} onChange={(e) => setGender(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 appearance-none shadow-inner"
                    >
                      <option value="">Select</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Est. Age</label>
                    <input 
                      type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="0"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-none outline-none font-bold text-slate-700 shadow-inner"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* TRIAGE CARD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50"
            >
                <h3 className="font-black text-slate-800 mb-6 uppercase text-sm tracking-tighter">Emergency Triage</h3>
                <div className="grid grid-cols-3 gap-4">
                  {triagePriorities.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTriageLevel(p.id)}
                      className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                        triageLevel === p.id 
                        ? `${p.border} ${p.bg} ring-4 ring-offset-2 ring-slate-100` 
                        : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {triageLevel === p.id && <CheckCircle2 size={18} className={`${p.color} absolute top-3 right-3`} />}
                      <div className={`w-4 h-4 rounded-full ${p.id === 'RED' ? 'bg-red-500' : p.id === 'YELLOW' ? 'bg-amber-500' : 'bg-emerald-500'} shadow-lg shadow-current/20`} />
                      <span className={`font-black text-xs tracking-tight ${p.color}`}>{p.label}</span>
                    </button>
                  ))}
                </div>
            </motion.div>
          </div>

          {/* ASIDE LOGISTICS - DYNAMIC BEDS */}
          <aside className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20"
            >
              <h3 className="flex items-center gap-2 font-black mb-6 text-slate-400 uppercase text-[10px] tracking-widest">
                <Bed size={16} /> ER Bed Assignment (Registry)
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-8">
                {fetchingBeds ? (
                   <div className="col-span-2 py-10 flex flex-col items-center opacity-50">
                      <Loader2 className="animate-spin mb-2" size={20} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Fetching Beds...</span>
                   </div>
                ) : availableBeds.length > 0 ? (
                  availableBeds.map(bed => (
                    <button
                      key={bed.id}
                      disabled={bed.isOccupied}
                      onClick={() => setSelectedBed(bed.bedNumber)}
                      className={`py-4 rounded-2xl font-black text-xs transition-all relative ${
                        selectedBed === bed.bedNumber 
                        ? 'bg-blue-600 text-white scale-95 shadow-lg shadow-blue-500/40' 
                        : bed.isOccupied 
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed opacity-50' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {bed.isOccupied && <X size={12} className="absolute top-1 right-1 text-red-500" />}
                      {bed.displayLabel}
                    </button>
                  ))
                ) : (
                  <p className="col-span-2 text-center py-4 text-xs font-bold text-slate-500">No ER Beds configured.</p>
                )}
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest ml-2">Chief Complaint</h3>
                <textarea 
                  value={complaint} onChange={(e) => setComplaint(e.target.value)}
                  className="w-full bg-slate-800 rounded-2xl p-4 border-none text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                  placeholder="Why is the patient here?"
                />
              </div>

              <button 
                onClick={handleAdmission}
                disabled={loading || !selectedBed || !triageLevel}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-20 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UserCheck size={20}/> ADMIT PATIENT</>}
              </button>
            </motion.div>
            
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-[1.5rem] flex gap-4">
              <AlertCircle className="text-blue-600 shrink-0" size={24} />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                <strong>REGISTRY LINKED:</strong> These beds are fetched from the <strong>Emergency & Triage</strong> ward registry.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* VITALS OVERLAY (Same as your original code) */}
      <AnimatePresence>
        {isVitalsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsVitalsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[90]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-[100] shadow-2xl p-10 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black tracking-tighter italic">QUICK VITALS</h2>
                <button onClick={() => setIsVitalsOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Blood Pressure', icon: <Activity className="text-blue-600" />, key: 'bp', placeholder: '120/80' },
                  { label: 'Pulse Rate', icon: <Heart className="text-red-600" />, key: 'pulse', placeholder: '72 BPM' },
                  { label: 'Oxygen Saturation', icon: <Droplets className="text-cyan-500" />, key: 'spo2', placeholder: '98%' },
                  { label: 'Body Temperature', icon: <Thermometer className="text-orange-500" />, key: 'temp', placeholder: '36.5 °C' },
                ].map((item) => (
                  <div key={item.key} className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      {item.icon} {item.label}
                    </div>
                    <input 
                      onChange={(e) => setVitals({...vitals, [item.key]: e.target.value})}
                      placeholder={item.placeholder}
                      className="w-full p-5 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-800 placeholder:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
                <button onClick={() => setIsVitalsOpen(false)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest mt-8 shadow-2xl">
                  Save Vitals
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}