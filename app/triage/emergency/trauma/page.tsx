'use client'

import React, { useState } from 'react'
import { FlameKindling, AlertTriangle } from 'lucide-react'

export default function TraumaPage() {
  const [injuryLevel, setInjuryLevel] = useState('Critical')

  return (
    <div style={{ padding: '24px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '30px', 
        borderBottom: '2px solid #fee2e2', 
        paddingBottom: '16px' 
      }}>
        <FlameKindling size={32} color="#dc2626" />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Trauma & Injury Unit</h1>
          <p style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', margin: 0 }}>IMMEDIATE INTERVENTION REQUIRED</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Quick Assessment Form */}
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <h3 style={{ marginBottom: '16px' }}>Rapid Assessment</h3>
          
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Injury Mechanism</label>
          <select style={{ width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>
            <option>Road Traffic Accident (RTA)</option>
            <option>Fall from Height</option>
            <option>Penetrating Injury</option>
            <option>Blunt Trauma</option>
          </select>

          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Consciousness Level (GCS)</label>
          <input 
            type="number" 
            placeholder="Score 3-15" 
            style={{ width: '100%', padding: '10px', borderRadius: '6px', marginBottom: '16px', border: '1px solid #cbd5e1' }} 
          />
          
          <button style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: '#dc2626', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 700, 
            cursor: 'pointer' 
          }}>
            ACTIVATE TRAUMA TEAM
          </button>
        </div>

        {/* Temporary ID Info */}
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', border: '1px dashed #f87171', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', marginBottom: '12px' }}>
            <AlertTriangle size={20} />
            <h3 style={{ margin: 0 }}>Emergency Mode</h3>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
            Patient is being treated under <strong>TEMP-ID: {Math.floor(Math.random() * 10000)}</strong>. 
            Official registration can be completed once the patient is stabilized.
          </p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #fee2e2' }}>
            <p style={{ fontSize: '0.85rem', margin: '4px 0', color: '#475569' }}><strong>Assigned Bed:</strong> ER-BED-04</p>
            <p style={{ fontSize: '0.85rem', margin: '4px 0', color: '#475569' }}><strong>Status:</strong> Awaiting Surgeon</p>
          </div>
        </div>
      </div>
    </div>
  )
}