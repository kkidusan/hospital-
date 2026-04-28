// app/specialist/consultation/[patientId]/stores/useConsultationStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  labDraft: LabRequestDraft;
  radiologyDraft: RadiologyRequestDraft;
  finalizeDraft: FinalizeDraft;

  setLabDraft: (data: Partial<LabRequestDraft>) => void;
  toggleLabTest: (testName: string) => void;
  setRadiologyDraft: (data: Partial<RadiologyRequestDraft>) => void;
  toggleUltrasound: (item: string) => void;
  setOtherUltrasound: (value: string) => void;
  setFinalizeDraft: (data: Partial<FinalizeDraft>) => void;

  resetLabDraft: () => void;
  resetRadiologyDraft: () => void;
  resetFinalizeDraft: () => void;
  resetAllDrafts: () => void;
}

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
      labDraft: initialLab,
      radiologyDraft: initialRadiology,
      finalizeDraft: initialFinalize,

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

      resetLabDraft: () => set({ labDraft: initialLab }),
      resetRadiologyDraft: () => set({ radiologyDraft: initialRadiology }),
      resetFinalizeDraft: () => set({ finalizeDraft: initialFinalize }),

      resetAllDrafts: () =>
        set({
          labDraft: initialLab,
          radiologyDraft: initialRadiology,
          finalizeDraft: initialFinalize,
        }),
    }),
    {
      name: "consultation-drafts-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);