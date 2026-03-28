import { prisma } from '@/lib/db';

import { revalidatePath } from 'next/cache';



export default async function BillingDashboard() {

  // Fetch all invoices to allow filtering in the UI

  const invoices = await (prisma as any).invoice.findMany({

    include: { 

      patient: true, 

      items: true 

    },

    orderBy: { createdAt: 'desc' }

  });



  const pendingCount = invoices.filter((i: any) => i.status === 'PENDING').length;



  // SERVER ACTION: Confirm Payment

  async function confirmPayment(formData: FormData) {

    "use server";

    const invoiceId = formData.get("invoiceId") as string;



    await prisma.$transaction(async (tx) => {

      // 1. Mark Invoice as Paid

      await (tx as any).invoice.update({

        where: { id: invoiceId },

        data: { 

          status: 'PAID',

          paidAt: new Date() // Assuming you have this field

        }

      });



      // 2. Update linked services (Lab/Rad)

      const items = await (tx as any).invoiceItem.findMany({ where: { invoiceId } });

      

      for (const item of items) {

        const updateData = { status: 'PAID' };

        

        if (item.serviceType === 'LAB') {

          await (tx as any).labRequest.update({

            where: { id: item.serviceId },

            data: updateData

          });

        } else if (item.serviceType === 'RADIOLOGY') {

          await (tx as any).radiologyRequest.update({

            where: { id: item.serviceId },

            data: updateData

          });

        }

      }

    });



    revalidatePath('/reception/billing');

  }



  return (

    <div style={container}>

      {/* Header Section */}

      <header style={header}>

        <div>

          <h1 style={title}>Billing & Financial Clearance</h1>

          <p style={subtitle}>Manage patient invoices and release medical orders.</p>

        </div>

        <div style={statsContainer}>

          <div style={statCard}>

            <span style={statLabel}>Pending Payments</span>

            <span style={statValue}>{pendingCount}</span>

          </div>

        </div>

      </header>



      {/* Modern Table Layout */}

      <div style={tableWrapper}>

        <table style={table}>

          <thead>

            <tr style={tableHeaderRow}>

              <th style={th}>Date</th>

              <th style={th}>Patient Name</th>

              <th style={th}>Services</th>

              <th style={th}>Total Amount</th>

              <th style={th}>Status</th>

              <th style={th}>Actions</th>

            </tr>

          </thead>

          <tbody>

            {invoices.map((inv: any) => (

              <tr key={inv.id} style={tableRow}>

                <td style={td}>

                  {new Date(inv.createdAt).toLocaleDateString()}

                  <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>

                    {new Date(inv.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}

                  </div>

                </td>

                <td style={td}>

                  <div style={patientName}>{inv.patient.fullName}</div>

                  <div style={{fontSize: '0.8rem', color: '#64748b'}}>ID: {inv.patient.id.slice(-6)}</div>

                </td>

                <td style={td}>

                  {inv.items.map((item: any) => (

                    <div key={item.id} style={itemTag}>

                      {item.serviceName}

                    </div>

                  ))}

                </td>

                <td style={{...td, fontWeight: 700, color: '#1e293b'}}>

                  {inv.totalAmount.toLocaleString()} ETB

                </td>

                <td style={td}>

                  <span style={getStatusStyle(inv.status)}>

                    {inv.status}

                  </span>

                </td>

                <td style={td}>

                  {inv.status === 'PENDING' ? (

                    <form action={confirmPayment}>

                      <input type="hidden" name="invoiceId" value={inv.id} />

                      <button type="submit" style={payBtn}>

                        Process Payment

                      </button>

                    </form>

                  ) : (

                    <button disabled style={receiptBtn}>

                      View Receipt

                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

        

        {invoices.length === 0 && (

          <div style={emptyState}>No billing records found.</div>

        )}

      </div>

    </div>

  );

}



// --- HELPER FUNCTIONS ---

const getStatusStyle = (status: string) => {

  const base = {

    padding: '4px 10px',

    borderRadius: '12px',

    fontSize: '0.75rem',

    fontWeight: 700,

    textTransform: 'uppercase' as const,

  };



  switch (status) {

    case 'PAID':

      return { ...base, background: '#dcfce7', color: '#166534' };

    case 'PENDING':

      return { ...base, background: '#fef9c3', color: '#854d0e' };

    case 'CANCELLED':

      return { ...base, background: '#fee2e2', color: '#991b1b' };

    default:

      return { ...base, background: '#f1f5f9', color: '#475569' };

  }

};



// --- STYLES (CSS-in-JS) ---

const container = { padding: '32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' };

const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' };

const title = { color: '#0f172a', fontSize: '1.8rem', fontWeight: 800, margin: 0 };

const subtitle = { color: '#64748b', margin: '4px 0 0 0' };



const statsContainer = { display: 'flex', gap: '16px' };

const statCard = { background: '#fff', padding: '12px 24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' as const };

const statLabel = { fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' as const };

const statValue = { fontSize: '1.5rem', fontWeight: 800, color: '#2563eb' };



const tableWrapper = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };

const table = { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const };

const tableHeaderRow = { background: '#f1f5f9' };

const th = { padding: '16px', color: '#475569', fontSize: '0.85rem', fontWeight: 600 };

const td = { padding: '16px', borderTop: '1px solid #f1f5f9', verticalAlign: 'middle' as const };

const tableRow = { transition: 'background 0.2s' };



const patientName = { fontWeight: 600, color: '#1e293b' };

const itemTag = { display: 'inline-block', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', marginRight: '4px', marginBottom: '4px' };



const payBtn = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' };

const receiptBtn = { background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'not-allowed', fontSize: '0.85rem' };

const emptyState = { padding: '40px', textAlign: 'center' as const, color: '#94a3b8' };  