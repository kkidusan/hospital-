"use client";
import React from 'react';

export default function Page() {
  return (
    <div className="space-y-6">
      {/* Example Content: Quick Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-blue-600 text-xs font-bold uppercase">Active Patients</p>
          <p className="text-2xl font-bold text-blue-900">1,284</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-emerald-600 text-xs font-bold uppercase">Bed Occupancy</p>
          <p className="text-2xl font-bold text-emerald-900">84%</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-amber-600 text-xs font-bold uppercase">Pending Reports</p>
          <p className="text-2xl font-bold text-amber-900">12</p>
        </div>
      </div>

      {/* Main Page Content */}
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 leading-relaxed">
          The dashboard is currently active. You can use the sidebar on the left to navigate 
          through <strong>Patient Management</strong>, <strong>Billing</strong>, and <strong>Pharmacy</strong> modules. 
          Use the collapse button at the bottom of the sidebar to maximize your workspace.
        </p>
      </div>

      {/* Placeholder for a table or list */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Upcoming Appointments</h3>
        <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-8 text-center text-slate-400 italic">
          No appointments scheduled for the next hour.
        </div>
      </div>
    </div>
  );
}