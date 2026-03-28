import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  attempts: number
  blockedUntil: number | null
  incrementAttempts: () => void
  resetAttempts: () => void
  setBlockedUntil: (time: number) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      attempts: 0,
      blockedUntil: null,
      incrementAttempts: () => set((state) => ({ attempts: state.attempts + 1 })),
      resetAttempts: () => set({ attempts: 0, blockedUntil: null }),
      setBlockedUntil: (time) => set({ blockedUntil: time })
    }),
    { name: "auth-storage" }
  )
)