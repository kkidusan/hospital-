'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Clock, 
  Loader2, 
  User 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  patientName: string;
  patientId: string;
}

export default function CurrentUserHeader() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- GET CURRENT USER DATA ---
  // This logic looks at the session and extracts the name or email
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  
  // Logic to get initials (e.g., "Mohamed Berihun" -> "MB")
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/login' });
    } catch (error) {
      console.error("Logout error:", error);
      router.push('/login');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/lab-unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (e) { console.error(e); }
  };

  const fetchNewAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/recent');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 20000);
      return () => clearInterval(interval);
    }
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) setIsNotificationsOpen(false);
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Clinic Identity */}
      <div className="flex flex-col">
        <h1 className="text-sm md:text-[15px] font-extrabold text-slate-900 leading-tight">
          ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ
        </h1>
        <h2 className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider italic">
          DR Birku Belete Internal medicine specialty clinic
        </h2>
      </div>

      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              const next = !isNotificationsOpen;
              setIsNotificationsOpen(next);
              if (next) fetchNewAlerts();
            }}
            className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:bg-white'}`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#f8fafc]">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="px-5 py-4 border-b bg-slate-50/50 font-bold text-sm text-slate-800">
                New Lab Alerts
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {loading ? (
                  <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className="px-5 py-4 border-b hover:bg-blue-50/30 cursor-pointer">
                      <h4 className="font-bold text-[13px] text-slate-900">{n.patientName}</h4>
                      <p className="text-[11px] text-slate-600">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs">All caught up!</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* --- DYNAMIC USER SECTION --- */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl hover:bg-white transition-all group"
          >
            {status === 'loading' ? (
              <div className="w-24 h-4 bg-slate-200 animate-pulse rounded" />
            ) : (
              <div className="text-right hidden sm:block">
                <p className="font-bold text-slate-800 text-sm leading-none mb-1">
                  {userName}
                </p>
                <p className="text-[9px] text-blue-600 font-bold uppercase tracking-tight">
                  {(session?.user as any)?.role || 'Specialist'}
                </p>
              </div>
            )}

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {status === 'loading' ? '...' : initials}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2">
              <div className="px-5 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={17} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}