'use client'

import React, { useState, useEffect } from 'react'

import { useSession } from 'next-auth/react'

import { useRouter } from 'next/navigation'

import { Loader2 } from 'lucide-react'

import DoctorSidebar from '../components/specialist/DoctorSidebar'

import DoctorHeader from '../components/specialist/DoctorHeader'



export default function SpecialistLayout({

  children,

}: {

  children: React.ReactNode

}) {

  const { data: session, status } = useSession()

  const router = useRouter()

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)



  // 1. Handle Redirects in useEffect

  useEffect(() => {

    if (status === 'unauthenticated') {

      router.replace('/login')

    } else if (status === 'authenticated' && session?.user?.role !== 'SPECIALIST') {

      // If they are logged in but NOT a specialist, send them to their default dashboard

      router.replace('/dashboard')

    }

  }, [status, session, router])



  const toggleSidebar = () => {

    setIsSidebarOpen((prev) => !prev)

  }



  // 2. THE SECURITY GATE: 

  // If loading OR if the role is not yet confirmed as SPECIALIST, 

  // we return ONLY the loading screen.

  if (status === 'loading' || status === 'unauthenticated' || session?.user?.role !== 'SPECIALIST') {

    return (

      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50">

        <div className="flex flex-col items-center gap-4">

          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />

          <div className="text-center">

            <p className="text-lg font-bold text-slate-800">Hospital Secure Gate</p>

            <p className="text-sm text-slate-500 font-medium">Verifying Staff Credentials...</p>

          </div>

        </div>

      </div>

    )

  }



  // 3. AUTHORIZED CONTENT:

  // This part of the code is ONLY reached if (status === 'authenticated' && role === 'SPECIALIST')

  return (

    <div style={{ 

      display: 'flex', 

      height: '100vh', 

      width: '100vw', 

      overflow: 'hidden',

      backgroundColor: '#f8fafc' 

    }}>

      

      {/* Sidebar is only rendered after authorization */}

      <DoctorSidebar isOpen={isSidebarOpen} />



      <div style={{ 

        flex: 1, 

        display: 'flex', 

        flexDirection: 'column', 

        minWidth: 0, 

        position: 'relative'

      }}>

        

        <DoctorHeader 

          toggleSidebar={toggleSidebar} 

          isSidebarOpen={isSidebarOpen} 

        />



        <main style={{ 

          flex: 1, 

          overflowY: 'auto', 

          padding: '32px',

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

          main::-webkit-scrollbar { width: 8px; }

          main::-webkit-scrollbar-track { background: #f1f5f9; }

          main::-webkit-scrollbar-thumb { 

            background: #cbd5e1; 

            border-radius: 10px; 

          }

          main::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        `}</style>

      </div>

    </div>

  )

} 