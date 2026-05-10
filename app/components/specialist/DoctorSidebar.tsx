'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FolderOpen, 
  Footprints, 
  FileText, 
  Wrench, 
  Settings, 
  BarChart3,
  ChevronRight,
  LucideIcon // Added this import for typing
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

// 1. Define the Interface to resolve TS2339
interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
  hasCount?: boolean;    // Optional
  hasLabCount?: boolean; // Optional
}

interface MenuGroups {
  group: string;
  items: MenuItem[];
}

// ... (fetch functions remain the same)
async function fetchQueueCount(): Promise<number> {
  try {
    const res = await fetch('/api/specialist/queue-count', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) { return 0; }
}

async function fetchUnreadLabNotificationsCount(): Promise<number> {
  try {
    const res = await fetch('/api/notifications/lab-unread-count', { method: 'GET', cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) { return 0; }
}

// 2. Apply the interface to the menu constant
const SPECIALIST_MENU: MenuGroups[] = [
  {
    group: "Clinical",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, href: "/specialist" },
      { name: "Queue", icon: Users, href: "/specialist/queue", hasCount: true },
      { name: "Appointments", icon: Calendar, href: "/specialist/appointments" },
    ]
  },
  {
    group: "Consultation",
    items: [
      { name: "Records", icon: FolderOpen, href: "/specialist/records", hasLabCount: true },
    ]
  },
  {
    group: "In-Patient",
    items: [
      { name: "Rounds", icon: Footprints, href: "/specialist/rounds" },
      { name: "Discharge", icon: FileText, href: "/specialist/discharge" },
    ]
  },
  {
    group: "Personal",
    items: [
      { name: "Equipment", icon: Wrench, href: "/specialist/equipment" },
      { name: "Settings", icon: Settings, href: "/specialist/settings" },
      { name: "Reports", icon: BarChart3, href: "/specialist/reports" },
    ]
  }
]

export default function DoctorSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [time, setTime] = useState("")
  const [queueCount, setQueueCount] = useState<number>(0)
  const [unreadLabCount, setUnreadLabCount] = useState<number>(0)

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const loadData = async () => {
      const [q, l] = await Promise.all([fetchQueueCount(), fetchUnreadLabNotificationsCount()])
      setQueueCount(q)
      setUnreadLabCount(l)
    }
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!pathname?.startsWith('/specialist')) return null;

  return (
    <aside style={{ 
      width: isOpen ? '260px' : '72px',
      transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#f8fafc',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #e2e8f0',
      zIndex: 50,
      flexShrink: 0,
    }}>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />

      {/* Header */}
      <div style={{ 
        padding: '20px 16px', 
        minHeight: '64px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'flex-start' : 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {isOpen ? (
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0284c8', letterSpacing: '1px', textTransform: 'uppercase' }}>
            SPECIALIST PORTAL
          </span>
        ) : (
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284c8' }} />
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" style={{ flex: 1, padding: '16px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {SPECIALIST_MENU.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '22px' }}>
            {isOpen && (
              <p style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px' }}>
                {group.group}
              </p>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/specialist' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  title={!isOpen ? item.name : ""}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0369a1' : '#64748b',
                    marginBottom: '3px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    style={{ minWidth: '20px', marginRight: isOpen ? '12px' : '0' }} 
                  />
                  
                  {isOpen && (
                    <span style={{ fontSize: '0.875rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', flex: 1 }}>
                      {item.name}
                    </span>
                  )}

                  {/* Now TypeScript knows these properties might exist */}
                  {item.hasCount && queueCount > 0 && (
                    <span style={{
                      position: isOpen ? 'static' : 'absolute',
                      top: isOpen ? 'auto' : '6px',
                      right: isOpen ? 'auto' : '6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: '#fee2e2',
                      color: '#ef4444',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      lineHeight: 1,
                    }}>
                      {queueCount}
                    </span>
                  )}

                  {item.hasLabCount && unreadLabCount > 0 && (
                    <span style={{
                      position: isOpen ? 'static' : 'absolute',
                      top: isOpen ? 'auto' : '6px',
                      right: isOpen ? 'auto' : '6px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: '#fef3c7',
                      color: '#d97706',
                      padding: '2px 6px',
                      borderRadius: '10px',
                      lineHeight: 1,
                    }}>
                      {unreadLabCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #e2e8f0', 
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center'
      }}>
        {isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.58rem', color: '#94a3b8', fontWeight: 600 }}>SESSION TIME</span>
            <span style={{ fontSize: '0.93rem', color: '#1e293b', fontWeight: 700 }}>
              {time || '--:--'}
            </span>
          </div>
        )}

        <button 
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#334155',
          }}
          title={isOpen ? "Collapse" : "Expand"}
        >
          <ChevronRight size={18} style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }} />
        </button>
      </div>
    </aside>
  )
}