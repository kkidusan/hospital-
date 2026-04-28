'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

// Fetch queue count (existing)
async function fetchQueueCount(): Promise<number> {
  try {
    const res = await fetch('/api/specialist/queue-count', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('Failed to fetch queue count:', error);
    return 0;
  }
}

// NEW: Fetch unread lab result notifications count
async function fetchUnreadLabNotificationsCount(): Promise<number> {
  try {
    const res = await fetch('/api/notifications/lab-unread-count', {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    console.error('Failed to fetch unread lab notifications:', error);
    return 0;
  }
}

const SPECIALIST_MENU = [
  {
    group: "Clinical",
    items: [
      { name: "Dashboard", icon: "🏠", href: "/specialist" },
      { name: "Queue", icon: "👥", href: "/specialist/queue", hasCount: true },
      { name: "Appointments", icon: "⏰", href: "/specialist/appointments" },
    ]
  },
  {
    group: "Consultation",
    items: [
      { 
        name: "Records", 
        icon: "📁", 
        href: "/specialist/records", 
        hasLabCount: true   // NEW: For lab notifications
      },
    ]
  },
  {
    group: "In-Patient",
    items: [
      { name: "Rounds", icon: "🚶", href: "/specialist/rounds" },
      { name: "Discharge", icon: "📄", href: "/specialist/discharge" },
    ]
  },
  {
    group: "Personal",
    items: [
      { name: "Equipment", icon: "⚙️", href: "/specialist/equipment" },
      { name: "Settings", icon: "⚙️", href: "/specialist/settings" },
      { name: "Reports", icon: "📊", href: "/specialist/reports" },
    ]
  }
]

export default function DoctorSidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname()
  const [time, setTime] = useState("")
  const [queueCount, setQueueCount] = useState<number>(0)
  const [unreadLabCount, setUnreadLabCount] = useState<number>(0)   // NEW

  // Live time update
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const timer = setInterval(updateTime, 60000)
    return () => clearInterval(timer)
  }, [])

  // Queue count with auto-refresh
  useEffect(() => {
    const loadQueueCount = async () => {
      const count = await fetchQueueCount()
      setQueueCount(count)
    }

    loadQueueCount()
    const interval = setInterval(loadQueueCount, 25000)

    return () => clearInterval(interval)
  }, [])

  // NEW: Unread Lab Notifications count with auto-refresh
  useEffect(() => {
    const loadLabNotifications = async () => {
      const count = await fetchUnreadLabNotificationsCount()
      setUnreadLabCount(count)
    }

    loadLabNotifications()
    const interval = setInterval(loadLabNotifications, 30000) // Refresh every 30 seconds

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
      
      {/* Scrollbar Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sidebar-nav {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .sidebar-nav::-webkit-scrollbar { width: 3px; }
        .sidebar-nav:hover::-webkit-scrollbar { display: block; }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
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
        {isOpen && (
          <span style={{ 
            fontSize: '0.68rem', 
            fontWeight: 800, 
            color: '#0284c8', 
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            SPECIALIST PORTAL
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav 
        className="sidebar-nav"
        style={{ 
          flex: 1, 
          padding: '16px 8px', 
          overflowY: 'auto' 
        }}
      >
        {SPECIALIST_MENU.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '22px' }}>
            {isOpen && (
              <p style={{ 
                fontSize: '0.62rem', 
                fontWeight: 700, 
                color: '#94a3b8', 
                textTransform: 'uppercase', 
                marginBottom: '8px',
                paddingLeft: '12px'
              }}>
                {group.group}
              </p>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || 
                              (item.href !== '/specialist' && pathname.startsWith(item.href));

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  title={!isOpen ? item.name : ""}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: isActive ? '#e0f2fe' : 'transparent',
                    color: isActive ? '#0f172a' : '#64748b',
                    marginBottom: '3px',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '1.18rem', 
                      marginRight: isOpen ? '12px' : '0',
                      opacity: isActive ? 1 : 0.8
                    }}>
                      {item.icon}
                    </span>
                    
                    {isOpen && (
                      <span style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: isActive ? 700 : 500,
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}
                      </span>
                    )}
                  </div>

                  {/* Queue Count */}
                  {item.hasCount && queueCount > 0 && isOpen && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#ef4444',
                      marginLeft: '8px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      lineHeight: 1,
                    }}>
                      {queueCount}
                    </span>
                  )}

                  {/* NEW: Lab Result Notifications Count (for Records) */}
                  {item.hasLabCount && unreadLabCount > 0 && isOpen && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: '#f59e0b',           // Orange color for lab results
                      marginLeft: '8px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      lineHeight: 1,
                      letterSpacing: '0.5px'
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

      {/* Footer - unchanged */}
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
            fontSize: '15px',
          }}
          title={isOpen ? "Collapse" : "Expand"}
        >
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }}>
            →
          </span>
        </button>
      </div>
    </aside>
  )
}