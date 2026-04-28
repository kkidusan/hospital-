'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { 
  Bell, User, LogOut, Menu, Settings, 
  ChevronDown, ShieldAlert 
} from 'lucide-react';

interface AdminHeaderProps {
  toggleSidebar: () => void;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const { data: session } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = session?.user;
  const fullName = user?.name || "Admin User";
  const email = user?.email || "admin@clinic.com";
  const userInitial = fullName.charAt(0).toUpperCase();

  // Security Check
  if (user?.role !== "ADMIN") {
    return (
      <div className="h-20 bg-rose-50 flex items-center px-6 text-rose-600 font-bold border-b border-rose-100">
        <ShieldAlert className="mr-2" /> Access Denied: Administrator Privileges Required
      </div>
    );
  }

  return (
    /* The parent container of this header in your layout.tsx or page.tsx 
       should have the class "bg-[#f8fafc] min-h-screen" 
    */
    <header className="h-16 md:h-20 bg-[#f8fafc]/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      
      {/* Clinic Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2.5 bg-white hover:bg-slate-50 rounded-xl lg:hidden transition-colors border border-slate-200 shadow-sm"
        >
          <Menu size={20} className="text-slate-600" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-[14px] md:text-[16px] font-extrabold text-slate-900 leading-tight">
            ዶ/ር ብርኩ በለጠ የውስጥ ደዌ ስፔሻሊቲ ክሊኒክ
          </h1>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider italic">
            DR Birku Belete Internal medicine specialty clinic
          </p>
        </div>
      </div>

      {/* Admin User Actions */}
      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-2xl relative transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#f8fafc]"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white transition-all border border-transparent hover:border-slate-100"
          >
            <div className="hidden md:block text-right pl-2">
              <p className="text-[13px] font-bold text-slate-800 leading-none">
                {fullName}
              </p>
              <p className="text-[10px] text-blue-600 font-bold uppercase mt-1 tracking-tighter">
                System Admin
              </p>
            </div>
            
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
              {userInitial}
            </div>
            
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 mr-1 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isProfileOpen && (
            <>
              {/* Overlay */}
              <div 
                className="fixed inset-0 z-0" 
                onClick={() => setIsProfileOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                <div className="px-5 py-4 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrator</p>
                  <p className="text-sm font-bold text-slate-700 truncate">{email}</p>
                </div>
                
                <div className="px-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <User size={16} /> Admin Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                    <Settings size={16} /> System Settings
                  </button>
                  
                  <div className="h-px bg-slate-100 my-2 mx-2" />
                  
                  <button 
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}