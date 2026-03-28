'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Search, Plus, MoreHorizontal, AlertTriangle, Clock, UserCheck } from 'lucide-react'
import RegisterPatient from './RegisterPatient'
import TriageForm from './TriageForm'

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
  const [activeTriageId, setActiveTriageId] = useState<string | null>(null)
  const [selectedPatientForActions, setSelectedPatientForActions] = useState<string | null>(null)

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

  const handleDirectSend = async (patientId: string) => {
    if (!confirm("Send patient directly to Doctor? Vitals will be skipped.")) return
    setActionId(patientId)
    try {
      const res = await fetch(`/api/reception/direct-send/${patientId}`, { method: 'POST' })
      if (res.ok) await fetchPatients()
    } catch (err) {
      alert("Network error.")
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
        alert(`${actionType.replace('-', ' ').toUpperCase()} completed successfully`)
        await fetchPatients()
      } else {
        alert("Action failed.")
      }
    } catch (err) {
      alert("Network error.")
    } finally {
      setActionId(null)
      setSelectedPatientForActions(null)
    }
  }

  // Enhanced search
  useEffect(() => {
    const results = patients.filter(p => {
      const term = searchTerm.toLowerCase().trim()
      if (!term) return true
      return (
        p.fullName.toLowerCase().includes(term) ||
        p.mrn.toLowerCase().includes(term) ||
        (p.phone && p.phone.toLowerCase().includes(term)) ||
        p.age.toString().includes(term) ||
        (p.address && p.address.toLowerCase().includes(term))
      )
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
                placeholder="Search by Name, Age, Phone, Address or MRN..."
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={fetchPatients}
              disabled={loading}
              className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={17} className={`${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsRegisterOpen(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
            >
              <Plus size={17} strokeWidth={3} />
              New
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
                statusFilter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center mb-3 px-1">
          <p className="text-sm text-slate-500">
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="text-xs text-slate-400">Auto-refresh • 20s</div>
        </div>

        {/* Clean Table - No Background Card */}
        <div className="overflow-hidden">
          <table className="w-full text-left bg-white">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-52">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr><td colSpan={3} className="py-16 text-center text-slate-400">Loading patients...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={3} className="py-16 text-center text-slate-400">No patients found</td></tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors h-14">
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-px rounded">
                            {p.mrn}
                          </span>
                          <span className="font-medium text-slate-900 text-[15px] leading-none">{p.fullName}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {p.age}{p.ageUnit} • {p.sex} • {p.phone || '—'}
                        </div>
                        {p.address && <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.address}</div>}
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <StatusTag status={p.status} />
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex gap-1.5 justify-center items-center">
                        {(p.status === 'WAITING' || p.status === 'IN_TRIAGE') && (
                          <>
                            <button
                              onClick={() => setActiveTriageId(p.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-xl text-xs font-medium transition"
                            >
                              Triage
                            </button>
                            <button
                              onClick={() => handleDirectSend(p.id)}
                              disabled={actionId === p.id}
                              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-1 rounded-xl text-xs font-medium disabled:opacity-60"
                            >
                              Direct
                            </button>
                          </>
                        )}

                        {(p.status === 'TRIAGED' || p.status === 'EMERGENCY') && (
                          <div className="px-4 py-1 bg-slate-100 text-slate-500 rounded-xl text-xs flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            Doctor
                          </div>
                        )}

                        {(p.status === 'COMPLETED' || !p.status) && (
                          <button
                            onClick={() => handleReQueue(p.id)}
                            disabled={actionId === p.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1 rounded-xl text-xs font-medium disabled:opacity-60"
                          >
                            Re-queue
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedPatientForActions(p.id)}
                          className="p-2 hover:bg-slate-100 rounded-xl transition"
                        >
                          <MoreHorizontal size={18} className="text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Patient Overlay - NO Close Button */}
      {isRegisterOpen && (
        <Overlay onClose={() => setIsRegisterOpen(false)} showCloseButton={false}>
          <RegisterPatient
            onClose={() => setIsRegisterOpen(false)}
            onSuccess={() => {
              setIsRegisterOpen(false)
              fetchPatients()
            }}
          />
        </Overlay>
      )}

      {/* Triage Form Overlay - NO Close Button */}
      {activeTriageId && (
        <Overlay onClose={() => setActiveTriageId(null)} showCloseButton={false}>
          <TriageForm
            patientId={activeTriageId}
            onClose={() => setActiveTriageId(null)}
            onSuccess={() => {
              setActiveTriageId(null)
              fetchPatients()
            }}
          />
        </Overlay>
      )}

      {/* More Actions Overlay */}
      {selectedPatientForActions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">More Actions</h3>
                <button 
                  onClick={() => setSelectedPatientForActions(null)}
                  className="text-2xl text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => handleOtherAction(selectedPatientForActions, 'mark-emergency')}
                  disabled={actionId === selectedPatientForActions}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50 text-red-600 rounded-2xl transition text-left"
                >
                  <AlertTriangle size={20} />
                  <span className="font-medium">Mark as Emergency</span>
                </button>

                <button
                  onClick={() => handleOtherAction(selectedPatientForActions, 'hold-patient')}
                  disabled={actionId === selectedPatientForActions}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-100 rounded-2xl transition text-left"
                >
                  <Clock size={20} />
                  <span className="font-medium">Hold Patient</span>
                </button>

                <button
                  onClick={() => handleOtherAction(selectedPatientForActions, 'send-to-lab')}
                  disabled={actionId === selectedPatientForActions}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-100 rounded-2xl transition text-left"
                >
                  <UserCheck size={20} />
                  <span className="font-medium">Send to Laboratory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusTag({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    WAITING: "bg-amber-100 text-amber-700 border border-amber-200",
    IN_TRIAGE: "bg-blue-100 text-blue-700 border border-blue-200",
    TRIAGED: "bg-purple-100 text-purple-700 border border-purple-200",
    EMERGENCY: "bg-red-100 text-red-700 border border-red-200",
    COMPLETED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  }

  return (
    <div className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border ${styles[status || ''] || 'bg-slate-100 text-slate-500'}`}>
      {status ? status.replace('_', ' ') : 'OUT'}
    </div>
  )
}

// Updated Overlay Component - Now accepts showCloseButton prop
function Overlay({ 
  children, 
  onClose, 
  showCloseButton = true 
}: { 
  children: React.ReactNode; 
  onClose: () => void;
  showCloseButton?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-8 overflow-y-auto border-l border-slate-200">
        
        {/* Close button only shows if showCloseButton is true */}
        {showCloseButton && (
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-3xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        )}
        
        {children}
      </div>
    </div>
  )
}