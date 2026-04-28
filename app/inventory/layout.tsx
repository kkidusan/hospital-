'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '../components/inventory/Sidebare'
import Header from '../components/inventory/Header'

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: '#f1f5f9' }} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar - Fixed Positioned */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        // This margin ensures the content isn't hidden behind the fixed sidebar
        marginLeft: isOpen ? '260px' : '80px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Header />
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          backgroundColor: '#f1f5f9' 
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}