'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Activity, Users, 
  ChevronLeft, ChevronRight, Siren, 
  Baby, BedDouble, ClipboardList, 
  Stethoscope, FlameKindling, HeartPulse, 
  UserPlus2, Timer, Settings, Wrench, 
  ShieldCheck, Box, History
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

async function fetchSidebarCount(url: string): Promise<number> {
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return 0;
    const data = await res.json();
    return data.count || 0;
  } catch (error) {
    return 0;
  }
}

const MENU_ITEMS = [
  { 
    group: "Overview", 
    items: [
      { name: 'Triage Dashboard', icon: LayoutDashboard, href: '/triage' },
      { name: 'Active Queue', icon: Users, href: '/triage/queue', countKey: 'queue' },
    ]
  },
  { 
    group: "Emergency Actions", 
    items: [
      { name: 'Quick Admission', icon: UserPlus2, href: '/triage/emergency/quick-reg' },
      { name: 'Trauma & Injury', icon: FlameKindling, href: '/triage/emergency/trauma' },
      { name: 'Cardiac Alert', icon: HeartPulse, href: '/triage/emergency/cardiac' },
      { name: 'ER Bed Mapping', icon: BedDouble, href: '/triage/emergency/beds' },
    ]
  },
  { 
    group: "Maternity (Labor)", 
    items: [
      { name: 'Active Labor Ward', icon: Baby, href: '/triage/maternity/labor', countKey: 'labor' },
      { name: 'NICU Admission', icon: Stethoscope, href: '/triage/maternity/nicu' },
      { name: 'Postnatal Care', icon: Activity, href: '/triage/maternity/postnatal' },
    ]
  },
  { 
    group: "Clinical Actions", 
    items: [
      { name: 'Vitals Record', icon: Activity, href: '/triage/vitals' },
      { name: 'Doctor Notification', icon: Siren, href: '/triage/alerts', countKey: 'alerts' },
      { name: 'Assessment Forms', icon: ClipboardList, href: '/triage/assessment' },
    ]
  },
  { 
    group: "Management & Tools", 
    items: [
      { name: 'Unit Settings', icon: Settings, href: '/triage/management/settings' },
      { name: 'Equipment Status', icon: Wrench, href: '/triage/management/equipment' },
      { name: 'Inventory & Meds', icon: Box, href: '/triage/management/inventory' },
      { name: 'Security & Access', icon: ShieldCheck, href: '/triage/management/security' },
      { name: 'System Logs', icon: History, href: '/triage/management/logs' },
    ]
  },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [counts, setCounts] = useState({ queue: 0, labor: 0, alerts: 0 });

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshCounts = useCallback(async () => {
    const [q, l, a] = await Promise.all([
      fetchSidebarCount('/api/triage/queue-count'),
      fetchSidebarCount('/api/triage/labor-count'),
      fetchSidebarCount('/api/triage/alerts-count')
    ]);
    setCounts({ queue: q, labor: l, alerts: a });
  }, []);

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 30000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  if (!pathname?.startsWith('/triage')) return null;

  return (
    <aside style={{ 
      width: isOpen ? '260px' : '72px', 
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#ffffff', 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column', 
      borderRight: '1px solid #f1f5f9',
      position: 'relative',
      zIndex: 50
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* Header Area */}
      <div style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'flex-start' : 'center',
        minHeight: '80px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '4px', height: '20px', backgroundColor: '#b91c1c', borderRadius: '2px' }} />
          {isOpen && (
            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Triage Unit
            </span>
          )}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="no-scrollbar" style={{ 
        flex: 1, 
        padding: '10px 10px', 
        overflowY: 'auto',
      }}>
        {MENU_ITEMS.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '24px' }}>
            {isOpen && (
              <p style={{ 
                fontSize: '0.65rem', 
                color: '#94a3b8', 
                fontWeight: 800, 
                paddingLeft: '12px', 
                textTransform: 'uppercase',
                marginBottom: '10px',
                letterSpacing: '1.2px'
              }}>
                {group.group}
              </p>
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href;
              const isUrgentGroup = group.group === "Emergency Actions" || group.group === "Maternity (Labor)";
              const isManagement = group.group === "Management & Tools";
              const currentCount = item.countKey ? counts[item.countKey as keyof typeof counts] : 0;

              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  title={!isOpen ? item.name : ""}
                  style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px', 
                    borderRadius: '8px',
                    textDecoration: 'none', 
                    marginBottom: '4px',
                    backgroundColor: isActive 
                      ? (isUrgentGroup ? '#fef2f2' : isManagement ? '#f0f9ff' : '#f8fafc') 
                      : 'transparent',
                    color: isActive 
                      ? (isUrgentGroup ? '#b91c1c' : isManagement ? '#0369a1' : '#0f172a') 
                      : '#64748b',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    justifyContent: isOpen ? 'flex-start' : 'center'
                  }}
                >
                  <item.icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    style={{ 
                      marginRight: isOpen ? '12px' : '0',
                      color: isActive 
                        ? (isUrgentGroup ? '#b91c1c' : isManagement ? '#0ea5e9' : '#1e293b') 
                        : '#94a3b8'
                    }} 
                  />
                  {isOpen && (
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                  )}

                  {currentCount > 0 && (
                    isOpen ? (
                      <span style={{
                        marginLeft: 'auto',
                        fontSize: '0.65rem',
                        fontWeight: 900,
                        backgroundColor: isUrgentGroup ? '#b91c1c' : '#64748b',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '5px'
                      }}>
                        {currentCount}
                      </span>
                    ) : (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: '#b91c1c', border: '2px solid white'
                      }} />
                    )
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div style={{ 
        padding: '12px', 
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {isOpen && (
          <div style={{ 
            flex: 1,
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            color: '#64748b'
          }}>
            <Timer size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {time}
            </span>
          </div>
        )}

        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            width: isOpen ? '40px' : '100%',
            height: '40px',
            border: 'none', 
            background: isOpen ? '#f1f5f9' : '#f8fafc', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
          onMouseOut={(e) => e.currentTarget.style.background = isOpen ? '#f1f5f9' : '#f8fafc'}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>
    </aside>
  );
}