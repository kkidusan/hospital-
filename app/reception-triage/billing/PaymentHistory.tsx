"use client";

import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
  FileText, 
  Download,
  CheckCircle2,
  Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';

export default function PaymentHistory({ data }: { data: any[] }) {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleOpenReceipt = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowDrawer(true);
  };

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    const toastId = toast.loading("Generating receipt image...");
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Receipt_${selectedInvoice.patient?.fullName?.replace(/\s+/g, '_') || 'Patient'}.png`;
      link.click();
      toast.success("Receipt downloaded!", { id: toastId });
    } catch (err) {
      toast.error("Download failed", { id: toastId });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${selectedInvoice.patient?.fullName}`,
          text: `Medical Receipt for ${selectedInvoice.patient?.fullName}. Total: ${selectedInvoice.totalAmount} ETB`,
          url: window.location.href,
        });
      } catch (err) { console.log(err); }
    } else {
      toast.error("Web Share not supported.");
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      {/* TABLE SECTION - CLEAN & NO BACKGROUND CARD */}
      <div style={mainContainer}>
        <table style={table}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={th}>Paid Date</th>
              <th style={th}>Patient Details</th>
              <th style={th}>Services</th>
              <th style={th}>Amount</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((inv) => (
              <tr key={inv.id} style={tableRow}>
                <td style={td}>
                  <div style={dateStyle}>{new Date(inv.paidAt).toLocaleDateString('en-GB')}</div>
                  <div style={timeStyle}>{new Date(inv.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={td}>
                  <div style={patientName}>{inv.patient.fullName}</div>
                  <div style={mrnStyle}>MRN: {inv.patient.mrn}</div>
                </td>
                <td style={td}>
                  <div style={servicesPreview}>
                    {inv.items.slice(0, 1).map((item: any, i: number) => (
                      <span key={i} style={itemTag}>{item.serviceName}</span>
                    ))}
                    {inv.items.length > 1 && <span style={moreTag}>+{inv.items.length - 1} more</span>}
                  </div>
                </td>
                <td style={td}>
                  <div style={amountStyle}>{inv.totalAmount.toFixed(2)} <span style={{fontSize: '0.65rem'}}>ETB</span></div>
                </td>
                <td style={td}>
                  <button onClick={() => handleOpenReceipt(inv)} style={receiptBtn}>
                    <CheckCircle2 size={16} style={{ marginRight: '6px' }} /> View Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={emptyState}>No transaction history found.</div>}
      </div>

      {/* DRAWER UI - MATCHES BILLING CLIENT EXACTLY */}
      {showDrawer && selectedInvoice && (
        <div style={drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div style={drawer} onClick={(e) => e.stopPropagation()}>
            <div style={drawerContent}>
                
                {/* RECEIPT PAPER */}
                <div id="printable-receipt" ref={receiptRef} style={receiptPaper}>
                  <div style={clinicHeader}>
                    <h2 style={clinicName}>DR. BIRKU BELETE</h2>
                    <p style={clinicSub}>INTERNAL MEDICINE SPECIALTY CLINIC</p>
                    <p style={clinicContact}>Woldia, Ethiopia | 0915858840 / 0925993830</p>
                    <div style={doubleLine} />
                    <h4 style={receiptTitle}>OFFICIAL CASH RECEIPT</h4>
                  </div>

                  <div style={dataSection}>
                    <div style={row}><span style={lbl}>Patient:</span><span style={val}>{selectedInvoice.patient?.fullName?.toUpperCase()}</span></div>
                    <div style={row}><span style={lbl}>MRN:</span><span style={val}>{selectedInvoice.patient?.mrn}</span></div>
                    <div style={row}><span style={lbl}>Date:</span><span style={val}>{new Date(selectedInvoice.paidAt).toLocaleDateString('en-GB')}</span></div>
                    <div style={row}><span style={lbl}>Inv No:</span><span style={val}>#{selectedInvoice.id.slice(-6).toUpperCase()}</span></div>
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
                      {selectedInvoice.items?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td style={tdL}>{item.serviceName}</td>
                          <td style={tdR}>{(item.price ?? 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={dashedLine} />

                  <div style={summaryBox}>
                    <div style={rowS}><span>Sub-Total:</span><span>{(selectedInvoice.totalAmount - (selectedInvoice.taxAmount || 0)).toFixed(2)}</span></div>
                    <div style={rowS}><span>VAT (15%):</span><span>{(selectedInvoice.taxAmount || 0).toFixed(2)}</span></div>
                    <div style={totalRow}><span>TOTAL PAID:</span><span>{selectedInvoice.totalAmount.toFixed(2)} ETB</span></div>
                  </div>

                  {/* TOOLS - MATCHES BILLING CLIENT STYLE */}
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
                    <button onClick={() => setShowDrawer(false)} style={closeBtn}>
                      <X size={16} /> <span>Close</span>
                    </button>
                  </div>
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
      `}</style>
    </>
  );
}

// ====================== STYLES ======================
const mainContainer = { width: '100%', marginTop: '10px' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const tableHeaderRow = { borderBottom: '2px solid #f1f5f9' };
const th = { padding: '12px 8px', color: '#64748b', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase' as const, textAlign: 'left' as const };
const td = { padding: '16px 8px', borderBottom: '1px solid #f1f5f9' };
const tableRow = { background: 'transparent' };

const dateStyle = { fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' };
const timeStyle = { fontSize: '0.7rem', color: '#94a3b8' };
const patientName = { fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' };
const mrnStyle = { fontSize: '0.75rem', color: '#64748b' };
const servicesPreview = { display: 'flex', gap: '4px', alignItems: 'center' };
const itemTag = { background: '#f8fafc', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid #e2e8f0' };
const moreTag = { fontSize: '0.7rem', color: '#94a3b8' };
const amountStyle = { fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' };

// BUTTONS - EXACT MATCH
const receiptBtn = { display: 'flex', alignItems: 'center', background: '#fff', color: '#16a34a', border: '1px solid #16a34a', padding: '8px 16px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' };

// DRAWER & RECEIPT - EXACT COPIES FROM BILLING CLIENT
const drawerOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' };
const drawer = { width: '480px', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' as const };
const drawerContent = { flex: 1, overflowY: 'auto' as const };
const receiptPaper = { padding: '30px', fontFamily: '"Courier New", Courier, monospace', color: '#000' };

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
const emptyState = { padding: '40px', textAlign: 'center' as const, color: '#94a3b8' };