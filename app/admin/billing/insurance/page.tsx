"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpRight, 
  Building2, 
  Plus,
  Download,
  Info
} from 'lucide-react';

// Types for the Insurance System
interface Claim {
  id: string;
  patientName: string;
  insuranceProvider: string;
  policyNumber: string;
  claimAmount: number;
  approvedAmount: number | null;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
  submittedDate: string;
}

const InsurancePage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const claims: Claim[] = [
    { id: "CLM-9901", patientName: "Kebede Kassaye", insuranceProvider: "Nyala Insurance", policyNumber: "NY-88210", claimAmount: 12500, approvedAmount: 11000, status: "Approved", submittedDate: "2024-03-25" },
    { id: "CLM-9902", patientName: "Hanna Tadesse", insuranceProvider: "Ethio-Life", policyNumber: "EL-44322", claimAmount: 4500, approvedAmount: null, status: "Pending", submittedDate: "2024-03-28" },
    { id: "CLM-9903", patientName: "Samuel Bekele", insuranceProvider: "Global Insurance", policyNumber: "GI-11200", claimAmount: 32000, approvedAmount: null, status: "Rejected", submittedDate: "2024-03-20" },
    { id: "CLM-9904", patientName: "Marta Yosef", insuranceProvider: "Nyala Insurance", policyNumber: "NY-77100", claimAmount: 8400, approvedAmount: null, status: "Processing", submittedDate: "2024-03-29" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. Insurance Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Insurance Claims</h2>
          <p className="text-slate-500 text-sm">Manage TPA approvals and track provider reimbursements.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold">
            <Download size={18} /> Export List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm font-semibold">
            <Plus size={18} /> New Claim Submission
          </button>
        </div>
      </div>

      {/* 2. Quick Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard title="Pending Review" count={12} icon={<Clock size={20} className="text-amber-500" />} color="amber" />
        <StatusCard title="Approved (MTD)" count={45} icon={<CheckCircle2 size={20} className="text-emerald-500" />} color="emerald" />
        <StatusCard title="Rejected" count={3} icon={<XCircle size={20} className="text-red-500" />} color="red" />
        <StatusCard title="Total Providers" count={8} icon={<Building2 size={20} className="text-blue-500" />} color="blue" />
      </div>

      {/* 3. TPA Information Notice */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <Info className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm">
          <p className="font-bold text-blue-900">TPA Settlement Reminder</p>
          <p className="text-blue-700 opacity-80">Claims typically take 7-14 business days for processing. Ensure all itemized bills (Room Rent, Pharmacy, Lab) are attached before final submission.</p>
        </div>
      </div>

      {/* 4. Claims Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Policy # or Patient Name..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all text-slate-900"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 text-slate-600 hover:text-blue-600 text-sm font-semibold transition-colors">
            <Filter size={18} /> Advance Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Claim ID</th>
                <th className="px-6 py-4">Patient / Policy</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Amount (ETB)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Submitted</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">{claim.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-800">{claim.patientName}</p>
                    <p className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{claim.policyNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-[10px] font-bold text-blue-700 uppercase">
                        {claim.insuranceProvider.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-600 font-medium">{claim.insuranceProvider}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{claim.claimAmount.toLocaleString()}</div>
                    {claim.approvedAmount && (
                      <div className="text-[10px] text-emerald-600 font-bold">Approved: {claim.approvedAmount.toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <ClaimStatus status={claim.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                    {claim.submittedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold uppercase ml-auto">
                      View <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatusCard = ({ title, count, icon, color }: any) => {
  const colorMap: any = {
    amber: "border-amber-100 bg-amber-50/30",
    emerald: "border-emerald-100 bg-emerald-50/30",
    red: "border-red-100 bg-red-50/30",
    blue: "border-blue-100 bg-blue-50/30"
  };
  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]} shadow-xs`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-black text-slate-800">{count}</span>
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{title}</p>
    </div>
  );
};

const ClaimStatus = ({ status }: { status: Claim['status'] }) => {
  const styles: any = {
    Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Processing: "bg-blue-50 text-blue-600 border-blue-100",
    Rejected: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default InsurancePage;