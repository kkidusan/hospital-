'use client'

import React, { useState, useEffect } from 'react'
import { 
  Baby, Activity, Bed as BedIcon, X, Heart, Timer, Waves, 
  Loader2, CheckCircle2, Stethoscope, Clock, UserPlus2, MapPin, AlertCircle 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MaternityLaborTriage() {
  const [loading, setLoading] = useState(false)
  const [fetchingBeds, setFetchingBeds] = useState(true)
  const [isVitalsOpen, setIsVitalsOpen] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [success, setSuccess] = useState(false)

  // Data State
  const [wards, setWards] = useState<any[]>([]) 
  const [selectedBed, setSelectedBed] = useState<string | null>(null)
  const [triageLevel, setTriageLevel] = useState<string | null>(null)
  
  // Patient Info
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gravida, setGravida] = useState('')
  const [para, setPara] = useState('')
  const [gestationWeeks, setGestationWeeks] = useState('')

  // Labor Progress
  const [dilation, setDilation] = useState('')
  const [effacement, setEffacement] = useState('')
  const [station, setStation] = useState('')
  const [membranes, setMembranes] = useState('INTACT')
  const [fetalHeartRate, setFetalHeartRate] = useState('')
  const [contractions, setContractions] = useState({ frequency: '', duration: '' })
  const [vitals, setVitals] = useState({ bp: '', pulse: '', temp: '', spo2: '' })

  // Fetch Beds on Load
  useEffect(() => {
    fetchMaternityBeds()
  }, [])

  const fetchMaternityBeds = async () => {
    try {
      setFetchingBeds(true)
      const res = await fetch('/api/triage/beds')
      const data = await res.json()
      setWards(data)
    } catch (err) {
      console.error('Failed to load Maternity beds', err)
    } finally {
      setFetchingBeds(false)
    }
  }

  // --- FULL SUBMIT LOGIC ---
  const handleSubmit = async () => {
    // 1. Basic UI Validation
    if (!triageLevel || !selectedBed) {
       alert("Please select a Triage Level and an Available Bed.");
       return;
    }

    if (!isAnonymous && !fullName) {
      alert("Please enter Patient Name or toggle Anonymous mode.");
      return;
    }

    setLoading(true)
    
    try {
      // 2. Prepare Payload
      const payload = {
        patientName: isAnonymous ? `ANON-MAT-${Math.floor(1000 + Math.random() * 9000)}` : fullName,
        age: parseInt(age),
        isAnonymous,
        obstetricHistory: { gravida, para, gestationWeeks },
        laborProgress: { dilation, effacement, station, membranes, fetalHeartRate, contractions },
        triageLevel,
        bedNumber: selectedBed, // We pass the bedNumber string to match in the backend
        vitals,
        timestamp: new Date().toISOString()
      }

      // 3. API Call
      const response = await fetch('/api/triage/labor-admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to admit patient")
      }

      // 4. Success Routine
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        resetForm()
        fetchMaternityBeds() // Refresh bed availability
      }, 3000)

    } catch (error: any) {
      console.error("Submission Error:", error)
      alert(`Critical Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFullName('')
    setAge('')
    setGravida('')
    setPara('')
    setGestationWeeks('')
    setDilation('')
    setEffacement('')
    setStation('')
    setFetalHeartRate('')
    setTriageLevel(null)
    setSelectedBed(null)
    setVitals({ bp: '', pulse: '', temp: '', spo2: '' })
    setIsAnonymous(false)
  }

  const triagePriorities = [
    { id: 'EMERGENT', label: 'Emergent', color: 'bg-red-600', border: 'border-red-600' },
    { id: 'URGENT', label: 'Urgent', color: 'bg-orange-500', border: 'border-orange-500' },
    { id: 'NON_URGENT', label: 'Stable', color: 'bg-emerald-600', border: 'border-emerald-600' },
  ]

  // ... (Rest of your JSX return remains mostly the same, ensuring the button uses handleSubmit)
  return (
    <div className="min-h-screen bg-slate-50 p-4 font-sans text-slate-900 md:p-8">
       {/* SUCCESS TOAST */}
       <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 font-bold"
          >
            <CheckCircle2 /> Maternity Admission Confirmed
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-pink-500 mb-1">
              <Baby size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Maternity Department</span>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-950">Labor & Delivery Triage</h1>
          </div>

          <div className="flex gap-3">
             <button
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`flex h-12 items-center gap-2 rounded-2xl px-6 font-bold transition-all border ${isAnonymous ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              <UserPlus2 size={18} />
              <span className="text-sm">{isAnonymous ? "Anonymous Mode On" : "Standard Admission"}</span>
            </button>

            <button
              onClick={() => setIsVitalsOpen(true)}
              className="flex h-12 items-center gap-3 rounded-2xl bg-white px-6 font-bold shadow-sm transition-all hover:shadow-md border border-slate-200"
            >
              <Activity size={18} className="text-pink-500" />
              <span className="text-sm">Vitals {vitals.bp && "• Saved"}</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* MAIN FORM */}
          <div className="space-y-12 lg:col-span-8">
            {/* 01. Patient Info */}
            <section>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                <UserPlus2 size={16} /> 01. Patient Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 pb-4 border-b border-slate-200">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Name</label>
                  <input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isAnonymous}
                    placeholder={isAnonymous ? "AUTO-ID GENERATED" : "Enter Mother's Name"}
                    className="w-full bg-transparent text-lg font-bold outline-none placeholder:text-slate-300 disabled:opacity-50"
                  />
                </div>
                <div className="pb-4 border-b border-slate-200">
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Age</label>
                  <input 
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-transparent text-lg font-bold outline-none"
                  />
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { label: 'Gravida', val: gravida, set: setGravida, hint: 'Total' },
                  { label: 'Para', val: para, set: setPara, hint: 'Live' },
                  { label: 'Gestation', val: gestationWeeks, set: setGestationWeeks, hint: 'Weeks' },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-100/70 p-5 rounded-2xl">
                    <label className="block text-[9px] font-black uppercase text-slate-400">{item.label}</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={item.val}
                        onChange={(e) => item.set(e.target.value)}
                        className="w-full bg-transparent text-xl font-black outline-none"
                        placeholder="0"
                      />
                      <span className="text-[10px] font-bold text-slate-400 italic">{item.hint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 02. Assessment */}
            <section>
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                <Stethoscope size={16} /> 02. Labor Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h4 className="text-[10px] font-black uppercase text-pink-500 flex items-center gap-2 mb-4">
                    <Waves size={14} /> Cervical Exam
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400">Dilation</span>
                      <input value={dilation} onChange={(e) => setDilation(e.target.value)} className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none focus:border-pink-500 text-lg" placeholder="cm" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400">Efface %</span>
                      <input value={effacement} onChange={(e) => setEffacement(e.target.value)} className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none focus:border-pink-500 text-lg" placeholder="%" />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-400">Station</span>
                      <input value={station} onChange={(e) => setStation(e.target.value)} className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none focus:border-pink-500 text-lg" placeholder="-/+" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 mb-4">
                    <Heart size={14} /> Fetal Status
                  </h4>
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-400">FHR</span>
                      <input value={fetalHeartRate} onChange={(e) => setFetalHeartRate(e.target.value)} className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none focus:border-blue-500 text-lg" placeholder="bpm" />
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-slate-400">Membranes</span>
                      <select value={membranes} onChange={(e) => setMembranes(e.target.value)} className="w-full border-b-2 border-slate-200 p-3 font-bold outline-none bg-transparent text-lg">
                        <option value="INTACT">Intact</option>
                        <option value="SROM">SROM</option>
                        <option value="AROM">AROM</option>
                        <option value="ROM">ROM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                <Clock size={14} /> 03. Priority
              </h3>
              <div className="flex flex-wrap gap-2">
                {triagePriorities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTriageLevel(p.id)}
                    className={`inline-flex flex-1 min-w-[100px] items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                      triageLevel === p.id 
                        ? `${p.border} ${p.color} text-white shadow-lg` 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tight">{p.label}</span>
                    {triageLevel === p.id && <CheckCircle2 size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2">
                <BedIcon size={14} /> 04. Bed Assignment
              </h3>
              <div className="max-h-[300px] overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {fetchingBeds ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin opacity-40" /></div>
                ) : (
                  wards.map((ward) => (
                    <div key={ward.id} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <MapPin size={12} className="text-pink-500" />
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">{ward.name}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {ward.rooms.flatMap((room: any) => 
                          room.beds.map((bed: any) => (
                            <button
                              key={bed.id}
                              disabled={bed.isOccupied}
                              onClick={() => setSelectedBed(bed.bedNumber)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                selectedBed === bed.bedNumber 
                                  ? 'border-pink-500 bg-pink-50 text-pink-700' 
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              } ${bed.isOccupied ? 'opacity-40 cursor-not-allowed' : ''}`}
                            >
                               <span className="text-sm font-bold">Bed {room.roomNumber}-{bed.bedNumber.split('-').pop()}</span>
                               {selectedBed === bed.bedNumber && <CheckCircle2 size={16} />}
                               {bed.isOccupied && <span className="text-[9px] font-bold text-slate-400 uppercase">Occupied</span>}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !triageLevel || !selectedBed}
              className="w-full h-16 rounded-3xl bg-slate-950 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-pink-600 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Admission'}
            </button>
          </aside>
        </div>
      </div>
      
      {/* Vitals Drawer (Omitted for brevity, but same as your original) */}
      <AnimatePresence>
        {isVitalsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVitalsOpen(false)} className="fixed inset-0 z-[90] bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 z-[100] h-full w-full max-w-md bg-white p-8 shadow-2xl">
               <div className="flex items-center justify-between mb-10">
                 <h2 className="text-2xl font-black uppercase tracking-tighter">Vitals Entry</h2>
                 <button onClick={() => setIsVitalsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
               </div>
               <div className="space-y-8">
                 {[
                   { label: 'Blood Pressure', key: 'bp', unit: 'mmHg', icon: <Activity className="text-red-500" /> },
                   { label: 'Pulse Rate', key: 'pulse', unit: 'bpm', icon: <Heart className="text-pink-500" /> },
                   { label: 'Temperature', key: 'temp', unit: '°C', icon: <Timer className="text-orange-500" /> },
                   { label: 'SpO2', key: 'spo2', unit: '%', icon: <Waves className="text-blue-500" /> },
                 ].map((v) => (
                   <div key={v.key} className="relative">
                     <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">{v.label}</label>
                     <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-2 focus-within:border-pink-500 transition-all">
                       {v.icon}
                       <input className="flex-1 bg-transparent text-xl font-bold outline-none" value={(vitals as any)[v.key]} onChange={(e) => setVitals({...vitals, [v.key]: e.target.value})} placeholder="--" />
                       <span className="text-xs font-bold text-slate-300">{v.unit}</span>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => setIsVitalsOpen(false)} className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase text-xs tracking-widest mt-4 hover:bg-pink-600 transition-colors">Save Vitals</button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}