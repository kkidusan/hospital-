'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  RefreshCw, 
  Search, 
  Plus, 
  MoreHorizontal, 
  AlertTriangle, 
  UserCheck, 
  ArrowLeftRight,
  X,
  CheckCircle2
} from 'lucide-react'
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
  const [menuConfig, setMenuConfig] = useState<{ top: number; left: number; dropUp: boolean } | null>(null)
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

  // --- SMART POSITIONING LOGIC ---
  const handleOpenActions = (e: React.MouseEvent, patientId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const menuHeight = 200 // Approximate height of the menu
    const windowHeight = window.innerHeight
    const spaceBelow = windowHeight - rect.bottom
    
    // If space below is less than 200px, we drop UP
    const shouldDropUp = spaceBelow < menuHeight

    setMenuConfig({
      top: shouldDropUp 
        ? rect.top + window.scrollY - 8 // Position at top of button
        : rect.bottom + window.scrollY + 8, // Position at bottom of button
      left: rect.left + window.scrollX - 180, // Align to the left of the button
      dropUp: shouldDropUp
    })
    setSelectedPatientForActions(patientId)
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

  const handleRequeue = async (patientId: string) => {
    if (!patientId) return;
    setActionId(patientId)
    setSelectedPatientForActions(null)
    
    try {
      const res = await fetch(`/api/reception/requeue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientId, 
          status: 'WAITING'
        }),
      })

      if (res.ok) {
        await fetchPatients()
      } else {
        const errorData = await res.json()
        alert(`Failed to re-queue: ${errorData.message || 'Unknown error'}`)
      }
    } catch (err) {
      console.error("Requeue error", err)
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

  const handleOtherAction = async (patientId: string, actionType: string) => {
    setActionId(patientId)
    try {
      const res = await fetch(`/api/reception/${actionType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId }),
      })
      if (res.ok) await fetchPatients()
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
    const interval = setInterval(fetchPatients, 30000)
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

  const activePatientForMenu = patients.find(p => p.id === selectedPatientForActions)

  const isRequeueDisabled = 
    activePatientForMenu?.status === 'WAITING' || 
    activePatientForMenu?.status === 'IN_TRIAGE' || 
    activePatientForMenu?.status === 'TRIAGED' || 
    activePatientForMenu?.status === 'EMERGENCY';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter">Reception Center</h1>
            <p className="text-slate-500 mt-1">Manage patient arrivals and triage queue</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search MRN or Name..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={fetchPatients} disabled={loading} className="flex items-center justify-center min-w-[40px] h-10 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <RefreshCw size={17} className={`${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => { setEditData(null); setIsRegisterOpen(true); }}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
            >
              <Plus size={18} strokeWidth={3} /> Register
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                statusFilter === option.value 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Slim Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-2 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-2 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Status</th>
                <th className="px-2 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-100/50 transition-colors group">
                  <td className="px-2 py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${p.mrn.startsWith('TEP_') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {p.mrn}
                        </span>
                        <span className="font-bold text-slate-900 text-[15px]">{p.fullName}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium italic">
                        {p.age} {p.ageUnit} • {p.sex} • {p.phone || 'Contact missing'}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-5 text-center">
                    <StatusTag status={p.status} />
                  </td>
                  <td className="px-2 py-5">
                    <div className="flex gap-2 justify-end items-center">
                      {p.status === 'WAITING' ? (
                        <>
                          <button 
                            onClick={() => handleStartTriage(p.id)} 
                            disabled={actionId === p.id} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-blue-100 disabled:opacity-50"
                          >
                             Triage
                          </button>
                          <button 
                            onClick={() => handleDirectSend(p.id)} 
                            disabled={actionId === p.id} 
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-1.5 rounded-xl text-xs font-bold transition disabled:opacity-50"
                          >
                            Direct
                          </button>
                        </>
                      ) : (p.status === 'COMPLETED' || !p.status) ? (
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 mr-2">
                          <CheckCircle2 size={14} />
                          <span className="text-sm font-normal">Completed</span>
                        </div>
                      ) : (
                        <span className="text-sm font-normal text-slate-400 italic mr-2">
                          {actionId === p.id ? 'Updating...' : 'Processing...'}
                        </span>
                      )}
                      
                      <button 
                        onClick={(e) => handleOpenActions(e, p.id)} 
                        className="p-2 hover:bg-slate-200 rounded-xl transition text-slate-400 hover:text-slate-900"
                      >
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="py-20 text-center text-slate-400 font-medium">No patients found in this category.</div>
          )}
        </div>
      </div>

      {/* Register/Edit Sidebar */}
      {isRegisterOpen && (
        <Overlay onClose={() => setIsRegisterOpen(false)}>
          <RegisterPatient
            onClose={() => setIsRegisterOpen(false)}
            onSuccess={() => { setIsRegisterOpen(false); fetchPatients(); }}
            initialData={editData}
          />
        </Overlay>
      )}

      {/* --- MODERN FLOATING CONTEXT MENU --- */}
      {selectedPatientForActions && menuConfig && (
        <>
          {/* Backdrop to close menu */}
          <div className="fixed inset-0 z-[60]" onClick={() => setSelectedPatientForActions(null)} />
          
          <div 
            style={{ 
                top: `${menuConfig.top}px`, 
                left: `${menuConfig.left}px`,
                transform: menuConfig.dropUp ? 'translateY(-100%)' : 'translateY(0)' 
            }}
            className={`
                absolute z-[70] w-56 bg-white/90 backdrop-blur-xl rounded-2xl 
                shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-2 
                animate-in fade-in zoom-in duration-150 ease-out
                ${menuConfig.dropUp ? 'origin-bottom' : 'origin-top'}
            `}
          >
            <div className="px-4 py-2 border-b border-slate-50 mb-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Options</p>
            </div>

            <ActionButton 
              icon={<UserCheck size={16} className="text-blue-600"/>} 
              label="Edit Profile" 
              onClick={() => {
                const p = patients.find(pat => pat.id === selectedPatientForActions);
                setEditData(p);
                setIsRegisterOpen(true);
                setSelectedPatientForActions(null);
              }}
            />

            <ActionButton 
              icon={<ArrowLeftRight size={16} className={ isRequeueDisabled ? "text-slate-300" : "text-amber-500"}/>} 
              label="Re-queue (Waiting)" 
              disabled={isRequeueDisabled}
              onClick={() => handleRequeue(selectedPatientForActions!)}
            />

            <div className="my-1 border-t border-slate-50" />

            <ActionButton 
              icon={<AlertTriangle size={16} className={ (activePatientForMenu?.status === 'COMPLETED' || !activePatientForMenu?.status) ? "text-slate-300" : "text-red-500" }/>} 
              label="Mark Emergency" 
              color="text-red-600 hover:bg-red-50" 
              disabled={activePatientForMenu?.status === 'COMPLETED' || !activePatientForMenu?.status}
              onClick={() => handleOtherAction(selectedPatientForActions!, 'mark-emergency')}
            />
          </div>
        </>
      )}
    </div>
  )
}

function ActionButton({ icon, label, onClick, disabled, color = "text-slate-700 hover:bg-slate-100" }: any) {
  return (
    <button 
      onClick={disabled ? undefined : (e) => { e.stopPropagation(); onClick(); }} 
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left font-bold text-xs ${
        disabled 
          ? 'opacity-30 cursor-not-allowed text-slate-400 bg-transparent' 
          : `${color} active:scale-95`
      }`}
    >
      {icon} {label}
    </button>
  )
}

function StatusTag({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    WAITING: "text-amber-600",
    IN_TRIAGE: "text-blue-600",
    TRIAGED: "text-purple-600",
    EMERGENCY: "text-red-600",
    COMPLETED: "text-emerald-600",
  }

  const formatStatus = (s: string | null) => {
    if (!s) return 'Completed'
    const text = s.replace('_', ' ').toLowerCase()
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
  
  return (
    <div className={`inline-block text-sm font-normal ${styles[status || ''] || 'text-emerald-600'}`}>
      {formatStatus(status)}
    </div>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-8 md:p-12 overflow-y-auto animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}