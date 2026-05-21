'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Stethoscope, 
  Save, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  Lock,
  Pencil,
  Eye,
  EyeOff
} from 'lucide-react';

interface UserProfileData {
  name: string;
  email: string;
  role: string;
  specialty: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password visibility state toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState<UserProfileData>({
    name: 'Abebe Kebede',
    email: '',
    role: 'RECEPTION',
    specialty: 'Reception Desk'
  });
  const [formData, setFormData] = useState<UserProfileData>({ ...profile });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData(data);
        } else if (res.status === 401) {
          router.push('/login');
        }
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfileData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // Action: Save Profile Changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isPasswordUpdate: false }),
      });

      if (!res.ok) throw new Error('Update failed');

      setProfile(formData);
      setIsEditingProfile(false);
      setStatusMessage({ type: 'success', text: 'Identity details updated successfully.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Failed to save identity modifications.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Action: Change Password with Strong Password Rules
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Verify confirmation match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    // Comprehensive strong password complexity check (Format example: Mis@1234)
    const newPassword = passwordData.newPassword;
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const isValidLength = newPassword.length >= 8;

    if (!isValidLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Password must be at least 8 characters long and contain uppercase letters, lowercase letters, and numbers (e.g., Mis@1234).' 
      });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          isPasswordUpdate: true
        }),
      });

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.error || 'Password update failed');

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setStatusMessage({ type: 'success', text: 'Password updated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pt-12 pb-12">
      <div className="max-w-2xl mx-auto px-6">
        
        {/* Alerts and feedback block */}
        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-xs font-bold">{statusMessage.text}</span>
          </div>
        )}

        {/* Central Component Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-10">
          
          {/* BLOCK 1: IDENTITY EDIT PROFILE SECTION */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase size={14} /> Identity Profile
              </h3>
              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 border border-transparent rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                >
                  <Pencil size={14} /> Edit Fields
                </button>
              )}
            </div>
            
            <form id="profile-form" onSubmit={handleSaveChanges} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      name="name"
                      disabled={!isEditingProfile}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Department / Specialty</label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      name="specialty"
                      disabled={!isEditingProfile}
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:bg-slate-50 transition-all text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Email (Account ID)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      value={profile.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {isEditingProfile && (
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setFormData({ ...profile });
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md flex items-center gap-1.5"
                  >
                    {isSavingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Info
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* DIVIDER LINE */}
          <div className="border-t border-slate-100" />

          {/* BLOCK 2: SECURITY PASSWORD FIELD SECTION */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Lock size={14} /> Security Password Update
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    required
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      required
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="e.g. Mis@1234"
                      className="w-full pl-10 pr-12 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      placeholder="Repeat new password"
                      className="w-full pl-10 pr-12 py-2.5 text-xs font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-md flex items-center gap-1.5"
                >
                  {isSavingPassword ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Update Password
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}