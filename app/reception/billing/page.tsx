import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import BillingClient from './BillingClient';
import BillingTabsController from './BillingTabsController';
import PaymentHistory from './PaymentHistory';

export const dynamic = 'force-dynamic';

export default async function BillingDashboard() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [invoices, historyData] = await Promise.all([
    prisma.invoice.findMany({
      include: { patient: true, items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.invoice.findMany({
      where: {
        status: 'PAID',
        paidAt: { gte: oneWeekAgo }
      },
      include: { patient: true, items: true },
      orderBy: { paidAt: 'desc' }
    })
  ]);

  const pendingCount = invoices.filter((i) => i.status === 'PENDING').length;

  async function confirmPayment(formData: FormData) {
    "use server";
    const invoiceId = formData.get("invoiceId") as string;
    if (!invoiceId) throw new Error("Invoice ID is required");

    await prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID', paidAt: new Date() },
        include: { items: true, patient: true }
      });

      const paidIds: string[] = [];
      for (const item of updatedInvoice.items) {
        if (item.labRequestId) paidIds.push(item.labRequestId);
        if (item.radiologyRequestId) paidIds.push(item.radiologyRequestId);
      }

      if (paidIds.length > 0) {
        await tx.notification.updateMany({
          where: { relatedId: { in: paidIds }, paymentStatus: 'PENDING' },
          data: { paymentStatus: 'PAID' },
        });
      }
    });

    revalidatePath('/reception-triage/billing');
  }

  return (
    <div className="billing-container" style={container}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Desktop Defaults */
        .status-mobile-only { display: none; }
        .services-wrapper { 
            display: flex; 
            flex-direction: row; 
            flex-wrap: nowrap; 
            gap: 6px; 
            align-items: center; 
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          
          .billing-container {
             padding: 8px 10px !important;
          }

          /* Global Shrink for Mobile */
          .billing-table {
            table-layout: fixed;
            width: 100% !important;
          }

          .billing-table td {
            padding: 6px 4px !important;
          }

          /* Scale text down to roughly 50-60% */
          .patient-name-text { font-size: 0.65rem !important; }
          .mrn-text { font-size: 0.5rem !important; }
          .amount-text { font-size: 0.65rem !important; }
          
          .mobile-truncate {
            display: block !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            width: 100%;
          }

          /* Status shown inside Patient column */
          .status-mobile-only { 
            display: inline-flex !important; 
            margin-top: 2px;
          }

          .status-badge-mobile {
            font-size: 0.45rem !important; 
            padding: 1px 3px !important;
            line-height: 1 !important;
            font-weight: 800 !important;
          }

          /* Shrink Action Buttons specifically for mobile */
          .billing-table td:last-child button,
          .billing-table td:last-child a {
            font-size: 0.6rem !important; 
            padding: 4px 6px !important;
            height: auto !important;
            min-width: unset !important;
          }
          
          header h1 { font-size: 1.1rem !important; }
          header span { font-size: 0.6rem !important; }
        }
      `}} />

      <header style={header}>
        <div>
          <h1 style={title}>Billing & Clearance</h1>
          <div style={miniStats}>
            <span style={subtitle}>Manage payments and services</span>
            <span style={divider}>|</span>
            <span style={pendingText}>
              Pending: <strong>{pendingCount}</strong>
            </span>
          </div>
        </div>
      </header>

      <div className="mobile-full-width">
        <BillingTabsController 
          invoiceTab={
            <div key="invoice-content-wrapper" style={tableWrapper}>
              <table className="billing-table" style={table}>
                <thead>
                  <tr style={tableHeaderRow}>
                    <th className="hide-mobile" style={th}>Date & Time</th>
                    <th style={{...th, width: '45%'}}>Patient Details</th>
                    <th className="hide-mobile" style={th}>Services</th>
                    <th style={{...th, width: '25%'}}>Amount</th>
                    <th className="hide-mobile" style={th}>Status</th>
                    <th style={{...th, textAlign: 'right', width: '30%'}}>Action</th>
                  </tr>
                </thead>
                <tbody style={tbody}>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={tableRow}>
                      <td className="hide-mobile" style={td}>
                        <div style={dateStyle}>{new Date(inv.createdAt).toLocaleDateString('en-GB')}</div>
                        <div style={timeStyle}>{new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td style={td}>
                        <div className="mobile-truncate patient-name-text" style={patientName}>{inv.patient.fullName}</div>
                        <div className="mobile-truncate mrn-text" style={mrnStyle}>MRN: {inv.patient.mrn}</div>
                        <div className="status-mobile-only">
                           <span className="status-badge-mobile" style={getStatusStyle(inv.status)}>{inv.status}</span>
                        </div>
                      </td>
                      <td className="hide-mobile" style={td}>
                        <div className="services-wrapper">
                          {inv.items.slice(0, 2).map((item) => (
                            <span key={item.id} style={itemTag}>{item.serviceName}</span>
                          ))}
                          {inv.items.length > 2 && <span style={moreTag}>+{inv.items.length - 2}</span>}
                        </div>
                      </td>
                      <td style={td}>
                        <div className="mobile-truncate amount-text" style={amountStyle}>{inv.totalAmount.toLocaleString()} ETB</div>
                      </td>
                      <td className="hide-mobile" style={td}>
                        <span style={getStatusStyle(inv.status)}>{inv.status}</span>
                      </td>
                      <td style={{...td, textAlign: 'right'}}>
                        <BillingClient invoice={inv} confirmPaymentAction={confirmPayment} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {invoices.length === 0 && (
                <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem'}}>
                  No active invoices found.
                </div>
              )}
            </div>
          }
          historyTab={<PaymentHistory key="payment-history-tab" data={historyData} />}
        />
      </div>
    </div>
  );
}

/* Constants Styles */
const container = { padding: '24px 32px', background: '#f8fafc', minHeight: '100vh' };
const header = { marginBottom: '24px' };
const title = { color: '#0f172a', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.025em' };
const miniStats = { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' };
const subtitle = { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 };
const divider = { color: '#e2e8f0' };
const pendingText = { color: '#0f172a', fontSize: '0.85rem' };
const tableWrapper = { width: '100%', overflowX: 'hidden' as const, marginTop: '8px' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const tbody = { background: 'transparent' };
const tableHeaderRow = { borderBottom: '2px solid #e2e8f0' };
const th = { padding: '12px 16px', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' as const, textAlign: 'left' as const };
const td = { padding: '16px 16px', borderBottom: '1px solid #e2e8f0', verticalAlign: 'middle' as const };
const tableRow = { transition: 'background 0.2s ease' };
const dateStyle = { fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' };
const timeStyle = { fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 };
const patientName = { fontWeight: 800, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' };
const mrnStyle = { fontSize: '0.8rem', color: '#64748b', fontWeight: 500 };
const amountStyle = { fontSize: '1rem', fontWeight: 800, color: '#0f172a' };
const itemTag = { background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' as const };
const moreTag = { background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600 };

const getStatusStyle = (status: string) => ({
  display: 'inline-flex',
  padding: '3px 10px', 
  borderRadius: '99px', 
  fontSize: '0.65rem', 
  fontWeight: 900,
  textTransform: 'uppercase' as const,
  background: status === 'PAID' ? '#dcfce7' : '#fef3c7', 
  color: status === 'PAID' ? '#166534' : '#92400e',
});