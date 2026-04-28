'use client'

import { useState, useEffect } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import TriageForm from './TriageForm' // Adjust path to your TriageForm component

// 1. Define the shape of your Patient data
interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  gender: string;
  phoneNumber?: string;
  queue?: {
    enteredAt: string;
  };
}

export default function TriageWorkstation() {
  // 2. Explicitly type the state hooks
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const fetchTriageQueue = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await fetch('/api/triage/queue')
      
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      
      const data = await res.json()
      // Ensure we access the queue property correctly from your API response
      setPatients(data.queue || [])
    } catch (err) {
      console.error("Queue fetch error:", err)
      setFetchError("Could not load queue. Ensure API route exists.")
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
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Activity className="text-blue-600" /> Triage Queue
            </h1>
            <button onClick={fetchTriageQueue} className="p-2 hover:bg-white rounded-full transition-colors">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <input 
            type="text"
            placeholder="Search MRN or Name..."
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {fetchError && <div className="text-red-500 text-xs p-4 bg-red-50 rounded-lg">{fetchError}</div>}
          
          {filteredPatients.length === 0 && !loading ? (
            <div className="text-center py-10 text-slate-400 text-sm">Queue is empty</div>
          ) : (
            filteredPatients.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPatientId(p.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedPatientId === p.id 
                  ? 'bg-blue-600 border-blue-600 shadow-lg text-white' 
                  : 'bg-white border-slate-100 hover:border-blue-200'
                }`}
              >
                <div className="flex justify-between text-[10px] mb-1 opacity-80">
                  <span className="font-bold">{p.mrn}</span>
                  <span>
                    {p.queue?.enteredAt 
                      ? new Date(p.queue.enteredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                      : '--:--'}
                  </span>
                </div>
                <div className="font-bold">{p.fullName}</div>
                <div className="text-xs opacity-70">{p.gender} • {p.phoneNumber || 'No phone'}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-6">
        {selectedPatientId ? (
          <div className="w-full max-w-3xl bg-white rounded-4xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white">
              <h2 className="text-xl font-bold">Patient Assessment</h2>
              <p className="text-blue-400 text-xs">Filling vitals for ID: {selectedPatientId}</p>
            </div>
            <TriageForm 
              patientId={selectedPatientId} 
              onClose={() => setSelectedPatientId(null)} 
              onSuccess={() => {
                setSelectedPatientId(null)
                fetchTriageQueue()
              }} 
            />
          </div>
        ) : (
          <div className="text-slate-400 flex flex-col items-center">
            <Activity size={48} className="mb-2 opacity-20" />
            <p>Select a patient to begin triage</p>
          </div>
        )}
      </div>
    </div>
  )
}
