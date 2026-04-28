// app/radiology/RadiologyRequestClient.tsx
"use client";

import React, { useState, useTransition } from 'react';
import { MarsIcon, Radio, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface RadiologyRequest {
  id: string;
  status: string;
  createdAt: Date;
  scanType?: string;
  clinicalData?: string;
  ultrasound?: string[];
  xrayType?: string | null;
  findings?: string | null;
  impression?: string | null;
  patient: {
    fullName: string;
    mrn: string;
    age?: number;
    gender?: string;
  };
}

export default function RadiologyInterface({ 
  requests = [], 
  submitAction 
}: { 
  requests: RadiologyRequest[]; 
  submitAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedReq, setSelectedReq] = useState<RadiologyRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = (req: RadiologyRequest) => {
    setSelectedReq(req);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isPending) return;
    setIsOpen(false);
    setSelectedReq(null);
  };

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>📡 Radiology Department - Result Entry</h1>
          <p style={subtitle}>Enter professional findings and impressions</p>
        </div>
        <div style={stats}>
          <div style={statItem}>
            <span style={statNumber}>{requests.length}</span>
            <span style={statLabel}>Requests Awaiting Report</span>
          </div>
        </div>
      </div>

      <div style={grid}>
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} style={card}>
              <div style={cardHeader}>
                <div style={patientInfo}>
                  <div style={avatar}><User size={24} color="#64748b" /></div>
                  <div>
                    <div style={patientName}>{req.patient.fullName}</div>
                    <div style={mrn}>
                      MRN: {req.patient.mrn} • {req.patient.age} yrs • {req.patient.gender}
                    </div>
                  </div>
                </div>
                <div style={scanTypeBadge}>{req.scanType || 'Radiology'}</div>
              </div>

              <div style={requestDetails}>
                {req.ultrasound && req.ultrasound.length > 0 && (
                  <div><strong>Ultrasound:</strong> {req.ultrasound.join(', ')}</div>
                )}
                {req.xrayType && <div><strong>X-Ray:</strong> {req.xrayType}</div>}
                {req.clinicalData && (
                  <div style={clinicalBox}>
                    <strong>Clinical Indication:</strong><br />
                    {req.clinicalData}
                  </div>
                )}
              </div>

              <div 
                style={enterBtn}
                onClick={() => handleOpen(req)}
              >
                <Radio size={20} />
                ENTER RADIOLOGY FINDINGS & REPORT
              </div>

              <div style={timeInfo}>
                <Clock size={16} /> 
                Requested: {format(new Date(req.createdAt), 'dd MMM yyyy • HH:mm')}
              </div>
            </div>
          ))
        ) : (
          <div style={emptyState}>
            <Radio size={80} color="#cbd5e1" />
            <p style={emptyText}>No paid radiology requests awaiting reporting</p>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '8px' }}>
              Paid requests will appear here automatically
            </p>
          </div>
        )}
      </div>

      {/* Drawer */}
      {isOpen && <div style={backdrop} onClick={handleClose} />}
      
      <div style={drawer(isOpen)}>
        <div style={drawerHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Radio size={28} color="#7c3aed" />
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>Radiology Report Entry</div>
          </div>
          <button onClick={handleClose} style={closeBtn}> <XMarkIcon  /></button>
        </div>

        {selectedReq && (
          <form
            style={formContainer}
            action={(formData) => {
              formData.append('requestId', selectedReq.id);
              startTransition(async () => {
                await submitAction(formData);
                handleClose();
              });
            }}
          >
            <div style={patientBanner}>
              <div style={bannerLabel}>PATIENT</div>
              <div style={patientNameBig}>{selectedReq.patient.fullName}</div>
              <div style={scanTypeBig}>{selectedReq.scanType}</div>
            </div>

            <div style={formGroup}>
              <label style={label}>Findings / Detailed Report <span style={{color: '#ef4444'}}>*</span></label>
              <textarea 
                name="findings" 
                rows={10} 
                style={textarea} 
                placeholder="Describe ultrasound / X-ray findings in detail..." 
                required 
              />
            </div>

            <div style={formGroup}>
              <label style={label}>Impression / Conclusion</label>
              <textarea 
                name="impression" 
                rows={5} 
                style={textarea} 
                placeholder="Final impression / suggested diagnosis..." 
              />
            </div>

            <div style={formGroup}>
              <label style={label}>Radiologist Notes / Recommendations (Optional)</label>
              <textarea 
                name="radiologistNotes" 
                rows={4} 
                style={textarea} 
                placeholder="Any additional comments or follow-up suggestions..." 
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending} 
              style={isPending ? disabledSubmitBtn : submitBtn}
            >
              {isPending ? 'Saving Report...' : '✓ Save & Finalize Radiology Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ====================== STYLES ======================
const container = { padding: '28px', background: '#f8fafc', minHeight: '100vh' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap' as const, gap: '16px' };
const title = { fontSize: '1.95rem', fontWeight: 800, color: '#0f172a', margin: 0 };
const subtitle = { color: '#64748b', fontSize: '0.95rem' };

const stats = { background: '#fff', padding: '16px 28px', borderRadius: '14px', border: '1px solid #e2e8f0' };
const statItem = { textAlign: 'center' as const };
const statNumber = { fontSize: '2.3rem', fontWeight: 800, color: '#7c3aed' };
const statLabel = { fontSize: '0.82rem', color: '#64748b', fontWeight: 600 };

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '24px' };
const card = { background: '#fff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.05)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' };
const patientInfo = { display: 'flex', gap: '16px', alignItems: 'center' };
const avatar = { width: 52, height: 52, background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const patientName = { fontWeight: 700, fontSize: '1.15rem' };
const mrn = { fontSize: '0.85rem', color: '#64748b' };
const scanTypeBadge = { background: '#f3e8ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700 };

const requestDetails = { marginBottom: '20px', lineHeight: 1.6, fontSize: '0.95rem' };
const clinicalBox = { marginTop: '12px', padding: '14px', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #c4b5fd', fontSize: '0.9rem' };

const enterBtn = { 
  background: '#7c3aed', color: '#fff', padding: '14px', borderRadius: '12px', 
  fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', 
  gap: '10px', justifyContent: 'center', marginBottom: '16px'
};

const timeInfo = { display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem' };

const emptyState = { gridColumn: '1/-1', textAlign: 'center' as const, padding: '120px 20px', color: '#64748b' };
const emptyText = { fontSize: '1.25rem', fontWeight: 600, marginTop: '12px' };

const backdrop = { position: 'fixed' as const, inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 900, backdropFilter: 'blur(8px)' };
const drawer = (open: boolean) => ({ 
  position: 'fixed' as const, top: 0, right: open ? 0 : '-520px', width: '500px', 
  height: '100vh', background: '#fff', boxShadow: '-30px 0 60px rgba(0,0,0,0.25)', 
  zIndex: 1000, transition: 'right 0.4s cubic-bezier(0.32, 0.72, 0, 1)', display: 'flex', flexDirection: 'column' as const 
});

const drawerHeader = { padding: '24px 28px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' };

const patientBanner = { background: '#f3e8ff', padding: '20px', borderRadius: '14px', border: '1px solid #e0bbff', marginBottom: '24px' };
const bannerLabel = { fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8', textTransform: 'uppercase' };
const patientNameBig = { fontSize: '1.28rem', fontWeight: 800, color: '#4c1d95' };
const scanTypeBig = { color: '#7c3aed', fontWeight: 700, marginTop: '6px' };

const formContainer = { padding: '24px 28px', flex: 1, overflowY: 'auto' };
const formGroup = { marginBottom: '24px' };
const label = { display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.87rem', color: '#475569' };
const textarea = { 
  width: '100%', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '12px', 
  fontSize: '1rem', outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit'
};

const submitBtn = { 
  width: '100%', background: '#7c3aed', color: '#fff', border: 'none', 
  padding: '18px', borderRadius: '14px', fontWeight: 700, fontSize: '1.08rem', 
  cursor: 'pointer', marginTop: '12px' 
};
const disabledSubmitBtn = { ...submitBtn, background: '#94a3b8', cursor: 'not-allowed' };