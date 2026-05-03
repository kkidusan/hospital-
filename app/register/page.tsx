'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Updated Role Type to include PHARMACIST and INVENTORY
type Role = 
  | 'ADMIN' 
  | 'RECEPTION' 
  | 'TRIAGE' 
  | 'SPECIALIST' 
  | 'LABORATORY' 
  | 'RADIOLOGY' 
  | 'BILLING' 
  | 'FINANCIAL' 
  | 'PHARMACIST' 
  | 'INVENTORY';

// 2. Updated roles list for the UI dropdown
const roles: { value: Role; label: string }[] = [
  { value: 'RECEPTION', label: 'Reception' },
  { value: 'TRIAGE', label: 'Triage Nurse' },
  { value: 'SPECIALIST', label: 'Specialist Doctor' },
  { value: 'PHARMACIST', label: 'Pharmacist' },
  { value: 'INVENTORY', label: 'Inventory / Store Manager' },
  { value: 'LABORATORY', label: 'Laboratory Technician' },
  { value: 'RADIOLOGY', label: 'Radiology Technician' },
  { value: 'BILLING', label: 'Billing Officer' },
  { value: 'FINANCIAL', label: 'Finance / Accounts' },
  { value: 'ADMIN', label: 'System Administrator' },
];

const specialties = [
  'General Practitioner',
  'Internal Medicine',
  'Pediatrics',
  'Gynecology',
  'Obstetrics',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Surgeon',
  'Dermatology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPTION' as Role,
    specialty: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      // Reset specialty when role is not SPECIALIST
      ...(name === 'role' && value !== 'SPECIALIST' ? { specialty: '' } : {}),
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!form.name.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (form.role === 'SPECIALIST' && !form.specialty.trim()) {
      setError("Please select the doctor's specialty");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          specialty: form.role === 'SPECIALIST' ? form.specialty.trim() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setShowSuccess(true);

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
              🏥
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Staff Registration</h1>
              <p className="text-blue-100 mt-1">Create new hospital staff account</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Dr. Sarah Mohammed"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="doctor@hospital.et"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">Minimum 8 characters</p>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                Role / Department
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white transition-all"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Field - Only for SPECIALIST */}
            {form.role === 'SPECIALIST' && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <label htmlFor="specialty" className="block text-sm font-medium text-blue-700 mb-2">
                  Doctor&apos;s Specialty
                </label>
                <select
                  id="specialty"
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-blue-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="">-- Select Specialization --</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-start gap-2">
                ⚠️ {error}
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm">
                ✓ Account created successfully! Redirecting to login...
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || showSuccess}
              className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2
                ${loading || showSuccess
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-500/30'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Staff Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-sm text-slate-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}