import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PatientDraft {
  fullName: string;
  age: string;
  ageUnit: string;
  sex: string;
  address: string;
  region: string;
  phone: string;
}

interface RegistrationState {
  draft: PatientDraft;
  updateDraft: (fields: Partial<PatientDraft>) => void;
  clearDraft: () => void;
}

const initialDraft: PatientDraft = {
  fullName: '',
  age: '',
  ageUnit: 'years',
  sex: 'M',
  address: '',
  region: 'Amhara',
  phone: '+251',
};

export const useRegistrationStore = create<RegistrationState>()(
  persist(
    (set) => ({
      draft: initialDraft,
      updateDraft: (fields) =>
        set((state) => ({
          draft: { ...state.draft, ...fields },
        })),
      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: "registration-draft-storage",
    }
  )
);