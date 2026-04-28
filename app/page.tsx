'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from './lib/store/authStore'
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  Activity 
} from 'lucide-react'

// --- TypeScript Fix for 'role' error ---
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { attempts, blockedUntil, incrementAttempts, resetAttempts, setBlockedUntil } = useAuthStore()

  const now = Date.now()
  const isBlocked = blockedUntil !== null && now < blockedUntil
  const remainingMinutes = isBlocked ? Math.max(1, Math.ceil((blockedUntil! - now) / 60000)) : 0

  const roleRedirectMap: Record<string, string> = {
    ADMIN: '/admin',
    RECEPTION: '/reception-triage',
    SPECIALIST: '/specialist',
    LABORATORY: '/laboratory',
  }

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role
      const redirectPath = roleRedirectMap[role] || '/dashboard'
      router.replace(redirectPath)
    }
  }, [status, session, router])

  useEffect(() => {
    if (!isBlocked) return
    const timer = setInterval(() => {
      if (Date.now() >= blockedUntil!) {
        resetAttempts()
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isBlocked, blockedUntil, resetAttempts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isBlocked) {
      setError(`Security Protocol: Access locked for ${remainingMinutes}m.`)
      return
    }

    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      })

      if (result?.error) {
        incrementAttempts()
        const newAttempts = attempts + 1
        if (newAttempts >= 3) {
          setBlockedUntil(Date.now() + 15 * 60 * 1000)
          setError('Security Protocol: Too many attempts. Account locked.')
        } else {
          setError(`Invalid email or password. (${newAttempts}/3)`)
        }
      } else {
        resetAttempts()
      }
    } catch (err) {
      setError('Connection to hospital server failed.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      {/* Background Soft Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] relative">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden">
          
          {/* Top Banner / Branding */}
          <div className="pt-10 pb-6 text-center border-b border-slate-50">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 mb-4 ring-4 ring-blue-50/50">
              <Activity size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hospital Management</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Secure Staff Authentication</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1" htmlFor="email">
                Staff Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isBlocked || loading}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest" htmlFor="password">
                  Password
                </label>
                <button type="button" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tighter">
                  Reset
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isBlocked || loading}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl py-3.5 pl-11 pr-12 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 animate-in fade-in zoom-in duration-200">
                <AlertCircle size={16} className="shrink-0" />
                <span className="text-xs font-semibold leading-none">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isBlocked}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md ${
                loading || isBlocked
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isBlocked ? (
                `Terminal Locked (${remainingMinutes}m)`
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Authorize Access
                </>
              )}
            </button>
          </form>

          {/* Bottom Security Footer */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((step) => (
                <div 
                  key={step} 
                  className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                    attempts >= step ? 'bg-rose-500' : 'bg-slate-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              End-to-End Encrypted
            </span>
          </div>
        </div>

        <p className="text-center mt-8 text-[11px] text-slate-400 font-medium uppercase tracking-[0.15em]">
          Internal Hospital Network • v3.4.2
        </p>
      </div>
    </div>
  )
}