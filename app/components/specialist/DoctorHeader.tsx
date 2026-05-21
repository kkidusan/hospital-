'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Clock, 
  Loader2, 
  UserCircle, 
  LayoutDashboard, 
  Stethoscope, 
  FolderHeart, 
  Settings2,
  CheckCircle2
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  patientName: string;
  patientId: string;
}

interface SystemConfig {
  company_name?: string;
  company_name_secondary?: string;
  primary_color?: string;
  system_logo?: string;
}

export default function DoctorHeader() {
  const { data: session } = useSession();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  
  // --- Dynamic Branding State ---
  const [config, setConfig] = useState<SystemConfig | null>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = session?.user?.name || 'Dr. Birku Belete';
  const displaySpecialty = (session?.user as any)?.specialty || 'Internal Medicine Specialist';

  // Fetch Branding Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load header branding:", err);
      }
    };
    fetchSettings();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch('/api/notifications/lab-unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchNewAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications/recent');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch recent alerts:", err);
    } finally {
      setLoading(false);
    }
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

  const handleSecureLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch (error) {
      await signOut({ callbackUrl: '/login' });
    } finally {
      setIsLoggingOut(false);
    }
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

  // Branding Fallbacks
  const mainTitle = config?.company_name || "ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ";
  const subTitle = config?.company_name_secondary || "DR Birku Belete Internal medicine specialty clinic";
  const brandColor = config?.primary_color || "#2563eb"; // Specialist Blue

  // Helper for profile menu actions
  const navigateTo = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  return (
    <header className="h-16 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
      
      {/* Left Section: Branding & Identity */}
      <div className="flex items-center gap-3 min-w-0 max-w-[70%]">
        {config?.system_logo && (
          <div className="relative h-9 w-9 bg-white border border-slate-100 rounded-xl p-1 shadow-sm flex items-center justify-center flex-shrink-0 hidden md:flex">
            <img 
              src={config.system_logo} 
              alt="Clinic Logo" 
              className="h-full w-full object-contain" 
            />
          </div>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <h1 
            className="text-xs sm:text-sm md:text-[15px] font-extrabold leading-tight transition-colors truncate"
            style={{ color: brandColor }}
          >
            {mainTitle}
          </h1>
          <h2 className="hidden sm:block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate mt-0.5">
            {subTitle}
          </h2>
        </div>
      </div>

      {/* Right Section: Interactive Panels */}
      <div className="flex items-center gap-1 md:gap-3 flex-shrink-0">
        
        {/* Lab Alerts Panel */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              const next = !isNotificationsOpen;
              setIsNotificationsOpen(next);
              if (next) fetchNewAlerts();
            }}
            className={`p-2.5 rounded-2xl transition-all relative ${isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#f8fafc]">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-xs sm:text-sm text-slate-800">New Alerts Only</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-[11px] font-bold hover:underline"
                    style={{ color: brandColor }}
                  >
                    Dismiss all
                  </button>
                )}
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {loading ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin" size={20} style={{ color: brandColor }} />
                    <span className="text-xs font-medium">Checking for updates...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n.patientId, n.id)}
                      className="px-5 py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-all cursor-pointer active:bg-slate-100"
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div 
                            className="p-1.5 rounded-lg opacity-90 flex-shrink-0"
                            style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                          >
                            <UserCircle size={14} />
                          </div>
                          <h4 className="font-bold text-[13px] text-slate-900 truncate">{n.patientName}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 mt-0.5">
                          <Clock size={10} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p 
                        className="text-xs font-semibold mt-1 truncate"
                        style={{ color: brandColor }}
                      >
                        {n.title}
                      </p>
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

              <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    router.push('/specialist/records');
                  }}
                  className="w-full py-2.5 text-[11px] font-bold text-slate-600 hover:bg-white rounded-xl transition-all border border-slate-200 shadow-sm"
                >
                  View All Laboratory History →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* Dynamic Profile Sub-Menu Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 md:gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white hover:shadow-sm transition-all group"
          >
            <div className="text-right hidden sm:block min-w-0">
              <p className="font-extrabold text-slate-800 text-xs md:text-sm line-clamp-1">{displayName}</p>
              <p 
                className="text-[9px] md:text-[10px] font-bold uppercase tracking-tight truncate mt-0.5"
                style={{ color: brandColor }}
              >
                {displaySpecialty}
              </p>
            </div>
            
            {/* Consistent UserCircle Icon Asset Wrapper */}
            <div className="relative flex-shrink-0">
              <UserCircle 
                size={28} 
                className="md:size-[32px] text-slate-400 transition-colors group-hover:scale-102"
                style={{ color: isDropdownOpen ? brandColor : undefined }}
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 border-2 border-[#f8fafc] rounded-full"></div>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 py-1 overflow-hidden">
                
                {/* Profile Header Block */}
                <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 truncate">{displayName}</div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{displaySpecialty}</div>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                </div>

                {/* Core Specialist Routing Options */}
                <div className="py-1.5">
                  <button 
                    onClick={() => navigateTo('/specialist')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-slate-400" />
                    Medical Dashboard
                  </button>
                  
                  <button 
                    onClick={() => navigateTo('/specialist/consultation')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left transition-colors"
                  >
                    <Stethoscope size={16} className="text-slate-400" />
                    Active Consultations
                  </button>

                  <button 
                    onClick={() => navigateTo('/specialist/records')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left transition-colors"
                  >
                    <FolderHeart size={16} className="text-slate-400" />
                    Patient Records Archive
                  </button>
                </div>

                {/* System Configuration Block */}
                <div className="border-t border-slate-100 mt-1" />
                <div className="px-4 pt-2.5 pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Account Management</span>
                </div>
                
                <div className="py-1">
                  <button 
                    onClick={() => navigateTo('/specialist/profile')}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left transition-colors"
                  >
                    <Settings2 size={16} className="text-slate-400" />
                    Personal Information 
                  </button>
                </div>

                {/* Dynamic Secure Session Terminator */}
                <div className="border-t border-slate-100 mt-1" />
                <button
                  onClick={handleSecureLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-rose-50/50 hover:text-rose-600 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isLoggingOut ? (
                      <Loader2 size={16} className="animate-spin text-slate-400" />
                    ) : (
                      <LogOut size={16} className="text-slate-400" />
                    )}
                    <span className="truncate">
                      {isLoggingOut ? "Ending Session..." : "Sign Out"}
                    </span>
                  </div>
                  {!isLoggingOut && <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />}
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}