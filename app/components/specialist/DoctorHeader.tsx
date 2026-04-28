'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Bell, ChevronDown, LogOut, Clock, Loader2, User } from 'lucide-react';
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

export default function DoctorHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DB';

  const fetchUnreadCount = async () => {
    const res = await fetch('/api/notifications/lab-unread-count');
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.count || 0);
    }
  };

  const fetchNewAlerts = async () => {
    setLoading(true);
    const res = await fetch('/api/notifications/recent');
    if (res.ok) {
      const data = await res.json();
      setNotifications(data.notifications || []);
    }
    setLoading(false);
  };

  const markAllAsRead = async () => {
    const res = await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    if (res.ok) {
      setUnreadCount(0);
      setNotifications([]);
    }
  };

  const handleNotificationClick = async (patientId: string, notificationId: string) => {
    if (!patientId) return;

    await fetch(`/api/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    });

    setIsNotificationsOpen(false);
    router.push(`/specialist/consultation/${patientId}`);
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex flex-col">
        <h1 className="text-sm md:text-[15px] font-extrabold text-slate-900 leading-tight">
          ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ
        </h1>
        <h2 className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider italic">
          DR Birku Belete Internal medicine specialty clinic
        </h2>
      </div>

      <div className="flex items-center gap-3">
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
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="px-5 py-4 border-b flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-sm text-slate-800">New Alerts Only</span>
                {notifications.length > 0 && (
                  <button onClick={markAllAsRead} className="text-[11px] font-bold text-blue-600 hover:underline">
                    Dismiss all
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {loading ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-xs font-medium">Checking for updates...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.patientId, n.id)}
                      className="px-5 py-4 border-b last:border-0 hover:bg-blue-50/30 transition-all cursor-pointer active:bg-blue-100"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                            <User size={14} />
                          </div>
                          <h4 className="font-bold text-[13px] text-slate-900">{n.patientName}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-blue-700 mt-1">{n.title}</p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="text-slate-200" size={24} />
                    </div>
                    <p className="text-slate-500 text-sm font-semibold">All caught up!</p>
                    <p className="text-slate-400 text-[11px]">No new laboratory results.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-slate-50/30">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push('/specialist/records');
                  }}
                  className="w-full py-2.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 hover:bg-white rounded-2xl transition-all border border-slate-200"
                >
                  View All Laboratory History →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl hover:bg-white transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-800 text-sm">{session?.user?.name || 'Dr. Birku'}</p>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tighter">
                {(session?.user as any)?.specialty || 'Specialist'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
              {initials}
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50">
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
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