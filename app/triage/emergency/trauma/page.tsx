'use client'

import React, { useState, useEffect } from 'react'
import {
  UserPlus2,
  Activity,
  Bed,
  X,
  Heart,
  Thermometer,
  Droplets,
  Loader2,
} from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

export default function RapidAdmission() {
  const [loading, setLoading] = useState(false)
  const [fetchingBeds, setFetchingBeds] = useState(true)
  const [isVitalsOpen, setIsVitalsOpen] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)

  const [availableBeds, setAvailableBeds] = useState<any[]>([])
  const [selectedBed, setSelectedBed] = useState<string | null>(null)

  const [triageLevel, setTriageLevel] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [complaint, setComplaint] = useState('')

  const [vitals, setVitals] = useState({
    bp: '',
    pulse: '',
    spo2: '',
    temp: '',
  })

  useEffect(() => {
    const fetchERBeds = async () => {
      try {
        setFetchingBeds(true)
        const res = await fetch('/api/admin/wards/beds')
        const data = await res.json()

        const erWard = data.find((w: any) => w.type === 'EMERGENCY_TRIAGE')

        if (erWard) {
          const allBeds = erWard.rooms.flatMap((room: any) =>
            room.beds.map((bed: any) => ({
              ...bed,
              displayLabel: `${room.roomNumber}-${bed.bedNumber.split('-').pop()}`,
            }))
          )
          setAvailableBeds(allBeds)
        }
      } catch (err) {
        console.error('Failed to load ER beds', err)
      } finally {
        setFetchingBeds(false)
      }
    }

    fetchERBeds()
  }, [])

  const triagePriorities = [
    { id: 'RED', label: 'P1: Immediate', activeColor: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' },
    { id: 'YELLOW', label: 'P2: Urgent', activeColor: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' },
    { id: 'GREEN', label: 'P3: Stable', activeColor: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600' },
  ]

  const handleVitalsChange = (key: string, value: string) => {
    setVitals((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-transparent p-4 font-sans text-slate-900 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <header className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                Rapid Triage System
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">
              Rapid Admission
            </h1>
          </div>

          <button
            onClick={() => setIsVitalsOpen(true)}
            className="flex h-10 items-center gap-2 rounded-full bg-slate-950 px-5 text-white shadow-lg transition-all hover:bg-blue-600"
          >
            <Activity size={16} className="text-blue-400" />
            <span className="text-xs font-bold">Vitals</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* LEFT SIDE */}
          <div className="space-y-6 lg:col-span-8">

            {/* IDENTIFICATION - Mobile Optimized */}
            <section className="lg:rounded-2xl lg:border lg:border-slate-100 lg:bg-white/40 lg:p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <UserPlus2 size={14} />
                  01. Identification
                </h3>

                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`rounded-full border px-3 py-1 text-[9px] font-black transition-all ${
                    isAnonymous
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  {isAnonymous ? 'ANONYMOUS ACTIVE' : 'MARK ANONYMOUS'}
                </button>
              </div>

              <div className="flex flex-wrap md:flex-nowrap items-end gap-3 w-full">
                {/* FULL NAME */}
                <div className="flex-1 min-w-[280px] group border-b border-slate-200 py-1 transition-all focus-within:border-blue-600 lg:border-none lg:bg-transparent">
                  <label className="block text-[9px] font-black uppercase text-slate-400">
                    Full Name
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isAnonymous}
                    placeholder={isAnonymous ? 'AUTO-GENERATED ID' : 'Patient Name'}
                    className="w-full border-none bg-transparent text-base font-bold outline-none placeholder:text-slate-300"
                  />
                </div>

                {/* SEX */}
                <div className="shrink-0">
                  <label className="mb-2 block text-[9px] font-black uppercase text-slate-400">
                    Sex
                  </label>
                  <div className="flex gap-2">
                    {['MALE', 'FEMALE', 'OTHER'].map((s) => {
                      const checked = gender === s
                      return (
                        <label key={s} className="group flex cursor-pointer items-center gap-1.5">
                          <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                            checked ? 'border-blue-600 bg-blue-600' : 'border-black bg-white'
                          }`}>
                            <input
                              type="radio"
                              name="gender"
                              checked={checked}
                              onChange={() => setGender(s)}
                              className="hidden"
                            />
                            {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <span className={`text-[10px] font-black transition-all ${checked ? 'text-blue-600' : 'text-slate-500'}`}>
                            {s}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* AGE */}
                <div className="w-20 shrink-0 group border-b border-slate-200 py-1 transition-all focus-within:border-blue-600 lg:border-none">
                  <label className="block text-[9px] font-black uppercase text-slate-400">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full border-none bg-transparent text-base font-bold outline-none"
                  />
                </div>
              </div>
            </section>

            {/* TRIAGE */}
            <section>
              <h3 className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                02. Priority Level
              </h3>

              <div className="lg:rounded-xl lg:border lg:border-slate-100 lg:bg-white/50 lg:p-4">
                <div className="flex gap-6 md:gap-8 rounded-xl border border-slate-100 bg-white/50 p-4 lg:border-none lg:bg-transparent lg:p-0">
                  {triagePriorities.map((p) => {
                    const checked = triageLevel === p.id
                    return (
                      <label key={p.id} className="group flex cursor-pointer items-center gap-3">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                          checked ? `${p.activeColor} ${p.border}` : 'border-black bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="triage"
                            checked={checked}
                            onChange={() => setTriageLevel(p.id)}
                            className="hidden"
                          />
                          {checked && <div className="h-2 w-2 rounded-sm bg-white" />}
                        </div>
                        <span className={`text-[11px] font-black uppercase transition-all ${checked ? p.text : 'text-slate-500'}`}>
                          {p.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* COMPLAINT */}
            <section>
              <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                03. Chief Complaint
              </h3>
              <div className="lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white/50 lg:p-4">
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="h-20 w-full resize-none border border-slate-200 bg-white/50 p-4 text-sm font-medium outline-none focus:border-blue-600 lg:border-none lg:bg-transparent lg:p-0"
                  placeholder="Clinical notes..."
                />
              </div>
            </section>
          </div>

          {/* RIGHT SIDE - Bed Assignment */}
          <div className="lg:col-span-4">
            <div className="space-y-6">
              <section className="lg:rounded-2xl lg:border lg:border-slate-100 lg:bg-slate-50/50 lg:p-4">
                <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <Bed size={14} />
                  04. Bed Assignment
                </h3>

                <div className="custom-scrollbar max-h-[320px] space-y-1 overflow-y-auto pr-2">
                  {fetchingBeds ? (
                    <div className="flex justify-center py-8 opacity-20">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    availableBeds.map((bed) => {
                      const checked = selectedBed === bed.bedNumber
                      return (
                        <label
                          key={bed.id}
                          className={`flex items-center justify-between rounded-lg p-3 transition-all lg:p-2 ${
                            bed.isOccupied
                              ? 'cursor-not-allowed opacity-30'
                              : 'cursor-pointer hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                              checked ? 'border-blue-600 bg-blue-600' : 'border-black bg-white'
                            }`}>
                              <input
                                type="radio"
                                name="bed"
                                disabled={bed.isOccupied}
                                checked={checked}
                                onChange={() => setSelectedBed(bed.bedNumber)}
                                className="hidden"
                              />
                              {checked && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                            <span className={`text-[11px] font-bold transition-all ${checked ? 'text-blue-600' : 'text-slate-600'}`}>
                              Bed {bed.displayLabel}
                            </span>
                          </div>

                          {bed.isOccupied && (
                            <span className="text-[8px] font-black uppercase text-red-400">In Use</span>
                          )}
                        </label>
                      )
                    })
                  )}
                </div>
              </section>

              {/* Confirm Button */}
              <button
                disabled={loading || !selectedBed || !triageLevel}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-blue-700 disabled:opacity-20"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Confirm Admission'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VITALS OVERLAY - Unchanged */}
      <AnimatePresence>
        {isVitalsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVitalsOpen(false)}
              className="fixed inset-0 z-[90] bg-slate-950/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 z-[100] h-full w-full max-w-sm bg-white p-8 shadow-2xl"
            >
              {/* Vitals content remains the same */}
              <div className="mb-10 flex items-center justify-between">
                <h2 className="text-xl font-black uppercase tracking-tighter">Vitals Entry</h2>
                <button onClick={() => setIsVitalsOpen(false)} className="rounded-full p-2 hover:bg-slate-50">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {[
                  { label: 'Blood Pressure', key: 'bp', icon: <Activity size={18} />, unit: 'mmHg' },
                  { label: 'Pulse Rate', key: 'pulse', icon: <Heart size={18} />, unit: 'bpm' },
                  { label: 'SpO2', key: 'spo2', icon: <Droplets size={18} />, unit: '%' },
                  { label: 'Temperature', key: 'temp', icon: <Thermometer size={18} />, unit: '°C' },
                ].map((v) => (
                  <div key={v.key} className="group">
                    <label className="mb-2 block text-[10px] font-black uppercase text-slate-400">
                      {v.label}
                    </label>
                    <div className="flex items-center gap-3 border-b-2 border-slate-100 pb-2 transition-all group-focus-within:border-blue-600">
                      <span className="text-slate-400">{v.icon}</span>
                      <input
                        type="text"
                        value={(vitals as any)[v.key]}
                        onChange={(e) => handleVitalsChange(v.key, e.target.value)}
                        placeholder="--"
                        className="flex-1 border-none bg-transparent text-lg font-bold outline-none"
                      />
                      <span className="text-[10px] font-bold text-slate-300">{v.unit}</span>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setIsVitalsOpen(false)}
                  className="mt-8 h-12 w-full rounded-xl bg-slate-950 text-xs font-bold uppercase text-white transition-colors hover:bg-blue-600"
                >
                  Save Vitals Data
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}