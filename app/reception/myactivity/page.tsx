'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Clock, 
  UserPlus, 
  CheckSquare, 
  AlertCircle 
} from 'lucide-react';

// Sample mock data layout for reception activities
const MOCK_ACTIVITIES = [
  { id: 1, action: 'Registered Patient', target: 'Abebech Kebede', time: '10:24 AM', date: 'Today', icon: UserPlus, color: 'text-blue-500 bg-blue-5 light:bg-blue-100' },
  { id: 2, action: 'Checked-in Patient', target: 'Chala Tadesse', time: '09:15 AM', date: 'Today', icon: CheckSquare, color: 'text-emerald-500 bg-emerald-50' },
  { id: 3, action: 'Updated Profile Information', target: 'Dr. Birku Belete Config', time: 'Yesterday', date: 'May 19, 2026', icon: FileText, color: 'text-amber-500 bg-amber-50' },
  { id: 4, action: 'Printed Appointment slip', target: 'Yonas Alemu', time: '04:30 PM', date: 'May 18, 2026', icon: FileText, color: 'text-slate-500 bg-slate-100' },
];

export default function MyActivityPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  
  const displayName = session?.user?.name || 'Staff Member';

  const filteredActivities = MOCK_ACTIVITIES.filter(act => 
    act.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    act.target.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="text-slate-700" size={24} />
              My Activity Log
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Reviewing active actions executed by <span className="font-semibold text-slate-700">{displayName}</span>
            </p>
          </div>

          {/* Search bar inside activity view */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search actions or targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Activity Timeline List */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                    
                    {/* Circle Status Badge Icon */}
                    <div className={`p-2 rounded-xl flex-shrink-0 ${activity.color}`}>
                      <IconComponent size={18} />
                    </div>

                    {/* Meta Row Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {activity.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium truncate">
                        Target / Detail: <span className="text-slate-700 font-semibold">{activity.target}</span>
                      </p>
                    </div>

                    {/* Date/Time stamp values */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end justify-center h-10">
                      <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" />
                        {activity.time}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                        <Calendar size={10} />
                        {activity.date}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State Container layout block if filter fails */
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-3">
                <AlertCircle size={24} />
              </div>
              <p className="text-sm font-bold text-slate-800">No matching activities found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Try modifying your filter keyword or check back later as new events process.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}