'use client'

import { useState, useEffect } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import toast, { Toaster } from 'react-hot-toast'

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const containerStyle = { width: '100%', backgroundColor: 'transparent' };
const labelStyle = { display: 'block', marginBottom: '3px', fontWeight: '800', fontSize: '10px', textTransform: 'uppercase' as const, color: '#475569' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' };
const radioContainerStyle = { display: 'flex', alignItems: 'center', gap: '8px' };
const radioInputStyle = { width: '18px', height: '18px' };
const radioTextStyle = { fontSize: '14px', fontWeight: '600', color: '#1e293b' };
const cancelBtnStyle = { flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '700' };

function getSubmitStyle(loading: boolean): any {
  return {
    flex: 2, padding: '12px', background: loading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700'
  };
}

export default function RegisterPatient({ onClose, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    ageUnit: 'years',
    sex: 'M',
    phone: '+251',
    address: '',
    region: 'Amhara',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || '',
        age: initialData.age?.toString() || '',
        ageUnit: initialData.ageUnit || 'years',
        sex: initialData.sex === 'F' || initialData.sex === 'Female' ? 'F' : 'M',
        phone: initialData.phoneNumber || '+251',
        address: initialData.address || '',
        region: initialData.region || 'Amhara',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = initialData 
        ? `/api/reception/update-patient/${initialData.id}` 
        : '/api/reception/register-patient';
      
      const res = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      toast.success(initialData?.mrn?.startsWith('TEP_') ? "Official ID Assigned!" : "Success!");
      setTimeout(() => onSuccess(), 800);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <Toaster position="top-right" />
      
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
          {initialData?.mrn?.startsWith('TEP_') ? 'Verify Permanent Registry' : initialData ? 'Update Patient Info' : 'Patient Registration'}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>
          {initialData ? `Current MRN: ${initialData.mrn}` : 'New Patient Entry'}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Full Name *</label>
          <input required name="fullName" value={formData.fullName} onChange={handleChange} style={inputStyle} placeholder="Legal Name" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Age *</label>
            <input required name="age" type="number" value={formData.age} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Age Unit</label>
            <select name="ageUnit" style={inputStyle} value={formData.ageUnit} onChange={handleChange}>
              <option value="years">Years</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Sex *</label>
          <div style={{ display: 'flex', gap: '30px', marginTop: '4px' }}>
            <label style={radioContainerStyle}>
              <input type="radio" name="sex" value="M" checked={formData.sex === 'M'} onChange={handleChange} style={radioInputStyle} /> 
              <span style={radioTextStyle}>Male</span>
            </label>
            <label style={radioContainerStyle}>
              <input type="radio" name="sex" value="F" checked={formData.sex === 'F'} onChange={handleChange} style={radioInputStyle} /> 
              <span style={radioTextStyle}>Female</span>
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Phone</label>
          <PhoneInput
            international 
            defaultCountry="ET"
            value={formData.phone}
            onChange={(val) => setFormData({ ...formData, phone: val || '+251' })}
            className="custom-phone-input"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input name="address" value={formData.address} onChange={handleChange} style={inputStyle} placeholder="Address" />
          <input name="region" value={formData.region} onChange={handleChange} style={inputStyle} placeholder="Region" />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={onClose} style={cancelBtnStyle}>Cancel</button>
          <button type="submit" disabled={loading} style={getSubmitStyle(loading)}>
            {loading ? 'Processing...' : initialData?.mrn?.startsWith('TEP_') ? 'Assign Permanent ID' : 'Save Patient'}
          </button>
        </div>
      </form>

      <style jsx global>{`
        .custom-phone-input { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; background: #fff; }
        .custom-phone-input input { border: none !important; outline: none !important; font-size: 14px; width: 100%; margin-left: 10px; }
      `}</style>
    </div>
  )
}