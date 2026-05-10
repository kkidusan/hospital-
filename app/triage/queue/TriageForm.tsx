'use client'

import { useState } from 'react'
import { Activity, Thermometer, Heart, Wind, Droplets, Save, XCircle } from 'lucide-react'

type Props = {
  patientId: string
  onClose: () => void
  onSuccess: () => void
}

// Mobile: text-base (to prevent iOS zoom) | Desktop: text-sm (Original)
const inputBaseStyle = "w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"

export default function TriageForm({ patientId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    spo2: '',
  })

  const [triageData, setTriageData] = useState({
    chiefComplaint: '',
    triageLevel: '3',
  })

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVitals(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleTriageChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setTriageData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/reception/triage/${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...vitals, ...triageData }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save triage data')
      }
      onSuccess() 
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        
        {/* Vitals Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Activity size={18} className="text-blue-600" />
            <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-slate-500">Vital Signs</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Thermometer size={14} /> Temp (°C)
              </label>
              <input name="temperature" type="number" step="0.1" value={vitals.temperature} onChange={handleVitalChange} className={inputBaseStyle} placeholder="36.5" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Heart size={14} /> BP (mmHg)
              </label>
              <input name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalChange} className={inputBaseStyle} placeholder="120/80" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Activity size={14} /> Heart Rate
              </label>
              <input name="heartRate" type="number" value={vitals.heartRate} onChange={handleVitalChange} className={inputBaseStyle} placeholder="72" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] md:text-xs font-semibold text-slate-600 flex items-center gap-1">
                <Droplets size={14} /> SpO2 (%)
              </label>
              <input name="spo2" type="number" value={vitals.spo2} onChange={handleVitalChange} className={inputBaseStyle} placeholder="98" />
            </div>
          </div>
        </section>

        {/* Clinical Assessment */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            <Wind size={18} className="text-blue-600" />
            <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-wider text-slate-500">Assessment</h3>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-semibold text-slate-600">Chief Complaint *</label>
            <textarea 
              name="chiefComplaint" 
              required 
              value={triageData.chiefComplaint} 
              onChange={handleTriageChange} 
              className={`${inputBaseStyle} min-h-[80px] md:min-h-[100px] py-3`} 
              placeholder="Primary reason..." 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] md:text-xs font-semibold text-slate-600">Priority (ESI)</label>
            <select 
              name="triageLevel" 
              value={triageData.triageLevel} 
              onChange={handleTriageChange} 
              className={`${inputBaseStyle} bg-white h-11`}
            >
              <option value="1">Level 1 - Resuscitation</option>
              <option value="2">Level 2 - Emergent</option>
              <option value="3">Level 3 - Urgent</option>
              <option value="4">Level 4 - Less Urgent</option>
              <option value="5">Level 5 - Non-Urgent</option>
            </select>
          </div>
        </section>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm border border-red-100">
            <XCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse md:flex-row gap-3 pt-4 md:pt-6">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm md:text-base hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm md:text-base hover:bg-blue-700 shadow-md active:scale-95 disabled:bg-slate-300"
          >
            {loading ? <Activity size={18} className="animate-spin" /> : <Save size={18} />}
            Complete Triage
          </button>
        </div>
      </form>
    </div>
  )
}