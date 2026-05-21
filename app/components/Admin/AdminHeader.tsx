'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Bell, User, LogOut, Menu, Settings, 
  ChevronDown, ShieldAlert, ShieldCheck,
  CreditCard, LayoutDashboard, Mail
} from 'lucide-react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

interface SystemConfig {
  company_name?: string;
  company_name_secondary?: string;
  primary_color?: string;
  system_logo?: string;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user;
  const fullName = user?.name || "Admin User";
  const email = user?.email || "admin@clinic.com";
  const userInitial = fullName.charAt(0).toUpperCase();

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) setConfig(await res.json());
      } catch (err) {
        console.error("Branding load failed:", err);
      }
    };
    fetchSettings();
  }, []);

  // Close on Outside Click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (user?.role !== "ADMIN") {
    return (
      <div className="h-20 bg-red-50 flex items-center px-6 text-red-600 font-bold border-b border-red-100">
        <ShieldAlert className="mr-3" /> Unauthorized: Admin Access Only
      </div>
    );
  }

  const brandColor = config?.primary_color || "#0f172a";

  return (
    <header className="h-16 md:h-20 bg-[#f8fafc]/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* 1. BRANDING SECTION */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 bg-white rounded-lg lg:hidden border border-slate-200 shadow-sm">
          <Menu size={20} className="text-slate-600" />
        </button>

        <div className="flex items-center gap-3">
          {config?.system_logo && (
            <div className="relative h-10 w-10 hidden sm:block">
              <Image src={config.system_logo} alt="Logo" fill className="object-contain" />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="text-sm md:text-base font-extrabold" style={{ color: brandColor }}>
              {config?.company_name || "Clinic Management System"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Administrator Portal
            </p>
          </div>
        </div>
      </div>

      {/* 2. ACTIONS & PROFILE SECTION */}
      <div className="flex items-center gap-4">
        <button className="hidden md:flex p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell size={22} />
        </button>

        <div className="h-8 w-px bg-slate-200 hidden md:block" />

        {/* PROFILE DROPDOWN AREA */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white transition-all border border-transparent hover:border-slate-200 hover:shadow-sm"
          >
            {/* Avatar Circle */}
            <div 
              className="w-9 h-9 md:w-10 md:h-10 rounded-full text-white flex items-center justify-center font-bold shadow-inner"
              style={{ backgroundColor: brandColor }}
            >
              {userInitial}
            </div>
            
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none">{fullName}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Super Admin</p>
            </div>
            
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* THE LIST MENU */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
              
              {/* Menu Header Card */}
              <div className="bg-slate-50/80 p-5 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: brandColor }}>
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-100/50 text-emerald-700 px-2 py-1 rounded-md w-fit">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">Verified Admin</span>
                </div>
              </div>

              {/* Navigation List Items */}
              <div className="p-2">
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Settings</p>
                
                <Link href="/admin/dashboard" onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group">
                  <LayoutDashboard size={18} className="text-slate-400 group-hover:text-blue-500" />
                  Dashboard Overview
                </Link>

                <Link href="/admin/profile" onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group">
                  <User size={18} className="text-slate-400 group-hover:text-blue-500" />
                  My Profile
                </Link>

                <Link href="/admin/settings" onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all group">
                  <Settings size={18} className="text-slate-400 group-hover:text-blue-500" />
                  Global Settings
                </Link>

                <div className="my-2 border-t border-slate-100" />
                
                <p className="px-3 pt-1 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Actions</p>
                
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group">
                  <Mail size={18} className="text-slate-400 group-hover:text-blue-500" />
                  Support Tickets
                </button>

                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full mt-2 flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-600 bg-red-50/30 hover:bg-red-50 rounded-xl transition-all group">
                  <div className="p-1.5 bg-white rounded-lg shadow-sm border border-red-100 group-hover:scale-110 transition-transform">
                    <LogOut size={16} />
                  </div>
                  Sign Out Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}