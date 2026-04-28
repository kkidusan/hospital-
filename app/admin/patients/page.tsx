'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Patient {
  id: string;
  mrn: string;
  fullName: string;
  age: number;
  ageUnit: string;
  sex: string;
  phoneNumber: string | null;
  region: string | null;
  registeredAt: string;
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/reception/patients', {
          cache: 'no-store',
        });

        if (!res.ok) throw new Error('Failed to load patients');

        const data = await res.json();
        // Assuming your API returns { patients: [...] }
        const patientList = Array.isArray(data) ? data : data.patients || [];
        
        setPatients(patientList);
        setFilteredPatients(patientList);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Live search (real-time filtering)
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) {
      setFilteredPatients(patients);
      return;
    }

    const filtered = patients.filter((patient) =>
      patient.mrn.toLowerCase().includes(term) ||
      patient.fullName.toLowerCase().includes(term) ||
      (patient.phoneNumber && patient.phoneNumber.includes(term)) ||
      patient.region?.toLowerCase().includes(term)
    );

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Delete handler (you can connect real DELETE API later)
  const handleDelete = async (id: string, mrn: string) => {
    if (!confirm(`Delete patient ${mrn}? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/reception/patients/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      // Remove from UI immediately
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setFilteredPatients((prev) => prev.filter((p) => p.id !== id));
      
      alert(`Patient ${mrn} deleted successfully`);
    } catch (err) {
      alert('Could not delete patient. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
            <p className="text-gray-600 mt-1">
              Total patients: <span className="font-semibold">{filteredPatients.length}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Search */}
            <div className="relative w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by MRN, Name, Phone or Region..."
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-2xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* New Patient Button */}
            <Link
              href="/reception/register-patient"
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-2xl flex items-center gap-2 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Patient
            </Link>
          </div>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="bg-white rounded-3xl shadow p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
            ⚠️ {error}
          </div>
        )}

        {/* Patient Table */}
        {!loading && !error && (
          <div className="bg-white rounded-3xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">MRN</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Full Name</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Age</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Sex</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Region</th>
                  <th className="px-6 py-5 text-left text-xs font-semibold text-gray-500 uppercase tracking-widest">Registered</th>
                  <th className="px-6 py-5 text-center text-xs font-semibold text-gray-500 uppercase tracking-widest w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No patients found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-5 font-mono font-semibold text-green-700">{patient.mrn}</td>
                      <td className="px-6 py-5 font-medium text-gray-900">{patient.fullName}</td>
                      <td className="px-6 py-5 text-gray-600">
                        {patient.age} {patient.ageUnit}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            patient.sex === 'Male'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {patient.sex}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-gray-600 font-medium">
                        {patient.phoneNumber || '—'}
                      </td>
                      <td className="px-6 py-5 text-gray-600">{patient.region || 'Addis Ababa'}</td>
                      <td className="px-6 py-5 text-gray-500 text-sm">
                        {new Date(patient.registeredAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4">
                          {/* View Button */}
                          <Link
                            href={`/admin/patients/${patient.id}`}
                            className="text-gray-500 hover:text-green-600 transition"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                            </svg>
                          </Link>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/patients/${patient.id}/edit`}
                            className="text-gray-500 hover:text-amber-600 transition"
                            title="Edit Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(patient.id, patient.mrn)}
                            className="text-gray-500 hover:text-red-600 transition"
                            title="Delete Patient"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.595 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.595-1.858L5 7m5 4v6m4-6v6m1-10V9a1 1 0 00-1-1h-4a1 1 0 00-1 1v1M12 4v-.5a1 1 0 011-1h2a1 1 0 011 1V4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 mt-8">
          Showing {filteredPatients.length} of {patients.length} patients • Real-time search enabled
        </div>
      </div>
    </div>
  );
}