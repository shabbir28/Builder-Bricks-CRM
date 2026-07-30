import React, { useState } from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  BanknotesIcon, 
  MapIcon 
} from '@heroicons/react/24/outline';
import DocumentsTab from '../documents/DocumentsTab';

const DealDetails = ({ deal, onClose }) => {
  const [activeTab, setActiveTab] = useState('documents');

  const tabs = [
    { id: 'overview',   label: 'Overview',   icon: MapIcon },
    { id: 'activities', label: 'Activities', icon: ChatBubbleLeftRightIcon },
    { id: 'documents',  label: 'Documents',  icon: DocumentTextIcon },
    { id: 'payments',   label: 'Payments',   icon: BanknotesIcon },
  ];

  if (!deal) return null;

  return (
    <div className="fixed top-0 bottom-0 right-0 left-0 lg:left-[224px] bg-surface-bg z-[60] flex flex-col animate-slide-up shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-builders-border bg-builders-surface backdrop-blur-md">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 rounded-2xl bg-builders-blue/10 border border-builders-blue/20 flex items-center justify-center shadow-inner">
              <span className="text-2xl font-black text-builders-blue">{deal.title?.charAt(0) || 'D'}</span>
           </div>
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter">{deal.title}</h2>
              <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-builders-text-muted">
                 <span className="text-emerald-400">Rs. {(deal.dealValue / 1000000).toFixed(1)}M</span>
                 <span>•</span>
                 <span>{deal.pipelineStage}</span>
                 <span>•</span>
                 <span>Counterparty: {deal.lead?.name || 'Unassigned'}</span>
              </div>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-builders-card border border-builders-border rounded-xl text-builders-text-secondary hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 transition-all shadow-xl"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex px-6 pt-4 border-b border-builders-border bg-builders-surface overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap
                ${isActive 
                  ? 'border-builders-blue text-builders-blue' 
                  : 'border-transparent text-builders-text-secondary hover:text-white hover:border-builders-border'}`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-builders-bg custom-scrollbar">
         {activeTab === 'overview' && (
           <div className="card h-64 flex items-center justify-center">
             <p className="text-builders-text-muted font-black uppercase text-[10px] tracking-widest">Overview Panel (Coming Soon)</p>
           </div>
         )}
         {activeTab === 'activities' && (
           <div className="card h-64 flex items-center justify-center">
             <p className="text-builders-text-muted font-black uppercase text-[10px] tracking-widest">Activities Panel (Coming Soon)</p>
           </div>
         )}
         {activeTab === 'documents' && (
           <DocumentsTab dealId={deal.id} />
         )}
         {activeTab === 'payments' && (
           <div className="card h-64 flex items-center justify-center">
             <p className="text-builders-text-muted font-black uppercase text-[10px] tracking-widest">Payments Panel (Coming Soon)</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default DealDetails;
