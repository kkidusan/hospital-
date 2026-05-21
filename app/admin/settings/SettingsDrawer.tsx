"use client";
import React, { useRef, useEffect } from 'react';
import { X, Check, Loader2, Upload, Globe, Zap, ShieldCheck, RefreshCw } from 'lucide-react';

interface DrawerProps {
  isOpen: 'company' | 'logo' | 'colors' | 'calendar' | 'language' | 'currency' | 'backup' | 'location' | 'contacts' | 'security' | null;
  onClose: () => void;
  settings: any;
  isSaving: boolean;
  onUpdate: (key: string, value: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsDrawer: React.FC<DrawerProps> = ({ 
  isOpen, onClose, settings, isSaving, onUpdate, onFileUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to generate a random 6-digit number string
  const generateSixDigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Automatically generate and save a 6-digit code if 2FA is active but no code exists yet
  useEffect(() => {
    if (isOpen === 'security' && settings.two_factor_auth === 'On' && !settings.two_factor_code) {
      onUpdate('two_factor_code', generateSixDigitCode());
    }
  }, [isOpen, settings.two_factor_auth, settings.two_factor_code]);

  const handleRegenerateCode = () => {
    const newCode = generateSixDigitCode();
    onUpdate('two_factor_code', newCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
        onClick={() => !isSaving && onClose()} 
      />
      
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col transition-transform duration-300">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-lg font-bold text-gray-800">
            {isOpen === 'company' && "Edit Institution Name"}
            {isOpen === 'logo' && "System Logo"}
            {isOpen === 'colors' && "Theme Palette"}
            {isOpen === 'calendar' && "Date & Calendar Logic"}
            {isOpen === 'language' && "System Language"}
            {isOpen === 'location' && "Physical Location Setup"}
            {isOpen === 'contacts' && "Master Contact Details"}
            {isOpen === 'security' && "2FA Authentication Policy"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* --- INSTITUTION NAME --- */}
          {isOpen === 'company' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Primary Name (Amharic)</label>
                <input 
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.company_name}
                  onBlur={(e) => onUpdate('company_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Secondary Name (English)</label>
                <input 
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.company_name_secondary}
                  onBlur={(e) => onUpdate('company_name_secondary', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* --- SYSTEM LOGO --- */}
          {isOpen === 'logo' && (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-2xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all"
            >
              {settings.system_logo ? (
                <img src={settings.system_logo} alt="Logo" className="h-24 object-contain" />
              ) : (
                <Upload className="text-gray-400 group-hover:text-blue-500" size={32} />
              )}
              <p className="mt-2 text-sm text-gray-500 font-medium">Click to upload brand logo</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileUpload} />
            </div>
          )}

          {/* --- THEME COLORS --- */}
          {isOpen === 'colors' && (
            <div className="grid grid-cols-5 gap-4">
              {['#2563eb', '#7c3aed', '#db2777', '#059669', '#ea580c'].map(color => (
                <button 
                  key={color}
                  onClick={() => onUpdate('primary_color', color)}
                  className={`h-12 w-12 rounded-full border-4 transition-all ${settings.primary_color === color ? 'border-white ring-2 ring-blue-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* --- PHYSICAL LOCATION --- */}
          {isOpen === 'location' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Physical Address / Street</label>
                <input 
                  type="text"
                  placeholder="e.g., Bole Road, Next to Mall"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.physical_address}
                  onBlur={(e) => onUpdate('physical_address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">City</label>
                  <input 
                    type="text"
                    placeholder="e.g., Addis Ababa"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue={settings.city}
                    onBlur={(e) => onUpdate('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Sub-City / Region</label>
                  <input 
                    type="text"
                    placeholder="e.g., Bole"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue={settings.region}
                    onBlur={(e) => onUpdate('region', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Country</label>
                <input 
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.country || 'Ethiopia'}
                  onBlur={(e) => onUpdate('country', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* --- MASTER CONTACT LIST --- */}
          {isOpen === 'contacts' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Primary Phone Number</label>
                <input 
                  type="tel"
                  placeholder="+2519..."
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.primary_phone}
                  onBlur={(e) => onUpdate('primary_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Secondary / Emergency Phone</label>
                <input 
                  type="tel"
                  placeholder="+25111..."
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.secondary_phone}
                  onBlur={(e) => onUpdate('secondary_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Official Email Address</label>
                <input 
                  type="email"
                  placeholder="info@hospital.com"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.official_email}
                  onBlur={(e) => onUpdate('official_email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Website URL</label>
                <input 
                  type="url"
                  placeholder="https://www.hospital.com"
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  defaultValue={settings.website_url}
                  onBlur={(e) => onUpdate('website_url', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* --- CALENDAR LOGIC --- */}
          {isOpen === 'calendar' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <Zap className="text-blue-600 mt-1" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Auto-detect Time</h4>
                  <p className="text-xs text-blue-700">The system currently matches: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-gray-700 block">Calendar Type</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'gregorian', label: 'Gregorian (International)', desc: 'Standard 12-month calendar' },
                    { id: 'ethiopian', label: 'Ethiopian (Local)', desc: '13-month calendar (Meskerem - Pagume)' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => onUpdate('calendar_type', type.id)}
                      className={`flex flex-col p-4 rounded-xl border-2 text-left transition-all ${settings.calendar_type === type.id ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200'}`}
                    >
                      <span className="font-bold text-gray-900">{type.label}</span>
                      <span className="text-xs text-gray-500">{type.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-bold">Auto-sync with Server</p>
                  <p className="text-xs text-gray-500">Prevent manual time tampering</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.auto_time !== 'false'}
                  onChange={(e) => onUpdate('auto_time', e.target.checked.toString())}
                  className="w-5 h-5 accent-blue-600"
                />
              </div>
            </div>
          )}

          {/* --- LANGUAGE --- */}
          {isOpen === 'language' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">Select the default interface language for all staff members.</p>
              {['English (US)', 'Amharic (አማርኛ)', 'Oromifa'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onUpdate('system_language', lang)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${settings.system_language === lang ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className={settings.system_language === lang ? 'text-blue-600' : 'text-gray-400'} />
                    <span className={`font-semibold ${settings.system_language === lang ? 'text-blue-900' : 'text-gray-700'}`}>{lang}</span>
                  </div>
                  {settings.system_language === lang && <Check size={18} className="text-blue-600" />}
                </button>
              ))}
            </div>
          )}

          {/* --- NEW: 2FA SECURITY CONFIGURATION --- */}
          {isOpen === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                <div>
                  <p className="text-sm font-bold text-gray-900">Enforce 2FA Security</p>
                  <p className="text-xs text-gray-500">Require security keys for all staff logins</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.two_factor_auth === 'On'}
                  onChange={(e) => onUpdate('two_factor_auth', e.target.checked ? 'On' : 'Off')}
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                />
              </div>

              {settings.two_factor_auth === 'On' && (
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-2 text-blue-700">
                    <ShieldCheck size={20} />
                    <h4 className="text-sm font-bold">Master Security Token</h4>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This is your unique 6-digit initialization master token stored globally in your system configurations.
                  </p>
                  
                  <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl">
                    <span className="text-2xl font-mono font-bold tracking-widest text-gray-800">
                      {settings.two_factor_code || '------'}
                    </span>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-2 rounded-lg transition-all"
                    >
                      <RefreshCw size={14} className={isSaving ? "animate-spin" : ""} />
                      Re-generate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50/50 flex gap-3">
          <button 
            disabled={isSaving}
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Save & Finish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};