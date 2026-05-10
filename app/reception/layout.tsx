'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
    const handleInitialView = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false); // Hidden by default on mobile
      } else {
        setIsSidebarOpen(true); // Open by default on desktop
      }
      setIsLoading(false);
    };

    handleInitialView();
    // Optional: Update state if window is resized manually
    window.addEventListener('resize', handleInitialView);
    return () => window.removeEventListener('resize', handleInitialView);
  }, []);

  if (status === 'loading' || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 z-[9999]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Verifying Terminal...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar - Position fixed on mobile via its own internal logic */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Overlay Backdrop - Only visible on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[90] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[radial-gradient(#e2e8f0_0.8px,transparent_0.8px)] [background-size:24px_24px]">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}