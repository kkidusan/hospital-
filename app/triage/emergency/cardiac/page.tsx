'use client'

import React from 'react'
import { HeartPulse, Zap, Timer } from 'lucide-react'

export default function CardiacAlertPage() {
  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <HeartPulse size={40} color="#dc2626" />
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Cardiac Alert System</h1>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Protocol: Acute Coronary Syndrome</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
            DOOR-TO-BALLOON CLOCK ACTIVE
          </div>
        </div>
      </header>

      <div style={{ gridTemplateColumns: '1fr 1fr 1fr', display: 'grid', gap: '20px' }}>
        {/* Vitals Monitor Simulation */}
        <div style={{ backgroundColor: '#000', padding: '20px', borderRadius: '12px', color: '#22c55e', fontFamily: 'monospace' }}>
          <p style={{ fontSize: '0.8rem', color: '#fff' }}>LIVE VITALS</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>88 <small style={{ fontSize: '1rem' }}>BPM</small></div>
          <div style={{ fontSize: '1.5rem' }}>BP: 110/70</div>
          <div style={{ fontSize: '1.5rem' }}>SpO2: 94%</div>
        </div>

        {/* Action Panel */}
        <div style={{ gridColumn: 'span 2', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={20} color="#eab308" /> Cardiac Protocol Actions
          </h3>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button style={{ flex: 1, padding: '15px', border: '1px solid #dc2626', color: '#dc2626', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              Upload ECG Image
            </button>
            <button style={{ flex: 1, padding: '15px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              NOTIFY CARDIOLOGIST
            </button>
          </div>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem' }}><strong>Medication Given:</strong> Aspirin 300mg, Nitroglycerin</p>
          </div>
        </div>
      </div>
    </div>
  )
}