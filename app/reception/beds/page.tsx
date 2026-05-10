'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bed, Search, Loader2, RefreshCw, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BedManagement() {
  const [wards, setWards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/wards/beds");
      const data = await res.json();
      setWards(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const allBeds = wards.flatMap(ward => 
    ward.rooms.flatMap((room: any) => 
      (room.beds || []).map((bed: any) => ({
        id: bed.id,
        bedNo: bed.bedNumber,
        ward: ward.type.replace('_', ' '),
        roomNo: room.roomNumber,
        status: bed.isUnderMaintenance ? "MAINTENANCE" : (bed.isOccupied ? "OCCUPIED" : "AVAILABLE"),
        patientName: bed.currentPatient?.name || null, 
        mrn: bed.currentPatient?.mrn || null,
        since: bed.updatedAt ? new Date(bed.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : null,
        isPrivate: room.isPrivate
      }))
    )
  );

  const filteredBeds = allBeds.filter(bed =>
    bed.bedNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bed.ward.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const total = allBeds.length;
  const occupied = allBeds.filter(b => b.status === "OCCUPIED").length;
  const available = allBeds.filter(b => b.status === "AVAILABLE").length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-sans">
      
      {/* HEADER SECTION - Borderless & Flat */}
      <div className="px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          
          {/* Brand/Title */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 flex items-center gap-2">
              <Bed className="text-blue-600" size={24} /> 
              BED REGISTRY
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Real-Time Hospital Capacity
            </p>
          </div>

          {/* CENTERED STATISTICS - Minimalist */}
          <div className="flex items-center justify-center gap-10">
            <div className="text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-black text-slate-900">{total}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest mb-1">Occupied</p>
              <p className="text-xl font-black text-slate-900">{occupied}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Available</p>
              <p className="text-xl font-black text-slate-900">{available}</p>
            </div>
          </div>

          {/* SEARCH ACTIONS - Removed borders and outlines */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-11 pr-4 py-3 bg-slate-100/60 border-none outline-none focus:outline-none focus:ring-0 rounded-2xl text-sm w-full md:w-56 transition-all placeholder:text-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchData} 
              className="p-3 text-slate-400 hover:text-blue-600 transition-colors border-none outline-none focus:outline-none"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* REGISTRY TABLE */}
      <div className="px-6 pb-20">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-slate-200" size={40} />
          </div>
        ) : (
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Bed Identity</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Patient Details</th>
                <th className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {filteredBeds.map((bed) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={bed.id} 
                    className="group"
                  >
                    <td className="px-4 py-5 bg-transparent group-hover:bg-slate-50/80 transition-colors rounded-l-2xl">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${bed.status === 'OCCUPIED' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300'}`}>
                          <Bed size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{bed.bedNo}</span>
                            {bed.isPrivate && <span className="text-[7px] font-black bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded uppercase">Private</span>}
                          </div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">{bed.ward} • {bed.roomNo}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-5 bg-transparent group-hover:bg-slate-50/80 transition-colors">
                      {bed.patientName ? (
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{bed.patientName}</div>
                          <div className="text-[10px] font-mono text-blue-500 font-bold">{bed.mrn}</div>
                        </div>
                      ) : (
                        <span className="text-slate-200 text-[10px] font-black uppercase tracking-widest">Vacant</span>
                      )}
                    </td>

                    <td className="px-4 py-5 bg-transparent group-hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col">
                        <span className={`text-[9px] font-black tracking-widest ${
                          bed.status === 'OCCUPIED' ? 'text-orange-500' :
                          bed.status === 'MAINTENANCE' ? 'text-amber-500' :
                          'text-emerald-500'
                        }`}>
                          {bed.status}
                        </span>
                        {bed.since && <span className="text-[9px] text-slate-400 font-bold">{bed.since}</span>}
                      </div>
                    </td>

                    <td className="px-4 py-5 bg-transparent group-hover:bg-slate-50/80 transition-colors rounded-r-2xl text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-all outline-none border-none">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}