'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Boxes, PackageSearch, History, 
  ChevronLeft, ChevronRight, Truck, FileSpreadsheet, 
  AlertTriangle, FlaskConical, Pill, Trash2, 
  Settings, UserCheck, ShoppingCart, PlusCircle 
} from 'lucide-react';

const MENU_ITEMS = [
  { name: 'Stock Dashboard', icon: LayoutDashboard, href: '/inventory' },
  { name: 'Manage Stock', icon: PlusCircle, href: '/inventory/Manage-item' },
  { name: 'Internal Requests', icon: ShoppingCart, href: '/inventory/requests' },
  { name: 'Purchase Orders', icon: Truck, href: '/inventory/procurement' },
  { name: 'Vendor Directory', icon: UserCheck, href: '/inventory/vendors' },
  { name: 'Expiring Items', icon: AlertTriangle, href: '/inventory/expiring' },
  { name: 'Movement History', icon: History, href: '/inventory/logs' },
  { name: 'Waste Disposal', icon: Trash2, href: '/inventory/waste' },
  { name: 'Inventory Reports', icon: FileSpreadsheet, href: '/inventory/reports' },
  { name: 'System Settings', icon: Settings, href: '/inventory/settings' },
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
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: '#ffffff', 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column', 
      borderRight: '1px solid #f1f5f9',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      overflow: 'hidden'
    }}>
      {/* CSS to hide scrollbar while allowing scrolling */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Header */}
      <div style={{ 
        padding: '24px 20px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'flex-start' : 'center',
        borderBottom: '1px solid #f8fafc',
        height: '80px'
      }}>
        {isOpen ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 900, color: '#4f46e5', fontSize: '1.1rem', letterSpacing: '-0.5px' }}>HMS LOGISTICS</span>
            <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '0.65rem', textTransform: 'uppercase' }}>Central Command</span>
          </div>
        ) : (
          <div style={{ fontWeight: 900, color: '#4f46e5', fontSize: '1.2rem' }}>H</div>
        )}
      </div>

      {/* Navigation - Applied 'no-scrollbar' class */}
      <nav 
        className="no-scrollbar"
        style={{ 
          flex: 1, 
          padding: '16px 12px', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isAlert = item.name === "Expiring Items";

            return (
              <Link 
                key={item.name} 
                href={item.href} 
                title={!isOpen ? item.name : ""}
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '12px 14px', 
                  borderRadius: '12px',
                  textDecoration: 'none', 
                  backgroundColor: isActive ? '#eef2ff' : 'transparent',
                  color: isActive ? '#4f46e5' : '#64748b',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                <item.icon 
                  size={22} 
                  style={{ 
                    marginRight: isOpen ? '14px' : '0',
                    flexShrink: 0,
                    color: isActive ? '#4f46e5' : (isAlert ? '#f43f5e' : '#94a3b8')
                  }} 
                />
                
                {isOpen && (
                  <span style={{ fontSize: '0.9rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                    {item.name}
                  </span>
                )}

                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '0',
                    width: '4px',
                    height: '20px',
                    backgroundColor: '#4f46e5',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Area */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid #f8fafc',
        backgroundColor: isOpen ? '#fcfdfe' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        height: '70px'
      }}>
        
        {/* DB CONNECTED (Left) */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#22c55e',
            boxShadow: '0 0 0 3px #dcfce7',
            flexShrink: 0
          }} />
          {isOpen && (
            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b', whiteSpace: 'nowrap' }}>
              DB CONNECTED
            </span>
          )}
        </div>

        {/* Expand/Collapse Toggle (Right) */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ 
            border: 'none', 
            background: '#f1f5f9', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            padding: '8px',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  );
}