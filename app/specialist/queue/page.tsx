// app/specialist/queue/page.tsx
import { prisma } from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SpecialistQueuePage() {
  // Fetch patients ready for consultation
  const waitingPatients = await prisma.queue.findMany({
    where: {
      status: { in: ['TRIAGED', 'EMERGENCY'] }
    },
    include: {
      patient: {
        include: {
          triage: true 
        }
      }
    },
    orderBy: [
      { status: 'desc' },   // Emergency first
      { enteredAt: 'asc' }  // Oldest waiting first
    ]
  });

  return (
    <div style={container}>
      <div style={headerSection}>
        <div>
          <h1 style={pageTitle}>Active Consultation Queue</h1>
          <p style={subtitle}>
            Showing {waitingPatients.length} patients cleared by Triage
          </p>
        </div>
        <div style={navContainer}>
          <Link href="/specialist/appointments" style={navBtn}>📅 Appointments</Link>
          <Link href="/specialist/history" style={navBtn}>🔍 Find Patient</Link>
        </div>
      </div>

      <div style={tableCard}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Priority</th>
              <th style={th}>Patient Details</th>
              <th style={th}>Wait Time</th>
              <th style={th}>Vital Signs</th>
              <th style={th}>Chief Complaint</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {waitingPatients.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyCell}>
                  No patients in the queue. All clear!
                </td>
              </tr>
            ) : (
              waitingPatients.map((entry) => {
                const waitMinutes = Math.floor(
                  (new Date().getTime() - new Date(entry.enteredAt).getTime()) / 60000
                );

                return (
                  <tr 
                    key={entry.id} 
                    style={tr(entry.status === 'EMERGENCY')}
                  >
                    <td style={td}>
                      <span style={statusBadge(entry.status)}>
                        {entry.status}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={patientName}>{entry.patient.fullName}</div>
                      <div style={mrnText}>
                        MRN: {entry.patient.mrn} • {entry.patient.sex}/{entry.patient.age}
                      </div>
                    </td>
                    <td style={td}>
                      <span style={waitTimeStyle}>
                        {waitMinutes} min{waitMinutes !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={vitalsPill}>
                        <span title="Temperature">{entry.patient.triage?.temperature}°C</span> | 
                        <span title="Blood Pressure"> {entry.patient.triage?.bloodPressure}</span> | 
                        <span title="SPO2"> {entry.patient.triage?.spo2}%</span>
                      </div>
                    </td>
                    <td style={complaintTd}>
                      <div style={truncateText}>
                        {entry.patient.triage?.chiefComplaint || '—'}
                      </div>
                    </td>
                    <td style={td}>
                      <Link 
                        href={`/specialist/consultation/${entry.patientId}`} 
                        style={actionBtn(entry.status === 'EMERGENCY')}
                      >
                        Examine Patient
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ====================== STYLES ======================
const container = { 
  maxWidth: '1250px', 
  margin: '40px auto', 
  padding: '0 20px', 
  fontFamily: 'Inter, sans-serif' 
};

const headerSection = { 
  display: 'flex', 
  justifyContent: 'space-between', 
  alignItems: 'center', 
  marginBottom: '25px' 
};

const pageTitle = { 
  margin: 0, 
  color: '#0f172a', 
  fontSize: '1.75rem', 
  fontWeight: 800 
};

const subtitle = { 
  margin: '5px 0 0 0', 
  color: '#64748b',
  fontSize: '0.95rem'
};

const navContainer = { display: 'flex', gap: '12px' };
const navBtn = { 
  padding: '10px 16px', 
  background: '#fff', 
  border: '1px solid #e2e8f0', 
  borderRadius: '8px', 
  textDecoration: 'none', 
  color: '#475569', 
  fontSize: '0.9rem', 
  fontWeight: 600 
};

const tableCard = { 
  background: '#fff', 
  borderRadius: '12px', 
  border: '1px solid #e2e8f0', 
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', 
  overflow: 'hidden' 
};

const table = { 
  width: '100%', 
  borderCollapse: 'collapse' as const, 
  textAlign: 'left' as const 
};

const theadRow = { 
  background: '#f8fafc', 
  borderBottom: '2px solid #e2e8f0' 
};

const th = { 
  padding: '16px 20px', 
  fontSize: '0.75rem', 
  color: '#64748b', 
  fontWeight: 700, 
  textTransform: 'uppercase' as const, 
  letterSpacing: '0.05em' 
};

const tr = (isEmerg: boolean) => ({
  borderBottom: '1px solid #f1f5f9',
  background: isEmerg ? '#fff1f2' : 'transparent',
  transition: 'background 0.2s'
});

const td = { 
  padding: '16px 20px', 
  verticalAlign: 'middle' as const 
};

const patientName = { 
  fontWeight: 700, 
  color: '#1e293b',
  fontSize: '1rem'
};

const mrnText = { 
  fontSize: '0.75rem', 
  color: '#64748b',
  marginTop: '4px'
};

const waitTimeStyle = { 
  fontSize: '0.85rem', 
  fontWeight: 600,
  color: '#334155'
};

const vitalsPill = { 
  background: '#f1f5f9', 
  padding: '4px 10px', 
  borderRadius: '6px', 
  fontSize: '0.8rem', 
  color: '#475569', 
  fontWeight: 600, 
  border: '1px solid #e2e8f0', 
  display: 'inline-block' 
};

const complaintTd = { 
  ...td, 
  maxWidth: '250px' 
};

const truncateText = { 
  whiteSpace: 'nowrap' as const, 
  overflow: 'hidden', 
  textOverflow: 'ellipsis', 
  fontSize: '0.85rem', 
  color: '#475569' 
};

const emptyCell = { 
  textAlign: 'center' as const, 
  padding: '80px', 
  color: '#94a3b8', 
  fontSize: '1rem' 
};

const statusBadge = (status: string) => ({
  padding: '4px 10px',
  borderRadius: '6px',
  fontSize: '0.7rem',
  fontWeight: 800,
  background: status === 'EMERGENCY' ? '#ef4444' : '#dcfce7',
  color: status === 'EMERGENCY' ? '#fff' : '#15803d',
  display: 'inline-block'
});

const actionBtn = (isEmerg: boolean) => ({
  display: 'inline-block',
  padding: '8px 16px',
  background: isEmerg ? '#ef4444' : '#2563eb',
  color: '#fff',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '0.85rem',
  fontWeight: 700,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.2s'
});