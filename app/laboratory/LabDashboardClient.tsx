'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Clock, Loader2, AlertTriangle, LogIn } from 'lucide-react';

interface DashboardData {
  newCount: number;
  inProgressCount: number;
  completedCount: number;
  urgentCount: number;
  allRequests: any[];
  timestamp: string;
}

export default function LabDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Data Fetching
  const fetchData = async () => {
    try {
      const res = await fetch('/api/lab-dashboard', { 
        cache: 'no-store',
        credentials: 'include' 
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setErrorMessage("Your session has expired or been revoked. Logging you out...");
          setTimeout(() => signOut({ callbackUrl: '/login' }), 1500);
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await res.json();
      if (result.error) throw new Error(result.error);

      setData(result);
      setLastUpdated(new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Authentication + Role Protection + Auto Refresh
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'LABORATORY') {
        router.replace('/dashboard');
        return;
      }

      fetchData();

      // Auto-refresh every 20 seconds
      const interval = setInterval(fetchData, 20000);
      return () => clearInterval(interval);
    }
  }, [status, session, router]);

  // Manual Refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchData();
  };

  // Navigate to Result Entry Page with specific request ID
  const handleEnter = (requestId: string) => {
    router.push(`/laboratory/requests/newenter?id=${requestId}`);
  };

  // Loading State
  if (status === 'loading' || (loading && !data)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading Lab Dashboard...</p>
        </div>
      </div>
    );
  }

  // Error / Session Revoked State
  if (errorMessage || !session) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-950 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-600" />
          <h2 className="mt-6 text-2xl font-bold text-red-800 dark:text-red-200">Access Denied</h2>
          <p className="mt-4 text-red-600 dark:text-red-400">
            {errorMessage || "Your session is no longer valid."}
          </p>
          <p className="mt-6 text-sm text-gray-500">You will be redirected to login shortly...</p>
        </div>
      </div>
    );
  }

  // Main Dashboard UI
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lab Dashboard</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <Clock className="h-3 w-3" />
            Last updated: <span className="font-medium">{lastUpdated}</span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all active:scale-95 disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
        <div className="min-w-[138px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex-shrink-0">
          <div className="text-xs font-semibold text-blue-600">NEW</div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
            {data?.newCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Pending Payment</div>
        </div>

        <div className="min-w-[138px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex-shrink-0">
          <div className="text-xs font-semibold text-amber-600">IN PROGRESS</div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
            {data?.inProgressCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Processing</div>
        </div>

        <div className="min-w-[138px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm flex-shrink-0">
          <div className="text-xs font-semibold text-emerald-600">COMPLETED</div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mt-3">
            {data?.completedCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Today</div>
        </div>

        <div className="min-w-[138px] bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 rounded-2xl p-4 shadow-sm flex-shrink-0">
          <div className="text-xs font-semibold text-red-600">URGENT</div>
          <div className="text-4xl font-bold text-red-600 mt-3">
            {data?.urgentCount ?? 0}
          </div>
          <div className="text-[10px] text-gray-500 mt-1">Immediate</div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Recent Lab Requests</h2>
          <span className="text-xs text-gray-500">Last 12 • Auto-refreshes every 20s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">MRN</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Age / Gender</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500">Tests</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {data?.allRequests?.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                    {req.patient?.mrn || '—'}
                  </td>
                  <td className="px-6 py-4 font-medium">{req.patient?.fullName}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {req.patient?.age} • {req.patient?.gender}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {req.tests?.slice(0, 3).map((t: any, i: number) => (
                        <span 
                          key={i} 
                          className="text-[10px] bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-xl"
                        >
                          {t.testName}
                        </span>
                      ))}
                      {req.tests?.length > 3 && (
                        <span className="text-[10px] text-gray-500">+{req.tests.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-2xl ${
                      req.status === 'PENDING_PAYMENT' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleEnter(req.id)}
                      className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-2xl transition-all active:scale-95 shadow-sm"
                    >
                      <LogIn className="h-4 w-4" />
                      Enter
                    </button>
                  </td>
                </tr>
              ))}

              {(!data?.allRequests || data.allRequests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No lab requests found at the moment.
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