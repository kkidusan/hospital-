'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Conversion failed');
      }

      setResult(data);

      // Auto download
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'icd11_full.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          ICD-11 Excel to JSON Converter
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Upload the ICD-11 SimpleTabulation Excel file and download clean JSON
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                📊
              </div>
              <p className="text-lg font-medium text-gray-700">
                {file ? file.name : 'Click to upload Excel file'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                SimpleTabulation-ICD-11-MMS-en.xlsx
              </p>
            </label>
          </div>

          <button
            onClick={handleConvert}
            disabled={!file || loading}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl transition text-lg"
          >
            {loading ? 'Converting... Please wait' : 'Convert & Download JSON'}
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-center font-medium">{error}</p>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-medium">
                ✅ Successfully converted <strong>{result.count}</strong> ICD-11 codes!
              </p>
              <p className="text-sm text-green-600 mt-1">
                JSON file has been downloaded automatically.
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          Built for ICD-11 MMS • Supports large files
        </p>
      </div>
    </div>
  );
}