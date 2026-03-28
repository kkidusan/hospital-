'use client'

import React from 'react'

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function DoctorHeader({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  return (
    <header style={{ 
      height: '70px', 
      backgroundColor: '#ffffff', 
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
      
      {/* Left Section: Sidebar Toggle & Quick Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: 1 }}>
        <button 
          onClick={toggleSidebar}
          style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            padding: '10px', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          {isSidebarOpen ? '📑' : '📖'}
        </button>

        {/* Global Patient Search Bar */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search patient by Name or MRN..." 
            style={{ 
              width: '100%', 
              padding: '10px 10px 10px 40px', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0', 
              backgroundColor: '#f1f5f9',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }} 
          />
        </div>
      </div>

      {/* Right Section: Notifications & Doctor Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        
        {/* Urgent Notifications */}
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.4rem' }}>🔔</span>
          <span style={{ 
            position: 'absolute', 
            top: '-2px', 
            right: '-2px', 
            background: '#ef4444', 
            color: 'white', 
            fontSize: '0.65rem', 
            padding: '2px 5px', 
            borderRadius: '50%', 
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            3
          </span>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }}></div>

        {/* Doctor Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>
              Dr. Mohamed Berihun
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Specialist Surgeon
            </div>
          </div>
          
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800,
            fontSize: '1rem',
            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
          }}>
            MB
          </div>
        </div>
      </div>
    </header>
  )
}