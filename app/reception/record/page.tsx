'use client'

import { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  Search, 
  Plus, 
  MoreHorizontal, 
  AlertTriangle, 
  UserCheck, 
  ArrowLeftRight,
  X,
  CheckCircle2,
  Filter,
  User
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

type Doctor = {
  id: string
  name: string
  specialty: string
}

export default function ReceptionTriageDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [selectedPatientForActions, setSelectedPatientForActions] = useState<string | null>(null)
  const [menuConfig, setMenuConfig] = useState<{ top: number; left: number; dropUp: boolean } | null>(null)
  const [editData, setEditData] = useState<any>(null)
  
  // NEW: State for Direct Send Modal
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false)
  const [activePatientId, setActivePatientId] = useState<string | null>(null)

  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'WAITING', label: 'Waiting' },
    { value: 'IN_TRIAGE', label: 'In Triage' },
    { value: 'TRIAGED', label: 'Triaged' },
    { value: 'EMERGENCY', label: 'Emergency' },
    { value: 'COMPLETED', label: 'Completed' },
  ]

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/reception/patients')
      const data = await res.json()
      const list = Array.isArray(data.patients) ? data.patients : []
      setPatients(list)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // NEW: Fetch Specialist Doctors
  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/reception/doctors') // Ensure this endpoint returns { doctors: [{id, name, specialty}] }
      const data = await res.json()
      setDoctors(data.doctors || [])
    } catch (err) {
      console.error("Failed to fetch doctors", err)
    }
  }

  useEffect(() => {
    fetchPatients()
    fetchDoctors()
    const interval = setInterval(fetchPatients, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleOpenActions = (e: React.MouseEvent, patientId: string) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const menuHeight = 200 
    const windowHeight = window.innerHeight
    const spaceBelow = windowHeight - rect.bottom
    const shouldDropUp = spaceBelow < menuHeight

    setMenuConfig({
      top: shouldDropUp ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 8,
      left: Math.max(10, rect.left + window.scrollX - 180), 
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
        body: JSON.stringify({ patientId, isDirect: false }),
      })
      if (res.ok) await fetchPatients()
    } finally {
      setActionId(null)
    }
  }

  // MODIFIED: Open Selection Modal instead of immediate send
  const handleOpenDirectDialog = (patientId: string) => {
    setActivePatientId(patientId)
    setIsDirectModalOpen(true)
  }

  const handleConfirmDirectSend = async (doctorId: string) => {
    if (!activePatientId) return
    setActionId(activePatientId)
    setIsDirectModalOpen(false)
    
    try {
      const res = await fetch(`/api/reception/start-triage`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            patientId: activePatientId, 
            isDirect: true,
            assignedDoctorId: doctorId // Sending the specific doctor ID
        }) 
      })
      if (res.ok) await fetchPatients()
    } finally {
      setActionId(null)
      setActivePatientId(null)
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
        body: JSON.stringify({ patientId, status: 'WAITING' }),
      })
      if (res.ok) await fetchPatients()
    } catch (err) {
      console.error(err)
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

  const activePatientForMenu = patients.find(p => p.id === selectedPatientForActions)
  const isRequeueDisabled = 
    activePatientForMenu?.status === 'WAITING' || 
    activePatientForMenu?.status === 'IN_TRIAGE' || 
    activePatientForMenu?.status === 'TRIAGED' || 
    activePatientForMenu?.status === 'EMERGENCY';

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-4 md:mb-8">
          <div className="hidden md:block">
            <h1 className="text-3xl font-extrabold tracking-tighter">Reception Center</h1>
            <p className="text-slate-500 mt-1">Manage patient arrivals and triage queue</p>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center flex-1 md:min-w-[280px] bg-transparent group border-b border-transparent focus-within:border-slate-200 transition-all">
              <Search size={18} className={`transition-colors duration-200 ${searchTerm ? 'text-slate-900' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search MRN or Name..."
                className="w-full bg-transparent border-none pl-3 pr-0 py-2.5 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={fetchPatients} disabled={loading} className="flex items-center justify-center min-w-[40px] h-10 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all">
              <RefreshCw size={17} className={`${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => { setEditData(null); setIsRegisterOpen(true); }}
              className="flex items-center justify-center h-10 px-4 transition-all active:scale-95 w-10 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 md:w-auto md:px-5"
            >
              <Plus size={18} strokeWidth={3} className="block md:hidden " />
              <span className="hidden md:block text-xs font-bold">Register Patient</span>
            </button>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-left border-collapse min-w-[340px] md:min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</th>
                <th className="px-1 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Status</th>
                <th className="px-2 py-4 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-100/50 transition-colors group">
                  <td className="px-2 py-3 md:py-5">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] md:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${p.mrn.startsWith('TEP_') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {p.mrn}
                        </span>
                        <span className="font-bold text-slate-900 text-[13px] md:text-[15px]">{p.fullName}</span>
                      </div>
                      <div className="text-[10px] md:text-xs text-slate-500 mt-1 font-medium italic">
                        {p.age} {p.ageUnit} • {p.sex}
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <StatusTag status={p.status} />
                  </td>
                  <td className="px-2 py-3">
                    <div className="flex gap-1.5 justify-end items-center">
                      {p.status === 'WAITING' ? (
                        <>
                          <button 
                            onClick={() => handleStartTriage(p.id)} 
                            disabled={actionId === p.id} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold"
                          >
                            Triage
                          </button>
                          <button 
                            onClick={() => handleOpenDirectDialog(p.id)} 
                            disabled={actionId === p.id} 
                            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold transition"
                          >
                            Direct
                          </button>
                        </>
                      ) : (p.status === 'COMPLETED' || !p.status) ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 size={14} />
                          <span className="text-[11px] md:text-sm">Done</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Processing...</span>
                      )}
                      <button onClick={(e) => handleOpenActions(e, p.id)} className="p-2 hover:bg-slate-200 rounded-xl">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODALS & OVERLAYS --- */}

      {/* 1. Register/Edit Patient Sidebar */}
      {isRegisterOpen && (
        <Overlay onClose={() => setIsRegisterOpen(false)}>
          <RegisterPatient
            onClose={() => setIsRegisterOpen(false)}
            onSuccess={() => { setIsRegisterOpen(false); fetchPatients(); }}
            initialData={editData}
          />
        </Overlay>
      )}

      {/* 2. Direct Send: Doctor Selection Modal */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDirectModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-blue-600 p-6 text-white">
              <h3 className="text-xl font-bold">Assign to Specialist</h3>
              <p className="text-blue-100 text-sm">Select a doctor to skip triage vitals.</p>
            </div>
            
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {doctors.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm italic">No specialist doctors available</p>
              ) : (
                <div className="grid gap-2">
                  {doctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleConfirmDirectSend(doc.id)}
                      className="flex items-center gap-4 w-full p-4 hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all group text-left"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-700">{doc.name}</p>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{doc.specialty}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsDirectModalOpen(false)}
                className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dropdown Menu for More Actions */}
      {selectedPatientForActions && menuConfig && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setSelectedPatientForActions(null)} />
          <div 
            style={{ 
                top: `${menuConfig.top}px`, 
                left: `${menuConfig.left}px`,
                transform: menuConfig.dropUp ? 'translateY(-100%)' : 'translateY(0)' 
            }}
            className="absolute z-[70] w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2"
          >
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
              icon={<AlertTriangle size={16} className="text-red-500" />} 
              label="Mark Emergency" 
              color="text-red-600 hover:bg-red-50" 
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left font-bold text-xs ${disabled ? 'opacity-30 cursor-not-allowed' : `${color} active:scale-95`}`}
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
    return s.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }
  return (
    <div className={`text-[11px] md:text-sm font-semibold ${styles[status || ''] || 'text-emerald-600'}`}>
      {formatStatus(status)}
    </div>
  )
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void; }) {
  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}