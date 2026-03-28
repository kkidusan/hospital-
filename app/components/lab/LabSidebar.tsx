"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BeakerIcon, 
  HomeIcon, 
  QueueListIcon, 
  ClipboardDocumentCheckIcon, 
  WrenchScrewdriverIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  AdjustmentsVerticalIcon,
  ExclamationCircleIcon // Added this for Pending Tests
} from '@heroicons/react/24/outline';

const menuItems = [
  { name: 'Dashboard Home', href: '/laboratory', icon: HomeIcon },
  { name: 'New Test Requests', href: '/laboratory/requests', icon: QueueListIcon },
  { name: 'Sample Collection', href: '/laboratory/samples', icon: UserGroupIcon },
  { name: 'Pending Tests', href: '/laboratory/pending', icon: ExclamationCircleIcon }, // Fixed
  { name: 'Completed Tests', href: '/laboratory/completed', icon: ClipboardDocumentCheckIcon },
  { name: 'Test Categories', href: '/laboratory/categories', icon: AdjustmentsVerticalIcon },
  { name: 'Equipment List', href: '/laboratory/equipment', icon: WrenchScrewdriverIcon },
  { name: 'Quality Control', href: '/laboratory/qc', icon: ChartBarIcon },
];

export default function LabSidebar() {
  const pathname = usePathname();

  return (
    <aside style={sidebarStyle}>
      <div style={logoSection}>
        <BeakerIcon style={{ width: '32px', color: '#3b82f6' }} />
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>BRUH LAB</h2>
      </div>
      
      <nav style={{ padding: '15px 10px', flex: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} style={navLink(isActive)}>
              <item.icon style={{ width: '20px', marginRight: '12px', strokeWidth: 2 }} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div style={footerStyle}>
        <div style={versionBadge}>v2.4.0-Stable</div>
      </div>
    </aside>
  );
}

// --- STYLES ---
const sidebarStyle = { 
  width: '260px', 
  background: '#ffffff', 
  borderRight: '1px solid #e2e8f0', 
  display: 'flex', 
  flexDirection: 'column' as const, 
  height: '100vh', 
  position: 'sticky' as const, 
  top: 0 
};
const logoSection = { padding: '25px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' };
const navLink = (active: boolean) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  textDecoration: 'none',
  color: active ? '#2563eb' : '#64748b',
  background: active ? '#eff6ff' : 'transparent',
  borderRadius: '10px',
  marginBottom: '4px',
  fontWeight: 600,
  fontSize: '0.875rem',
  transition: 'all 0.2s'
});
const footerStyle = { padding: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' as const };
const versionBadge = { fontSize: '0.7rem', color: '#94a3b8', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' };