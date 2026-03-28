"use client";

import { BellIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function LabHeader() {
  return (
    <header style={headerStyle}>
      <div style={searchContainer}>
        <MagnifyingGlassIcon style={{ width: '18px', color: '#94a3b8' }} />
        <input type="text" placeholder="Search Patient or Test ID..." style={searchInput} />
      </div>

      <div style={actionGroup}>
        <div style={statusIndicator}>
          <span style={dot}></span>
          <span style={{ color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>LAB ANALYZER ONLINE</span>
        </div>

        <button style={iconBtn}>
          <BellIcon style={{ width: '22px' }} />
          <span style={notificationBadge}>3</span>
        </button>

        <div style={divider}></div>

        <div style={profileInfo}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Mohamed Berihun</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Senior Lab Tech</div>
          </div>
          <UserCircleIcon style={{ width: '35px', color: '#334155' }} />
        </div>
      </div>
    </header>
  );
}

const headerStyle = { height: '70px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', position: 'sticky' as const, top: 0, zIndex: 10 };
const searchContainer = { display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 15px', borderRadius: '8px', width: '300px', gap: '10px' };
const searchInput = { border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%' };
const actionGroup = { display: 'flex', alignItems: 'center', gap: '20px' };
const iconBtn = { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', position: 'relative' as const };
const notificationBadge = { position: 'absolute' as const, top: '-5px', right: '-5px', background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '10px', fontWeight: 700 };
const divider = { width: '1px', height: '30px', background: '#e2e8f0' };
const profileInfo = { display: 'flex', alignItems: 'center', gap: '12px' };
const statusIndicator = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', padding: '6px 12px', borderRadius: '20px' };
const dot = { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' };