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
      <style dangerouslySetInnerHTML={{ __html: `
        /* Default Desktop Styles (Preserving your original design) */
        .tabs-container { 
          display: flex; 
          gap: 8px; 
          margin-bottom: 4px; 
          border-bottom: 1px solid #e2e8f0; 
        }
        
        .tab-btn { 
          padding: 10px 16px; 
          font-size: 0.85rem; 
          font-weight: 700; 
          cursor: pointer; 
          background: transparent; 
          border: none; 
          color: #64748b; 
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-btn-active { 
          color: #2563eb; 
          border-bottom: 2px solid #2563eb; 
        }

        /* Mobile Specific Overrides */
        @media (max-width: 768px) {
          .tabs-container {
            gap: 0px; /* Tighten gap for small screens */
          }
          
          .tab-btn {
            flex: 1;
            padding: 10px 4px;
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            text-align: center;
            display: inline-block;
          }
        }
      `}} />

      <div className="tabs-container">
        <button 
          key="btn-invoice"
          onClick={() => setActiveTab('INVOICE')} 
          className={`tab-btn ${activeTab === 'INVOICE' ? 'tab-btn-active' : ''}`}
        >
          Invoice Billing
        </button>
        <button 
          key="btn-service"
          onClick={() => setActiveTab('SERVICE')} 
          className={`tab-btn ${activeTab === 'SERVICE' ? 'tab-btn-active' : ''}`}
        >
          Service Billing
        </button>
        <button 
          key="btn-history"
          onClick={() => setActiveTab('HISTORY')} 
          className={`tab-btn ${activeTab === 'HISTORY' ? 'tab-btn-active' : ''}`}
        >
          Payment History
        </button>
      </div>

      <div style={{ marginTop: '16px' }}>
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