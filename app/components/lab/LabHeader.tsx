'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  BellIcon, 
  UserCircleIcon,
  ChevronDownIcon 
} from '@heroicons/react/24/outline';
import { 
  Settings, 
  FileText, 
  LogOut,
  HelpCircle,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  paymentStatus: string | null;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

interface SystemConfig {
  company_name?: string;
  company_name_secondary?: string;
  primary_color?: string;
  system_logo?: string;
}

interface LabHeaderProps {
  userName?: string;
}

export default function LabHeader({ userName }: LabHeaderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // --- New Branding State ---
  const [config, setConfig] = useState<SystemConfig | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  const displayName = userName || session?.user?.name || 'Lab Specialist';
  const userInitial = displayName.charAt(0).toUpperCase();

  // Fetch System Branding Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load branding:", err);
      }
    };
    fetchSettings();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    try {
      setErrorMessage(null);
      const res = await fetch('/api/notifications?type=LAB_REQUEST&paymentStatus=PAID');

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          await signOut({ callbackUrl: '/login' });
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data: Notification[] = await res.json();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setErrorMessage("Could not load notifications");
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 4000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.id) return;

    setNotifications(prev =>
      prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    try {
      await fetch(`/api/notifications/${notif.id}/read`, { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }

    if (notif.relatedId && notif.relatedType === 'LAB_REQUEST') {
      router.push(`/laboratory/requests/newenter?id=${notif.relatedId}`);
    } else {
      router.push('/laboratory/notifications');
    }
    setIsNotificationOpen(false);
  };

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await fetch('/api/notifications/mark-all-read?type=LAB_REQUEST&paymentStatus=PAID', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleSecureLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      await signOut({ callbackUrl: '/', redirect: true });
    } catch (error) {
      await signOut({ callbackUrl: '/' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Branding Fallbacks
  const mainTitle = config?.company_name || "ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ";
  const subTitle = config?.company_name_secondary || "DR Birku Belete Internal medicine specialty clinic";
  const brandColor = config?.primary_color || "#2563eb"; // Default blue-600 for lab

  return (
    <header className="h-16 bg-[#f8fafc]/90 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-50">
      
      {/* Dynamic Branding Section */}
      <div className="flex items-center gap-3">
        {config?.system_logo && (
          <img src={config.system_logo} alt="Logo" className="h-9 w-9 object-contain hidden md:block" />
        )}
        <div className="flex flex-col justify-center">
          <h1 
            className="text-sm md:text-[15px] font-extrabold leading-tight transition-colors"
            style={{ color: brandColor }}
          >
            {mainTitle}
          </h1>
          <h2 className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {subTitle}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <button title="Help Center" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
          <HelpCircle size={20} />
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[450px] flex flex-col animate-in fade-in slide-in-from-top-2">
              <div className="px-5 py-4 border-b flex items-center justify-between bg-slate-50">
                <div className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                  <BellIcon size={16} /> Paid Lab Requests
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-xs font-bold hover:underline flex items-center gap-1"
                    style={{ color: brandColor }}
                  >
                    <CheckCircle size={14} /> Mark all read
                  </button>
                )}
              </div>

              {errorMessage && (
                <div className="px-5 py-2 bg-amber-50 text-amber-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errorMessage}
                </div>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isInitialLoading && notifications.length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin" size={24} style={{ color: brandColor }} />
                    <span className="text-sm">Checking for paid requests...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <BellIcon className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">No paid lab requests yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.isRead ? 'bg-blue-50/40' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm leading-tight ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: brandColor }} />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t bg-slate-50 text-center">
                <a href="/laboratory/notifications" className="text-xs hover:underline font-bold" style={{ color: brandColor }}>
                  View all records
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-slate-200 mx-2" />

        {/* User Profile Dropdown */}
        <div 
          className="relative" 
          ref={dropdownRef} 
          onMouseEnter={() => setIsDropdownOpen(true)} 
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white hover:shadow-sm transition-all group">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{displayName}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Lab Tech</p>
            </div>
            <div className="relative">
              {/* Profile Initial with Dynamic Brand Color */}
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: brandColor }}
              >
                {userInitial}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <ChevronDownIcon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right">
              <div className="px-4 py-3 border-b bg-slate-50">
                <div className="font-bold text-slate-900">{displayName}</div>
                <div className="text-[10px] font-extrabold uppercase" style={{ color: brandColor }}>LABORATORY DEPARTMENT</div>
              </div>
              <div className="py-1">
                <a href="/laboratory/reports" className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <FileText size={16} className="text-slate-400" /> Lab Results
                </a>
                <a href="/laboratory/settings" className="flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  <Settings size={16} className="text-slate-400" /> Settings
                </a>
              </div>
              <div className="border-t mt-1">
                <button 
                  onClick={handleSecureLogout} 
                  disabled={isLoggingOut} 
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 text-xs font-bold"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Signing out..." : "Secure Sign Out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}