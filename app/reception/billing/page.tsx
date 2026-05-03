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
    <div style={container}>
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

      <BillingTabsController 
        invoiceTab={
          <div key="invoice-content-wrapper" style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={th}>Date & Time</th>
                  <th style={th}>Patient Details</th>
                  <th style={th}>Services</th>
                  <th style={th}>Amount</th>
                  <th style={th}>Status</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={tableRow}>
                    <td style={td}>
                      <div style={dateStyle}>{new Date(inv.createdAt).toLocaleDateString('en-GB')}</div>
                      <div style={timeStyle}>{new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={td}>
                      <div style={patientName}>{inv.patient.fullName}</div>
                      <div style={mrnStyle}>MRN: {inv.patient.mrn}</div>
                    </td>
                    <td style={td}>
                      <div style={servicesContainer}>
                        {inv.items.slice(0, 2).map((item) => (
                          <span key={item.id} style={itemTag}>{item.serviceName}</span>
                        ))}
                        {inv.items.length > 2 && <span style={moreTag}>+{inv.items.length - 2}</span>}
                      </div>
                    </td>
                    <td style={td}>
                      <div style={amountStyle}>{inv.totalAmount.toLocaleString()} ETB</div>
                    </td>
                    <td style={td}>
                      <span style={getStatusStyle(inv.status)}>{inv.status}</span>
                    </td>
                    <td style={td}>
                      <BillingClient invoice={inv} confirmPaymentAction={confirmPayment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
        historyTab={<PaymentHistory key="payment-history-tab" data={historyData} />}
      />
    </div>
  );
}

const container = { padding: '12px 20px', background: '#f8fafc', minHeight: '100vh' };
const header = { marginBottom: '16px' };
const title = { color: '#0f172a', fontSize: '1.4rem', fontWeight: 900 };
const miniStats = { display: 'flex', alignItems: 'center', gap: '10px' };
const subtitle = { color: '#64748b', fontSize: '0.85rem' };
const divider = { color: '#e2e8f0' };
const pendingText = { color: '#0f172a', fontSize: '0.85rem' };
const tableWrapper = { background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const tableHeaderRow = { background: '#f1f5f9' };
const th = { padding: '10px 16px', color: '#475569', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' as const, textAlign: 'left' as const };
const td = { padding: '8px 16px', borderBottom: '1px solid #f1f5f9' };
const tableRow = { transition: 'background 0.2s' };
const dateStyle = { fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' };
const timeStyle = { fontSize: '0.75rem', color: '#94a3b8' };
const patientName = { fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' };
const mrnStyle = { fontSize: '0.75rem', color: '#64748b' };
const servicesContainer = { display: 'flex', flexWrap: 'wrap' as const, gap: '4px' };
const itemTag = { background: '#f0f9ff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 };
const moreTag = { background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' };
const amountStyle = { fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' };
const getStatusStyle = (status: string) => ({
  padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800,
  background: status === 'PAID' ? '#dcfce7' : '#fef3c7', color: status === 'PAID' ? '#166534' : '#92400e',
});