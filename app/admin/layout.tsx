'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../components/Admin/AdminSidebar';
import AdminHeader from '../components/Admin/AdminHeader';
import { Loader2, ShieldAlert, Lock } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // --- ACCESS CONTROL LOGIC ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.replace('/unauthorized'); 
    }
  }, [status, session, router]);

  // 1. Loading State (Matching the clean, minimalist aesthetic)
  if (status === 'loading') {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
          <p className="text-slate-600 font-bold tracking-tight">Initializing Admin Terminal...</p>
        </div>
      </div>
    );
  }

  // 2. Security Gate (Access Denied)
  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-2xl">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-500 mb-8 font-medium">
            This area is reserved for system administrators only. Your current credentials do not have permission.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
          >
            <Lock size={18} />
            Secure Login
          </button>
        </div>
      </div>
    );
  }

  // 3. Authorized State
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] text-slate-900">
      {/* Sidebar - Consistent with Specialist layout */}
      <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header - Glassmorphism effect matches the Specialist UI */}
        <AdminHeader toggleSidebar={() => setIsCollapsed(!isCollapsed)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Setting a max-width on the inner container often improves 
              readability on ultra-wide monitors while keeping the 
              overall background full-width.
          */}
          <div className="p-4 md:p-8 lg:p-3 mx-auto max-w-[1600px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
}