// store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  attempts: number;
  blockedUntil: number | null;
  currentDeviceId: string | null;

  incrementAttempts: () => void;
  resetAttempts: () => void;
  setBlockedUntil: (time: number) => void;
  setCurrentDevice: (deviceId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      attempts: 0,
      blockedUntil: null,
      currentDeviceId: null,

      incrementAttempts: () => set((state) => ({ attempts: state.attempts + 1 })),
      resetAttempts: () => set({ attempts: 0, blockedUntil: null, currentDeviceId: null }),
      setBlockedUntil: (time: number) => set({ blockedUntil: time }),
      setCurrentDevice: (deviceId: string) => set({ currentDeviceId: deviceId }),
      logout: () => set({ attempts: 0, blockedUntil: null, currentDeviceId: null }),
    }),
    { 
      name: "auth-storage",
      partialize: (state) => ({ 
        attempts: state.attempts, 
        blockedUntil: state.blockedUntil,
        currentDeviceId: state.currentDeviceId 
      })
    }
  )
);