'use client'

import React from 'react'
import { Bell, Search, User, AlertTriangle } from 'lucide-react'

export default function Header() {
  return (
    <header style={{
      height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px'
    }}>
      <div style={{ position: 'relative', width: '300px' }}>
        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          type="text" 
          placeholder="Search Patient..." 
          style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.85rem' }}
        />
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#dc2626', gap: '6px' }}>
          <AlertTriangle size={18} />
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>EMERGENCY (0)</span>
        </div>
        <Bell size={20} color="#64748b" />
        <div style={{ height: '32px', width: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9' }} />
      </div>
    </header>
  );
}