"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, ArrowUpRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function BillingRegistry() {
  const [loading, setLoading] = useState(true);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const DAILY_RATE = 500;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/billing/active-beds');
      if (!res.ok) throw new Error(`Error ${res.status}: Route not found`);
      const data = await res.json();
      setAdmissions(data);
    } catch (err) {
      toast.error("Failed to sync registry.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStayDays = (entryDate: string, dischargeDate?: string) => {
    if (!entryDate) return 1;
    const start = new Date(entryDate);
    const end = dischargeDate ? new Date(dischargeDate) : new Date();
    const diff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 0 ? 1 : diff;
  };

  const handleDischarge = async () => {
    if (!selectedAdmission) return;
    setIsProcessing(true);
    const tId = toast.loading("Processing...");
    try {
      const res = await fetch('/api/admin/billing/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          admissionId: selectedAdmission.id,
          totalAmount: calculateStayDays(selectedAdmission.admissionDate) * DAILY_RATE 
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Discharge successful", { id: tId });
        setIsDrawerOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error("Process failed", { id: tId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .registry-container { padding: 0 !important; }
          .hide-mobile { display: none !important; }
          .registry-table { table-layout: fixed; width: 100% !important; }
          .registry-table td, .registry-table th { padding: 12px 4px !important; }
          .m-date { font-size: 0.65rem !important; font-weight: 700; }
          .m-name { font-size: 0.75rem !important; font-weight: 800; display: block; overflow: hidden; text-overflow: ellipsis; }
          .m-mrn { font-size: 0.6rem !important; opacity: 0.7; }
          .m-status { font-size: 0.55rem !important; padding: 2px 6px !important; }
          .m-btn { padding: 6px !important; font-size: 0.6rem !important; }
          .drawer-box { width: 100% !important; border-radius: 0 !important; }
        }
      `}} />

      <div className="registry-container" style={mainContainer}>
        <table className="registry-table" style={table}>
          <thead>
            <tr style={tableHeaderRow}>
              <th style={{...th, width: '20%'}}>Entry Date</th>
              <th style={{...th, width: '40%'}}>Patient</th>
              <th className="hide-mobile" style={th}>Room/Bed</th>
              <th style={{...th, width: '20%', textAlign: 'center'}}>Status</th>
              <th style={{...th, width: '20%', textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {admissions.map((adm) => (
              <tr key={adm.id} style={tableRow}>
                <td style={td}>
                  <div className="m-date" style={dateStyle}>
                    {adm.admissionDate ? new Date(adm.admissionDate).toLocaleDateString('en-GB') : "N/A"}
                  </div>
                  <div style={timeStyle}>Inpatient</div>
                </td>
                <td style={td}>
                  <div className="m-name" style={patientName}>{adm.patient?.fullName}</div>
                  <div className="m-mrn" style={mrnStyle}>MRN: {adm.patient?.mrn}</div>
                </td>
                <td className="hide-mobile" style={td}>
                  <div style={servicesPreview}>
                    <span style={itemTag}>RM-{adm.bed?.room?.roomNumber}</span>
                    <span style={moreTag}>Bed {adm.bed?.bedNumber}</span>
                  </div>
                </td>
                <td style={{...td, textAlign: 'center'}}>
                  <span className="m-status" style={{
                    ...statusBase,
                    backgroundColor: adm.status === 'ACTIVE' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: adm.status === 'ACTIVE' ? '#b45309' : '#047857',
                  }}>
                    {adm.status}
                  </span>
                </td>
                <td style={{...td, textAlign: 'right'}}>
                  <button className="m-btn" onClick={() => { setSelectedAdmission(adm); setIsDrawerOpen(true); }} style={viewBtn}>
                    <ArrowUpRight size={14} /> <span className="hide-mobile" style={{marginLeft: '4px'}}>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {admissions.length === 0 && !loading && <div style={emptyState}>No active registry found.</div>}
      </div>

      {isDrawerOpen && selectedAdmission && (
        <div style={drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-box" style={drawer} onClick={(e) => e.stopPropagation()}>
            <div style={drawerContent}>
                <div style={receiptPaper}>
                  <div style={clinicHeader}>
                    <h2 style={clinicName}>BILLING PROTOCOL</h2>
                    <p style={clinicSub}>INPATIENT SETTLEMENT SYSTEM</p>
                    <div style={doubleLine} />
                  </div>

                  <div style={dataSection}>
                    <div style={row}><span style={lbl}>Patient:</span><span style={val}>{selectedAdmission.patient?.fullName?.toUpperCase()}</span></div>
                    <div style={row}><span style={lbl}>MRN:</span><span style={val}>{selectedAdmission.patient?.mrn}</span></div>
                    <div style={row}><span style={lbl}>Entry:</span><span style={val}>{new Date(selectedAdmission.admissionDate).toLocaleDateString('en-GB')}</span></div>
                    <div style={row}><span style={lbl}>Room:</span><span style={val}>RM-{selectedAdmission.bed?.room?.roomNumber} (Bed {selectedAdmission.bed?.bedNumber})</span></div>
                  </div>

                  <div style={dashedLine} />

                  <div style={summaryBox}>
                    <div style={rowS}><span>Stay Duration:</span><span>{calculateStayDays(selectedAdmission.admissionDate)} Days</span></div>
                    <div style={rowS}><span>Daily Rate:</span><span>{DAILY_RATE.toFixed(2)}</span></div>
                    <div style={totalRow}><span>TOTAL DUE:</span><span>{(calculateStayDays(selectedAdmission.admissionDate) * DAILY_RATE).toFixed(2)} ETB</span></div>
                  </div>

                  <div className="no-print" style={toolsContainer}>
                    {selectedAdmission.status === 'ACTIVE' ? (
                      <button onClick={handleDischarge} style={dischargeBtn} disabled={isProcessing}>
                        {isProcessing ? 'Syncing...' : 'Execute Discharge'}
                      </button>
                    ) : (
                      <button style={closedBtn} disabled>Account Closed</button>
                    )}
                    <button onClick={() => setIsDrawerOpen(false)} style={closeBtn}><X size={16} /> Close</button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ====================== UPDATED CLEAN STYLES ======================
const mainContainer = { width: '100%', marginTop: '10px', background: 'transparent' };
const table = { width: '100%', borderCollapse: 'collapse' as const, background: 'transparent' };
const tableHeaderRow = { borderBottom: '1px solid rgba(0,0,0,0.05)' };
const th = { padding: '12px 8px', color: '#64748b', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase' as const, textAlign: 'left' as const };
const td = { padding: '16px 8px', borderBottom: '1px solid rgba(0,0,0,0.04)', verticalAlign: 'middle' as const };
const tableRow = { background: 'transparent' };

const dateStyle = { fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' };
const timeStyle = { fontSize: '0.7rem', color: '#94a3b8' };
const patientName = { fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: '2px' };
const mrnStyle = { fontSize: '0.75rem', color: '#64748b' };
const servicesPreview = { display: 'flex', gap: '4px', alignItems: 'center' };
const itemTag = { background: 'rgba(0,0,0,0.03)', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(0,0,0,0.05)' };
const moreTag = { fontSize: '0.7rem', color: '#94a3b8' };

const statusBase = { padding: '4px 10px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase' as const, fontSize: '0.6rem' };
const viewBtn = { display: 'inline-flex', alignItems: 'center', background: 'transparent', color: '#0f172a', border: '1px solid rgba(15, 23, 42, 0.2)', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' };

const drawerOverlay = { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' };
const drawer = { width: '450px', height: '100%', background: '#fff', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)' };
const drawerContent = { height: '100%', overflowY: 'auto' as const };
const receiptPaper = { padding: '30px', fontFamily: 'inherit', color: '#000' };

const clinicHeader = { textAlign: 'center' as const, marginBottom: '10px' };
const clinicName = { margin: 0, fontSize: '1rem', fontWeight: 900, letterSpacing: '1px' };
const clinicSub = { margin: 0, fontSize: '0.65rem', fontWeight: 700, color: '#64748b' };
const doubleLine = { borderBottom: '1px solid #000', marginTop: '10px' };
const dashedLine = { borderBottom: '1px dashed #e2e8f0', margin: '20px 0' };

const dataSection = { margin: '15px 0' };
const row = { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '8px' };
const lbl = { color: '#64748b', fontWeight: 500 };
const val = { fontWeight: 700, color: '#0f172a' };

const summaryBox = { marginTop: '20px' };
const rowS = { display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 900, borderTop: '2px solid #0f172a', marginTop: '15px', paddingTop: '15px' };

const toolsContainer = { display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '40px' };
const toolBtn = { width: '100%', padding: '14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' };
const dischargeBtn = { ...toolBtn, background: '#0f172a', color: '#fff' };
const closedBtn = { ...toolBtn, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' };
const closeBtn = { ...toolBtn, background: 'transparent', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const emptyState = { padding: '60px', textAlign: 'center' as const, color: '#94a3b8', fontSize: '0.8rem' };