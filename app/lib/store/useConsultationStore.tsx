// app/specialist/consultation/[patientId]/stores/useConsultationStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. Define the Doctor Interface
export interface DoctorInfo {
  id: string;
  name: string;
  email: string;
}

export interface LabRequestDraft {
  selectedTests: string[];
  clinicalIndication: string;
  labNotes: string;
}

export interface RadiologyRequestDraft {
  ultrasound: string[];
  otherUltrasound: string;
  xrayType: string;
  clinicalData: string;
}

export interface FinalizeDraft {
  diagnosis: string;
  notes: string;
}

interface ConsultationState {
  // Data State
  doctor: DoctorInfo;
  labDraft: LabRequestDraft;
  radiologyDraft: RadiologyRequestDraft;
  finalizeDraft: FinalizeDraft;

  // Actions
  setDoctor: (doctor: DoctorInfo) => void;
  setLabDraft: (data: Partial<LabRequestDraft>) => void;
  toggleLabTest: (testName: string) => void;
  setRadiologyDraft: (data: Partial<RadiologyRequestDraft>) => void;
  toggleUltrasound: (item: string) => void;
  setOtherUltrasound: (value: string) => void;
  setFinalizeDraft: (data: Partial<FinalizeDraft>) => void;

  // Resets
  resetLabDraft: () => void;
  resetRadiologyDraft: () => void;
  resetFinalizeDraft: () => void;
  resetAllDrafts: () => void;
}

// Initial States
const initialDoctor: DoctorInfo = {
  id: "",
  name: "",
  email: "",
};

const initialLab: LabRequestDraft = {
  selectedTests: [],
  clinicalIndication: "",
  labNotes: "",
};

const initialRadiology: RadiologyRequestDraft = {
  ultrasound: [],
  otherUltrasound: "",
  xrayType: "",
  clinicalData: "",
};

const initialFinalize: FinalizeDraft = {
  diagnosis: "",
  notes: "",
};

export const useConsultationStore = create<ConsultationState>()(
  persist(
    (set) => ({
      // --- STATE ---
      doctor: initialDoctor,
      labDraft: initialLab,
      radiologyDraft: initialRadiology,
      finalizeDraft: initialFinalize,

      // --- ACTIONS ---
      
      // Set the logged-in doctor
      setDoctor: (doctor) => set({ doctor }),

      setLabDraft: (data) =>
        set((state) => ({ labDraft: { ...state.labDraft, ...data } })),

      toggleLabTest: (testName) =>
        set((state) => {
          const current = state.labDraft.selectedTests;
          const newTests = current.includes(testName)
            ? current.filter((t) => t !== testName)
            : [...current, testName];
          return { labDraft: { ...state.labDraft, selectedTests: newTests } };
        }),

      setRadiologyDraft: (data) =>
        set((state) => ({ radiologyDraft: { ...state.radiologyDraft, ...data } })),

      toggleUltrasound: (item) =>
        set((state) => {
          const current = state.radiologyDraft.ultrasound;
          const newList = current.includes(item)
            ? current.filter((i) => i !== item)
            : [...current, item];
          return { radiologyDraft: { ...state.radiologyDraft, ultrasound: newList } };
        }),

      setOtherUltrasound: (value) =>
        set((state) => ({ radiologyDraft: { ...state.radiologyDraft, otherUltrasound: value } })),

      setFinalizeDraft: (data) =>
        set((state) => ({ finalizeDraft: { ...state.finalizeDraft, ...data } })),

      // --- RESETS ---
      resetLabDraft: () => set({ labDraft: initialLab }),
      resetRadiologyDraft: () => set({ radiologyDraft: initialRadiology }),
      resetFinalizeDraft: () => set({ finalizeDraft: initialFinalize }),

      resetAllDrafts: () =>
        set({
          labDraft: initialLab,
          radiologyDraft: initialRadiology,
          finalizeDraft: initialFinalize,
          // Note: Usually we don't reset the doctor on "resetAllDrafts" 
          // because the doctor stays the same throughout the session.
        }),
    }),
    {
      name: "consultation-drafts-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);