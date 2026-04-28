// app/specialist/appointments/page.tsx
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SpecialistAppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    include: {
      patient: true,
    },
    orderBy: {
      appointmentDate: 'asc',
    },
  });

  // Server Action - Properly typed
  async function updateStatus(formData: FormData) {
    'use server';

    const id = formData.get('id') as string;
    const newStatus = formData.get('status') as string;

    if (!id || !newStatus) {
      throw new Error('Missing required fields');
    }

    await prisma.appointment.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath('/specialist/appointments');
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={{ margin: 0 }}>📅 Appointment Schedule</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.7 }}>
            Manage your upcoming patient follow-ups
          </p>
        </div>
        <Link href="/specialist" style={backBtn}>
          Back to Active Queue
        </Link>
      </div>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              <th style={th}>Date & Time</th>
              <th style={th}>Patient Name</th>
              <th style={th}>MRN</th>
              <th style={th}>Reason</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} style={emptyCell}>
                  No appointments scheduled.
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id} style={tr}>
                  <td style={td}>
                    <div style={{ fontWeight: 700 }}>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-GB')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(appt.appointmentDate).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td style={td}>
                    <strong>{appt.patient.fullName}</strong>
                  </td>
                  <td style={td}>{appt.patient.mrn}</td>
                  <td style={td}>{appt.reason || 'General Follow-up'}</td>
                  <td style={td}>
                    <span style={statusBadge(appt.status)}>{appt.status}</span>
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link href={`/specialist/history/${appt.patientId}`} style={smallBtn}>
                        History
                      </Link>

                      {appt.status === 'SCHEDULED' && (
                        <form action={updateStatus}>
                          <input type="hidden" name="id" value={appt.id} />
                          <input type="hidden" name="status" value="ARRIVED" />
                          <button type="submit" style={arriveBtn}>
                            Mark Arrived
                          </button>
                        </form>
                      )}

                      {appt.status !== 'CANCELLED' && (
                        <form action={updateStatus}>
                          <input type="hidden" name="id" value={appt.id} />
                          <input type="hidden" name="status" value="CANCELLED" />
                          <button type="submit" style={cancelBtn}>
                            Cancel
                          </button>
                        </form>
                      )}
                    </div>
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

// ====================== STYLES ======================
const container = {
  maxWidth: '1200px',
  margin: '40px auto',
  padding: '0 20px',
  fontFamily: 'sans-serif',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '30px',
};

const backBtn = {
  background: '#f1f5f9',
  color: '#0f172a',
  padding: '10px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: 600,
  border: '1px solid #e2e8f0',
};

const tableWrapper = {
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
};

const table = {
  width: '100%',
  borderCollapse: 'collapse' as const,
  textAlign: 'left' as const,
};

const theadRow = { background: '#f8fafc', borderBottom: '2px solid #e2e8f0' };
const th = {
  padding: '15px 20px',
  fontSize: '0.85rem',
  color: '#64748b',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
};

const tr = { borderBottom: '1px solid #f1f5f9' };
const td = { padding: '15px 20px', fontSize: '0.9rem', color: '#1e293b' };
const emptyCell = {
  textAlign: 'center' as const,
  padding: '50px',
  color: '#94a3b8',
};

const smallBtn = {
  padding: '6px 12px',
  background: '#334155',
  color: 'white',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '0.75rem',
  fontWeight: 600,
};

const arriveBtn = {
  padding: '6px 12px',
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const cancelBtn = {
  padding: '6px 12px',
  background: 'transparent',
  color: '#ef4444',
  border: '1px solid #fee2e2',
  borderRadius: '6px',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const statusBadge = (status: string) => {
  const colors: Record<string, string> = {
    SCHEDULED: '#dbeafe',
    ARRIVED: '#dcfce7',
    COMPLETED: '#f1f5f9',
  };
  const textColors: Record<string, string> = {
    SCHEDULED: '#1e40af',
    ARRIVED: '#15803d',
    COMPLETED: '#64748b',
  };

  return {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: 800,
    background: colors[status] || '#f1f5f9',
    color: textColors[status] || '#64748b',
  };
};