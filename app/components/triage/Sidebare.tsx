'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Activity, Users, 
  ChevronLeft, ChevronRight, Siren, 
  Baby, BedDouble, ClipboardList, 
  Stethoscope, FlameKindling, HeartPulse, 
  UserPlus2
} from 'lucide-react';

// Emergency and Maternity Focused Menu Items
const MENU_ITEMS = [
  { 
    group: "Overview", 
    items: [
      { name: 'Triage Dashboard', icon: LayoutDashboard, href: '/triage' },
      { name: 'Active Queue', icon: Users, href: '/triage/queue' },
    ]
  },
  { 
    group: "Emergency Actions", 
    items: [
      { name: 'Quick Admission', icon: UserPlus2, href: '/triage/emergency/quick-reg' }, // ያለ ካርድ መግቢያ
      { name: 'Trauma & Injury', icon: FlameKindling, href: '/triage/emergency/trauma' }, // ለአደጋዎች
      { name: 'Cardiac Alert', icon: HeartPulse, href: '/triage/emergency/cardiac' }, // ለልብ ድንገተኛ
      { name: 'ER Bed Mapping', icon: BedDouble, href: '/triage/emergency/beds' },
    ]
  },
  { 
    group: "Maternity (Labor)", 
    items: [
      { name: 'Active Labor Ward', icon: Baby, href: '/triage/maternity/labor' }, // ምጥ ላይ ያሉ
      { name: 'NICU Admission', icon: Stethoscope, href: '/triage/maternity/nicu' }, // የሕፃናት ድንገተኛ
      { name: 'Postnatal Care', icon: Activity, href: '/triage/maternity/postnatal' },
    ]
  },
  { 
    group: "Clinical Actions", 
    items: [
      { name: 'Vitals Record', icon: Activity, href: '/triage/vitals' },
      { name: 'Doctor Notification', icon: Siren, href: '/triage/alerts' }, // ለዶክተር Alert መላኪያ
      { name: 'Assessment Forms', icon: ClipboardList, href: '/triage/assessment' },
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside style={{ 
      width: isOpen ? '260px' : '80px', 
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#ffffff', 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column', 
      borderRight: '1px solid #f1f5f9',
      position: 'relative',
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{ 
        padding: '20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center',
        borderBottom: '1px solid #f8fafc'
      }}>
        {isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, color: '#b91c1c', fontSize: '1.1rem', lineHeight: 1 }}>EMERGENCY</span>
            <span style={{ fontWeight: 600, color: '#64748b', fontSize: '0.7rem' }}>TRIAGE UNIT</span>
          </div>
        )}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            border: 'none', 
            background: '#fee2e2', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            padding: '6px',
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Nav List */}
      <nav style={{ 
        flex: 1, 
        padding: '12px 10px', 
        overflowY: 'auto',
        scrollbarWidth: 'none' // For Firefox
      }}>
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '20px' }}>
            {isOpen && (
              <p style={{ 
                fontSize: '0.65rem', 
                color: '#94a3b8', 
                fontWeight: 800, 
                paddingLeft: '12px', 
                textTransform: 'uppercase',
                marginBottom: '8px',
                letterSpacing: '1px'
              }}>
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const isUrgentGroup = group.group === "Emergency Actions" || group.group === "Maternity (Labor)";

              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  title={!isOpen ? item.name : ""}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '10px 12px', 
                    borderRadius: '8px',
                    textDecoration: 'none', 
                    marginBottom: '4px',
                    backgroundColor: isActive ? (isUrgentGroup ? '#fef2f2' : '#f8fafc') : 'transparent',
                    color: isActive ? (isUrgentGroup ? '#b91c1c' : '#1e293b') : '#64748b',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ 
                      marginRight: isOpen ? '12px' : '0',
                      flexShrink: 0,
                      color: isActive ? (isUrgentGroup ? '#b91c1c' : '#1e293b') : '#94a3b8'
                    }} 
                  />
                  {isOpen && (
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: isActive ? 700 : 500,
                      whiteSpace: 'nowrap'
                    }}>
                      {item.name}
                    </span>
                  )}
                  {/* Active Indicator Dot */}
                  {isActive && !isOpen && (
                    <div style={{
                      position: 'absolute',
                      right: '10px',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#b91c1c'
                    }} />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      {isOpen && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#fef2f2', 
          margin: '10px', 
          borderRadius: '8px',
          border: '1px solid #fee2e2'
        }}>
          <p style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700, margin: 0 }}>
            SYSTEM ACTIVE
          </p>
          <p style={{ fontSize: '0.6rem', color: '#f87171', margin: 0 }}>
            Emergency Override Enabled
          </p>
        </div>
      )}
    </aside>
  );
}