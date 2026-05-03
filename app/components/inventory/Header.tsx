'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  User, 
  ChevronDown, 
  LogOut, 
  Clock, 
  Loader2, 
  History 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  patientName: string;
  patientId: string;
}

export default function StandardClinicHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'BB';

  const fetchNewAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/recent');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Shared Design Constants
  const glassStyle = "bg-white/95 backdrop-blur-xl border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.12)]";
  const textMuted = "text-[10px] font-bold uppercase tracking-[0.15em]";

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* BRANDING SECTION */}
      <div className="flex flex-col">
        <h1 className="text-sm md:text-[15px] font-black text-slate-900 leading-tight tracking-tight">
          ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ
        </h1>
        <h2 className={`text-blue-600/70 mt-0.5 ${textMuted}`}>
          DR Birku Belete Internal medicine specialty clinic
        </h2>
      </div>

      {/* ACTION SECTION */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              const next = !isNotificationsOpen;
              setIsNotificationsOpen(next);
              if (next) fetchNewAlerts();
            }}
            className={`p-2.5 rounded-xl transition-all relative ${
              isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Bell size={20} strokeWidth={2.5} />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-blue-500 rounded-full ring-2 ring-white animate-pulse" />
          </button>

          {isNotificationsOpen && (
            <div className={`absolute right-0 mt-3 w-80 rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ${glassStyle}`}>
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                <span className="font-bold text-[11px] text-slate-500 uppercase tracking-widest">Recent Activity</span>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {loading ? (
                  <div className="py-12 flex flex-col items-center gap-2">
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                    <span className={textMuted + " text-slate-400"}>Syncing...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        setIsNotificationsOpen(false);
                        router.push(`/specialist/consultation/${n.patientId}`);
                      }}
                      className="px-5 py-4 border-b border-slate-50 hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">{n.patientName}</h4>
                      <p className="text-[10px] text-blue-600 font-bold mt-0.5 uppercase tracking-tighter">{n.title}</p>
                    </div>
                  ))
                ) : (
                  <div className={`py-12 text-center text-slate-400 ${textMuted}`}>No new alerts</div>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setIsNotificationsOpen(false);
                  router.push('/specialist/records');
                }}
                className="w-full py-3 text-[11px] font-black text-slate-500 hover:text-blue-600 bg-slate-50/50 transition-colors flex items-center justify-center gap-2 border-t border-slate-50"
              >
                <History size={12} /> View Full Records
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all group"
          >
            <div className="text-right hidden sm:block pl-2">
              <p className="font-bold text-slate-900 text-sm leading-none">{session?.user?.name || 'Dr. Birku'}</p>
              <p className={`text-blue-500 mt-1 ${textMuted}`}>
                {(session?.user as any)?.role || 'Specialist'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
              {initials}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className={`absolute right-0 mt-3 w-52 rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 ${glassStyle}`}>
              <div className="px-5 py-2 mb-2 border-b border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Account Management</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} strokeWidth={2.5} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}