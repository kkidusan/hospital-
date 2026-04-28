// app/specialist/consultation/[patientId]/ConsultationForm.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertCircle, TestTube, ClipboardCheck, 
  CheckCircle2, FileText, Printer, Heart, Calendar, UserCheck 
} from 'lucide-react';
import { useConsultationStore } from '../../../lib/store/useConsultationStore';
import { format } from 'date-fns';

interface ConsultationFormProps {
  patient: any;
  onLabSubmit: (formData: FormData) => Promise<void>;
  onRadSubmit: (formData: FormData) => Promise<void>;
  onFinalize: (formData: FormData) => Promise<void>;
  onPaymentUpdate?: (formData: FormData) => Promise<void>;
}

function RadiologyRequestForm({ 
  patient, 
  onRadSubmit 
}: { 
  patient: any; 
  onRadSubmit: (formData: FormData) => Promise<void>; 
}) {
  const { 
    radiologyDraft, 
    toggleUltrasound, 
    setOtherUltrasound, 
    setRadiologyDraft,
    resetRadiologyDraft 
  } = useConsultationStore();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('patientId', patient.id);
    formData.append('clinicalData', radiologyDraft.clinicalData || '');
    formData.append('xrayType', radiologyDraft.xrayType || '');

    const ultrasoundList = [...radiologyDraft.ultrasound];
    if (radiologyDraft.otherUltrasound?.trim()) {
      ultrasoundList.push(radiologyDraft.otherUltrasound.trim());
    }

    if (ultrasoundList.length > 0) {
      formData.append('ultrasound', JSON.stringify(ultrasoundList));
    }

    await onRadSubmit(formData);
    resetRadiologyDraft();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <input type="hidden" name="patientId" value={patient.id} />

      <div className="mb-10">
        <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Investigation Request</h2>
        <p className="text-gray-500 mt-1">Radiology • Dr. Birku Belete Internal Medicine Clinic</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-5">ULTRASOUND</h3>
          <div className="space-y-3 text-base">
            {['Abdominal', 'Pelvic', 'Abdominopelvic'].map((item) => (
              <label key={item} className="flex items-center gap-3 cursor-pointer hover:text-blue-600 transition-colors">
                <input 
                  type="checkbox" 
                  checked={radiologyDraft.ultrasound.includes(item)}
                  onChange={() => toggleUltrasound(item)}
                  className="w-4 h-4 accent-blue-600" 
                />
                <span>{item}</span>
              </label>
            ))}
            <div className="pt-3">
              <input 
                type="text" 
                value={radiologyDraft.otherUltrasound}
                onChange={(e) => setOtherUltrasound(e.target.value)}
                placeholder="Other (Thyroid, Breast, Scrotal...)" 
                className="w-full border-b border-gray-300 pb-2 text-base focus:outline-none focus:border-blue-600 transition-colors" 
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-5">X-RAY</h3>
          <input 
            type="text" 
            value={radiologyDraft.xrayType}
            onChange={(e) => setRadiologyDraft({ xrayType: e.target.value })}
            placeholder="e.g. Chest X-ray, Abdominal series, Knee X-ray..." 
            className="w-full border-b border-gray-300 pb-3 text-base focus:outline-none focus:border-blue-600 transition-colors" 
          />
        </div>
      </div>

      <div className="mb-12">
        <label className="block text-base font-medium text-gray-700 mb-3">
          Clinical Data / Provisional Diagnosis
        </label>
        <textarea 
          value={radiologyDraft.clinicalData}
          onChange={(e) => setRadiologyDraft({ clinicalData: e.target.value })}
          required
          rows={5}
          className="w-full border border-gray-300 rounded-2xl p-5 text-base focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all resize-y"
          placeholder="Relevant history, symptoms, and reason for imaging..."
        />
      </div>

      <div className="flex justify-center">
        <button 
          type="submit"
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-base px-10 py-3.5 rounded-2xl transition-all duration-200 shadow-sm"
        >
          <Printer size={20} />
          Submit Radiology Request
        </button>
      </div>
    </form>
  );
}

export default function ConsultationForm({
  patient,
  onLabSubmit,
  onRadSubmit,
  onFinalize,
  onPaymentUpdate,
}: ConsultationFormProps) {
  
  const hasTriage = !!patient?.triage;
  const [tab, setTab] = useState<'triage' | 'lab-request' | 'radiology' | 'results' | 'finalize'>(
    hasTriage ? 'triage' : 'lab-request'
  );

  const { 
    labDraft, 
    radiologyDraft, 
    finalizeDraft,
    toggleLabTest,
    setLabDraft,
    setRadiologyDraft,
    setFinalizeDraft,
    resetAllDrafts,
    resetLabDraft,
    resetRadiologyDraft
  } = useConsultationStore();

  useEffect(() => {
    return () => {
      resetAllDrafts();
    };
  }, [resetAllDrafts]);

  const tabs = hasTriage 
    ? ['triage', 'lab-request', 'radiology', 'results', 'finalize']
    : ['lab-request', 'radiology', 'results', 'finalize'];

  const tabLabels: Record<string, string> = {
    triage: 'Triage',
    'lab-request': 'Lab Request',
    radiology: 'Radiology',
    results: 'Investigation Results',
    finalize: 'Finalize',
  };

  return (
    <div className="pb-16">
      <div className="border-b border-gray-200 mb-12">
        <div className="flex gap-8">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`pb-4 text-sm font-medium transition-all relative ${
                tab === t 
                  ? 'text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabels[t]}
              {tab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {tab === 'triage' && hasTriage && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="flex items-center gap-3 text-xl font-semibold text-gray-900 mb-6">
                <Heart className="text-red-500" size={22} /> Vital Signs
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest text-gray-500">Temperature</div>
                  <div className="text-2xl font-semibold mt-1">{patient.triage?.temperature}°C</div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest text-gray-500">Blood Pressure</div>
                  <div className="text-2xl font-semibold mt-1">{patient.triage?.bloodPressure}</div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest text-gray-500">Pulse</div>
                  <div className="text-2xl font-semibold mt-1">{patient.triage?.pulse} bpm</div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <div className="text-xs uppercase tracking-widest text-gray-500">SpO₂</div>
                  <div className="text-2xl font-semibold mt-1">{patient.triage?.spo2}%</div>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl col-span-2 sm:col-span-1">
                  <div className="text-xs uppercase tracking-widest text-gray-500">Weight</div>
                  <div className="text-2xl font-semibold mt-1">{patient.triage?.weight} kg</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-3 text-xl font-semibold text-gray-900 mb-6">
                <AlertCircle className="text-amber-500" size={22} /> Chief Complaint
              </h3>
              <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl text-gray-800 leading-relaxed">
                {patient.triage?.chiefComplaint || "No chief complaint recorded."}
              </div>
            </div>
          </div>
        )}

        {tab === 'lab-request' && (
          <form 
            action={async (formData: FormData) => {
              await onLabSubmit(formData);
              resetLabDraft();
            }} 
            className="max-w-5xl mx-auto"
          >
            <input type="hidden" name="patientId" value={patient.id} />
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-gray-900 tracking-tight">Laboratory Requisition</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-9">
              <div>
                <h4 className="font-semibold text-blue-700 text-base mb-4">HEMATOLOGY</h4>
                <div className="space-y-2.5 text-sm">
                  {['CBC', 'ESR', 'Blood group & RH', 'Peripheral morphology', 'Blood film'].map((test) => (
                    <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                      <input 
                        type="checkbox" 
                        checked={labDraft.selectedTests.includes(test)}
                        onChange={() => toggleLabTest(test)}
                        name="labTests" 
                        value={test} 
                        className="w-4 h-4 accent-blue-600" 
                      />
                      {test}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-9">
                <div>
                  <h4 className="font-semibold text-blue-700 text-base mb-4">SEROLOGY</h4>
                  <div className="space-y-2.5 text-sm">
                    {['HCG (PT)', 'WIDAL / O&H', 'HBsAg', 'HCV Ab', 'RF', 'ANA'].map((test) => (
                      <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={labDraft.selectedTests.includes(test)}
                          onChange={() => toggleLabTest(test)}
                          name="labTests" 
                          value={test} 
                          className="w-4 h-4 accent-blue-600" 
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 text-base mb-4">CHEMISTRY</h4>
                  <div className="space-y-2.5 text-sm">
                    {['RBS', 'FBS', 'ALT/SGOT', 'ALP', 'Creatinine', 'BUN/Urea', 'Cholesterol', 'Triglyceride', 'HDL', 'LDL'].map((test) => (
                      <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={labDraft.selectedTests.includes(test)}
                          onChange={() => toggleLabTest(test)}
                          name="labTests" 
                          value={test} 
                          className="w-4 h-4 accent-blue-600" 
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-9">
                <div>
                  <h4 className="font-semibold text-blue-700 text-base mb-4">URINALYSIS</h4>
                  <div className="space-y-2.5 text-sm">
                    {['Urinalysis (Physical + Chemical + Micro)', 'Urine Pregnancy Test'].map((test) => (
                      <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={labDraft.selectedTests.includes(test)}
                          onChange={() => toggleLabTest(test)}
                          name="labTests" 
                          value={test} 
                          className="w-4 h-4 accent-blue-600" 
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 text-base mb-4">MICROBIOLOGY</h4>
                  <div className="space-y-2.5 text-sm">
                    {['Stool Examination', 'AFB', 'KOH Preparation', 'Gram Stain'].map((test) => (
                      <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={labDraft.selectedTests.includes(test)}
                          onChange={() => toggleLabTest(test)}
                          name="labTests" 
                          value={test} 
                          className="w-4 h-4 accent-blue-600" 
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700 text-base mb-4">HORMONAL</h4>
                  <div className="space-y-2.5 text-sm">
                    {['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4'].map((test) => (
                      <label key={test} className="flex items-center gap-3 cursor-pointer hover:text-blue-600">
                        <input 
                          type="checkbox" 
                          checked={labDraft.selectedTests.includes(test)}
                          onChange={() => toggleLabTest(test)}
                          name="labTests" 
                          value={test} 
                          className="w-4 h-4 accent-blue-600" 
                        />
                        {test}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-14 space-y-8 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Indication / Diagnosis</label>
                <textarea 
                  name="clinicalIndication"
                  value={labDraft.clinicalIndication}
                  onChange={(e) => setLabDraft({ clinicalIndication: e.target.value })}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-2xl p-5 text-base focus:border-blue-600 focus:ring-1"
                  placeholder="Reason for requesting these tests..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
                <textarea 
                  name="labNotes"
                  value={labDraft.labNotes}
                  onChange={(e) => setLabDraft({ labNotes: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-2xl p-5 text-base focus:border-blue-600 focus:ring-1"
                  placeholder="Any notes for the laboratory..."
                />
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button 
                type="submit"
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base px-10 py-3.5 rounded-2xl transition-all shadow-sm"
              >
                <TestTube size={20} />
                Submit Laboratory Request
              </button>
            </div>
          </form>
        )}

        {tab === 'radiology' && (
          <RadiologyRequestForm patient={patient} onRadSubmit={onRadSubmit} />
        )}

        {tab === 'results' && (
          <div className="space-y-12">
            <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <ClipboardCheck size={26} /> Investigation Results
            </h3>

            {(!patient.labRequests?.length && !patient.radiologyRequests?.length) ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 text-center">
                <ClipboardCheck size={60} className="mx-auto text-gray-300 mb-6" />
                <p className="text-xl text-gray-500">No results available yet</p>
                <p className="text-gray-400 mt-2">Lab or Radiology results will appear here once entered by the laboratory</p>
              </div>
            ) : (
              <div className="space-y-10">
                {patient.labRequests?.map((req: any) => (
                  <div key={req.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 bg-gray-50 border-b flex justify-between items-center">
                      <div>
                        <strong className="text-lg">Laboratory Results</strong>
                        <p className="text-sm text-gray-500 mt-1">
                          Requested on {format(new Date(req.createdAt), 'dd MMM yyyy • hh:mm a')}
                        </p>
                      </div>
                      <span className={`px-6 py-2 text-sm font-semibold rounded-full ${
                        req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-8 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-xs uppercase tracking-widest text-gray-500">
                            <th className="py-4 text-left font-medium">Test Name</th>
                            <th className="py-4 text-left font-medium">Category</th>
                            <th className="py-4 text-left font-medium">Result</th>
                            <th className="py-4 text-left font-medium">Unit</th>
                            <th className="py-4 text-left font-medium">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {req.tests?.map((test: any) => (
                            <tr key={test.id} className="hover:bg-gray-50">
                              <td className="py-5 font-medium">{test.testName}</td>
                              <td className="py-5 text-gray-600">{test.category}</td>
                              <td className="py-5 font-semibold text-lg">{test.result || '—'}</td>
                              <td className="py-5 text-gray-600">{test.unit || '—'}</td>
                              <td className="py-5 text-gray-600 italic">{test.remarks || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="border-t bg-gray-50 px-8 py-6 flex flex-wrap items-center justify-between gap-6 text-sm">
                      <div className="flex items-center gap-3">
                        <UserCheck className="text-emerald-600" size={22} />
                        <div>
                          <span className="text-gray-500">Reported by:</span>{' '}
                          <span className="font-semibold text-emerald-700">
                            {req.completedByName || 'Laboratory Department'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>{' '}
                        <span className="font-medium">
                          {req.completedAt ? format(new Date(req.completedAt), 'dd MMM yyyy') : '—'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {patient.radiologyRequests?.map((req: any) => (
                  <div key={req.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 bg-violet-50 border-b">
                      <div className="flex items-center gap-3">
                        <FileText size={22} className="text-violet-600" />
                        <div>
                          <strong className="text-lg">{req.scanType || 'Radiology Report'}</strong>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested on {format(new Date(req.createdAt), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 space-y-6 text-sm text-gray-700">
                      {req.ultrasound?.length > 0 && (
                        <div><strong>Ultrasound:</strong> {req.ultrasound.join(', ')}</div>
                      )}
                      {req.xrayType && (
                        <div><strong>X-Ray:</strong> {req.xrayType}</div>
                      )}
                      {req.clinicalData && (
                        <div>
                          <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Clinical Data</div>
                          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 whitespace-pre-wrap">
                            {req.clinicalData}
                          </div>
                        </div>
                      )}
                      {req.reportedAt && (
                        <div className="pt-4 border-t text-xs text-gray-500">
                          Reported on {format(new Date(req.reportedAt), 'dd MMM yyyy')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'finalize' && (
          <form 
            action={async (formData: FormData) => {
              await onFinalize(formData);
              resetAllDrafts();
            }} 
            className="max-w-3xl mx-auto"
          >
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
        )}
      </div>
    </div>
  );
}