'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function HistoryClientView({ patientData }: { patientData: any }) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const groupedTimeline = useMemo(() => {
    if (!patientData) return {};

    // Grouping all historical data into one chronological stream
    const timeline = [
      ...(patientData.consultations || []).map((d: any) => ({ 
        ...d, 
        type: 'DIAGNOSIS', 
        displayTitle: d.diagnosis // Using the 'diagnosis' field from Consultation model
      })),
      ...(patientData.prescriptions || []).map((p: any) => ({ 
        ...p, 
        type: 'PRESCRIPTION', 
        displayTitle: p.medicineName 
      })),
      ...(patientData.labRequests || []).map((l: any) => ({ 
        ...l, 
        type: 'LAB', 
        displayTitle: l.testName 
      })),
      ...(patientData.radiologyRequests || []).map((r: any) => ({ 
        ...r, 
        type: 'RADIOLOGY', 
        displayTitle: r.scanType 
      })),
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const groups: { [key: string]: any[] } = {};
    timeline.forEach(event => {
      const dateKey = new Date(event.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      });
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    return groups;
  }, [patientData]);

  return (
    <div style={layoutContainer}>
      {/* --- LEFT SIDE: TIMELINE NAVIGATION --- */}
      <div style={mainScrollArea}>
        <div style={topNav}>
          <Link href={`/specialist/consultation/${patientData.id}`} style={backBtn}>
            ← Back to Consultation
          </Link>
          <div style={profileHeader}>
            <h1 style={patientName}>{patientData.fullName}</h1>
            <div style={metaRow}>
              <span>MRN: {patientData.mrn}</span>
              <span style={dotDivider}>•</span>
              <span>{patientData.sex}</span>
              <span style={dotDivider}>•</span>
              <span>{patientData.age} {patientData.ageUnit}</span>
            </div>
          </div>
        </div>

        <div style={timelineContent}>
          {Object.entries(groupedTimeline).map(([date, events]) => (
            <div key={date} style={dateSection}>
              <div style={dateStickyLabel}>{date}</div>
              <div style={eventList}>
                {events.map((event, idx) => (
                  <div 
                    key={idx} 
                    style={eventCard(selectedEvent === event)}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div style={typeIndicator(event.type)} />
                    <div style={{ flex: 1 }}>
                      <div style={cardTitle}>{event.displayTitle}</div>
                      <div style={cardTime}>
                        {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {event.flag && event.flag !== 'NORMAL' && (
                       <span style={miniFlag(event.flag)}>{event.flag}</span>
                    )}
                    <div style={typeLabel(event.type)}>{event.type}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- RIGHT SIDE: DETAIL PANEL --- */}
      <div style={detailSidebar}>
        {selectedEvent ? (
          <div style={detailWrapper}>
            <div style={detailHero(selectedEvent.type)}>
              <span style={heroBadge}>{selectedEvent.type}</span>
              <h2 style={heroTitle}>{selectedEvent.displayTitle}</h2>
              <p style={heroDate}>Recorded {new Date(selectedEvent.createdAt).toLocaleString()}</p>
            </div>

            <div style={detailInfoArea}>
              {selectedEvent.type === 'LAB' && (
                <div style={reportBox}>
                  <h4 style={secTitle}>Laboratory Analysis</h4>
                  <div style={resultRow}>
                    <div style={dataValLarge}>
                        {selectedEvent.result} <small style={{fontSize: '1rem', opacity: 0.6}}>{selectedEvent.unit}</small>
                    </div>
                    {selectedEvent.flag && (
                        <div style={mainFlagLabel(selectedEvent.flag)}>{selectedEvent.flag}</div>
                    )}
                  </div>
                  <div style={refRangeBox}>
                    <div style={refItem}>
                        <span style={refLabel}>Reference Range</span>
                        <span style={refVal}>{selectedEvent.refRange || '--'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'DIAGNOSIS' && (
                <div>
                   <h4 style={secTitle}>Clinical Notes</h4>
                   <p style={clinicalNotes}>{selectedEvent.clinicalNotes || "No detailed notes provided."}</p>
                   {selectedEvent.vitals && (
                     <div style={refRangeBox}>
                        <div style={refItem}>
                          <span style={refLabel}>BP</span>
                          <span style={refVal}>{selectedEvent.vitals.bp}</span>
                        </div>
                        <div style={refItem}>
                          <span style={refLabel}>Temp</span>
                          <span style={refVal}>{selectedEvent.vitals.temp}°C</span>
                        </div>
                     </div>
                   )}
                </div>
              )}

              {selectedEvent.type === 'PRESCRIPTION' && (
                <div style={rxGrid}>
                  <div style={rxTile}>
                    <label style={rxLabel}>Dosage</label>
                    <span style={rxVal}>{selectedEvent.dosage}</span>
                  </div>
                </div>
              )}
            </div>

            <div style={detailFooter}>
                <button style={printBtn} onClick={() => window.print()}>Print Record</button>
            </div>
          </div>
        ) : (
          <div style={sidebarEmpty}>
            <div style={{fontSize: '48px', marginBottom: '20px', opacity: 0.2}}>📑</div>
            <h3 style={{margin: 0, color: '#1e293b'}}>Patient Archive</h3>
            <p style={{color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px'}}>Select an entry to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES ---
const layoutContainer: React.CSSProperties = { display: 'flex', height: '100vh', width: '100%', background: '#fff', overflow: 'hidden' };
const mainScrollArea: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '0 40px', borderRight: '1px solid #f1f5f9' };
const detailSidebar: React.CSSProperties = { width: '400px', background: '#fcfdfe', height: '100vh', display: 'flex', flexDirection: 'column' };
const topNav = { padding: '30px 0', position: 'sticky' as const, top: 0, background: '#fff', zIndex: 10 };
const backBtn = { color: '#2563eb', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 800 };
const profileHeader = { marginTop: '15px' };
const patientName = { fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 };
const metaRow = { display: 'flex', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginTop: '4px' };
const dotDivider = { opacity: 0.4 };
const timelineContent = { maxWidth: '700px', marginTop: '20px' };
const dateSection = { marginBottom: '35px' };
const dateStickyLabel = { fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: '12px' };
const eventList = { display: 'flex', flexDirection: 'column' as const, gap: '6px' };

const eventCard = (active: boolean): React.CSSProperties => ({
  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderRadius: '12px',
  background: active ? '#f1f5f9' : 'transparent', border: '1px solid transparent',
  cursor: 'pointer', transition: 'all 0.15s ease',
});

const cardTitle = { fontSize: '0.9rem', fontWeight: 700, color: '#334155' };
const cardTime = { fontSize: '0.7rem', color: '#94a3b8' };
const typeIndicator = (type: string) => {
  const colors: any = { DIAGNOSIS: '#ef4444', PRESCRIPTION: '#8b5cf6', LAB: '#10b981', RADIOLOGY: '#f59e0b' };
  return { width: '6px', height: '6px', borderRadius: '50%', background: colors[type] || '#cbd5e1' };
};
const miniFlag = (flag: string) => ({ background: '#fee2e2', color: '#b91c1c', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', marginRight: '8px' });
const typeLabel = (type: string) => ({ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8', background: '#f8fafc', padding: '4px 6px', borderRadius: '4px' });
const detailWrapper = { display: 'flex', flexDirection: 'column' as const, height: '100%' };
const detailHero = (type: string): React.CSSProperties => {
  const colors: any = { DIAGNOSIS: '#ef4444', PRESCRIPTION: '#6366f1', LAB: '#059669', RADIOLOGY: '#d97706' };
  return { padding: '30px', background: colors[type] || '#1e293b', color: '#fff' };
};
const heroBadge = { background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 };
const heroTitle = { fontSize: '1.2rem', fontWeight: 800, margin: '10px 0 5px 0' };
const heroDate = { margin: 0, opacity: 0.8, fontSize: '0.75rem' };
const detailInfoArea = { padding: '30px', flex: 1, overflowY: 'auto' as const };
const secTitle = { fontSize: '0.65rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase' as const, marginBottom: '10px' };
const reportBox = { marginBottom: '20px' };
const resultRow = { display: 'flex', alignItems: 'flex-end', gap: '15px', marginBottom: '15px' };
const dataValLarge = { fontSize: '2.5rem', fontWeight: 900, color: '#0f172a' };
const mainFlagLabel = (flag: string) => ({ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 });
const refRangeBox = { background: '#f8fafc', border: '1px solid #eef2f6', borderRadius: '8px', padding: '12px', display: 'flex', gap: '20px', marginTop: '10px' };
const refItem = { display: 'flex', flexDirection: 'column' as const };
const refLabel = { fontSize: '0.6rem', color: '#94a3b8', fontWeight: 700 };
const refVal = { fontSize: '0.8rem', fontWeight: 700, color: '#475569' };
const clinicalNotes = { fontSize: '0.9rem', lineHeight: 1.5, color: '#475569' };
const rxGrid = { display: 'grid', gridTemplateColumns: '1fr', gap: '10px' };
const rxTile = { padding: '12px', background: '#f1f5f9', borderRadius: '8px' };
const rxLabel = { display: 'block', fontSize: '0.6rem', color: '#94a3b8', fontWeight: 800 };
const rxVal = { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' };
const detailFooter = { padding: '20px 30px', borderTop: '1px solid #f1f5f9' };
const printBtn = { width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' };
const sidebarEmpty = { flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const, padding: '30px' };