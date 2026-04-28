'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import LabSidebar from './LabSidebar';
import LabHeader from './LabHeader';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'LABORATORY')) {
      router.replace('/');
    }
  }, [status, session, router]);

  if (status === 'loading' || !session || session?.user?.role !== 'LABORATORY') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-[9999]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Lab Security Gate</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar - Controlled by Layout State */}
      <LabSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-width-0 transition-all duration-300">
        <LabHeader />

        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(#e2e8f0_0.8px,transparent_0.8px)] [background-size:24px_24px]">
          <div className="max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>

        <footer className="p-4 text-[0.7rem] text-slate-400 text-center bg-white border-t border-slate-100">
          © 2026 Bruh Tech HMS | Lab Module v2.4.0
        </footer>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}