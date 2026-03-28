"use client";

import React, { useState, useTransition } from 'react';
import { XMarkIcon, BeakerIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function LabOverlayInterface({ requests = [], submitAction }: any) {
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpen = (req: any) => {
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
      <div style={mainContent}>
        <div style={headerSection}>
          {/* Minimized Font Sizes */}
          <h1 style={{margin: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 800}}>Laboratory Workspace</h1>
          <p style={{color: '#64748b', fontSize: '0.85rem', marginTop: '4px'}}>Diagnostic Entry • Paid Requests Only</p>
        </div>

        {/* Removed the background card/border here for a cleaner look */}
        <div style={{ overflow: 'hidden' }}>
          <table style={table}>
            <thead style={thead}>
              <tr>
                <th style={th}>Patient Identity</th>
                <th style={th}>Requested Test</th>
                <th style={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((req: any) => (
                <tr key={req.id} style={tr}>
                  <td style={td}>
                    <div style={{fontWeight: 700, color: '#1e293b', fontSize: '0.9rem'}}>{req.patient?.fullName}</div>
                    <div style={{fontSize: '0.7rem', color: '#94a3b8'}}>MRN: {req.patient?.mrn}</div>
                  </td>
                  <td style={td}>
                    <div style={testType}><BeakerIcon style={{width: '14px'}}/> {req.testName}</div>
                  </td>
                  <td style={td}>
                    <button onClick={() => handleOpen(req)} style={openBtn}>Enter Result</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={emptyMsg}>
                    No investigations in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && <div style={backdrop} onClick={handleClose} />}

      <div style={drawerStyle(isOpen)}>
        <div style={drawerHeader}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <ClipboardDocumentCheckIcon style={{width: '20px', color: '#2563eb'}}/>
            <h2 style={{margin: 0, fontSize: '1.1rem', fontWeight: 800}}>Diagnostic Report</h2>
          </div>
          <button onClick={handleClose} style={closeBtn}><XMarkIcon style={{width: '20px'}}/></button>
        </div>

        {selectedReq && (
          <form 
            style={formArea}
            action={(formData) => {
              startTransition(async () => {
                await submitAction(formData);
                handleClose();
              });
            }}
          >
            <input type="hidden" name="requestId" value={selectedReq.id} />
            
            <div style={patientBanner}>
               <div style={{fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700}}>Profile</div>
               <div style={{fontWeight: 800, fontSize: '1rem', margin: '2px 0', color: '#0c4a6e'}}>{selectedReq.patient?.fullName}</div>
               <div style={{color: '#2563eb', fontWeight: 700, fontSize: '0.85rem'}}>{selectedReq.testName}</div>
            </div>

            <div style={row}>
              <div style={{flex: 2}}>
                <label style={label}>Result *</label>
                <input name="resultValue" style={input} placeholder="14.5" required autoFocus />
              </div>
              <div style={{flex: 1}}>
                <label style={label}>Unit *</label>
                <input name="unit" style={input} placeholder="g/dL" required />
              </div>
            </div>

            <div style={row}>
              <div style={{flex: 1}}>
                <label style={label}>Ref. Range</label>
                <input name="refRange" style={input} placeholder="12-16" />
              </div>
              <div style={{flex: 1}}>
                <label style={label}>Status Flag</label>
                <select name="flag" style={input}>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="LOW">Low</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={label}>Remarks</label>
              <textarea name="remarks" rows={4} style={textarea}></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isPending} 
              style={isPending ? disabledBtn : submitBtn}
            >
              {isPending ? 'Processing...' : 'Authorize Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Minimal Styles
const container = { minHeight: '100vh', position: 'relative' as const };
const mainContent = { padding: '20px' };
const headerSection = { marginBottom: '25px' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const thead = { borderBottom: '2px solid #e2e8f0' };
const th = { padding: '12px 10px', textAlign: 'left' as const, fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' };
const td = { padding: '15px 10px', borderBottom: '1px solid #f1f5f9' };
const tr = { transition: '0.2s' };
const testType = { display: 'flex', alignItems: 'center', gap: '6px', color: '#2563eb', fontWeight: 700, fontSize: '0.85rem' };
const openBtn = { background: '#10b981', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' };
const backdrop = { position: 'fixed' as const, top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.3)', zIndex: 999, backdropFilter: 'blur(4px)' };
const drawerStyle = (open: boolean) => ({ position: 'fixed' as const, top: 0, right: open ? 0 : '-100%', width: '400px', maxWidth: '100%', height: '100vh', background: '#fff', zIndex: 1000, transition: 'right 0.3s ease-out', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' as const });
const drawerHeader = { padding: '20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' };
const formArea = { padding: '20px', flex: 1, overflowY: 'auto' as const };
const patientBanner = { background: '#f8fafc', padding: '15px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' };
const row = { display: 'flex', gap: '10px', marginBottom: '15px' };
const label = { display: 'block', marginBottom: '5px', fontWeight: 700, fontSize: '0.75rem', color: '#64748b' };
const input = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' };
const textarea = { ...input, fontFamily: 'inherit', resize: 'none' as const };
const submitBtn = { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' };
const disabledBtn = { ...submitBtn, background: '#cbd5e1', cursor: 'not-allowed' };
const emptyMsg = { padding: '40px', textAlign: 'center' as const, color: '#94a3b8', fontSize: '0.9rem' };