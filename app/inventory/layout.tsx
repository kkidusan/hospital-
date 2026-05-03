'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import Sidebar from '../components/inventory/Sidebare';
import Header from '../components/inventory/Header';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Redirect if unauthenticated
    if (status === 'unauthenticated') {
      router.replace('/');
    }

    // Redirect if authenticated but WRONG role
    if (status === 'authenticated' && session?.user?.role !== 'INVENTORY') {
      router.replace('/'); // or wherever non-inventory users go
    }
  }, [status, session, router]);

  // Show a loading screen while checking session or mounting
  if (!mounted || status === 'loading') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-100">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Prevent "flicker" of content if role is incorrect before redirect kicks in
  if (session?.user?.role !== 'INVENTORY') {
    return null;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar - Fixed Positioned */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        marginLeft: isOpen ? '260px' : '80px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <Header />
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '24px', 
          backgroundColor: '#f1f5f9' 
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}