'use client'

import { useState, useEffect } from 'react'

type Props = {
  patientId: string
  onClose: () => void
  onSuccess: () => void
}

export default function TriageForm({ patientId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    spo2: '',
    weight: '',
  })

  const [triageData, setTriageData] = useState({
    chiefComplaint: '',
    triageLevel: '3', // Default to 3 (Urgent)
    notes: '',
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

      alert('Triage completed successfully!')
      onSuccess() // Closes drawer and refreshes list
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Patient Triage</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6b7280' }}>✕</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Vitals Section */}
        <section>
          <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Vital Signs</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Temp (°C)</label>
              <input name="temperature" type="number" step="0.1" value={vitals.temperature} onChange={handleVitalChange} style={inputStyle} placeholder="36.5" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>BP (mmHg)</label>
              <input name="bloodPressure" value={vitals.bloodPressure} onChange={handleVitalChange} style={inputStyle} placeholder="120/80" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Heart Rate (bpm)</label>
              <input name="heartRate" type="number" value={vitals.heartRate} onChange={handleVitalChange} style={inputStyle} placeholder="72" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>SpO2 (%)</label>
              <input name="spo2" type="number" value={vitals.spo2} onChange={handleVitalChange} style={inputStyle} placeholder="98" />
            </div>
          </div>
        </section>

        {/* Clinical Assessment */}
        <section>
          <h3 style={{ fontSize: '1rem', color: '#374151', marginBottom: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Assessment</h3>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Chief Complaint *</label>
            <textarea name="chiefComplaint" required value={triageData.chiefComplaint} onChange={handleTriageChange} style={{ ...inputStyle, height: '80px', resize: 'none' }} placeholder="Why is the patient here?" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '4px' }}>Triage Priority (ESI)</label>
            <select name="triageLevel" value={triageData.triageLevel} onChange={handleTriageChange} style={inputStyle}>
              <option value="1">Level 1 - Resuscitation (Immediate)</option>
              <option value="2">Level 2 - Emergent</option>
              <option value="3">Level 3 - Urgent</option>
              <option value="4">Level 4 - Less Urgent</option>
              <option value="5">Level 5 - Non-Urgent</option>
            </select>
          </div>
        </section>

        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '8px', border: 'none', background: loading ? '#9ca3af' : '#2563eb', color: 'white', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Saving...' : 'Complete Triage'}
          </button>
        </div>
      </form>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '6px',
  border: '1px solid #d1d5db',
  fontSize: '0.95rem'
}