'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Search, Plus, MoreHorizontal, AlertTriangle, Clock, UserCheck } from 'lucide-react'
import RegisterPatient from './RegisterPatient'

type Patient = {
  id: string
  mrn: string
  fullName: string
  age: number
  ageUnit: string
  sex: string
  phone: string | null
  address?: string
  status: 'WAITING' | 'IN_TRIAGE' | 'TRIAGED' | 'EMERGENCY' | 'COMPLETED' | null
  queuePosition: number | null
}

export default function ReceptionTriageDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [selectedPatientForActions, setSelectedPatientForActions] = useState<string | null>(null)
  
  // NEW: State for pre-filling the update form
  const [editData, setEditData] = useState<any>(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reception/patients')
      const data = await res.json()
      const list = Array.isArray(data.patients) ? data.patients : []
      setPatients(list)
    } catch (err) {
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartTriage = async (patientId: string) => {
    setActionId(patientId)
    try {
      const res = await fetch(`/api/reception/start-triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      if (res.ok) await fetchPatients()
    } finally {
      setActionId(null)
    }
  }

  const handleDirectSend = async (patientId: string) => {
    if (!confirm("Send patient directly to Doctor? Vitals will be skipped.")) return
    setActionId(patientId)
    try {
      const res = await fetch(`/api/reception/direct-send/${patientId}`, { method: 'POST' })
      if (res.ok) await fetchPatients()
    } finally {
      setActionId(null)
    }
  }

  const handleReQueue = async (patientId: string) => {
    setActionId(patientId)
    try {
      const res = await fetch('/api/reception/re-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      if (res.ok) await fetchPatients()
    } finally {
      setActionId(null)
    }
  }

  const handleOtherAction = async (patientId: string, actionType: string) => {
    setActionId(patientId)
    try {
      const res = await fetch(`/api/reception/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      if (res.ok) {
        await fetchPatients()
      }
    } finally {
      setActionId(null)
      setSelectedPatientForActions(null)
    }
  }

  useEffect(() => {
    const results = patients.filter(p => {
      const term = searchTerm.toLowerCase().trim()
      if (!term) return true
      return p.fullName.toLowerCase().includes(term) || p.mrn.toLowerCase().includes(term)
    })
    const statusResults = statusFilter ? results.filter(p => p.status === statusFilter) : results
    setFiltered(statusResults)
  }, [searchTerm, statusFilter, patients])

  useEffect(() => {
    fetchPatients()
    const interval = setInterval(fetchPatients, 20000)
    return () => clearInterval(interval)
  }, [])

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'WAITING', label: 'Waiting' },
    { value: 'IN_TRIAGE', label: 'In Triage' },
    { value: 'TRIAGED', label: 'Triaged' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Reception Center</h1>
            <p className="text-slate-500 mt-1">Manage patient arrivals and triage</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search Patients..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={fetchPatients} disabled={loading} className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <RefreshCw size={17} className={`${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => { setEditData(null); setIsRegisterOpen(true); }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
            >
              <Plus size={17} strokeWidth={3} /> New
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all ${
                statusFilter === option.value ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className="overflow-hidden">
          <table className="w-full text-left bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors h-16">
                  <td className="px-5 py-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-px rounded ${p.mrn.startsWith('TEP_') ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {p.mrn}
                        </span>
                        <span className="font-semibold text-slate-900 text-[15px]">{p.fullName}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">{p.age}{p.ageUnit} • {p.sex} • {p.phone || 'No Phone'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center"><StatusTag status={p.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-center items-center">
                      {p.status === 'WAITING' && (
                        <>
                          <button onClick={() => handleStartTriage(p.id)} disabled={actionId === p.id} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-xl text-xs font-bold transition">Triage</button>
                          <button onClick={() => handleDirectSend(p.id)} disabled={actionId === p.id} className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-1.5 rounded-xl text-xs font-bold">Direct</button>
                        </>
                      )}
                      <button onClick={() => setSelectedPatientForActions(p.id)} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400 hover:text-slate-600">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Overlay */}
      {isRegisterOpen && (
        <Overlay onClose={() => setIsRegisterOpen(false)} showCloseButton={false}>
          <RegisterPatient
            onClose={() => setIsRegisterOpen(false)}
            onSuccess={() => { setIsRegisterOpen(false); fetchPatients(); }}
            initialData={editData}
          />
        </Overlay>
      )}

      {/* Actions Modal */}
      {selectedPatientForActions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-xs overflow-hidden p-6 border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Patient Actions</h3>
                <button onClick={() => setSelectedPatientForActions(null)} className="text-slate-400 text-2xl">×</button>
              </div>

              <div className="space-y-2">
                {/* NEW UPDATE ACTION */}
                <ActionButton 
                  icon={<UserCheck size={18} className="text-blue-600"/>} 
                  label="Update Info" 
                  onClick={() => {
                    const p = patients.find(pat => pat.id === selectedPatientForActions);
                    setEditData(p);
                    setIsRegisterOpen(true);
                    setSelectedPatientForActions(null);
                  }}
                />
                <ActionButton 
                  icon={<AlertTriangle size={18}/>} 
                  label="Emergency" 
                  color="text-red-600 hover:bg-red-50" 
                  onClick={() => handleOtherAction(selectedPatientForActions, 'mark-emergency')}
                />
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActionButton({ icon, label, onClick, color = "text-slate-700 hover:bg-slate-50" }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-left font-semibold text-sm ${color}`}>
      {icon} {label}
    </button>
  )
}

function StatusTag({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    WAITING: "bg-amber-50 text-amber-600 border-amber-100",
    IN_TRIAGE: "bg-blue-50 text-blue-600 border-blue-100",
    TRIAGED: "bg-purple-50 text-purple-600 border-purple-100",
    EMERGENCY: "bg-red-50 text-red-600 border-red-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }
  return (
    <div className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${styles[status || ''] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
      {status ? status.replace('_', ' ') : 'INACTIVE'}
    </div>
  )
}

function Overlay({ children, onClose, showCloseButton = true }: { children: React.ReactNode; onClose: () => void; showCloseButton?: boolean; }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto">
        {showCloseButton && (
          <button onClick={onClose} className="absolute top-8 right-8 text-3xl text-slate-300 hover:text-slate-500 transition-colors">×</button>
        )}
        {children}
      </div>
    </div>
  )
}