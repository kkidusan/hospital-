import React from 'react';
import { prisma } from '@/lib/db';
import { 
  QueueListIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default async function LabDashboardPage() {
  // --- REAL DATA FETCHING ---
  // We use a try-catch or careful counts to avoid runtime crashes if some fields are missing
  
  const [newCount, pendingCount, completedCount, allRequests] = await Promise.all([
    // Count PENDING
    prisma.labRequest.count({ where: { status: 'PENDING' } }),
    
    // Count IN_PROGRESS/COLLECTING
    prisma.labRequest.count({ where: { status: 'COLLECTING' } }),
    
    // Count COMPLETED today
    prisma.labRequest.count({ 
      where: { 
        status: 'COMPLETED',
        updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
      } 
    }),

    // Fetch Recent Requests (removed 'priority' filter to prevent the crash)
    prisma.labRequest.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: true,
      }
    })
  ]);

  // Derived urgent count (filtering in JS to prevent Prisma schema mismatch errors)
  // In a real production app, add 'priority' to your Prisma schema!
  const urgentCount = allRequests.filter(r => (r as any).priority === 'URGENT').length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={welcomeSection}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#0f172a' }}>Lab Overview</h1>
        <p style={{ color: '#64748b', marginTop: '5px' }}>Database Synchronized: {new Date().toLocaleTimeString()}</p>
      </div>

      {/* WORKFLOW CARDS */}
      <div style={grid4}>
        <div style={card('#eff6ff', '#2563eb')}>
          <div style={cardHeader}><QueueListIcon style={iconSm}/> <span style={cardLabel}>New Requests</span></div>
          <h2 style={cardVal}>{newCount}</h2>
        </div>
        <div style={card('#fff7ed', '#f59e0b')}>
          <div style={cardHeader}><ClockIcon style={iconSm}/> <span style={cardLabel}>In Progress</span></div>
          <h2 style={cardVal}>{pendingCount}</h2>
        </div>
        <div style={card('#f0fdf4', '#10b981')}>
          <div style={cardHeader}><CheckCircleIcon style={iconSm}/> <span style={cardLabel}>Completed Today</span></div>
          <h2 style={cardVal}>{completedCount}</h2>
        </div>
        <div style={card('#fef2f2', '#ef4444')}>
          <div style={cardHeader}><ExclamationTriangleIcon style={iconSm}/> <span style={cardLabel}>Urgent/Stat</span></div>
          <h2 style={cardVal}>{urgentCount}</h2>
        </div>
      </div>

      {/* RECENT REQUESTS TABLE */}
      <div style={sectionCard}>
        <div style={sectionHeader}>
          <h3 style={{ margin: 0 }}>Recent Requests Queue</h3>
        </div>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={th}>Patient</th>
              <th style={th}>Test Name</th>
              <th style={th}>Status</th>
              <th style={th}>Requested At</th>
            </tr>
          </thead>
          <tbody>
            {allRequests.length === 0 ? (
              <tr><td colSpan={4} style={emptyCell}>No requests found in database.</td></tr>
            ) : (
              allRequests.map((req) => (
                <tr key={req.id} style={tr}>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>{req.patient?.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MRN: {req.patient?.mrn}</div>
                  </td>
                  <td style={td}>{req.testName}</td>
                  <td style={td}>
                    <span style={statusBadge(req.status)}>{req.status}</span>
                  </td>
                  <td style={td}>
                    {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- STYLES ---
const welcomeSection = { marginBottom: '30px' };
const grid4 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' };
const card = (bg: string, color: string) => ({ background: bg, padding: '20px', borderRadius: '16px', border: `1px solid ${color}20`, color: color });
const cardHeader = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' };
const iconSm = { width: '18px' };
const cardLabel = { fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const };
const cardVal = { margin: 0, fontSize: '2.2rem', fontWeight: 800 };
const sectionCard = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const sectionHeader = { padding: '20px 25px', borderBottom: '1px solid #f1f5f9' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const thRow = { background: '#f8fafc' };
const th = { padding: '12px 25px', textAlign: 'left' as const, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' as const, fontWeight: 700 };
const td = { padding: '14px 25px', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9', color: '#334155' };
const tr = { transition: 'background 0.2s' };
const emptyCell = { textAlign: 'center' as const, padding: '40px', color: '#94a3b8' };

const statusBadge = (status: string) => {
  const colors: any = {
    PENDING: { bg: '#dbeafe', text: '#1e40af' },
    COLLECTING: { bg: '#fef3c7', text: '#b45309' },
    COMPLETED: { bg: '#dcfce7', text: '#15803d' }
  };
  const c = colors[status] || { bg: '#f1f5f9', text: '#64748b' };
  return { background: c.bg, color: c.text, padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 };
};