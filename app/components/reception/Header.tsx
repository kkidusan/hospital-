'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Imported for navigation
import { 
  UserCircle, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown,
  FileText, 
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Loader2,
  User,
  CheckCircle2
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
  const router = useRouter(); // Initialize router
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = session?.user?.name || 'Staff Member';

  // --- Fetch System Settings ---
  useEffect(() => {
    const fetchHeaderSettings = async () => {
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
    fetchHeaderSettings();
  }, []);

  // --- Close Dropdown on Outside Click ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSecureLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      await signOut({ callbackUrl: '/', redirect: true });
    } catch (error) {
      await signOut({ callbackUrl: '/' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Default values if DB is empty or loading
  const mainTitle = config?.company_name || "ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ";
  const subTitle = config?.company_name_secondary || "DR Birku Belete Internal medicine specialty clinic";
  const brandColor = config?.primary_color || "#0f172a"; 

  return (
    <header className="h-16 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
      
      {/* Left Section: Mobile Toggle & Dynamic Branding */}
      <div className="flex items-center gap-3 min-w-0 max-w-[70%]">
        <button 
          onClick={() => setIsSidebarOpen?.(!isSidebarOpen)}
          className="lg:hidden p-1.5 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all flex-shrink-0"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-3 min-w-0">
          {/* Clean Dynamic Logo Wrapper */}
          {config?.system_logo && (
            <div className="relative h-9 w-9 bg-white border border-slate-100 rounded-lg p-1 shadow-sm flex items-center justify-center flex-shrink-0">
              <img 
                src={config.system_logo} 
                alt="System Logo" 
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
            <h2 className="hidden sm:block text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate mt-0.5">
              {subTitle}
            </h2>
          </div>
        </div>
      </div>

      {/* Right Section: Navigation & Profile */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        
        <div className="hidden md:flex items-center gap-1">
          <button title="Help Center" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg transition-all">
            <HelpCircle size={20} />
          </button>

          <button title="Notifications" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm rounded-lg relative transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#f8fafc]"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 md:gap-2 pl-1 md:pl-2 pr-1 py-1 rounded-xl hover:bg-white hover:shadow-sm transition-all group"
          >
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-slate-800 transition-colors">
                {displayName}
              </p>
            </div>
            
            <div className="relative">
              <UserCircle 
                size={28} 
                className="md:size-[32px] text-slate-400 transition-colors"
                style={{ color: isDropdownOpen ? brandColor : undefined }}
              />
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-green-500 border-2 border-[#f8fafc] rounded-full"></div>
            </div>
            
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-0 pt-2 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 py-1 overflow-hidden">
                
                {/* User Context Header with Verification Icon on Right */}
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900 truncate">{displayName}</div>
                  </div>
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                </div>

                {/* Base Action Menu */}
                <div className="py-1">
                  {/* Changed to a button with router navigation */}
                  <button 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push('/reception/myactivity');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 text-left"
                  >
                    <FileText size={16} className="text-slate-400" />
                    My Activity
                  </button>
                  
                  <a href="/reception/settings" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <Settings size={16} className="text-slate-400" />
                    System Settings
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <ShieldCheck size={16} className="text-slate-400" />
                    Security
                  </a>
                </div>

                {/* Custom Profile List Section */}
                <div className="border-t border-slate-100 mt-1" />
                <div className="px-4 pt-2 pb-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Profile Options</span>
                </div>
                <div className="py-1">
                  <a href="/reception/profile" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    <User size={16} className="text-slate-400" />
                    Personal Information
                  </a>
                </div>

                {/* Modified Footer Layout: Name Left, Check Icon Right */}
                <div className="border-t border-slate-100 mt-1" />
                <button
                  onClick={handleSecureLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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