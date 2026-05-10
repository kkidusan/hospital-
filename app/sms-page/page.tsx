"use client";

import { useState } from 'react';

export default function SmsPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({ type: 'success', msg: 'መልዕክቱ በስኬት ተልኳል!' });
        setPhoneNumber('');
      } else {
        setStatus({ type: 'error', msg: data.error || 'ስህተት አጋጥሟል' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'ከሰርቨር ጋር መገናኘት አልተቻለም' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-[2rem] p-10 border border-gray-100">
        <h2 className="text-3xl font-black text-center mb-8 text-gray-900 tracking-tight">
          Afro<span className="text-blue-600">SMS</span>
        </h2>
        
        <form onSubmit={handleSend} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-400 font-bold border-r pr-3">+251</span>
            </div>
            <input
              type="text"
              required
              placeholder="975052194"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              className="block w-full pl-20 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl leading-5 focus:bg-white focus:ring-0 focus:border-blue-500 transition-all text-lg font-mono text-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-lg font-bold text-white transition-all transform active:scale-95 ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            {loading ? 'በመላክ ላይ...' : 'መልዕክት ላክ'}
          </button>
        </form>

        {status && (
          <div className={`mt-8 p-4 rounded-2xl text-center text-sm font-bold border-2 animate-in fade-in zoom-in duration-300 ${
            status.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {status.msg}
          </div>
        )}
      </div>
    </div>
  );
}