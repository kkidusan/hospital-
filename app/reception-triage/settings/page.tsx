'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Clock, 
  Users, 
  AlertCircle, 
  Save, 
  ShieldCheck, 
  Moon, 
  Globe 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ReceptionSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [settings, setSettings] = useState({
    // Reception & Triage Specific Settings
    newPatientAlerts: true,
    queueUpdateNotifications: true,
    triageCompletionAlerts: true,
    emergencyPatientAlerts: true,
    dailySummaryReport: true,
    
    // Appearance
    darkMode: false,
    
    // Workflow
    autoRefreshQueue: true,
    showWaitingTime: true,
    defaultTriagePriority: 'normal',
    
    // Language
    language: 'en',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Protection
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'RECEPTION') {
      router.replace('/dashboard');
    }
  }, [status, session, router]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof settings]
    }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Reception & Triage settings saved successfully!', {
        position: 'top-center',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Reception & Triage Settings</h1>
        <p className="text-slate-500 mt-2">Customize your workflow, notifications, and preferences</p>
      </div>

      <div className="space-y-8">

        {/* 1. Notifications */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">New Patient Registration Alerts</p>
                <p className="text-sm text-slate-500">Notify when a new patient is registered</p>
              </div>
              <button
                onClick={() => handleToggle('newPatientAlerts')}
                className={`w-12 h-6 rounded-full transition-all ${settings.newPatientAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.newPatientAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Queue Update Notifications</p>
                <p className="text-sm text-slate-500">Real-time updates when queue changes</p>
              </div>
              <button
                onClick={() => handleToggle('queueUpdateNotifications')}
                className={`w-12 h-6 rounded-full transition-all ${settings.queueUpdateNotifications ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.queueUpdateNotifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Triage Completion Alerts</p>
                <p className="text-sm text-slate-500">Notify when triage is completed for a patient</p>
              </div>
              <button
                onClick={() => handleToggle('triageCompletionAlerts')}
                className={`w-12 h-6 rounded-full transition-all ${settings.triageCompletionAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.triageCompletionAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Emergency Patient Alerts</p>
                <p className="text-sm text-slate-500">Immediate notification for emergency cases</p>
              </div>
              <button
                onClick={() => handleToggle('emergencyPatientAlerts')}
                className={`w-12 h-6 rounded-full transition-all ${settings.emergencyPatientAlerts ? 'bg-red-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.emergencyPatientAlerts ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Workflow Settings */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Workflow Preferences</h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Auto Refresh Queue</p>
                <p className="text-sm text-slate-500">Automatically refresh patient queue every 30 seconds</p>
              </div>
              <button
                onClick={() => handleToggle('autoRefreshQueue')}
                className={`w-12 h-6 rounded-full transition-all ${settings.autoRefreshQueue ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.autoRefreshQueue ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Show Waiting Time</p>
                <p className="text-sm text-slate-500">Display estimated waiting time for each patient</p>
              </div>
              <button
                onClick={() => handleToggle('showWaitingTime')}
                className={`w-12 h-6 rounded-full transition-all ${settings.showWaitingTime ? 'bg-blue-600' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.showWaitingTime ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Default Triage Priority</label>
              <select 
                value={settings.defaultTriagePriority}
                onChange={(e) => handleSelectChange('defaultTriagePriority', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Appearance */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Moon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-slate-500">Switch to dark theme for better night visibility</p>
            </div>
            <button
              onClick={() => handleToggle('darkMode')}
              className={`w-12 h-6 rounded-full transition-all ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* 4. Language */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Language & Region</h2>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Interface Language</label>
            <select 
              value={settings.language}
              onChange={(e) => handleSelectChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-12 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-10 py-3.5 rounded-2xl font-semibold transition-all"
        >
          <Save size={20} />
          {isSaving ? 'Saving Settings...' : 'Save All Changes'}
        </button>
      </div>

      <div className="mt-10 text-center text-xs text-slate-400">
        All settings changes are securely logged for audit purposes
      </div>
    </div>
  );
}