// app/reception-triage/billing/BillingClient.tsx
"use client";

import { useState, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Printer, Share2, Download, X, CheckCircle2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface Props {
  invoice: any;
  confirmPaymentAction: (formData: FormData) => Promise<void>;
}

export default function BillingClient({ invoice, confirmPaymentAction }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const onConfirm = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("invoiceId", invoice.id);

    try {
      await confirmPaymentAction(formData);
      toast.success("Payment Confirmed Successfully!");
      setShowConfirm(false);
    } catch (err) {
      toast.error("Failed to process payment.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const toastId = toast.loading("Generating receipt image...");

    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const actionRow = clonedDoc.querySelector('.no-print') as HTMLElement;
          if (actionRow) actionRow.style.display = 'none';
        }
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Receipt_${invoice.patient?.fullName?.replace(/\s+/g, '_') || 'Patient'}.png`;
      link.click();
      
      toast.success("Receipt downloaded successfully", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Download failed.", { id: toastId });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${invoice.patient?.fullName}`,
          text: `Medical Receipt for ${invoice.patient?.fullName}. Total: ${invoice.totalAmount} ETB`,
          url: window.location.href,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      toast.error("Web Share not supported on this browser.");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      {invoice.status === 'PAID' ? (
        <button onClick={() => setShowReceipt(true)} style={receiptBtn}>
          <CheckCircle2 size={16} style={{ marginRight: '6px' }} /> View Receipt
        </button>
      ) : (
        <button onClick={() => setShowConfirm(true)} style={confirmBtn}>
          Confirm Payment
        </button>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={modalTitle}>Confirm Payment</h3>
            <p style={modalText}>
              Mark payment as received for <strong>{invoice.patient?.fullName}</strong>?
            </p>
            <div style={btnRow}>
              <button onClick={() => setShowConfirm(false)} style={cancelBtn}>Cancel</button>
              <button onClick={onConfirm} disabled={loading} style={actionBtn}>
                {loading ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT DRAWER */}
      {showReceipt && (
        <div style={drawerOverlay} onClick={() => setShowReceipt(false)}>
          <div style={drawer} onClick={(e) => e.stopPropagation()}>
            <div id="printable-receipt" ref={receiptRef} style={receiptPaper}>
              <div style={clinicHeader}>
                <h2 style={clinicName}>DR. BIRKU BELETE</h2>
                <p style={clinicSub}>INTERNAL MEDICINE SPECIALTY CLINIC</p>
                <p style={clinicContact}>Woldia, Ethiopia | 0915858840 / 0925993830</p>
                <div style={doubleLine} />
                <h4 style={receiptTitle}>OFFICIAL CASH RECEIPT</h4>
              </div>

              <div style={dataSection}>
                <div style={row}><span style={lbl}>Patient:</span><span style={val}>{invoice.patient?.fullName?.toUpperCase()}</span></div>
                <div style={row}><span style={lbl}>MRN:</span><span style={val}>{invoice.patient?.mrn}</span></div>
                <div style={row}><span style={lbl}>Date:</span><span style={val}>{new Date().toLocaleDateString('en-GB')}</span></div>
                <div style={row}><span style={lbl}>Inv No:</span><span style={val}>#{invoice.id.slice(-6).toUpperCase()}</span></div>
              </div>

              <div style={dashedLine} />

              <table style={itemTable}>
                <thead>
                  <tr>
                    <th style={thL}>Description</th>
                    <th style={thR}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any, i: number) => (
                    <tr key={i}>
                      <td style={tdL}>{item.serviceName}</td>
                      <td style={tdR}>{(item.price ?? item.total ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={dashedLine} />

              <div style={summaryBox}>
                <div style={rowS}><span>Sub-Total:</span><span>{((invoice.totalAmount ?? 0) - (invoice.taxAmount ?? 0)).toFixed(2)}</span></div>
                <div style={rowS}><span>VAT (15%):</span><span>{(invoice.taxAmount ?? 0).toFixed(2)}</span></div>
                <div style={totalRow}><span>TOTAL PAID:</span><span>{(invoice.totalAmount ?? 0).toFixed(2)} ETB</span></div>
              </div>

              <div className="no-print" style={toolsContainer}>
                <button onClick={() => window.print()} style={toolBtn}>
                  <Printer size={16} /> <span>Print</span>
                </button>
                <button onClick={handleShare} style={toolBtn}>
                  <Share2 size={16} /> <span>Share</span>
                </button>
                <button onClick={handleDownload} style={toolBtn}>
                  <Download size={16} /> <span>Download</span>
                </button>
                <button onClick={() => setShowReceipt(false)} style={closeBtn}>
                  <X size={16} /> <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-receipt, #printable-receipt * { visibility: visible !important; }
          #printable-receipt { 
            position: absolute !important; left: 0; top: 0; width: 100% !important; 
            padding: 0 !important; margin: 0 !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
        #printable-receipt {
          overflow-y: auto;
          scrollbar-width: none;
        }
        #printable-receipt::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

// ====================== STYLES ======================
const drawerOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' };
const drawer = { width: '480px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' as const };
const receiptPaper = { flex: 1, padding: '30px', fontFamily: '"Courier New", Courier, monospace', color: '#000' };

const clinicHeader = { textAlign: 'center' as const, marginBottom: '10px' };
const clinicName = { margin: 0, fontSize: '1.2rem', fontWeight: 900 };
const clinicSub = { margin: 0, fontSize: '0.75rem', fontWeight: 700 };
const clinicContact = { margin: 0, fontSize: '0.6rem', color: '#444' };
const receiptTitle = { margin: '10px 0', fontSize: '0.85rem', fontWeight: 900, textDecoration: 'underline' };

const dataSection = { margin: '15px 0' };
const row = { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' };
const lbl = { fontWeight: 900 };
const val = { fontWeight: 400 };

const itemTable = { width: '100%', borderCollapse: 'collapse' as const, margin: '15px 0' };
const thL = { textAlign: 'left' as const, fontSize: '0.7rem', borderBottom: '1px solid #000', paddingBottom: '5px' };
const thR = { textAlign: 'right' as const, fontSize: '0.7rem', borderBottom: '1px solid #000', paddingBottom: '5px' };
const tdL = { textAlign: 'left' as const, fontSize: '0.75rem', padding: '5px 0' };
const tdR = { textAlign: 'right' as const, fontSize: '0.75rem', padding: '5px 0' };

const summaryBox = { marginLeft: 'auto', width: '200px', marginTop: '10px' };
const rowS = { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 900, marginTop: '8px', borderTop: '2px solid #000', paddingTop: '8px' };

const doubleLine = { borderBottom: '3px double #000', margin: '8px 0' };
const dashedLine = { borderBottom: '1px dashed #000', margin: '6px 0' };

const toolsContainer = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '50px' };
const toolBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#f4f4f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem' };
const closeBtn = { ...toolBtn, background: '#fee2e2', color: '#dc2626' };

const confirmBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };
const receiptBtn = { display: 'flex', alignItems: 'center', background: '#fff', color: '#16a34a', border: '1px solid #16a34a', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' };

const overlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000 };
const modal = { background: '#fff', padding: '24px', borderRadius: '16px', width: '300px', textAlign: 'center' as const };
const modalTitle = { margin: '0 0 8px 0', fontSize: '1rem', fontWeight: 800 };
const modalText = { margin: 0, fontSize: '0.85rem', color: '#64748b' };
const btnRow = { display: 'flex', gap: '8px', marginTop: '20px' };
const cancelBtn = { flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };
const actionBtn = { flex: 1, padding: '10px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 };