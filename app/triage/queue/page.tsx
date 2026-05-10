'use client'

import { useState, useEffect } from 'react'
import { Activity, RefreshCw, User, ClipboardList, Search, ChevronRight } from 'lucide-react'
import TriageForm from './TriageForm'

export default function TriageWorkstation() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)

  const fetchTriageQueue = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/triage/queue')
      const data = await res.json()
      setPatients(data.queue || [])
    } catch (err) {
      console.error("Sync error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTriageQueue()
    const interval = setInterval(fetchTriageQueue, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredPatients = patients.filter(p => 
    p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.mrn.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden">
      
      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${selectedPatientId ? 'md:mr-[450px]' : ''}`}>
        
        {/* HEADER */}
        <header className="p-6 md:px-8 md:pt-8 md:pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[#0f172a] text-2xl font-[900] tracking-tight">Triage Workstation</h1>
            <div className="flex items-center gap-2.5 mt-1">
              <span className="text-[#64748b] text-[0.85rem] font-medium">Vital signs & initial assessment</span>
              <span className="text-[#e2e8f0]">|</span>
              <span className="text-[#0f172a] text-[0.85rem]">
                In Queue: <strong className="font-extrabold">{patients.length}</strong>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-blue-600 transition-colors" size={16} />
              <input 
                type="text"
                placeholder="Search patient or MRN..."
                className="pl-10 pr-4 py-2 bg-white border border-[#e2e8f0] rounded-lg text-sm w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchTriageQueue} 
              className="p-2.5 bg-white border border-[#e2e8f0] text-[#64748b] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shadow-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

        {/* Table Container - REMOVED BORDER-T-2 */}
        <main className="px-4 md:px-8 py-2 overflow-y-auto">
          <div className="bg-transparent">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider">Patient Details</th>
                  <th className="hidden md:table-cell px-4 py-3 text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider">MRN</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider">Wait Time</th>
                  <th className="px-4 py-3 text-[0.75rem] font-bold text-[#64748b] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              {/* REMOVED DIVIDE-Y */}
              <tbody className="">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className={`hover:bg-[#f1f5f9] transition-colors rounded-lg ${selectedPatientId === p.id ? 'bg-[#f1f5f9]' : 'bg-transparent'}`}>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="text-[1rem] font-[800] text-[#0f172a] tracking-tight">{p.fullName}</span>
                        <span className="md:hidden text-[0.7rem] font-bold text-[#64748b]">MRN: {p.mrn}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-4 text-[0.85rem] font-medium text-[#64748b]">{p.mrn}</td>
                    <td className="hidden lg:table-cell px-4 py-4">
                      <span className="px-2 py-1 bg-[#f1f5f9] text-[#475569] rounded text-[0.7rem] font-bold uppercase">{p.gender}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-[0.9rem] font-bold text-[#1e293b]">
                        {p.queue?.enteredAt ? new Date(p.queue.enteredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button 
                        onClick={() => setSelectedPatientId(p.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-black uppercase tracking-widest shadow-sm transition-all active:scale-95"
                      >
                        Assess
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredPatients.length === 0 && (
              <div className="py-20 text-center text-[#94a3b8] text-sm font-medium">
                No patients in queue.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* SIDE DRAWER */}
      <aside 
        className={`fixed right-0 top-0 h-full bg-white border-l border-[#e2e8f0] shadow-2xl transition-transform duration-300 ease-in-out z-50 
        ${selectedPatientId ? 'translate-x-0 w-full md:w-[450px]' : 'translate-x-full w-0'}`}
      >
        {selectedPatientId && (
          <div className="flex flex-col h-full">
            <div className="p-6 bg-[#0f172a] text-white flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black tracking-tight">Patient Triage</h2>
                <p className="text-slate-400 text-[0.7rem] uppercase font-bold tracking-widest mt-0.5">
                   Assessing: {filteredPatients.find(p => p.id === selectedPatientId)?.fullName}
                </p>
              </div>
              <button onClick={() => setSelectedPatientId(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <ChevronRight size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <TriageForm 
                patientId={selectedPatientId} 
                onClose={() => setSelectedPatientId(null)} 
                onSuccess={() => {
                  setSelectedPatientId(null)
                  fetchTriageQueue()
                }} 
              />
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}