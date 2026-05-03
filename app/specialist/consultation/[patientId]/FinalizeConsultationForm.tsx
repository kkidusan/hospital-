"use client";

import Link from 'next/link';
import { CheckCircle2, Calendar } from 'lucide-react';
import { useConsultationStore } from '../../../lib/store/useConsultationStore';

interface FinalizeFormProps {
  patient: any;
  onFinalize: (formData: FormData) => Promise<void>;
}

export function FinalizeConsultationForm({ patient, onFinalize }: FinalizeFormProps) {
  const { finalizeDraft, setFinalizeDraft, resetAllDrafts } = useConsultationStore();

  const handleAction = async (formData: FormData) => {
    await onFinalize(formData);
    resetAllDrafts();
  };

  return (
    <form action={handleAction} className="max-w-3xl mx-auto">
      <input type="hidden" name="patientId" value={patient.id} />

      <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
        <h3 className="text-2xl font-semibold text-gray-900 mb-8 flex items-center gap-3">
          <CheckCircle2 size={26} className="text-emerald-600" /> 
          Complete Consultation & Schedule Follow-up
        </h3>

        <div className="space-y-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Final Diagnosis</label>
            <input 
              name="description" 
              value={finalizeDraft.diagnosis}
              onChange={(e) => setFinalizeDraft({ diagnosis: e.target.value })}
              required 
              className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-1 text-base"
              placeholder="e.g. Acute Gastroenteritis, Essential Hypertension..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prescription & Clinical Advice</label>
            <textarea 
              name="notes" 
              value={finalizeDraft.notes}
              onChange={(e) => setFinalizeDraft({ notes: e.target.value })}
              rows={6}
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 focus:ring-1 text-base resize-y"
              placeholder="Medications, dosage, duration, lifestyle advice, warning signs..."
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="text-indigo-600" size={24} />
              Schedule Follow-up Appointment
            </h4>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Follow-up Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'RECALL', label: 'Recall List (Preventive)', color: 'bg-blue-100 text-blue-700' },
                  { value: 'CHRONIC_CARE', label: 'Chronic Care', color: 'bg-amber-100 text-amber-700' },
                  { value: 'POST_OP', label: 'Post-Op / Procedure', color: 'bg-rose-100 text-rose-700' },
                ].map((cat) => (
                  <label key={cat.value} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="followUpType" 
                      value={cat.value}
                      className="peer hidden"
                    />
                    <div className={`peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-indigo-600 text-center py-3.5 rounded-2xl font-medium transition-all ${cat.color}`}>
                      {cat.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input 
                  type="date"
                  name="followUpDate"
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:border-indigo-600 focus:ring-1 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Time</label>
                <input 
                  type="time"
                  name="followUpTime"
                  className="w-full px-5 py-3.5 border border-gray-300 rounded-2xl focus:border-indigo-600 focus:ring-1 text-base"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Follow-up (Optional)</label>
              <textarea 
                name="followUpReason"
                rows={3}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-indigo-600 focus:ring-1 text-base resize-y"
                placeholder="e.g. Review treatment response, Repeat lab tests, Blood pressure control..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Priority</label>
              <div className="flex gap-4">
                <label className="flex-1">
                  <input 
                    type="radio" 
                    name="followUpPriority" 
                    value="ROUTINE"
                    defaultChecked
                    className="peer hidden"
                  />
                  <div className="peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-indigo-600 text-center py-3 rounded-2xl cursor-pointer font-medium transition-all bg-emerald-100 text-emerald-700">
                    Routine
                  </div>
                </label>
                <label className="flex-1">
                  <input 
                    type="radio" 
                    name="followUpPriority" 
                    value="URGENT"
                    className="peer hidden"
                  />
                  <div className="peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-indigo-600 text-center py-3 rounded-2xl cursor-pointer font-medium transition-all bg-rose-100 text-rose-700">
                    Urgent
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-12">
          <Link href="/specialist" className="flex-1">
            <button 
              type="button" 
              className="w-full py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-600 font-medium rounded-2xl transition"
            >
              Cancel
            </button>
          </Link>
          <button 
            type="submit" 
            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={20} />
            Complete Consultation & Save
          </button>
        </div>
      </div>
    </form>
  );
}