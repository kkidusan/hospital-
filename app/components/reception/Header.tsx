'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  UserCircle, 
  Settings, 
  HelpCircle,
  Bell,
  ChevronDown,
  FileText, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const displayName = session?.user?.name || 'Staff Member';

  // Close dropdown when clicking outside
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
      console.error('Logout error:', error);
      await signOut({ callbackUrl: '/' });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-[#f8fafc] border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Left Section: Hospital Name */}
      <div className="flex flex-col justify-center">
        <h1 className="text-sm md:text-[15px] font-extrabold text-slate-900 leading-tight">
          ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ
        </h1>
        <h2 className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          DR Birku Belete Internal medicine specialty clinic
        </h2>
      </div>

      {/* Right Section: Icons & Dropdown */}
      <div className="flex items-center gap-1 md:gap-2">
        
        <button title="Help Center" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-lg transition-all">
          <HelpCircle size={20} />
        </button>

        <button title="Notifications" className="p-2 text-slate-500 hover:bg-white hover:shadow-sm hover:text-blue-600 rounded-lg relative transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#f8fafc]"></span>
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-2" />

        {/* User Profile Dropdown */}
        <div 
          className="relative"
          ref={dropdownRef}
          onMouseEnter={() => setIsDropdownOpen(true)}
          onMouseLeave={() => setIsDropdownOpen(false)}
        >
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-white hover:shadow-sm transition-all group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                {displayName}
              </p>
            </div>
            
            <div className="relative">
              <UserCircle size={32} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f8fafc] rounded-full"></div>
            </div>
            
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-0 pt-2 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="bg-white rounded-xl shadow-xl border border-slate-200 py-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <div className="text-sm font-bold text-slate-900">{displayName}</div>
                  <div className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Authorized Staff</div>
                </div>

                <div className="py-1">
                  <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <FileText size={16} className="text-slate-400" />
                    My Activity
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings size={16} className="text-slate-400" />
                    Settings
                  </a>
                  <a href="#" className="flex items-center gap-3 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    <ShieldCheck size={16} className="text-slate-400" />
                    Security
                  </a>
                </div>

                <div className="border-t border-slate-100 mt-1" />

                <button
                  onClick={handleSecureLogout}
                  disabled={isLoggingOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  {isLoggingOut ? "Ending Session..." : "Secure Sign Out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}