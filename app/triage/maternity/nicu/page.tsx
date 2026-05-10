'use client'

import React, { useState, useEffect } from 'react'
import { 
  Baby, Activity, Bed as BedIcon, X, Heart, Timer, Waves, 
  Loader2, CheckCircle2, Stethoscope, Clock, UserPlus2, MapPin, 
  Wind, ShieldAlert, Weight, Ruler
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NICUTriage() {
  const [loading, setLoading] = useState(false)
  const [isVitalsOpen, setIsVitalsOpen] = useState(false)
  const [success, setSuccess] = useState(false)

  // Data State
  const [selectedBed, setSelectedBed] = useState<string | null>(null)
  const [triageLevel, setTriageLevel] = useState<string | null>(null)

  // Neonatal Patient Info
  const [infantName, setInfantName] = useState('')
  const [motherMrn, setMotherMrn] = useState('')
  const [birthWeight, setBirthWeight] = useState('')
  const [gestation, setGestation] = useState('')
  const [apgar1, setApgar1] = useState('')
  const [apgar5, setApgar5] = useState('')

  // Respiratory & Support
  const [respSupport, setRespSupport] = useState('ROOM_AIR')
  const [vitals, setVitals] = useState({ hr: '', rr: '', temp: '', spo2: '' })

  const triagePriorities = [
    { id: 'CRITICAL', label: 'Level III/IV', color: 'bg-red-600', border: 'border-red-600' },
    { id: 'INTERMEDIATE', label: 'Level II', color: 'bg-orange-500', border: 'border-orange-500' },
    { id: 'STABLE', label: 'Level I', color: 'bg-emerald-600', border: 'border-emerald-600' },
  ]

  const handleSubmit = async () => {
    if (!triageLevel || !selectedBed || !infantName) {
      alert("Please provide Infant Name, Triage Level, and select an Incubator.");
      return;
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/triage/nicu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          infantName,
          motherMrn,
          triageLevel,
          selectedBedId: selectedBed,
          vitals,
          assessment: {
            weight: birthWeight,
            gestation,
            apgar: { m1: apgar1, m5: apgar5 },
            respSupport
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true)
        // Reset Form
        setInfantName(''); setMotherMrn(''); setBirthWeight(''); setGestation('');
        setApgar1(''); setApgar5(''); setSelectedBed(null); setTriageLevel(null);
        setTimeout(() => setSuccess(false), 3000)
      } else {
        alert("Server Error: " + result.error);
      }
    } catch (err) {
      alert("Connection failed. Check your network or server logs.");
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-8">
      <AnimatePresence>
        {success && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-blue-600 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold">
            <CheckCircle2 /> Neonatal Admission Confirmed
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <ShieldAlert size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Neonatal Intensive Care Unit</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-950">NICU Intake Triage</h1>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setIsVitalsOpen(true)}
              className="flex h-12 items-center gap-3 rounded-2xl bg-white px-6 font-bold shadow-sm transition-all hover:shadow-md border border-slate-200">
              <Activity size={18} className="text-blue-500" />
              <span className="text-sm">Neo-Vitals {vitals.hr && "• Captured"}</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-8">
            <section>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                <Baby size={16} /> 01. Neonatal Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 pb-4 border-b border-slate-200">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Infant Name / Identifier</label>
                  <input value={infantName} onChange={(e) => setInfantName(e.target.value)} placeholder="e.g. B/G [Mother's Last Name]"
                    className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-slate-300" />
                </div>
                <div className="pb-4 border-b border-slate-200">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Mother's MRN</label>
                  <input value={motherMrn} onChange={(e) => setMotherMrn(e.target.value)} placeholder="LINK-ID"
                    className="w-full bg-transparent text-lg font-bold outline-none" />
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Weight', val: birthWeight, set: setBirthWeight, hint: 'grams', icon: <Weight size={14}/> },
                  { label: 'Gestation', val: gestation, set: setGestation, hint: 'wks+d', icon: <Clock size={14}/> },
                  { label: 'APGAR 1m', val: apgar1, set: setApgar1, hint: 'score', icon: <Timer size={14}/> },
                  { label: 'APGAR 5m', val: apgar5, set: setApgar5, hint: 'score', icon: <Timer size={14}/> },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-100/70 p-5 rounded-2xl">
                    <label className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">{item.icon} {item.label}</label>
                    <div className="flex items-center gap-2">
                      <input value={item.val} onChange={(e) => item.set(e.target.value)} className="w-full bg-transparent text-xl font-black outline-none" placeholder="0" />
                      <span className="text-[10px] font-bold text-slate-400 italic">{item.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                <Stethoscope size={16} /> 02. Stabilization Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 mb-4">
                    <Wind size={14} /> Respiratory Support
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['ROOM_AIR', 'CPAP', 'OXYGEN', 'VENTILATED'].map((mode) => (
                      <button key={mode} onClick={() => setRespSupport(mode)}
                        className={`p-3 rounded-xl border-2 font-bold text-[10px] transition-all ${respSupport === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 bg-white'}`}>
                        {mode.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-orange-500 flex items-center gap-2 mb-4">
                    <Timer size={14} /> Thermal Regulation
                  </h4>
                  <select className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none bg-transparent text-lg">
                    <option>Open Warmer</option>
                    <option>Isolette (Incubator)</option>
                    <option>Crib (Stable)</option>
                    <option>Transport Incubator</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                <Clock size={14} /> 03. Care Level
              </h3>
              <div className="flex flex-wrap gap-2">
                {triagePriorities.map((p) => (
                  <button key={p.id} onClick={() => setTriageLevel(p.id)}
                    className={`inline-flex flex-1 min-w-[100px] items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                      triageLevel === p.id ? `${p.border} ${p.color} text-white shadow-lg` : 'border-slate-200 bg-white'
                    }`}>
                    <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                    {triageLevel === p.id && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                <BedIcon size={14} /> 04. Incubator/Bed
              </h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {/* Note: In production, these should be mapped from a database fetch */}
                <button onClick={() => setSelectedBed('INC-01')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedBed === 'INC-01' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white'}`}>
                  <span className="text-sm font-bold">Incubator 01 (NICU-A)</span>
                  {selectedBed === 'INC-01' && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading || !triageLevel || !selectedBed}
              className="w-full h-16 rounded-3xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-blue-600 transition-all disabled:opacity-30 flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm NICU Admission'}
            </button>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {isVitalsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVitalsOpen(false)} className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 z-[100] h-full w-full max-w-md bg-white p-8 shadow-2xl">
               <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-600">Neonatal Vitals</h2>
                 <button onClick={() => setIsVitalsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
               </div>
               <div className="space-y-8">
                 {[
                   { label: 'Heart Rate (Neonatal)', key: 'hr', unit: 'bpm', icon: <Heart className="text-red-500" /> },
                   { label: 'Respiratory Rate', key: 'rr', unit: 'brpm', icon: <Waves className="text-blue-500" /> },
                   { label: 'Axillary Temp', key: 'temp', unit: '°C', icon: <Timer className="text-orange-500" /> },
                   { label: 'SpO2 Pre-ductal', key: 'spo2', unit: '%', icon: <Activity className="text-emerald-500" /> },
                 ].map((v) => (
                   <div key={v.key} className="relative">
                     <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">{v.label}</label>
                     <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-2 focus-within:border-blue-500 transition-all">
                       {v.icon}
                       <input 
                        className="flex-1 bg-transparent text-xl font-bold outline-none" 
                        placeholder="--"
                        value={(vitals as any)[v.key]}
                        onChange={(e) => setVitals({...vitals, [v.key]: e.target.value})}
                       />
                       <span className="text-xs font-bold text-slate-300">{v.unit}</span>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => setIsVitalsOpen(false)} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase text-xs tracking-widest mt-4 hover:bg-blue-600 transition-colors">Save Neo-Vitals</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}