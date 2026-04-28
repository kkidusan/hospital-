'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  BeakerIcon, 
  HomeIcon, 
  QueueListIcon, 
  ClipboardDocumentCheckIcon, 
  WrenchScrewdriverIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  AdjustmentsVerticalIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const MENU_ITEMS = [
  { group: "Overview", items: [
    { name: 'Dashboard', icon: HomeIcon, href: '/laboratory' },
    { name: 'New Requests', icon: QueueListIcon, href: '/laboratory/requests' },
  ]},
  { group: "Processing", items: [
    { name: 'Samples', icon: UserGroupIcon, href: '/laboratory/samples' },
    { name: 'Pending', icon: ExclamationCircleIcon, href: '/laboratory/pending' },
    { name: 'Completed', icon: ClipboardDocumentCheckIcon, href: '/laboratory/completed' },
  ]},
  { group: "Management", items: [
    { name: 'Categories', icon: AdjustmentsVerticalIcon, href: '/laboratory/categories' },
    { name: 'Equipment', icon: WrenchScrewdriverIcon, href: '/laboratory/equipment' },
    { name: 'QC Control', icon: ChartBarIcon, href: '/laboratory/qc' },
  ]}
];

export default function LabSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [time, setTime] = useState("")

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [])

  return (
    <aside style={{ 
      width: isOpen ? '240px' : '70px',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f8fafc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e2e8f0',
      zIndex: 50,
      flexShrink: 0
    }}>
      {/* MODERN FLOATING SCROLLBAR */}
      <style dangerouslySetInnerHTML={{ __html: `
        .nav-area { scrollbar-width: none; -ms-overflow-style: none; }
        .nav-area::-webkit-scrollbar { width: 2px; display: none; }
        .nav-area:hover::-webkit-scrollbar { display: block; }
        .nav-area::-webkit-scrollbar-track { background: transparent; margin: 20px 0; }
        .nav-area::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />
      
      {/* Header Section */}
      <div style={{ padding: '16px 12px', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center' }}>
        {isOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BeakerIcon style={{ width: '20px', color: '#000' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Laboratory Portal
            </span>
          </div>
        ) : (
          <BeakerIcon style={{ width: '24px', color: '#000' }} />
        )}
      </div>

      {/* Navigation */}
      <nav className="nav-area" style={{ flex: 1, padding: '0 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '14px' }}>
            {isOpen && (
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', paddingLeft: '10px' }}>
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href} title={!isOpen ? item.name : ""}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'flex-start' : 'center',
                    padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
                    backgroundColor: isActive ? '#eff6ff' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b',
                    marginBottom: '2px', transition: 'all 0.15s ease',
                    border: isActive ? '1px solid #dbeafe' : '1px solid transparent'
                  }}>
                  <item.icon style={{ 
                    width: '18px',
                    marginRight: isOpen ? '10px' : '0',
                    color: '#000', // STRICT BLACK ICON
                    strokeWidth: isActive ? 2.5 : 2,
                    opacity: isActive ? 1 : 0.7
                  }} />
                  {isOpen && <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500 }}>{item.name}</span>}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer Section */}
      <div style={{ padding: '12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center' }}>
        {isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700 }}>LAB CLOCK</span>
            <span style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 600 }}>{time}</span>
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease', fontSize: '12px', fontWeight: 'bold', color: '#000' }}>«</span>
        </button>
      </div>
    </aside>
  )
}