'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import Sidebar from './../components/reception/Sidebar';
import Header from './../components/reception/Header';

export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      if (session.user.role !== 'RECEPTION') {
        router.replace('/dashboard');
        return;
      }
      setIsLoading(false);
    }
  }, [status, session, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-[9999]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Verifying Terminal...</h2>
          <p className="text-sm text-slate-500">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(#e2e8f0_0.8px,transparent_0.8px)] [background-size:24px_24px]">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
}