"use client";
import React, { useState } from 'react';
import { Calendar as CalendarIcon, ListTodo, Clock, Plus } from 'lucide-react';

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const tabs = [
    { id: 'schedule', label: 'Schedule', icon: <ListTodo size={18} /> },
    { id: 'calendar', label: 'Calendar View', icon: <CalendarIcon size={18} /> },
    { id: 'waiting', label: 'Waiting List', icon: <Clock size={18} /> },
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-slate-500 text-sm">Manage patient bookings and doctor availability.</p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm w-fit">
          <Plus size={18} />
          <span className="font-semibold text-sm">New Appointment</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative
              ${activeTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        {activeTab === 'schedule' && <ScheduleView />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'waiting' && <WaitingListView />}
      </div>
    </div>
  );
};

// --- Sub-Components (Plain Text placeholders) ---

const ScheduleView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-slate-800">Daily Appointment Schedule</h2>
    <p className="text-slate-600 leading-relaxed">
      This is the <strong>Schedule View</strong>. Here you would typically see a list-based view of today's 
      appointments, sorted by time. It allows staff to check patients in and see upcoming slots at a glance.
    </p>
    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
      [DataTable showing: Time, Patient Name, Doctor, Status, Actions]
    </div>
  </div>
);

const CalendarView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-slate-800">Monthly Calendar View</h2>
    <p className="text-slate-600 leading-relaxed">
      This is the <strong>Calendar View</strong>. This section would integrate a full-sized calendar 
      (like FullCalendar or a custom grid) to visualize appointment density across weeks and months.
    </p>
    <div className="p-12 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
      [Interactive Calendar Grid Implementation]
    </div>
  </div>
);

const WaitingListView = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-slate-800">Patient Waiting List</h2>
    <p className="text-slate-600 leading-relaxed">
      This is the <strong>Waiting List</strong>. It displays patients who have arrived at the clinic but 
      are yet to be called into the consultation room, or those waiting for a cancellation slot.
    </p>
    <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
      [Priority Queue showing: Wait Time, Urgency, Patient Details]
    </div>
  </div>
);

export default AppointmentsPage;