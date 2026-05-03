'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // Optional: for a nice loading spinner
import Sidebar from '../components/triage/Sidebare';
import Header from '../components/triage/Header';

export default function TriageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 1. Handle Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Handle Role-Based Access Control (RBAC)
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'TRIAGE') {
      router.replace('/dashboard'); // Redirect unauthorized users
    }
  }, [status, session, router]);

  // Prevent flicker during hydration or session check
  if (!mounted || status === 'loading') {
    return (
      <div style={{ 
        height: '100vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#f1f5f9' 
      }}>
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  // Final check: if authenticated but wrong role, keep showing loader 
  // until the router.replace kicks in (prevents UI leaking)
  if (session?.user?.role !== 'TRIAGE') {
    return <div style={{ minHeight: '100vh', background: '#f1f5f9' }} />;
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden' 
    }}>
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <Header />
        
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          backgroundColor: '#f1f5f9' 
        }}>
          <div style={{ 
            maxWidth: '1600px', 
            margin: '0 auto',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {children}
          </div>
        </main>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}