'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, UserPlus, Search, Calendar, ClipboardList, 
  Ticket, Bed, Users, HelpCircle, FileBarChart, 
  CreditCard, Ambulance, Printer, History, CalendarCheck, Stethoscope,
  Database 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const MENU_ITEMS = [
  { 
    group: "Main", 
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/reception' },
      { name: 'Patient Record', icon: UserPlus, href: '/reception/record' },
      { name: 'Billing', icon: Search, href: '/reception/billing' },
    ]
  },
  { 
    group: "Follow-up Care", 
    items: [
      { name: 'Recall List', icon: History, href: '/reception/follow-up/recalls' },
      { name: 'Chronic Care', icon: Stethoscope, href: '/reception/follow-up/chronic' },
      { name: 'Post-Op Followup', icon: CalendarCheck, href: '/reception/follow-up/post-op' },
    ]
  },
  { 
    group: "Appointments", 
    items: [
      { name: 'New Booking', icon: Calendar, href: '/reception/booking' },
      { name: 'Daily Schedule', icon: ClipboardList, href: '/reception/appointments' },
      { name: 'OP Ticket', icon: Ticket, href: '/reception/op-ticket' },
    ]
  },
  { 
    group: "In-Patient", 
    items: [
      { name: 'Beds & Wards', icon: Bed, href: '/reception/beds' },
    ]
  },
  { 
    group: "Operations", 
    items: [
      { name: 'Equipment', icon: CreditCard, href: '/reception/equipment' },
      { name: 'Reports', icon: FileBarChart, href: '/reception/reports' },
      { name: 'Backup', icon: Database, href: '/reception/backup' }, 
    ]
  }
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [time, setTime] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    updateTime();
    const timer = setInterval(updateTime, 60000);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
    }
  }, [])

  const sidebarWidth = isOpen ? '240px' : '70px';

  return (
    <aside style={{ 
      // Mobile logic: Hidden off-screen (-100%) or overlay
      position: isMobile ? 'fixed' : 'relative',
      left: isMobile ? (isOpen ? '0' : '-100%') : '0',
      width: isMobile ? '240px' : sidebarWidth,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f8fafc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e2e8f0',
      zIndex: 100, // Higher z-index for mobile overlay
      flexShrink: 0
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-area { scrollbar-width: none; -ms-overflow-style: none; }
        .nav-area::-webkit-scrollbar { width: 2px; display: none; }
        .nav-area:hover::-webkit-scrollbar { display: block; }
        .nav-area::-webkit-scrollbar-track { background: transparent; margin: 20px 0; }
        .nav-area::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />
      
      {/* Header */}
      <div style={{ padding: '16px 12px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center' }}>
        {(isOpen || isMobile) ? (
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Reception Portal
          </span>
        ) : (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
        )}
      </div>

      {/* Navigation */}
      <nav className="nav-area" style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '14px' }}>
            {(isOpen || isMobile) && (
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '10px' }}>
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const showText = isOpen || isMobile;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => isMobile && setIsOpen(false)} // Auto close on mobile click
                  title={!showText ? item.name : ""}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: showText ? 'flex-start' : 'center',
                    padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#1e293b' : '#64748b',
                    marginBottom: '2px', transition: 'all 0.15s ease',
                    border: isActive ? '1px solid #dbeafe' : '1px solid transparent'
                  }}>
                  <item.icon size={18} style={{ 
                    marginRight: showText ? '10px' : '0',
                    color: isActive ? '#2563eb' : '#64748b',
                    strokeWidth: isActive ? 2.5 : 2
                  }} />
                  {showText && <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500 }}>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: (isOpen || isMobile) ? 'space-between' : 'center' }}>
        {(isOpen || isMobile) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700 }}>TERMINAL ACTIVE</span>
            <span style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>{time}</span>
          </div>
        )}
        
        {/* Only show collapse button on Desktop */}
        {!isMobile && (
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            style={{ 
              background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', 
              width: '28px', height: '28px', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center' 
            }}>
            <span style={{ 
              transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', 
              transition: 'transform 0.3s ease', fontSize: '12px', fontWeight: 'bold', color: '#000' 
            }}>«</span>
          </button>
        )}
      </div>
    </aside>
  )
}