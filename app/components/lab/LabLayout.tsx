"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';
import LabSidebar from './LabSidebar';
import LabHeader from './LabHeader';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // --- 1. AUTHORIZATION & REDIRECT LOGIC ---
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Not logged in? Send to login
      router.replace('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'LABORATORY') {
      // Wrong role? Send to their appropriate dashboard
      router.replace('/');
    }
  }, [status, session, router]);

  // --- 2. THE SECURE LOADING GATE ---
  /**
   * We hide the entire layout if:
   * - Session is still fetching (loading)
   * - User is not logged in (unauthenticated)
   * - User is logged in but the role isn't LABORATORY
   */
  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'LABORATORY') {
    return (
      <div style={gatekeeperContainer}>
        <div style={gatekeeperContent}>
          <Loader2 style={spinnerStyle} className="animate-spin" />
          <div style={{ textAlign: 'center' }}>
            <h2 style={gateTitle}>Secure Lab Access</h2>
            <p style={gateSubtitle}>Verifying Laboratory Credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. THE AUTHORIZED CONTENT ---
  // This code only runs if the user is 100% verified as LABORATORY
  return (
    <div style={layoutContainer}>
      {/* Fixed Sidebar on the left */}
      <LabSidebar />

      {/* Main content area on the right */}
      <div style={mainWrapper}>
        
        {/* Sticky Header */}
        <LabHeader />

        {/* Scrollable Page Content */}
        <main style={contentArea}>
          <div style={innerContent}>
            {children}
          </div>
        </main>

        {/* Lab Footer */}
        <footer style={footerStyle}>
          © 2026 Bruh Tech Hospital Management System | Laboratory Department
        </footer>
      </div>
    </div>
  );
}

// --- UPDATED STYLES ---

const gatekeeperContainer = {
  height: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
};

const gatekeeperContent = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '16px',
};

const gateTitle = {
  fontSize: '1.25rem',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: 0,
};

const gateSubtitle = {
  fontSize: '0.875rem',
  color: '#64748b',
  margin: '4px 0 0 0',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  color: '#2563eb', // Hospital Blue
};

const layoutContainer = {
  display: 'flex',
  flexDirection: 'row' as const,
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  background: '#f8fafc',
};

const mainWrapper = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  height: '100vh',
  overflow: 'hidden',
};

const contentArea = {
  flex: 1,
  overflowY: 'auto' as const,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column' as const,
};

const innerContent = {
  maxWidth: '1400px',
  width: '100%',
  margin: '0 auto',
};

const footerStyle = {
  padding: '15px 30px',
  fontSize: '0.75rem',
  color: '#94a3b8',
  textAlign: 'center' as const,
  background: '#fff',
  borderTop: '1px solid #e2e8f0',
};