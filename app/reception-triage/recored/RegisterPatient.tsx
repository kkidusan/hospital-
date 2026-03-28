'use client'

import { useState } from 'react'

type Props = {
  onClose: () => void
  onSuccess: () => void
}

export default function RegisterPatient({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    ageUnit: 'years',
    sex: 'M',
    phone: '',
    address: '',
    region: 'Addis Ababa',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/reception/register-patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to register patient')
        return
      }

      alert(`Patient registered successfully!\nMRN: ${data.patient.mrn}`)
      onSuccess() // Refresh list and close drawer
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', position: 'relative' }}>
      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}
      >
        ✕
      </button>

      <h1 style={{ textAlign: 'left', marginBottom: '8px', fontSize: '1.5rem' }}>Register New Patient</h1>
      <p style={{ textAlign: 'left', color: '#666', marginBottom: '32px' }}>
        Reception & Triage – Card Room
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Full Name *</label>
          <input name="fullName" required value={form.fullName} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Age *</label>
            <input name="age" type="number" required value={form.age} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Unit</label>
            <select name="ageUnit" value={form.ageUnit} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="years">Years</option>
              <option value="months">Months</option>
              <option value="days">Days</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Sex *</label>
          <select name="sex" required value={form.sex} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }}>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Phone Number</label>
          <input name="phone" type="tel" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Address</label>
          <input name="address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Region</label>
          <input name="region" value={form.region} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </div>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, padding: '14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                style={{ flex: 2, padding: '14px', background: loading ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
                {loading ? 'Registering...' : 'Register Patient'}
            </button>
        </div>
      </form>
    </div>
  )
}