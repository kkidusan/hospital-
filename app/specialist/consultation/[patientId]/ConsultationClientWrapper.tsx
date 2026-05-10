'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useConsultationStore } from '../../../lib/store/useConsultationStore'; 
import { 
  X, Loader2, CheckCircle2, Plus, Search, Clock, User, 
  ChevronDown, ChevronRight, FileEdit, History, Save, MoreHorizontal, Trash2, Hash 
} from 'lucide-react';

const pageContainer: React.CSSProperties = { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', backgroundColor: '#f8fafc', minHeight: '100vh', position: 'relative' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', flexWrap: 'wrap', gap: '20px' };
const patientInfoWrapper = { display: 'flex', alignItems: 'center', flexWrap: 'wrap' as const, gap: '8px', flex: 1 };
const infoTextStyle = { fontSize: '1.05rem', color: '#1e293b', fontWeight: 400 };
const detailSeparator = { color: '#cbd5e1', margin: '0 4px' };
const actionButtonsWrapper = { display: 'flex', gap: '12px' };
const notesBtnStyle = { padding: '10px 20px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' };
const historyBtnStyle = { padding: '10px 20px', borderRadius: '10px', border: '1px solid #003087', background: '#ffffff', color: '#003087', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' };
const backdropStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 999 };
const sideCardStyle: React.CSSProperties = { position: 'fixed', top: 0, right: 0, width: '850px', height: '100vh', backgroundColor: '#ffffff', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', flexDirection: 'row', borderLeft: '1px solid #e2e8f0' };
const internalSidebar: React.CSSProperties = { width: '300px', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '24px 16px', gap: '20px' };
const mainContentArea: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', overflow: 'hidden' };
const sidebarHeader: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '40px' };
const iconBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#003087', transition: 'all 0.2s' };
const expandedSearchContainer: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #003087', width: '100%', height: '40px' };
const sidebarSearchInput: React.CSSProperties = { border: 'none', outline: 'none', fontSize: '0.85rem', width: '100%', background: 'transparent' };
const recentSection: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' };
const sectionLabel: React.CSSProperties = { fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' };
const cardHeader: React.CSSProperties = { padding: '24px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const cardFooter: React.CSSProperties = { padding: '20px 25px', borderTop: '1px solid #e2e8f0', textAlign: 'right', backgroundColor: '#fcfdfe' };
const menuItemStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: '0.75rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '6px', transition: 'background 0.2s' };

interface ConsultationLayoutProps {
  children: React.ReactNode;
  patient: any;
  patientId: string;
  visitId: string;
}

export default function ConsultationLayout({ children, patient, patientId, visitId }: ConsultationLayoutProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<string[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { finalizeDraft, setFinalizeDraft } = useConsultationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    if (activeMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/specialist/consultation`);
      if (res.ok) {
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, fetchHistory]);

  const toggleDate = (date: string) => {
    setExpandedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const handleNewNote = () => {
    setEditingNoteId(null);
    setFinalizeDraft({ notes: '' });
  };

  const handleSelectNote = (item: any) => {
    setEditingNoteId(item.id);
    setFinalizeDraft({ notes: item.notes });
    setActiveMenuId(null);
  };

  const handleSave = async () => {
    if (!finalizeDraft.notes.trim()) return;
    setIsSaving(true);
    const method = editingNoteId ? 'PUT' : 'POST';
    const payload = editingNoteId ? { id: editingNoteId, notes: finalizeDraft.notes } : { patientId, notes: finalizeDraft.notes };
    try {
      const response = await fetch('/api/specialist/consultation', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error();
      setSaveStatus('success');
      await fetchHistory(); 
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const response = await fetch(`/api/specialist/consultation?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      if (editingNoteId === id) handleNewNote();
      await fetchHistory();
      setActiveMenuId(null);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const groupedHistory = useMemo(() => {
    const filtered = history.filter(item => 
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.reduce((groups, item) => {
      const date = new Date(item.updatedAt).toLocaleDateString(undefined, { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
      return groups;
    }, {} as Record<string, any[]>);
  }, [history, searchTerm]);

  return (
    <div style={pageContainer}>
      <header style={headerStyle}>
        <div style={patientInfoWrapper}>
          <span style={infoTextStyle}><strong>Name:</strong> {patient.fullName}</span>
          <span style={detailSeparator}>•</span>
          <span style={infoTextStyle}><strong>Card No:</strong> {patient.mrn || '—'}</span>
          <span style={detailSeparator}>•</span>
          <span style={{ 
            ...infoTextStyle, 
            backgroundColor: visitId === 'No Active Visit' ? '#fee2e2' : '#e0f2fe', 
            padding: '2px 10px', 
            borderRadius: '8px', 
            color: visitId === 'No Active Visit' ? '#991b1b' : '#0369a1', 
            fontSize: '0.95rem', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
          }}>
            <strong>Visit ID:</strong> {visitId}
          </span>
        </div>
        <div style={actionButtonsWrapper}>
          <button onClick={() => setIsOpen(true)} style={notesBtnStyle}><FileEdit size={18} /> Open Notes</button>
          <Link href={`/specialist/history/${patientId}`} style={historyBtnStyle}><History size={18} /> View History</Link>
        </div>
      </header>

      <main>{children}</main>

      {isOpen && (
        <>
          <div style={backdropStyle} onClick={() => !isSaving && setIsOpen(false)} />
          <aside style={sideCardStyle}>
            <div style={internalSidebar}>
              <div style={sidebarHeader}>
                {!isSearching ? (
                  <>
                    <button style={{...iconBtnStyle, backgroundColor: !editingNoteId ? '#003087' : '#ffffff', color: !editingNoteId ? '#ffffff' : '#003087'}} onClick={handleNewNote}><Plus size={20} /></button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>TIMELINE</span>
                    <button style={iconBtnStyle} onClick={() => setIsSearching(true)}><Search size={18} /></button>
                  </>
                ) : (
                  <div style={expandedSearchContainer}>
                    <Search size={16} style={{ color: '#94a3b8' }} />
                    <input autoFocus type="text" placeholder="Search..." style={sidebarSearchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <button onClick={() => { setIsSearching(false); setSearchTerm(''); }} style={{ background: 'none', border: 'none' }}><X size={16} /></button>
                  </div>
                )}
              </div>

              <div style={recentSection}>
                <div style={sectionLabel}><Clock size={12} /> RECENT UPDATES</div>
                {isLoadingHistory ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 size={20} className="animate-spin" /></div>
                ) : (
                  Object.entries(groupedHistory).map(([date, items]) => {
                    const isExpanded = expandedDates.includes(date);
                    return (
                      <div key={date} style={{ marginBottom: '8px' }}>
                        <button onClick={() => toggleDate(date)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px', backgroundColor: isExpanded ? '#f1f5f9' : 'transparent', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isExpanded ? <ChevronDown size={14} color="#003087" /> : <ChevronRight size={14} color="#64748b" />}
                            <span style={{ fontSize: '0.75rem', fontWeight: isExpanded ? 800 : 700, color: isExpanded ? '#003087' : '#334155' }}>{date}</span>
                          </div>
                          <span style={{ fontSize: '0.65rem', backgroundColor: isExpanded ? '#003087' : '#e2e8f0', padding: '2px 8px', borderRadius: '10px', color: isExpanded ? '#fff' : '#64748b' }}>{items.length}</span>
                        </button>

                        <div style={{ maxHeight: isExpanded ? '2000px' : '0', opacity: isExpanded ? 1 : 0, overflow: isExpanded ? 'visible' : 'hidden', transition: 'all 0.3s ease', marginLeft: '12px', paddingLeft: '8px', borderLeft: '2px solid #cbd5e1' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '8px' }}>
                            {items.map((item) => (
                              <div key={item.id} style={{ position: 'relative', zIndex: activeMenuId === item.id ? 1001 : 1 }}>
                                <div onClick={() => handleSelectNote(item)} style={{ padding: '12px', borderRadius: '10px', cursor: 'pointer', backgroundColor: editingNoteId === item.id ? '#e0e7ff' : (item.patientId === patientId ? '#eff6ff' : '#ffffff'), border: editingNoteId === item.id ? '1px solid #4338ca' : '1px solid #f1f5f9', position: 'relative' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', paddingRight: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <User size={12} color={item.patientId === patientId ? '#003087' : '#94a3b8'} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{item.patient?.fullName}</span>
                                    </div>
                                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.notes}</p>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }} style={{ position: 'absolute', top: '10px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                  <MoreHorizontal size={16} />
                                </button>
                                {activeMenuId === item.id && (
                                  <div ref={menuRef} className="menu-card" style={{ position: 'absolute', top: '30px', right: '0', backgroundColor: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', borderRadius: '8px', zIndex: 9999, border: '1px solid #e2e8f0', minWidth: '140px', padding: '5px' }}>
                                    <button onClick={() => handleSelectNote(item)} style={menuItemStyle} className="menu-item">
                                      <FileEdit size={14} color="#4338ca" /> Edit Note
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} style={{ ...menuItemStyle, color: '#ef4444' }} className="menu-item">
                                      <Trash2 size={14} /> Delete Note
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={mainContentArea}>
              <div style={cardHeader}>
                <div>
                   <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {editingNoteId ? <FileEdit size={22} color="#4338ca" /> : <Plus size={22} color="#003087" />}
                    {editingNoteId ? 'Update Note' : 'New Clinical Note'}
                   </h2>
                   <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Patient: <strong>{patient.fullName}</strong></p>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
              </div>
              <div style={{ flex: 1, padding: '30px', backgroundColor: '#fcfdfe' }}>
                <textarea style={{ width: '100%', height: '100%', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', outline: 'none', resize: 'none', fontSize: '1.1rem', color: '#334155', lineHeight: '1.7' }} value={finalizeDraft.notes} onChange={(e) => setFinalizeDraft({ notes: e.target.value })} placeholder="Start documentation..." />
              </div>
              <div style={cardFooter}>
                <button onClick={handleSave} disabled={isSaving} style={{ backgroundColor: saveStatus === 'success' ? '#10b981' : (editingNoteId ? '#4338ca' : '#003087'), color: 'white', padding: '14px 36px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  {isSaving ? <Loader2 size={20} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle2 size={20} /> : <Save size={20} />}
                  {saveStatus === 'success' ? 'Saved' : editingNoteId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      <style jsx global>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .menu-card { animation: menuFadeIn 0.15s ease-out; }
        @keyframes menuFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .menu-item:hover { background-color: #f1f5f9; }
        div::-webkit-scrollbar { width: 5px; }
        div::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}