'use client'

import { useSession } from 'next-auth/react';
import { 
  Bell, 
  Search, 
  UserCircle, 
  Settings, 
  Menu, 
  ChevronDown 
} from 'lucide-react';

interface HeaderProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  // 1. Hook into the NextAuth session
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
      
      {/* Left Section: Sidebar Toggle & Search */}
      <div className="flex items-center gap-6">
        {/* Toggle Button (Matches Specialist Layout Style) */}
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 w-96 group focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500 transition-all">
          <Search size={16} className="text-slate-400 mr-2 group-focus-within:text-blue-500" />
          <input 
            type="text" 
            placeholder="Search patient by UHID or Name..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
          />
        </div>
      </div>

      {/* Right Section: Actions & User Info */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-blue-600 rounded-xl relative transition-all">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Settings */}
        <button className="p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all">
          <Settings size={20} />
        </button>

        <div className="h-6 w-[1px] bg-slate-200 mx-3" />

        {/* User Profile Section */}
        <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100">
          <div className="text-right hidden sm:block">
            {/* 2. Display Dynamic User Name (Fallback to 'Guest') */}
            <p className="text-sm font-bold text-slate-900 leading-none">
              {session?.user?.name || 'Staff Member'}
            </p>
            {/* 3. Display Dynamic User Email */}
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-tight mt-1">
              {session?.user?.email || 'reception@hospital.com'}
            </p>
          </div>
          
          <div className="relative">
            <UserCircle size={36} className="text-slate-300" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
}