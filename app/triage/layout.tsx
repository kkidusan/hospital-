'use client'

import React, { useState, useEffect } from 'react'
import Sidebar from '../components/triage/Sidebare'
import Header from '../components/triage/Header'

export default function TriageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [mounted, setMounted] = useState(false)

  // CRITICAL: This effect prevents the "Default export" runtime error
  // by ensuring the layout renders consistently after hydration.
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Provide a blank layout or loading state to avoid flicker
    return <div style={{ minHeight: '100vh', background: '#f1f5f9' }} />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#f1f5f9' }}>
          {children}
        </main>
      </div>
    </div>
  )
}