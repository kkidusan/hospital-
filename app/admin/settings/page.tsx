"use client";
import React, { useState, useEffect } from 'react';
import { 
  Building2, ImageIcon, Palette, Database, Languages, 
  Stethoscope, Printer, Lock, Smartphone, HardDrive, 
  Activity, Loader2, ChevronRight, CreditCard, Users, 
  Bell, Globe, ShieldCheck, Cpu, Cloud, MapPin, Contact
} from 'lucide-react';
import { SettingsDrawer } from './SettingsDrawer'; 

type DrawerType = 'company' | 'logo' | 'colors' | 'calendar' | 'language' | 'currency' | 'backup' | 'location' | 'contacts' | 'security' | null;

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [activeDrawer, setActiveDrawer] = useState<DrawerType>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (key: string, value: any) => {
    setIsSaving(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setSettings((prev: any) => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error("Failed to update setting:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: string) => {
    const currentValue = settings[key];
    const newValue = currentValue === 'On' || currentValue === true ? 'Off' : 'On';
    handleUpdate(key, newValue);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 pb-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">General System Settings</h1>
          <p className="text-gray-500">Global configurations for your HMS platform.</p>
        </header>

        {/* --- BRANDING --- */}
        <Section title="Branding & Identity">
          <Item 
            icon={Building2} title="Institution Name" 
            desc={settings.company_name || "Enter Name"} 
            onClick={() => setActiveDrawer('company')} 
          />
          <Item 
            icon={ImageIcon} title="System Logo" 
            desc="Upload clinic logo" 
            badge={settings.system_logo ? "Custom" : "Default"} 
            onClick={() => setActiveDrawer('logo')} 
          />
          <Item 
            icon={Palette} title="Brand Colors" 
            desc={`Primary: ${settings.primary_color || '#2563eb'}`} 
            onClick={() => setActiveDrawer('colors')} 
          />
        </Section>

        {/* --- LOCATION & CONTACTS --- */}
        <Section title="Location & Contact Details">
          <Item 
            icon={MapPin} title="Physical Location" 
            desc={settings.physical_address || "Configure physical address, region, and city"} 
            onClick={() => setActiveDrawer('location')} 
          />
          <Item 
            icon={Contact} title="Master Contact List" 
            desc="Manage phone numbers, emails, and emergency contacts" 
            onClick={() => setActiveDrawer('contacts')} 
          />
        </Section>

        {/* --- LOCALIZATION & FINANCE --- */}
        <Section title="Localization & Finance">
          <Item 
            icon={Database} title="Date & Calendar" 
            desc={settings.calendar_type === 'ethiopian' ? "Ethiopian Calendar" : "Gregorian Calendar"} 
            onClick={() => setActiveDrawer('calendar')} 
          />
          <Item 
            icon={Languages} title="Language" 
            desc={settings.system_language || "English / Amharic"} 
            onClick={() => setActiveDrawer('language')} 
          />
          <Item 
            icon={CreditCard} title="Base Currency" 
            desc={settings.currency || "ETB (Birr)"} 
            onClick={() => setActiveDrawer('currency')}
          />
        </Section>

        {/* --- CLINICAL & PATIENTS --- */}
        <Section title="Clinical & Patient Portal">
          <Item icon={Stethoscope} title="Diagnosis Standards" desc="ICD-10 / ICD-11 Settings" badge="ICD-10" />
          <Item icon={Users} title="Patient Portal" desc="Allow patients to view results online" 
            badge={settings.patient_portal || "Off"} 
            onClick={() => toggleSetting('patient_portal')} 
          />
          <Item icon={Bell} title="SMS Notifications" desc="Appointment reminders" 
            badge={settings.sms_enabled || "Off"} 
            onClick={() => toggleSetting('sms_enabled')}
          />
        </Section>

        {/* --- SECURITY --- */}
        <Section title="Security & Access">
          <Item icon={Lock} title="Password Policy" desc="Staff account complexity" />
          <Item 
            icon={Smartphone} title="2FA Security" 
            desc={settings.two_factor_auth === 'On' ? `Active Token: ${settings.two_factor_code || 'None'}` : "Two-factor authentication for all staff"} 
            badge={settings.two_factor_auth || "Off"} 
            onClick={() => setActiveDrawer('security')} 
          />
          <Item 
            icon={ShieldCheck} title="Session Timeout" 
            desc="Auto-logout after 30 mins" 
            badge="Active" 
          />
        </Section>

        {/* --- INFRASTRUCTURE --- */}
        <Section title="Infrastructure & Maintenance">
          <Item 
            icon={Cloud} title="Database Backup" 
            desc="Automatic daily cloud snapshots" 
            badge={settings.auto_backup || "Off"} 
            onClick={() => toggleSetting('auto_backup')}
          />
          <Item 
            icon={Cpu} title="Maintenance Mode" 
            desc="Disable system for all non-admin users" 
            badge={settings.maintenance_mode || "Off"} 
            onClick={() => toggleSetting('maintenance_mode')}
          />
          <Item icon={Activity} title="System Status" desc="Monitor system health & logs" />
        </Section>
      </div>

      <SettingsDrawer 
        isOpen={activeDrawer} 
        onClose={() => setActiveDrawer(null)} 
        settings={settings}
        isSaving={isSaving}
        onUpdate={handleUpdate}
        onFileUpload={(e) => {/* your existing upload logic */}}
      />
    </div>
  );
}

// --- UI Components ---

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <section className="mb-8">
    <h3 className="mb-3 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">{title}</h3>
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">{children}</div>
  </section>
);

const Item = ({ icon: Icon, title, desc, badge, onClick }: any) => {
  const getBadgeStyle = (text: string) => {
    if (text === 'On' || text === 'Active' || text === 'Custom') 
      return 'bg-green-100 text-green-700';
    if (text === 'Off') 
      return 'bg-gray-100 text-gray-600';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div 
      onClick={onClick} 
      className="group flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
          <Icon size={20} />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeStyle(badge)}`}>
            {badge}
          </span>
        )}
        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};