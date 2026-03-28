'use client'

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import Sidebar from './../components/reception/Sidebar';
import Header from './../components/reception/Header';


export default function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // If not logged in at all, boot to login page
      router.replace('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'RECEPTION_TRIAGE') {
      // If logged in as a different role (e.g., Doctor), boot to a common dashboard
      router.replace('/');
    }
  }, [status, session, router]);

  // --- 2. The Loading & Security Gate ---
  // We return ONLY this block if the user isn't verified yet. 
  // This prevents the Sidebar/Header from "flickering" for unauthorized users.
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'RECEPTION_TRIAGE') {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50 z-[9999]">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-xl border border-slate-100">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Accessing Reception Portal</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Verifying Terminal Clearance</p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Authorized Content Rendering ---
  // This part only executes if the status is 'authenticated' AND the role is 'RECEPTION_TRIAGE'
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar - Only rendered for authorized reception staff */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Contains profile and notification icons */}
        <Header />

        <main className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(#e2e8f0_0.8px,transparent_0.8px)] [background-size:24px_24px]">
          {/* Main Page Content wrapper */}
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Global Transition Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
} 