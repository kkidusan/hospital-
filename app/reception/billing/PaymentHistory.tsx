"use client";

import React, { useState, useRef } from 'react';
import { 
  Printer, 
  X, 
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
    const toastId = toast.loading("Generating receipt...");
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
      toast.success("Saved to device", { id: toastId });
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
      
      <style dangerouslySetInnerHTML={{ __html: `
        /* PURE UI OVERRIDES */
        .history-table tr { background: transparent !important; }
        .history-table td { background: transparent !important; }
        
        @media (max-width: 768px) {
          .history-container { padding: 0 !important; }
          .hide-mobile { display: none !important; }
          .history-table { table-layout: fixed; width: 100% !important; }
          .history-table td, .history-table th { padding: 12px 4px !important; }
          .m-date { font-size: 0.65rem !important; }
          .m-time { font-size: 0.55rem !important; }
          .m-name { font-size: 0.75rem !important; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
          .m-mrn { font-size: 0.6rem !important; opacity: 0.7; }
          .m-amount { font-size: 0.75rem !important; font-weight: 800 !important; }
          .m-btn { padding: 4px 8px !important; font-size: 0.6rem !important; }
          .drawer-box { width: 100% !important; border-radius: 0 !important; }
        }

        @media print {
          body * { visibility: hidden !important; background: none !important; }
          #printable-receipt, #printable-receipt * { visibility: visible !important; }
          #printable-receipt { 
            position: fixed !important; left: 0; top: 0; width: 100% !important; 
            padding: 0 !important; margin: 0 !important; box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}} />

      <div className="history-container" style={mainContainer}>
        <table className="history-table" style={table}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{...th, width: '22%'}}>Date</th>
              <th style={{...th, width: '40%'}}>Patient</th>
              <th className="hide-mobile" style={th}>Services</th>
              <th style={{...th, width: '18%'}}>Amount</th>
              <th style={{...th, width: '20%', textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((inv) => (
              <tr key={inv.id} style={tableRow}>
                <td style={td}>
                  <div className="m-date" style={dateStyle}>{new Date(inv.paidAt).toLocaleDateString('en-GB')}</div>
                  <div className="m-time" style={timeStyle}>{new Date(inv.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={td}>
                  <div className="m-name" style={patientName}>{inv.patient.fullName}</div>
                  <div className="m-mrn" style={mrnStyle}>MRN: {inv.patient.mrn}</div>
                </td>
                <td className="hide-mobile" style={td}>
                  <div style={servicesPreview}>
                    {inv.items.slice(0, 1).map((item: any, i: number) => (
                      <span key={i} style={itemTag}>{item.serviceName}</span>
                    ))}
                    {inv.items.length > 1 && <span style={moreTag}>+{inv.items.length - 1}</span>}
                  </div>
                </td>
                <td style={td}>
                  <div className="m-amount" style={amountStyle}>{inv.totalAmount.toLocaleString()} <small style={{fontWeight: 400, fontSize: '0.65em'}}>ETB</small></div>
                </td>
                <td style={{...td, textAlign: 'right'}}>
                  <button className="m-btn" onClick={() => handleOpenReceipt(inv)} style={receiptBtn}>
                    <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div style={emptyState}>No transactions found.</div>}
      </div>

      {/* DRAWER UI */}
      {showDrawer && selectedInvoice && (
        <div style={drawerOverlay} onClick={() => setShowDrawer(false)}>
          <div className="drawer-box" style={drawer} onClick={(e) => e.stopPropagation()}>
            <div style={drawerContent}>
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

                  <div className="no-print" style={toolsContainer}>
                    <button onClick={() => window.print()} style={toolBtn}><Printer size={16} /> Print</button>
                    <button onClick={handleShare} style={toolBtn}><Share2 size={16} /> Share</button>
                    <button onClick={handleDownload} style={toolBtn}><Download size={16} /> Save</button>
                    <button onClick={() => setShowDrawer(false)} style={closeBtn}><X size={16} /> Close</button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ====================== STYLES (PURE MINIMALIST) ======================
const mainContainer = { width: '100%', background: 'transparent' };
const table = { width: '100%', borderCollapse: 'collapse' as const, background: 'transparent' };
const tableHeaderRow = { borderBottom: '1px solid #e2e8f0' };
const th = { padding: '12px 8px', color: '#64748b', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' as const, textAlign: 'left' as const };
const td = { padding: '14px 8px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' as const, background: 'transparent' };
const tableRow = { background: 'transparent' };

const dateStyle = { fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' };
const timeStyle = { fontSize: '0.65rem', color: '#94a3b8' };
const patientName = { fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' };
const mrnStyle = { fontSize: '0.7rem', color: '#64748b' };
const servicesPreview = { display: 'flex', gap: '4px', alignItems: 'center' };
const itemTag = { color: '#64748b', padding: '0px 4px', fontSize: '0.7rem', fontWeight: 500, borderLeft: '2px solid #e2e8f0' };
const moreTag = { fontSize: '0.65rem', color: '#cbd5e1' };
const amountStyle = { fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' };

const receiptBtn = { display: 'inline-flex', alignItems: 'center', background: 'transparent', color: '#10b981', border: '1px solid #10b981', padding: '5px 10px', borderRadius: '4px', fontWeight: 600, cursor: 'pointer', fontSize: '0.7rem' };

const drawerOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' };
const drawer = { width: '420px', height: '100%', background: '#fff', borderLeft: '1px solid #e2e8f0' };
const drawerContent = { height: '100%', overflowY: 'auto' as const };
const receiptPaper = { padding: '30px', fontFamily: '"Courier New", Courier, monospace', color: '#000', background: '#fff' };

const clinicHeader = { textAlign: 'center' as const, marginBottom: '10px' };
const clinicName = { margin: 0, fontSize: '1rem', fontWeight: 900 };
const clinicSub = { margin: 0, fontSize: '0.65rem', fontWeight: 700 };
const clinicContact = { margin: 0, fontSize: '0.55rem' };
const receiptTitle = { margin: '8px 0', fontSize: '0.75rem', fontWeight: 900, textDecoration: 'underline' };

const dataSection = { margin: '15px 0' };
const row = { display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '3px' };
const lbl = { fontWeight: 900 };
const val = { fontWeight: 400 };

const itemTable = { width: '100%', borderCollapse: 'collapse' as const, margin: '15px 0' };
const thL = { textAlign: 'left' as const, fontSize: '0.65rem', borderBottom: '1px solid #000', paddingBottom: '4px' };
const thR = { textAlign: 'right' as const, fontSize: '0.65rem', borderBottom: '1px solid #000', paddingBottom: '4px' };
const tdL = { textAlign: 'left' as const, fontSize: '0.7rem', padding: '5px 0' };
const tdR = { textAlign: 'right' as const, fontSize: '0.7rem', padding: '5px 0' };

const summaryBox = { marginLeft: 'auto', width: '100%' };
const rowS = { display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '2px' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 900, borderTop: '1px solid #000', marginTop: '8px', paddingTop: '8px' };

const doubleLine = { borderBottom: '3px double #000', margin: '10px 0' };
const dashedLine = { borderBottom: '1px dashed #000', margin: '8px 0' };

const toolsContainer = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '40px' };
const toolBtn = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.65rem', color: '#475569' };
const closeBtn = { ...toolBtn, background: '#fff', color: '#ef4444', borderColor: '#fee2e2' };
const emptyState = { padding: '60px', textAlign: 'center' as const, color: '#94a3b8', fontSize: '0.8rem' };