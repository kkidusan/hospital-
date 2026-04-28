'use client';
import { useState, useEffect } from "react";
import { 
  Plus, Search, MoreVertical, CheckCircle2, Edit3, 
  Trash2, UserPlus, X, Settings2, UserCheck, 
  Loader2, BedDouble, AlertTriangle
} from "lucide-react";

export default function WardManagementPage() {
  const [wards, setWards] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Dialog & Toast States
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, isOpen: boolean}>({ id: '', isOpen: false });
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const staticWardCategories = [
    { id: "EMERGENCY_TRIAGE", label: "Emergency & Triage" },
    { id: "GENERAL", label: "General Ward" },
    { id: "ICU", label: "ICU" },
    { id: "MATERNITY", label: "Maternity" },
    { id: "PEDIATRICS", label: "Pediatrics" },
    { id: "SURGICAL", label: "Surgical" },
    { id: "MEDICAL", label: "Medical" },
  ];

  const [formData, setFormData] = useState({
    wardType: "GENERAL",
    name: "",
    isPrivate: false
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/wards/beds");
      const data = await res.json();
      setWards(Array.isArray(data) ? data : []);
      
      if (selectedRoom) {
        const refreshed = data.flatMap((w: any) => w.rooms).find((r: any) => r.id === selectedRoom.id);
        if (refreshed) setSelectedRoom(refreshed);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (actionType: string, item: any) => {
    setOpenMenuId(null);
    if (actionType === 'EDIT') {
      const fullRoom = wards.flatMap(w => w.rooms).find(r => r.id === item.roomId);
      setSelectedRoom(fullRoom);
      setFormData({ wardType: item.wardType, name: item.roomNumber, isPrivate: item.isPrivate });
      setIsSidebarOpen(true);
    }
    if (actionType === 'ADD_BED') {
      // Logic: Private rooms can only have 1 bed
      if (item.isPrivate && item.totalBeds >= 1) {
        showToast("Private rooms are limited to 1 bed", "error");
        return;
      }
      
      const nextBed = (item.totalBeds || 0) + 1;
      const bedName = `${item.roomNumber}-B${nextBed}`;
      const res = await fetch("/api/admin/wards/beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'BED', roomId: item.roomId, name: bedName, wardType: item.wardType }),
      });
      if (res.ok) {
        showToast("Bed registered successfully");
        fetchData();
      }
    }
  };

  const confirmDelete = async () => {
    const res = await fetch(`/api/admin/wards/beds?bedId=${deleteConfirm.id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteConfirm({ id: '', isOpen: false });
      showToast("Asset removed from registry");
      fetchData();
    } else {
      showToast("Could not remove asset", "error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = selectedRoom ? "PATCH" : "POST";
    const body = selectedRoom ? { ...formData, roomId: selectedRoom.id } : { ...formData, type: 'ROOM' };
    const res = await fetch("/api/admin/wards/beds", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) { 
      setIsSidebarOpen(false); 
      setSelectedRoom(null); 
      showToast(selectedRoom ? "Registry updated" : "New room registered");
      fetchData(); 
    }
  };

  const tableData = wards.flatMap((ward: any) => 
    ward.rooms.map((room: any) => {
      const beds = room.beds || [];
      return {
        wardType: ward.type,
        roomNumber: room.roomNumber,
        roomId: room.id,
        isPrivate: room.isPrivate,
        totalBeds: beds.length,
        available: beds.filter((b: any) => !b.isOccupied && !b.isUnderMaintenance).length,
        occupied: beds.filter((b: any) => b.isOccupied).length,
        maintenance: beds.filter((b: any) => b.isUnderMaintenance).length,
        uniqueId: `room-${room.id}`
      };
    })
  ).filter(i => i.roomNumber.toString().includes(searchQuery) || i.wardType.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 md:p-8 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300">
          <div className={`${toast.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'} text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} />}
            <span className="text-sm font-bold uppercase tracking-wider">{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600">Registry</h1>
            <p className="text-slate-500 font-medium">Hospital Asset & Capacity Monitor</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input 
                type="text" placeholder="Search rooms..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white border-none shadow-sm rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => { setSelectedRoom(null); setFormData({wardType:'GENERAL', name:'', isPrivate:false}); setIsSidebarOpen(true); }}
              className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> Add New Room
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white overflow-visible">
          {loading ? (
            <div className="p-20 flex justify-center items-center flex-col gap-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Refreshing Registry Assets...</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ward Category</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Room Info</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Total Beds</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Capacity Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((item) => (
                  <tr key={item.uniqueId} className="group hover:bg-slate-50/80 transition-all">
                    <td className="px-8 py-5 border-b border-slate-50 font-bold text-slate-800">{item.wardType.replace('_', ' ')}</td>
                    <td className="px-8 py-5 border-b border-slate-50">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs">{item.roomNumber}</span>
                        {item.isPrivate && <span className="text-[9px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Private</span>}
                      </div>
                    </td>
                    <td className="px-8 py-5 border-b border-slate-50 font-black text-slate-700 text-lg">{item.totalBeds}</td>
                    <td className="px-8 py-5 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5" title="Available">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-600">{item.available}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Occupied">
                          <UserCheck size={14} className="text-rose-500" />
                          <span className="text-xs font-bold text-slate-600">{item.occupied}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Maintenance">
                          <Settings2 size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-slate-600">{item.maintenance}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 border-b border-slate-50 text-right relative">
                      <button 
                        onClick={() => setOpenMenuId(openMenuId === item.uniqueId ? null : item.uniqueId)}
                        className={`p-2 rounded-xl transition-all ${openMenuId === item.uniqueId ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:text-slate-900'}`}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === item.uniqueId && (
                        <div className="absolute right-8 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-40 py-2 text-left animate-in fade-in zoom-in-95 duration-150">
                          {/* Disable Quick Add Bed if Private and already has 1 bed */}
                          <button 
                            disabled={item.isPrivate && item.totalBeds >= 1}
                            onClick={() => handleAction('ADD_BED', item)} 
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <UserPlus size={16} /> Quick Add Bed
                          </button>
                          <button onClick={() => handleAction('EDIT', item)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">
                            <Edit3 size={16} /> Manage Room & Beds
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Side Slide-over (Manager) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500">
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">{selectedRoom ? 'Manage Room' : 'Add Room'}</h2>
            <p className="text-slate-500 text-sm mb-10">Configure hospital room registry assets.</p>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Ward Location</label>
                <select 
                  className="w-full bg-slate-50 border-2 border-transparent focus:bg-white rounded-2xl px-5 py-4 font-bold text-sm outline-none transition-all"
                  value={formData.wardType} onChange={(e) => setFormData({...formData, wardType: e.target.value})}
                >
                  {staticWardCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Room Number</label>
                <input 
                  required className="w-full bg-slate-50 border-2 border-transparent focus:bg-white rounded-2xl px-5 py-4 font-bold text-sm outline-none transition-all"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-100 transition-all cursor-pointer">
                 <input 
                  type="checkbox" id="isPrivate" className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-0"
                  checked={formData.isPrivate} onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                 />
                 <label htmlFor="isPrivate" className="text-sm font-bold text-slate-700 cursor-pointer flex-1">Private Room Registry</label>
              </div>

              {selectedRoom && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Active Bed Assets ({selectedRoom.beds?.length})</h3>
                  <div className="space-y-3">
                    {selectedRoom.beds?.map((bed: any) => (
                      <div key={bed.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-white hover:border-slate-200 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <BedDouble size={16} className="text-blue-600" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{bed.bedNumber}</span>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setDeleteConfirm({ id: bed.id, isOpen: true })} 
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 mt-10 active:scale-[0.98]">
                {selectedRoom ? 'Update Registry' : 'Save Room Registry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CENTERED DELETE DIALOG */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteConfirm({id:'', isOpen:false})} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-white animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center mb-2 tracking-tight uppercase">Confirm Deletion</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">Are you sure you want to remove this bed from the hospital registry? This action is permanent.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-100"
              >
                Permanently Delete
              </button>
              <button 
                onClick={() => setDeleteConfirm({id:'', isOpen:false})}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancel Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}