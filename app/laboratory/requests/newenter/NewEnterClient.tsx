'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Save, User, Calendar, Activity, Fingerprint, Info, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

interface LabTest {
  id: string;
  testName: string;
  category: string;
  result?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
}

interface LabRequest {
  id: string;
  createdAt: Date;
  patient: {
    fullName: string;
    mrn: string;
    age?: number;
    gender?: string;
  };
  tests: LabTest[];
  status: string;
}

interface Props {
  initialRequest: LabRequest;
}

// Default units based on category
const getDefaultUnits = (testName: string, category: string): string[] => {
  const name = testName.toUpperCase().trim();
  const cat = category.toUpperCase();

  if (cat === 'HEMATOLOGY' || name.includes('CBC') || name.includes('ESR') || name.includes('BLOOD FILM')) {
    return ['×10³/µL', '×10⁶/µL', 'g/dL', 'fL', '%', 'mm/hr', '10^9/L', '10^12/L'];
  }
  
  if (cat === 'CHEMISTRY' || name.includes('RBS') || name.includes('FBS') || name.includes('CREATININE') || 
      name.includes('UREA') || name.includes('ALT') || name.includes('CHOLESTEROL')) {
    return ['mg/dL', 'mmol/L', 'U/L', 'µmol/L', 'g/L', 'mEq/L'];
  }

  if (cat === 'URINALYSIS' || name.includes('URINE')) {
    return ['+', '++', '+++', 'Negative', 'Positive', 'ml/min', 'mg/dL'];
  }

  if (cat === 'SEROLOGY' || name.includes('HCG') || name.includes('HBsAg') || name.includes('WIDAL')) {
    return ['Positive', 'Negative', 'Reactive', 'Non-Reactive', 'Titre'];
  }

  if (cat === 'MICROBIOLOGY' || name.includes('AFB') || name.includes('GRAM') || name.includes('KOH')) {
    return ['Positive', 'Negative', 'Few', 'Moderate', 'Many', 'Scanty'];
  }

  if (cat === 'HORMONAL' || name.includes('TSH') || name.includes('T3') || name.includes('T4')) {
    return ['µIU/mL', 'ng/dL', 'pg/mL', 'nmol/L'];
  }

  return ['mg/dL', 'mmol/L', 'U/L', '%', 'g/dL', '10^9/L', 'Negative', 'Positive'];
};

export default function NewEnterClient({ initialRequest }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const [testResults, setTestResults] = useState<Record<string, any>>(
    initialRequest.tests.reduce((acc, test) => {
      acc[test.id] = {
        result: test.result || '',
        unit: test.unit || '',
        remarks: '',
      };
      return acc;
    }, {} as Record<string, any>)
  );

  const [isPending, setIsPending] = useState(false);

  const currentUserName = session?.user?.name || 'Lab Technician';

  const handleResultChange = (testId: string, field: string, value: string) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: {
        ...prev[testId],
        [field]: value,
      }
    }));
  };

  // Suggested units for each test
  const suggestedUnits = useMemo(() => {
    const unitsMap: Record<string, string[]> = {};
    initialRequest.tests.forEach(test => {
      unitsMap[test.id] = getDefaultUnits(test.testName, test.category);
    });
    return unitsMap;
  }, [initialRequest.tests]);

  // Save all results
  async function handleSaveAll() {
    if (!session?.user?.id) {
      alert("Session expired. Please login again.");
      return;
    }

    setIsPending(true);

    const resultsToSubmit = Object.entries(testResults).map(([testId, data]) => ({
      testId,
      resultValue: data.result.trim(),
      unit: data.unit.trim() || null,
      remarks: data.remarks.trim() || null,
    }));

    try {
      const res = await fetch('/api/lab-results/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: initialRequest.id,
          results: resultsToSubmit,
          reportedById: session.user.id,
          reportedByName: currentUserName,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save results');
      }

      alert('Results saved successfully!');
      router.refresh();
      router.push('/laboratory/requests');
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Error saving results. Please try again.');
    } finally {
      setIsPending(false);
    }
  }

  const isComplete = initialRequest.tests.every(test => 
    testResults[test.id]?.result?.trim().length > 0
  );

  return (
    <div className="min-h-screen bg-[#F9FBFC] py-6">
      <div className="max-w-6xl mx-auto px-4">

        {/* Header */}
        <header className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
                  Lab Result Entry
                </h1>
                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mt-1">
                  Dr. Birku Belete Internal Medicine Specialty Clinic
                </p>
              </div>
            </div>

            <div className="mt-3 md:mt-0 flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
              <Calendar className="h-3 w-3 text-gray-500" />
              <span className="text-[11px] font-semibold text-gray-600">
                {format(new Date(initialRequest.createdAt), 'dd MMM yyyy • hh:mm a')}
              </span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px]">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-gray-400 font-medium">Patient:</span>
              <span className="font-bold text-gray-900">{initialRequest.patient.fullName}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Fingerprint className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-400 font-medium">MRN:</span>
              <span className="font-mono text-gray-700 bg-white px-1.5 border border-gray-100 rounded">
                {initialRequest.patient.mrn}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-700">
                <span className="font-semibold">{initialRequest.patient.age || '—'}</span> Yrs / 
                <span className="font-semibold uppercase ml-1">{initialRequest.patient.gender || '—'}</span>
              </span>
            </div>

            {/* Reported By */}
            <div className="flex items-center gap-2 ml-auto">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-gray-400 font-medium">Reported by:</span>
              <span className="font-semibold text-emerald-700">{currentUserName}</span>
            </div>

            <div>
              <div className={`text-[10px] font-bold uppercase px-3 py-0.5 rounded-md border 
                ${isComplete ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                {isComplete ? '✓ READY TO SAVE' : 'INCOMPLETE'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest text-[10px]">
                    Test Analysis
                  </th>
                  <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest text-[10px] w-[220px]">
                    Result
                  </th>
                  <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest text-[10px] w-40">
                    Unit
                  </th>
                  <th className="px-5 py-3 text-left font-bold text-gray-500 uppercase tracking-widest text-[10px]">
                    Interpretation / Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {initialRequest.tests.map((test) => {
                  const units = suggestedUnits[test.id] || ['mg/dL', 'mmol/L', 'U/L', '%'];

                  return (
                    <tr key={test.id} className="hover:bg-blue-50/30 transition-all">
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-800">{test.testName}</div>
                        <div className="text-[10px] text-blue-600 font-medium uppercase tracking-wide">
                          {test.category}
                        </div>
                      </td>

                      {/* Result Input */}
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          value={testResults[test.id]?.result || ''}
                          onChange={(e) => handleResultChange(test.id, 'result', e.target.value)}
                          placeholder="Enter result value"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </td>

                      {/* Unit Dropdown */}
                      <td className="px-5 py-4">
                        <select
                          value={testResults[test.id]?.unit || ''}
                          onChange={(e) => handleResultChange(test.id, 'unit', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm cursor-pointer"
                        >
                          <option value="">Select Unit</option>
                          {units.map((unit, idx) => (
                            <option key={idx} value={unit}>
                              {unit}
                            </option>
                          ))}
                          <option value="CUSTOM">Other (Custom)</option>
                        </select>

                        {testResults[test.id]?.unit === 'CUSTOM' && (
                          <input
                            type="text"
                            placeholder="Enter custom unit"
                            onChange={(e) => handleResultChange(test.id, 'unit', e.target.value)}
                            className="mt-2 w-full px-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-blue-500"
                          />
                        )}
                      </td>

                      {/* Remarks */}
                      <td className="px-5 py-4">
                        <input
                          type="text"
                          value={testResults[test.id]?.remarks || ''}
                          onChange={(e) => handleResultChange(test.id, 'remarks', e.target.value)}
                          placeholder="Remarks / Interpretation (optional)"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="p-6 bg-gray-50/70 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSaveAll}
              disabled={isPending || !isComplete}
              className={`flex items-center gap-2 px-10 py-3 rounded-2xl text-sm font-semibold transition-all shadow-sm
                ${isPending || !isComplete 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save & Finalize Results
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}