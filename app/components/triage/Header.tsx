'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  Menu, 
  X, 
  User, 
  Settings, 
  BarChart3, 
  History,
  Loader2
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen?: boolean;
  setIsSidebarOpen?: (open: boolean) => void;
}

interface SystemConfig {
  company_name?: string;
  company_name_secondary?: string;
  primary_color?: string;
  system_logo?: string;
}

export default function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name || "Staff";
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // --- Dynamic Branding Fetch ---
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        }
      } catch (err) {
        console.error("Failed to load triage header branding:", err);
      }
    };
    fetchSettings();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Fallbacks and Dynamic Colors
  const mainTitle = config?.company_name || "ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ";
  const brandColor = config?.primary_color || "#dc2626"; // Default Triage Red

  return (
    <header className="h-16 bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      
      {/* Left Section: Mobile Menu & Clinic Branding */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen?.(!isSidebarOpen)}
          className="lg:hidden p-2 text-slate-500 hover:bg-white rounded-xl transition-all"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-3">
          {config?.system_logo && (
            <img 
              src={config.system_logo} 
              alt="Logo" 
              className="h-8 w-8 object-contain hidden md:block" 
            />
          )}
          <div className="flex flex-col">
            <h1 
              className="text-[11px] md:text-[14px] font-black leading-tight transition-colors"
              style={{ color: config?.primary_color ? 'inherit' : '#0f172a' }} // Use black if no primary color
            >
              {mainTitle}
            </h1>
            <h2 
              className="text-[9px] font-bold uppercase tracking-[0.15em]"
              style={{ color: brandColor }}
            >
              Emergency & Triage Unit
            </h2>
          </div>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:bg-white rounded-xl relative transition-all group"
          >
            <Bell size={20} className="group-hover:text-slate-900 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#f8fafc]" />
            )}
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block" />

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-2xl hover:bg-white hover:shadow-sm transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 transition-colors">
                {userName}
              </p>
              <p 
                className="text-[9px] font-black uppercase tracking-tighter"
                style={{ color: brandColor }}
              >
                Triage Officer
              </p>
            </div>
            
            {/* Dynamic Avatar with Brand Background */}
            <div 
              className="w-8 h-8 rounded-xl text-white flex items-center justify-center text-[10px] font-bold shadow-lg transition-transform group-hover:scale-105"
              style={{ backgroundColor: brandColor }}
            >
              {initials}
            </div>
            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              
              {/* User Account Info */}
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-[10px] font-bold text-slate-800 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{session?.user?.email}</p>
              </div>

              {/* Menu Options */}
              <div className="space-y-0.5">
                <button className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <User size={16} className="text-slate-400" />
                  Profile
                </button>
                
                <button className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <Settings size={16} className="text-slate-400" />
                  Settings
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <BarChart3 size={16} className="text-slate-400" />
                  Reports
                </button>

                <button className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                  <History size={16} className="text-slate-400" />
                  My Activity
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="mt-1 pt-1 border-t border-slate-50">
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> 
                  Secure Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}