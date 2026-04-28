'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Stethoscope, CalendarDays, UserPlus, Search, Clock, User, Mail, 
  Briefcase, ShieldCheck, Edit, Trash2, Lock, AlertCircle, CheckCircle2, 
  Loader2, RefreshCw, Sun, Sunset, Moon, Plus, ChevronLeft, ChevronRight,
  X, Save
} from 'lucide-react';

type Role = 'ADMIN' | 'RECEPTION' | 'TRIAGE' | 'SPECIALIST' | 'LABORATORY' | 'RADIOLOGY' | 'BILLING' | 'FINANCIAL';
type ShiftType = 'Morning' | 'Afternoon' | 'Night';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  specialty?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'OFF_DUTY';
}

interface ShiftAssignment {
  id: string;
  staffId: string;
  staffName: string;
  day: string;
  shift: ShiftType;
  role: Role;
}

const ROLES: { value: Role; label: string }[] = [
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'TRIAGE', label: 'Triage Nurse' },
  { value: 'SPECIALIST', label: 'Specialist Doctor' },
  { value: 'LABORATORY', label: 'Laboratory Technician' },
  { value: 'RADIOLOGY', label: 'Radiology Technician' },
  { value: 'BILLING', label: 'Billing Officer' },
  { value: 'FINANCIAL', label: 'Finance / Accounts' },
  { value: 'ADMIN', label: 'System Administrator' },
];

const SPECIALTIES = ['General Practitioner', 'Internal Medicine', 'Pediatrics', 'Cardiology', 'Neurology', 'Orthopedics', 'Surgeon', 'Dermatology', 'Psychiatry', 'Other'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SHIFT_SLOTS: { type: ShiftType; icon: React.ReactNode; time: string; color: string }[] = [
  { type: 'Morning',   icon: <Sun size={14} />,    time: '06:00 - 14:00', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { type: 'Afternoon', icon: <Sunset size={14} />, time: '14:00 - 22:00', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { type: 'Night',     icon: <Moon size={14} />,   time: '22:00 - 06:00', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
];

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<'doctors' | 'roster'>('doctors');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/staff', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch staff');
      const data = await res.json();
      setStaff(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Mock initial shifts
  useEffect(() => {
    setShifts([
      { id: 's1', staffId: '1', staffName: 'Dr. Sarah Tesfaye', day: 'Monday', shift: 'Morning', role: 'SPECIALIST' },
      { id: 's2', staffId: '2', staffName: 'Abebech Kebede', day: 'Tuesday', shift: 'Afternoon', role: 'TRIAGE' },
    ]);
  }, []);

  const filteredStaff = useMemo(() => {
    return staff.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, staff]);

  // Assign shift
  const assignShift = (staffMember: StaffMember, day: string, shiftType: ShiftType) => {
    const alreadyAssigned = shifts.some(
      s => s.staffId === staffMember.id && s.day === day && s.shift === shiftType
    );

    if (alreadyAssigned) {
      alert(`${staffMember.name} is already assigned to this shift on ${day}.`);
      return;
    }

    const newShift: ShiftAssignment = {
      id: `shift_${Date.now()}`,
      staffId: staffMember.id,
      staffName: staffMember.name,
      day,
      shift: shiftType,
      role: staffMember.role,
    };

    setShifts(prev => [...prev, newShift]);
    setIsPublished(false); // Unpublish when changes are made
  };

  // Remove shift
  const removeShift = (shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
    setIsPublished(false);
  };

  // Publish Roster - This is the main function you asked for
  const publishRoster = async () => {
    if (shifts.length === 0) {
      alert("No shifts assigned yet. Please assign some shifts before publishing.");
      return;
    }

    try {
      // Here you would normally send to your backend:
      // await fetch('/api/roster/publish', { method: 'POST', body: JSON.stringify(shifts) });

      // For now, we simulate success
      setTimeout(() => {
        setIsPublished(true);
        setPublishMessage(`Roster for April 13 - 19, 2026 has been published successfully! (${shifts.length} assignments)`);
        
        // Auto hide message after 4 seconds
        setTimeout(() => setPublishMessage(''), 4000);
      }, 800);

    } catch (err) {
      alert("Failed to publish roster. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Management</h1>
            <p className="text-sm text-slate-500">Manage hospital personnel and shift roster</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button onClick={fetchStaff} className="p-3 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-white transition">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsRegisterOpen(true)} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <UserPlus size={18} /> Add New Staff
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('doctors')} 
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'doctors' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Stethoscope size={18} /> Staff Directory
          </button>
          <button 
            onClick={() => setActiveTab('roster')} 
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${activeTab === 'roster' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarDays size={18} /> Shift Roster
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'doctors' ? (
          loading && staff.length === 0 ? <Loader /> : 
          error ? <ErrorView message={error} retry={fetchStaff} /> : 
          <StaffTable staff={filteredStaff} />
        ) : (
          <ShiftRosterView 
            staff={staff} 
            shifts={shifts} 
            isPublished={isPublished}
            onAssignShift={assignShift} 
            onRemoveShift={removeShift}
            onPublishRoster={publishRoster}
            publishMessage={publishMessage}
          />
        )}
      </div>

      {/* Registration Modal */}
      {isRegisterOpen && (
        <Overlay onClose={() => setIsRegisterOpen(false)}>
          <StaffRegistrationForm 
            onClose={() => setIsRegisterOpen(false)} 
            onRefresh={fetchStaff} 
          />
        </Overlay>
      )}
    </div>
  );
}

/* ====================== SHIFT ROSTER VIEW (UPDATED) ====================== */
function ShiftRosterView({ 
  staff, 
  shifts, 
  isPublished,
  onAssignShift, 
  onRemoveShift,
  onPublishRoster,
  publishMessage
}: { 
  staff: StaffMember[]; 
  shifts: ShiftAssignment[]; 
  isPublished: boolean;
  onAssignShift: (staff: StaffMember, day: string, shift: ShiftType) => void;
  onRemoveShift: (id: string) => void;
  onPublishRoster: () => void;
  publishMessage: string;
}) {

  const getAssignedStaff = (day: string, shiftType: ShiftType) => {
    return shifts.filter(s => s.day === day && s.shift === shiftType);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Weekly Shift Roster</h2>
          <p className="text-sm text-slate-500">April 13 – April 19, 2026</p>
        </div>

        <button 
          onClick={onPublishRoster}
          disabled={isPublished}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all ${
            isPublished 
              ? 'bg-emerald-600 text-white cursor-default' 
              : 'bg-slate-900 hover:bg-black text-white'
          }`}
        >
          {isPublished ? (
            <> <CheckCircle2 size={18} /> Published ✓ </>
          ) : (
            <> <Save size={18} /> Publish Roster </>
          )}
        </button>
      </div>

      {/* Publish Success Message */}
      {publishMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-3 rounded-2xl flex items-center gap-3">
          <CheckCircle2 size={20} />
          {publishMessage}
        </div>
      )}

      <div className="overflow-x-auto pb-6">
        <table className="w-full border-separate border-spacing-y-3 min-w-[1100px]">
          <thead>
            <tr>
              <th className="w-48 text-left pl-4"></th>
              {DAYS.map(day => (
                <th key={day} className="text-center font-bold text-slate-600 pb-4 min-w-[160px]">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHIFT_SLOTS.map((slot) => (
              <tr key={slot.type} className="group">
                <td className="pr-6 py-2">
                  <div className={`p-4 rounded-2xl border ${slot.color} shadow-sm bg-white`}>
                    <div className="flex items-center gap-3 font-bold text-sm">
                      {slot.icon}
                      <span>{slot.type}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock size={13} /> {slot.time}
                    </div>
                  </div>
                </td>

                {DAYS.map((day) => {
                  const assigned = getAssignedStaff(day, slot.type);
                  return (
                    <td key={`${day}-${slot.type}`} className="align-top p-1">
                      <div className="min-h-[180px] bg-white border-2 border-dashed border-slate-200 rounded-2xl p-3 hover:border-blue-300 transition-all">
                        {assigned.length > 0 ? (
                          <div className="space-y-2">
                            {assigned.map((assignment) => (
                              <div 
                                key={assignment.id}
                                className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm relative group/assign"
                              >
                                <div className="font-medium text-sm pr-6">{assignment.staffName}</div>
                                <div className="text-[10px] text-slate-500">{assignment.role}</div>
                                
                                <button
                                  onClick={() => onRemoveShift(assignment.id)}
                                  className="absolute top-2 right-2 opacity-0 group-hover/assign:opacity-100 text-red-500 hover:bg-red-50 p-1 rounded-full transition"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div 
                            className="h-full flex items-center justify-center text-slate-300 hover:text-blue-500 cursor-pointer transition"
                            onClick={() => {
                              const availableStaff = staff.find(s => s.status === 'ACTIVE');
                              if (availableStaff) {
                                onAssignShift(availableStaff, day, slot.type);
                              } else {
                                alert("No active staff available to assign.");
                              }
                            }}
                          >
                            <div className="flex flex-col items-center gap-1 text-xs">
                              <Plus size={24} strokeWidth={2.5} />
                              <span>Assign Staff</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-100 rounded"></div> Morning</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 rounded"></div> Afternoon</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-100 rounded"></div> Night</div>
      </div>
    </div>
  );
}

/* ====================== REMAINING COMPONENTS (UNCHANGED) ====================== */
function StaffTable({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Staff Member</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {staff.length === 0 ? (
            <tr><td colSpan={4} className="text-center py-12 text-slate-400">No staff found</td></tr>
          ) : (
            staff.map((person) => (
              <tr key={person.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-slate-800">{person.name}</div>
                    <div className="text-sm text-slate-500">{person.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-4 py-1 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                    {person.role === 'SPECIALIST' && person.specialty ? person.specialty : person.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusTag status={person.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"><Edit size={16} /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function StaffRegistrationForm({ onClose, onRefresh }: { onClose: () => void; onRefresh: () => void }) {
  const [form, setForm] = useState({ 
    name: '', email: '', password: '', role: 'RECEPTION' as Role, specialty: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Registration failed');

      setSuccess(true);
      onRefresh();
      setTimeout(() => onClose(), 1800);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-1">Register New Staff</h2>
      <p className="text-slate-500 text-sm mb-8">Create system access for hospital staff</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields same as before */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">FULL NAME</label>
          <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="Dr. Mekdes Alemayehu" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">EMAIL ADDRESS</label>
          <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="mekdes@hospital.et" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">PASSWORD</label>
          <input type="password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500" placeholder="••••••••" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">ROLE</label>
          <select value={form.role} onChange={e => setForm({...form, role: e.target.value as Role})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        {form.role === 'SPECIALIST' && (
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">SPECIALTY</label>
            <select required value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500">
              <option value="">Select Specialty</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl">{error}</p>}
        {success && <p className="text-emerald-600 text-sm bg-emerald-50 p-3 rounded-xl">✓ Staff registered successfully!</p>}

        <button type="submit" disabled={submitting || success} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-semibold text-sm tracking-wider transition disabled:opacity-70">
          {submitting ? 'Registering...' : 'Register Staff Member'}
        </button>
      </form>
    </div>
  );
}

function Loader() { 
  return <div className="py-20 flex flex-col items-center text-slate-400"><Loader2 className="animate-spin mb-3" size={32} /><p className="text-sm font-medium">Loading staff directory...</p></div>; 
}

function ErrorView({ message, retry }: { message: string; retry: () => void }) {
  return <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"><AlertCircle className="mx-auto text-red-500 mb-3" size={40} /><p className="font-medium text-red-700">{message}</p><button onClick={retry} className="mt-4 text-blue-600 hover:underline text-sm">Try Again</button></div>;
}

function StatusTag({ status }: { status: string }) {
  const colors: Record<string, string> = { ACTIVE: "bg-emerald-100 text-emerald-700", ON_LEAVE: "bg-amber-100 text-amber-700", OFF_DUTY: "bg-slate-100 text-slate-600" };
  return <span className={`inline-block px-4 py-1 text-xs font-bold rounded-full ${colors[status] || 'bg-gray-100'}`}>{status.replace('_', ' ')}</span>;
}

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-8 overflow-y-auto">{children}</div>
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 text-2xl">✕</button>
      </div>
    </div>
  );
}