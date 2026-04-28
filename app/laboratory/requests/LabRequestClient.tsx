'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Clock, User, Beaker, LogIn, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface LabRequest {
  id: string;
  createdAt: Date;
  status: string;
  clinicalIndication?: string;
  patient: {
    fullName: string;
    mrn: string;
    age?: number;
    gender?: string;
  };
  tests: Array<{
    id: string;
    testName: string;
    category: string;
  }>;
}

interface Props {
  initialRequests: LabRequest[];
}

export default function LabRequestsTable({ initialRequests }: Props) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lab-requests', { 
        cache: 'no-store',
        credentials: 'include' 
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      console.error('Failed to refresh requests');
    } finally {
      setLoading(false);
    }
  };

  // Auto refresh every 25 seconds
  useEffect(() => {
    const interval = setInterval(fetchRequests, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleEnter = (requestId: string) => {
    router.push(`/laboratory/requests/newenter?id=${requestId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Beaker className="h-8 w-8 text-blue-600" />
            Laboratory Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and enter results for paid lab requests
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl hover:shadow-md transition-all disabled:opacity-70"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-blue-600 font-semibold">TOTAL PAID</div>
          <div className="text-4xl font-bold mt-2">{requests.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-emerald-600 font-semibold">READY FOR ENTRY</div>
          <div className="text-4xl font-bold mt-2">{requests.length}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-lg">Paid Lab Requests</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            Last updated: {lastUpdated}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                <th className="px-6 py-4 text-left font-medium text-gray-500">MRN</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Patient Name</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Age / Gender</th>
                <th className="px-6 py-4 text-left font-medium text-gray-500">Tests</th>
                <th className="px-6 py-4 text-center font-medium text-gray-500">Requested On</th>
                <th className="px-6 py-4 text-center font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-5 font-mono text-gray-700 dark:text-gray-300">
                    {req.patient.mrn}
                  </td>
                  <td className="px-6 py-5 font-medium text-gray-900 dark:text-white">
                    {req.patient.fullName}
                  </td>
                  <td className="px-6 py-5 text-gray-600 dark:text-gray-400">
                    {req.patient.age} yrs • {req.patient.gender}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      {req.tests.slice(0, 3).map((test, i) => (
                        <span
                          key={i}
                          className="inline-block bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs px-3 py-1 rounded-2xl"
                        >
                          {test.testName}
                        </span>
                      ))}
                      {req.tests.length > 3 && (
                        <span className="text-xs text-gray-500">+{req.tests.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-gray-600 dark:text-gray-400 text-sm">
                    {format(new Date(req.createdAt), 'dd MMM yyyy • HH:mm')}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleEnter(req.id)}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95 shadow-sm"
                    >
                      <LogIn className="h-4 w-4" />
                      Enter
                    </button>
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No paid requests awaiting result entry</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}