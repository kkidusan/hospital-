"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  AlertCircle, 
  User, 
  Clock, 
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data - Replace with your actual API fetch
const MOCK_BEDS = [
  { id: 1, bedNo: "B-01", ward: "Emergency-A", status: "OCCUPIED", type: "EMERGENCY", patientName: "Abebe Kebede", mrn: "TEP_20260401", since: "10:30 AM" },
  { id: 2, bedNo: "B-02", ward: "Emergency-A", status: "OCCUPIED", type: "NORMAL", patientName: "Sara Tesfaye", mrn: "WD-202604-0012", since: "09:15 AM" },
  { id: 3, bedNo: "B-03", ward: "General-B", status: "AVAILABLE", type: null, patientName: null, mrn: null, since: null },
  { id: 4, bedNo: "B-04", ward: "Emergency-A", status: "OCCUPIED", type: "EMERGENCY", patientName: "Mulugeta Alene", mrn: "TEP_20260405", since: "11:00 AM" },
];

export default function BedManagement() {
  const [beds, setBeds] = useState(MOCK_BEDS);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bed className="text-blue-600" /> Reception Bed Dashboard
          </h1>
          <p className="text-gray-500">Monitor Triage & General Bed Occupancy</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input 
              type="text" 
              placeholder="Search MRN or Name..." 
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 bg-white shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="size-4" /> Filter
          </button>
        </div>
      </div>

      {/* Bed Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-gray-500 text-sm mb-1">Total Beds</div>
          <div className="text-2xl font-bold">24</div>
        </div>
        <div className="bg-red-50 p-5 rounded-xl border border-red-100 shadow-sm">
          <div className="text-red-600 text-sm mb-1 font-medium">Emergency Occupied</div>
          <div className="text-2xl font-bold text-red-700">12</div>
        </div>
        <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm">
          <div className="text-green-600 text-sm mb-1 font-medium">Available Beds</div>
          <div className="text-2xl font-bold text-green-700">08</div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Bed Info</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Patient Details</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Category</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beds.map((bed, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={bed.id} 
                  className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${bed.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Bed size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{bed.bedNo}</div>
                        <div className="text-xs text-gray-500">{bed.ward}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {bed.patientName ? (
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-1">
                          <User size={14} className="text-gray-400" /> {bed.patientName}
                        </div>
                        <div className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-1">
                          {bed.mrn}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No Patient</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {bed.type === 'EMERGENCY' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full uppercase">
                        <AlertCircle size={12} /> Triage/Emergency
                      </span>
                    ) : bed.type === 'NORMAL' ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase">
                        Normal Admission
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded w-fit ${
                        bed.status === 'OCCUPIED' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {bed.status}
                      </span>
                      {bed.since && (
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> Admitted {bed.since}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}