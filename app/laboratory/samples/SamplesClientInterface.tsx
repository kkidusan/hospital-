"use client";

import React, { useState, useTransition } from 'react';
import { BeakerIcon, ClipboardDocumentListIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SamplesClientInterface({ samples, onUpdate }: any) {
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await onUpdate(formData);
      setSelectedSample(null);
    });
  };

  return (
    <div style={layout}>
      <header style={header}>
        <div>
          <h1 style={title}>Lab Sample Queue</h1>
          <p style={subtitle}>{samples.length} Investigations Pending</p>
        </div>
        <div style={statsBox}>
          <div style={statItem}><strong>{samples.filter((s:any) => s.status === 'PENDING').length}</strong> <span>To Collect</span></div>
          <div style={statItem}><strong>{samples.filter((s:any) => s.status === 'COLLECTING').length}</strong> <span>In Process</span></div>
        </div>
      </header>

      <div style={tableWrapper}>
        <table style={table}>
          <thead>
            <tr style={thRow}>
              <th style={th}>Patient</th>
              <th style={th}>Investigation</th>
              <th style={th}>Ordered</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {samples.map((sample: any) => (
              <tr key={sample.id} style={tr}>
                <td style={td}>
                  <div style={patientInfo}>
                    <UserIcon style={{width: '18px', color: '#64748b'}}/>
                    <div>
                      <div style={patientName}>{sample.patient?.fullName}</div>
                      <div style={mrn}>MRN: {sample.patient?.mrn}</div>
                    </div>
                  </div>
                </td>
                <td style={td}>
                  <div style={testBadge}><BeakerIcon style={{width: '14px'}}/> {sample.testName}</div>
                </td>
                <td style={td}>{new Date(sample.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                <td style={td}>
                  <span style={statusBadge(sample.status)}>{sample.status}</span>
                </td>
                <td style={td}>
                  <button onClick={() => setSelectedSample(sample)} style={actionBtn}>
                    {sample.status === 'PENDING' ? 'Collect Sample' : 'Enter Result'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- DATA ENTRY MODAL/OVERLAY --- */}
      {selectedSample && (
        <div style={overlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <h3>Update Investigation: {selectedSample.testName}</h3>
              <button onClick={() => setSelectedSample(null)} style={closeBtn}>✕</button>
            </div>
            
            <form action={handleUpdate} style={form}>
              <input type="hidden" name="id" value={selectedSample.id} />
              
              <div style={fieldGroup}>
                <label style={label}>Change Status</label>
                <select name="status" defaultValue={selectedSample.status} style={input}>
                  <option value="COLLECTING">Sample Collected (In-Process)</option>
                  <option value="COMPLETED">Finalize (Complete)</option>
                </select>
              </div>

              {selectedSample.status === 'COLLECTING' && (
                <>
                  <div style={row}>
                    <div style={{flex: 2}}>
                      <label style={label}>Result Value</label>
                      <input name="result" style={input} placeholder="Enter numerical result" required />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={label}>Unit</label>
                      <input name="unit" style={input} placeholder="mg/dL" required />
                    </div>
                  </div>

                  <div style={row}>
                    <div style={{flex: 1}}>
                      <label style={label}>Reference Range</label>
                      <input name="refRange" style={input} placeholder="70 - 110" />
                    </div>
                    <div style={{flex: 1}}>
                      <label style={label}>Flag</label>
                      <select name="flag" style={input}>
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">High</option>
                        <option value="LOW">Low</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div style={fieldGroup}>
                    <label style={label}>Technical Remarks</label>
                    <textarea name="remarks" style={{...input, height: '80px'}} placeholder="Morphology, notes..."></textarea>
                  </div>
                </>
              )}

              <button type="submit" disabled={isPending} style={submitBtn}>
                {isPending ? 'Saving...' : 'Update Investigation Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- STYLING ---
const layout = { maxWidth: '1200px', margin: '0 auto' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const title = { margin: 0, fontSize: '1.8rem', color: '#0f172a' };
const subtitle = { color: '#64748b', margin: '5px 0 0 0' };
const statsBox = { display: 'flex', gap: '20px' };
const statItem = { background: '#fff', padding: '15px 25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' as const, display: 'flex', flexDirection: 'column' as const };
const tableWrapper = { background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const thRow = { background: '#f1f5f9' };
const th = { padding: '15px 20px', textAlign: 'left' as const, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' as const };
const td = { padding: '18px 20px', borderBottom: '1px solid #f1f5f9' };
const tr = { transition: '0.2s' };
const patientInfo = { display: 'flex', alignItems: 'center', gap: '12px' };
const patientName = { fontWeight: 700, color: '#1e293b' };
const mrn = { fontSize: '0.75rem', color: '#94a3b8' };
const testBadge = { background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' };
const actionBtn = { background: '#0f172a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 };

const statusBadge = (status: string) => ({
  padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800,
  background: status === 'PENDING' ? '#fef3c7' : '#dcfce7',
  color: status === 'PENDING' ? '#92400e' : '#166534'
});

const overlay = { position: 'fixed' as const, top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal = { background: '#fff', width: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const modalHeader = { padding: '20px 25px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' };
const form = { padding: '25px' };
const fieldGroup = { marginBottom: '20px' };
const label = { display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem' };
const input = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' };
const row = { display: 'flex', gap: '15px', marginBottom: '20px' };
const submitBtn = { width: '100%', background: '#2563eb', color: '#fff', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' };