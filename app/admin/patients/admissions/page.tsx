'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Admission {
  id: string;
  patient: {
    mrn: string;
    fullName: string;
    age: number;
    sex: string;
  };
  admissionDate: string;
  ward: string;
  bedNumber: string;
  status: string;
  source: string;
  admittingDoctor?: {
    name: string;
  };
  stayDays: number;
}

export default function AdminAdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [filteredAdmissions, setFilteredAdmissions] = useState<Admission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Active Admissions with better error handling
  const fetchAdmissions = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/admissions', {
        cache: 'no-store',
        next: { revalidate: 0 },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Server error: ${res.status} - ${res.statusText}`);
      }

      const data: Admission[] = await res.json();
      setAdmissions(data);
      setFilteredAdmissions(data);
    } catch (err: any) {
      console.error('Fetch admissions failed:', err);
      setError(
        err.message.includes('500')
          ? 'Internal Server Error in API. Check server console for details (likely Prisma query issue).'
          : err.message || 'Failed to load inpatient admissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  // Live Search + Ward Filter
  useEffect(() => {
    let result = admissions;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((adm) =>
        adm.patient.fullName.toLowerCase().includes(term) ||
        adm.patient.mrn.toLowerCase().includes(term) ||
        adm.bedNumber.toLowerCase().includes(term) ||
        adm.ward.toLowerCase().includes(term)
      );
    }

    if (wardFilter !== 'ALL') {
      result = result.filter((adm) => adm.ward === wardFilter);
    }

    setFilteredAdmissions(result);
  }, [searchTerm, wardFilter, admissions]);

  const handleRefresh = () => fetchAdmissions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inpatient admissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inpatient Admissions</h1>
            <p className="text-gray-600 mt-1">Manage hospitalized patients • Real-time bed occupancy</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-2xl flex items-center gap-2 text-sm font-medium"
            >
              ↻ Refresh
            </button>

            <Link
              href="/admin/patients/admissions/new"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl flex items-center gap-2"
            >
              + New Admission
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Active Inpatients</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{admissions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Occupied Beds</p>
            <p className="text-4xl font-bold mt-2">{admissions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">ICU Patients</p>
            <p className="text-4xl font-bold text-red-600 mt-2">
              {admissions.filter((a) => a.ward === 'ICU').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow">
            <p className="text-sm text-gray-500">Avg Stay</p>
            <p className="text-4xl font-bold mt-2">4.8 days</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by patient name, MRN or bed number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={wardFilter}
            onChange={(e) => setWardFilter(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500"
          >
            <option value="ALL">All Wards</option>
            <option value="ICU">ICU</option>
            <option value="GENERAL">General Ward</option>
            <option value="PEDIATRICS">Pediatrics</option>
            <option value="MATERNITY">Maternity</option>
            <option value="SURGICAL">Surgical</option>
            <option value="MEDICAL">Medical</option>
          </select>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-2xl">
            <p className="text-red-700 font-medium">Error: {error}</p>
            <p className="text-sm text-red-600 mt-1">
              Check your terminal/server console for the exact Prisma error.
            </p>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-3xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">MRN</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">Patient Name</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">Ward / Bed</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">Admitted On</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">Stay Duration</th>
                <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase">Source</th>
                <th className="px-6 py-5 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-500">
                    No active admissions found.
                  </td>
                </tr>
              ) : (
                filteredAdmissions.map((adm) => (
                  <tr key={adm.id} className="hover:bg-gray-50">
                    <td className="px-6 py-5 font-mono font-semibold text-green-700">{adm.patient.mrn}</td>
                    <td className="px-6 py-5 font-medium">{adm.patient.fullName}</td>
                    <td className="px-6 py-5">
                      <span className="font-semibold">{adm.ward}</span> • {adm.bedNumber}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {new Date(adm.admissionDate).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-5 font-semibold text-orange-600">{adm.stayDays} days</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        adm.source === 'ER' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {adm.source}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-4 text-sm">
                        <Link href={`/admin/patients/admissions/${adm.id}`} className="text-blue-600 hover:underline">View</Link>
                        <button className="text-amber-600 hover:underline">Transfer</button>
                        <button className="text-green-600 hover:underline">Discharge</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}