'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean
}

// 1. Updated Menu Structure with /specialist prefix
const SPECIALIST_MENU = [
  {
    group: "Clinical Overview",
    items: [
      { name: "Dashboard Home", icon: "🏠", href: "/specialist" },
      { name: "Today's Appointments", icon: "⏰", href: "/specialist/appointments" },
      { name: "Patient Queue", icon: "👥", href: "/specialist/queue" },
    ]
  },
  {
    group: "Consultation",
    items: [
      // Matches /specialist/consultation AND /specialist/consultation/123...
      { name: "Active Consultation", icon: "💊", href: "/specialist/consultation" },
      { name: "Lab Test Requests", icon: "🧪", href: "/specialist/lab-requests" },
      { name: "Medical Records", icon: "📁", href: "/specialist/records" },
    ]
  },
  {
    group: "In-Patient Care",
    items: [
      { name: "IP Patient Rounds", icon: "🚶", href: "/specialist/rounds" },
      { name: "Discharge Summary", icon: "📄", href: "/specialist/discharge" },
    ]
  },
  {
    group: "Personal",
    items: [
      { name: "Schedule Settings", icon: "⚙️", href: "/specialist/settings" },
      { name: "Clinical Reports", icon: "📊", href: "/specialist/reports" },
    ]
  }
]

export default function DoctorSidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside style={{ 
      width: isOpen ? '280px' : '0px', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#0f172a', 
      color: '#f8fafc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRight: '1px solid #1e293b',
      position: 'relative',
      zIndex: 50
    }}>
      
      {/* 2. Header / Branding */}
      <div style={{ padding: '24px', borderBottom: '1px solid #1e293b', whiteSpace: 'nowrap' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', margin: 0, letterSpacing: '-0.02em' }}>
          BRUH MEDICAL
        </h1>
        <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '4px 0 0 0', fontWeight: 600, textTransform: 'uppercase' }}>
          Specialist Portal
        </p>
      </div>

      {/* 3. Navigation with Hidden Scrollbar */}
      <nav 
        style={{ 
          flex: 1, 
          padding: '20px 16px', 
          overflowY: 'auto',
          msOverflowStyle: 'none',  /* IE/Edge */
          scrollbarWidth: 'none',    /* Firefox */
          display: 'block'
        }}
      >
        {/* Injected style for Webkit Browsers (Chrome, Safari, Brave) */}
        <style dangerouslySetInnerHTML={{ __html: `
          nav::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
        `}} />

        {SPECIALIST_MENU.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '28px' }}>
            <p style={{ 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              color: '#475569', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '12px', 
              paddingLeft: '12px' 
            }}>
              {group.group}
            </p>

            {group.items.map((item) => {
              // 4. Dynamic Path Logic
              // Stays active if path is exact OR if it's a sub-route (excluding home)
              const isActive = pathname === item.href || 
                              (item.href !== '/specialist' && pathname.startsWith(item.href))
              
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#1e293b' : 'transparent',
                    marginBottom: '4px',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    border: isActive ? '1px solid #334155' : '1px solid transparent'
                  }}
                >
                  <span style={{ 
                    marginRight: '14px', 
                    fontSize: '1.2rem',
                    filter: isActive ? 'none' : 'grayscale(1)',
                    opacity: isActive ? 1 : 0.6
                  }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* 5. Footer / System Status */}
      <div style={{ padding: '16px', borderTop: '1px solid #1e293b', backgroundColor: '#020617' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px', 
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#0f172a'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: '#22c55e',
            boxShadow: '0 0 10px rgba(34, 197, 94, 0.4)' 
          }}></div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
            Specialist Session Active
          </span>
        </div>
      </div>
    </aside>
  )
}