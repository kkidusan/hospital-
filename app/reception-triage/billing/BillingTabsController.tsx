"use client";

import { useState } from 'react';
import ServiceClient from './ServiceClient';

export default function BillingTabsController({ 
  invoiceTab, 
  historyTab 
}: { 
  invoiceTab: React.ReactNode;
  historyTab: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'INVOICE' | 'SERVICE' | 'HISTORY'>('INVOICE');

  return (
    <div key="tabs-main-wrapper">
      <div style={tabContainer}>
        <button 
          key="btn-invoice"
          onClick={() => setActiveTab('INVOICE')} 
          style={activeTab === 'INVOICE' ? activeTabBtn : tabBtn}
        >
          Invoice Billing
        </button>
        <button 
          key="btn-service"
          onClick={() => setActiveTab('SERVICE')} 
          style={activeTab === 'SERVICE' ? activeTabBtn : tabBtn}
        >
          Service Billing
        </button>
        <button 
          key="btn-history"
          onClick={() => setActiveTab('HISTORY')} 
          style={activeTab === 'HISTORY' ? activeTabBtn : tabBtn}
        >
          Payment History
        </button>
      </div>

      <div style={{ marginTop: '16px' }}>
        {/* Wrapped in divs with keys to force React to differentiate the children */}
        {activeTab === 'INVOICE' && (
          <div key="active-invoice-tab">{invoiceTab}</div>
        )}
        
        {activeTab === 'SERVICE' && (
          <div key="active-service-tab">
            <ServiceClient />
          </div>
        )}
        
        {activeTab === 'HISTORY' && (
          <div key="active-history-tab">{historyTab}</div>
        )}
      </div>
    </div>
  );
}

const tabContainer = { display: 'flex', gap: '8px', marginBottom: '4px', borderBottom: '1px solid #e2e8f0' };
const tabBtn = { 
  padding: '10px 16px', 
  fontSize: '0.85rem', 
  fontWeight: 700, 
  cursor: 'pointer', 
  background: 'transparent', 
  border: 'none', 
  color: '#64748b', 
  borderBottom: '2px solid transparent',
  transition: 'all 0.2s'
};
const activeTabBtn = { ...tabBtn, color: '#2563eb', borderBottom: '2px solid #2563eb' };