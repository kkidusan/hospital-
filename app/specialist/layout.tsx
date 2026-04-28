'use client';
import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle } from 'lucide-react';
import DoctorSidebar from '../components/specialist/DoctorSidebar';
import DoctorHeader from '../components/specialist/DoctorHeader';

export default function SpecialistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isValidating, setIsValidating] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      if (session.user.role !== 'SPECIALIST') {
        router.replace('/dashboard');
        return;
      }

      const validateSession = async () => {
        try {
          setIsValidating(false);
        } catch (err) {
          console.error("Validation error:", err);
          setErrorMessage("Session validation failed.");
          setTimeout(() => signOut({ callbackUrl: '/login' }), 1500);
        }
      };

      validateSession();
    }
  }, [status, session, router]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  if (status === 'loading' || isValidating) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (errorMessage || !session) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-red-50">
        <AlertTriangle className="h-16 w-16 text-red-600" />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      {/* FIXED: Added setIsOpen prop here */}
      <DoctorSidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        position: 'relative',
        /* The flex: 1 ensures this container grows/shrinks with the sidebar */
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <DoctorHeader
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          paddingTop: '-42px',
          scrollBehavior: 'smooth',
          backgroundImage: 'radial-gradient(#e2e8f0 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            animation: 'fadeIn 0.4s ease-out'
          }}>
            {children}
          </div>
        </main>

        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
}