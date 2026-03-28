import { prisma } from '@/lib/db'
import Link from 'next/link'

export const revalidate = 0;

async function getSpecialistData() {
  const [queue, stats] = await Promise.all([
    prisma.queue.findMany({
      // FIX: Include 'WAITING' so Direct Send patients appear
      where: { 
        OR: [
          { status: 'TRIAGED' },
          { status: 'WAITING' } 
        ]
      },
      include: {
        patient: {
          include: { triage: true }
        }
      },
      orderBy: { enteredAt: 'asc' }
    }),
    prisma.queue.groupBy({
      by: ['status'],
      _count: { _all: true }
    })
  ]);

  return { queue, stats };
}

export default async function SpecialistDashboard() {
  const { queue, stats } = await getSpecialistData();

  const summaryCards = [
    { label: "In Queue", value: queue.length, color: "#2563eb", icon: "👥" },
    { label: "Emergency", value: queue.filter(q => q.patient.triage?.triageLevel === '1').length, color: "#dc2626", icon: "🚨" },
    { label: "Completed", value: stats.find(s => s.status === 'COMPLETED')?._count._all || 0, color: "#059669", icon: "✅" },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>Specialist Queue</h1>
        <p style={{ color: '#64748b' }}>Select a patient to begin consultation.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
        {summaryCards.map((card, idx) => (
          <div key={idx} style={cardStyle}>
            <div style={{ fontSize: '1.2rem', color: card.color, fontWeight: 800 }}>{card.label}</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={tableContainer}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Priority / Type</th>
              <th style={thStyle}>Wait Time</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 700 }}>{item.patient.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>MRN: {item.patient.mrn}</div>
                </td>
                <td style={tdStyle}>
                  {item.patient.triage ? (
                    <span style={getEsiStyle(item.patient.triage.triageLevel)}>Level {item.patient.triage.triageLevel}</span>
                  ) : (
                    <span style={directBadge}>Direct Consultation</span>
                  )}
                </td>
                <td style={tdStyle}>{new Date(item.enteredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <Link href={`/specialist/consultation/${item.patientId}`}>
                    <button style={btnStyle}>Attend Patient</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardStyle = { background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' };
const tableContainer = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const thStyle = { padding: '16px', fontWeight: 800 };
const tdStyle = { padding: '16px' };
const btnStyle = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' };
const directBadge = { background: '#f0f9ff', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 };
function getEsiStyle(l: any) { return { background: l === '1' ? '#fee2e2' : '#fef9c3', color: l === '1' ? '#991b1b' : '#854d0e', padding: '4px 10px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }; }