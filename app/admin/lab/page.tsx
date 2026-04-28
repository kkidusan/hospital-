"use client";
import React, { useState } from 'react';
import { 
  FlaskConical, 
  ClipboardList, 
  Beaker, 
  Microscope, 
  Search, 
  Plus,
  Download
} from 'lucide-react';

const LaboratoryPage = () => {
  const [activeTab, setActiveTab] = useState('requests');

  const tabs = [
    { id: 'requests', label: 'Lab Requests', icon: <ClipboardList size={18} /> },
    { id: 'results', label: 'Results Entry', icon: <Beaker size={18} /> },
    { id: 'diagnostics', label: 'Diagnostics', icon: <Microscope size={18} /> },
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Laboratory Management</h1>
          <p className="text-slate-500 text-sm">Monitor test requests, process results, and manage diagnostic reports.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold">
            <Download size={18} />
            Export Reports
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-semibold">
            <Plus size={18} />
            New Test Request
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-xl px-4 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative
              ${activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white border-x border-t border-slate-200 p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Patient Name, Lab ID, or Test Type..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl border border-slate-200 shadow-sm p-6">
        {activeTab === 'requests' && <LabRequestsView />}
        {activeTab === 'results' && <ResultsEntryView />}
        {activeTab === 'diagnostics' && <DiagnosticsView />}
      </div>
    </div>
  );
};

// --- Sub-Components (Plain Text placeholders) ---

const LabRequestsView = () => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h2 className="text-lg font-bold text-slate-800">Pending Lab Requests</h2>
      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase">12 Urgent</span>
    </div>
    <p className="text-slate-600 text-sm leading-relaxed">
      This section displays all incoming laboratory orders from doctors. Staff can acknowledge requests, 
      assign sample collection IDs, and track the status of tests in progress.
    </p>
    <div className="mt-4 p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400">
       [ Table: Request ID | Patient | Test Type | Priority | Ordered By | Status ]
    </div>
  </div>
);

const ResultsEntryView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-800">Test Results & Data Entry</h2>
    <p className="text-slate-600 text-sm">
      Secure interface for lab technicians to input quantitative and qualitative data for completed tests. 
      Requires verification before being released to the patient's record.
    </p>
    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
      <p className="text-xs font-bold text-slate-400 uppercase mb-4">Awaiting Input</p>
      <div className="space-y-2">
        <div className="h-8 bg-white rounded border border-slate-200"></div>
        <div className="h-8 bg-white rounded border border-slate-200"></div>
        <div className="h-8 bg-white rounded border border-slate-200"></div>
      </div>
    </div>
  </div>
);

const DiagnosticsView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-slate-800">Imaging & Complex Diagnostics</h2>
    <p className="text-slate-600 text-sm">
      Manage radiology, pathology reports, and specialized diagnostic images (X-Rays, MRIs, CT Scans).
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['Radiology', 'Pathology', 'Cardiology'].map((dept) => (
        <div key={dept} className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
          <h3 className="font-semibold text-slate-700">{dept} Reports</h3>
          <p className="text-xs text-slate-500 mt-1">View latest diagnostic files</p>
        </div>
      ))}
    </div>
  </div>
);

export default LaboratoryPage;