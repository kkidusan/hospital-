"use client";

import { useState } from 'react';
import Link from 'next/link';

interface ConsultationFormProps {
  patient: any;
  onLabSubmit: (formData: FormData) => Promise<void>;
  onRadSubmit: (formData: FormData) => Promise<void>;
  onFinalize: (formData: FormData) => Promise<void>;
}

export default function ConsultationForm({ 
  patient, 
  onLabSubmit, 
  onRadSubmit, 
  onFinalize 
}: ConsultationFormProps) {
  const hasTriage = !!patient?.triage;
  const [tab, setTab] = useState(hasTriage ? 'triage' : 'finalize');

  const availableTabs = hasTriage 
    ? ['triage', 'lab', 'radiology', 'results', 'finalize'] 
    : ['lab', 'radiology', 'results', 'finalize'];

  const getFlagStyle = (flag: string) => {
    switch (flag?.toUpperCase()) {
      case 'HIGH': return { color: '#ef4444', fontWeight: 800 };
      case 'LOW': return { color: '#3b82f6', fontWeight: 800 };
      case 'CRITICAL': return { color: '#fff', background: '#dc2626', padding: '2px 6px', borderRadius: '4px' };
      default: return { color: '#10b981', fontWeight: 700 };
    }
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      {/* Navigation Tabs */}
      <div style={tabContainer}>
        {availableTabs.map(t => (
          <button 
            key={t} 
            type="button" 
            onClick={() => setTab(t)} 
            style={tabButtonStyle(tab === t)}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      <div style={cleanContentArea}>
        {/* TRIAGE TAB */}
        {tab === 'triage' && hasTriage && (
          <div style={grid2}>
            <div style={infoCard}>
              <h4 style={subH}>Current Vital Signs</h4>
              <div style={vitalsGrid}>
                <div style={vitalItem}><span style={vLabel}>Temp:</span> {patient.triage?.temperature}°C</div>
                <div style={vitalItem}><span style={vLabel}>BP:</span> {patient.triage?.bloodPressure}</div>
                <div style={vitalItem}><span style={vLabel}>Pulse:</span> {patient.triage?.pulse} bpm</div>
                <div style={vitalItem}><span style={vLabel}>SPO2:</span> {patient.triage?.spo2}%</div>
                <div style={vitalItem}><span style={vLabel}>Weight:</span> {patient.triage?.weight} kg</div>
              </div>
            </div>
            <div style={infoCard}>
              <h4 style={subH}>Clinical Assessment</h4>
              <p style={lbl}>Chief Complaint</p>
              <div style={complaintBox}>{patient.triage?.chiefComplaint}</div>
              
              {/* FIXED SYNTAX BELOW */}
              <p style={{ marginTop: '15px', ...lbl }}>Triage Notes</p>
              
              <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.5' }}>
                {patient.triage?.notes || "No additional notes provided."}
              </p>
            </div>
          </div>
        )}

        {/* LAB TAB */}
        {tab === 'lab' && (
          <form action={onLabSubmit}>
            <input type="hidden" name="patientId" value={patient.id} />
            <DynamicInputRows 
                title="Order Laboratory Investigations" 
                name="labName" 
                placeholder="Test Name (e.g. CBC, Liver Function...)" 
            />
            <button type="submit" style={actionBtn}>Submit Lab Order</button>
          </form>
        )}

        {/* RADIOLOGY TAB */}
        {tab === 'radiology' && (
          <form action={onRadSubmit}>
            <input type="hidden" name="patientId" value={patient.id} />
            <DynamicInputRows 
                title="Order Radiology / Imaging" 
                name="radiologyName" 
                placeholder="Scan Type (e.g. Chest X-Ray, Head CT...)" 
            />
            <button type="submit" style={actionBtn}>Submit Radiology Order</button>
          </form>
        )}

        {/* RESULTS TAB */}
        {tab === 'results' && (
          <div>
            <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.1rem' }}>Active Results</h3>
            {(!patient.labRequests?.length && !patient.radiologyRequests?.length) ? (
              <div style={emptyState}>No investigation results available yet.</div>
            ) : (
              <>
                {patient.labRequests?.map((req: any) => (
                  <div key={req.id} style={detailedResultCard}>
                    <div style={resultRow}>
                      <span style={{fontWeight: 700}}>LAB: {req.testName}</span>
                      <span style={statusBadge(req.status)}>{req.status}</span>
                    </div>
                    {req.status === 'COMPLETED' && (
                      <div style={labDetailGrid}>
                        <div><label style={miniLabel}>Result</label><div style={getFlagStyle(req.flag)}>{req.result} {req.unit}</div></div>
                        <div><label style={miniLabel}>Reference</label><div>{req.refRange || '--'}</div></div>
                        <div><label style={miniLabel}>Status</label><div style={getFlagStyle(req.flag)}>{req.flag || 'NORMAL'}</div></div>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* FINALIZE TAB */}
        {tab === 'finalize' && (
          <form action={onFinalize}>
            <input type="hidden" name="patientId" value={patient.id} />
            
            <div style={{ marginBottom: '24px' }}>
              <label style={lbl}>Final Diagnosis <span style={{color: '#ef4444'}}>*</span></label>
              <input name="description" required style={inp} placeholder="Enter the final diagnosis..." />
            </div>

            <DynamicInputRows 
              title="Prescription / Medication" 
              name="medName" 
              placeholder="Medicine" 
              secondName="dosage" 
              secondPlaceholder="Dosage/Frequency" 
            />

            <div style={{marginTop: '24px'}}>
              <label style={lbl}>Clinical Notes & Patient Advice</label>
              <textarea name="notes" style={{ ...inp, height: '120px', resize: 'none' }} placeholder="Write advice or follow-up instructions..." />
            </div>

            <div style={footerBtns}>
              <Link href="/specialist" style={{ flex: 1, textDecoration: 'none' }}>
                <button type="button" style={btnCancel}>Discard Session</button>
              </Link>
              <button type="submit" style={btnSubmit}>Complete Consultation</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function DynamicInputRows({ title, name, placeholder, secondName, secondPlaceholder }: any) {
  const [items, setItems] = useState([{ id: 1 }]);
  return (
    <div style={{marginBottom: '20px', background: '#f1f5f9', padding: '20px', borderRadius: '16px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: '#334155', fontSize: '0.9rem', fontWeight: 800 }}>{title}</h4>
        <button type="button" onClick={() => setItems([...items, { id: Date.now() }])} style={addBtn}>+ Add Row</button>
      </div>
      {items.map(item => (
        <div key={item.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input name={name} style={{...inp, flex: 2}} placeholder={placeholder} required />
          {secondName && <input name={secondName} style={{...inp, flex: 1}} placeholder={secondPlaceholder} />}
          {items.length > 1 && (
            <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} style={delBtn}>✕</button>
          )}
        </div>
      ))}
    </div>
  );
}

const tabContainer = { display: 'flex', gap: '25px', borderBottom: '2px solid #e2e8f0', marginBottom: '35px' };
const tabButtonStyle = (active: boolean) => ({
  padding: '12px 0',
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: active ? '#2563eb' : '#94a3b8',
  fontWeight: 800,
  fontSize: '0.85rem',
  borderBottom: active ? '3px solid #2563eb' : '3px solid transparent',
  transition: 'all 0.2s ease',
  outline: 'none'
});

const cleanContentArea = { minHeight: '450px' };
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' };
const infoCard = { padding: '0', borderRadius: '0', background: 'transparent' }; 
const vitalsGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' };
const vitalItem = { padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.95rem' };
const vLabel = { color: '#64748b', fontWeight: 600, marginRight: '8px' };
const complaintBox = { background: '#fffbeb', padding: '20px', borderRadius: '12px', border: '1px solid #fef3c7', color: '#92400e', fontSize: '0.95rem', fontWeight: 500 };
const subH = { margin: '0 0 16px 0', color: '#0f172a', fontSize: '1rem', fontWeight: 900 };
const inp = { width: '100%', padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', background: '#fff' };
const lbl = { display: 'block', fontWeight: 800, marginBottom: '8px', fontSize: '0.85rem', color: '#475569' };
const actionBtn = { width: '100%', padding: '16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 700, marginTop: '10px' };
const btnSubmit = { flex: 2, padding: '16px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '1rem' };
const btnCancel = { width: '100%', padding: '16px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#94a3b8', cursor: 'pointer', fontWeight: 700 };
const addBtn = { background: '#fff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700, color: '#2563eb' };
const delBtn = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer' };
const detailedResultCard = { background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' };
const resultRow = { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' };
const labDetailGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' };
const miniLabel = { display: 'block', fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' as const, fontWeight: 900, marginBottom: '4px' };
const footerBtns = { marginTop: '40px', display: 'flex', gap: '15px' };
const emptyState = { padding: '50px', textAlign: 'center' as const, color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '2px dashed #e2e8f0' };

function statusBadge(status: string): any {
  const isComp = status === 'COMPLETED';
  return {
    fontSize: '0.7rem',
    fontWeight: 800,
    padding: '4px 10px',
    borderRadius: '6px',
    background: isComp ? '#dcfce7' : '#fef9c3',
    color: isComp ? '#15803d' : '#854d0e'
  };
}