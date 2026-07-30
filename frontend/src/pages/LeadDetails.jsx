import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeftIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Existing Components (Assume they exist or we map them out)
// We will focus primarily on building out the Communications pane here
import CommunicationTimeline from '../components/communications/CommunicationTimeline';
import AddCommunicationModal from '../components/modals/AddCommunicationModal';
import RecommendedProperties from '../components/property/RecommendedProperties';
import LeadProgressTimeline from '../components/pipeline/LeadProgressTimeline';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'activities', label: 'Progress Log' },
  { id: 'communications', label: 'Communications' },
  { id: 'deals', label: 'Deals' }
];

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('communications'); // Defaulting to comms to show the feature
  
  // Modal State
  const [isCommModalOpen, setIsCommModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/leads/${id}`);
      if (res.data.success) {
        setLead(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load lead details');
      navigate('/leads'); // Back out on fail
    } finally {
      setLoading(false);
    }
  };

  if (loading || !lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-accent animate-spin" />
        <span className="text-xs text-ink-tertiary uppercase tracking-widest font-semibold">Loading lead…</span>
      </div>
    );
  }

  // To display agent name when logging, we will grab the current assigned agent or use a generic name
  const currentAgentName = lead.agent ? lead.agent.name : 'Unassigned Route';

  return (
    <div className="space-y-6 pb-16">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => navigate('/leads')}
          className="p-2 rounded-xl hover:bg-surface-raised transition-colors border border-transparent hover:border-surface-border"
        >
          <ArrowLeftIcon className="w-5 h-5 text-ink-secondary" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-3 w-1 rounded-full bg-accent" />
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.4em]">
              Lead Control
            </span>
          </div>
          <h1 className="text-3xl font-black text-ink-primary tracking-tight">
            {lead.name}
          </h1>
        </div>
      </div>

      {/* ── Quick Info Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Contact info block */}
        <div className="panel p-5 flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <h3 className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Contact Details</h3>
          
          <div className="flex items-center gap-3 text-sm text-ink-secondary z-10">
            <EnvelopeIcon className="w-4 h-4 text-ink-quarter" />
            {lead.email || 'No email provided'}
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-secondary z-10">
            <PhoneIcon className="w-4 h-4 text-ink-quarter" />
            {lead.phone || 'No phone provided'}
          </div>
          <div className="flex items-center gap-3 text-sm text-ink-secondary z-10">
            <GlobeAltIcon className="w-4 h-4 text-ink-quarter" />
            {lead.source ? lead.source.charAt(0).toUpperCase() + lead.source.slice(1) : 'Unknown Source'}
          </div>
        </div>

        {/* Status block */}
        <div className="panel p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div>
            <h3 className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-2">Current Status</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              {lead.status.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-3">
             <h3 className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-1">Assigned To</h3>
             <span className="text-sm font-semibold text-ink-secondary">
               {lead.agent ? lead.agent.name : 'Unassigned'}
             </span>
          </div>
        </div>
        
        {/* Requirement block */}
        <div className="panel p-5 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
           <div>
            <h3 className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-2">Property Request</h3>
            <div className="text-lg font-black text-ink-primary capitalize">{lead.preferredPropertyType || 'Any'} property</div>
            <div className="text-sm text-ink-secondary">{lead.preferredLocation || 'Location open'}</div>
          </div>
          <div className="mt-2 text-sm font-bold text-amber-500 bg-amber-500/10 self-start px-2 py-1 rounded-lg border border-amber-500/20">
            Budget: {lead.budget ? `${lead.budget}` : 'TBD'}
          </div>
        </div>
      </div>

      {/* ── Smart Recommendations ── */}
      <RecommendedProperties leadId={lead.id} />

      {/* ── Tabs Navigation ── */}
      <div className="flex items-center gap-1 border-b border-surface-border pb-px overflow-x-auto">
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3 text-sm font-bold transition-all relative whitespace-nowrap"
              style={{
                color: active ? '#f0f2f5' : '#8b8fa8',
              }}
            >
              {tab.label}
              {active && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent rounded-t-full shadow-[0_-2px_8px_rgba(99,102,241,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="py-2">
        {activeTab === 'communications' && (
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-ink-primary">Client Communication Center</h2>
                <p className="text-sm text-ink-tertiary mt-1">Timeline of all recorded interactions with {lead.name}</p>
              </div>
              <button
                onClick={() => setIsCommModalOpen(true)}
                className="btn flex items-center gap-2"
                style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700 }}
              >
                <PlusIcon className="w-4 h-4" /> Log Interaction
              </button>
            </div>
            
            <CommunicationTimeline 
              leadId={lead.id} 
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="panel p-6 text-center text-ink-tertiary text-sm py-16 border-dashed border-2">
            Overview metrics integration goes here.
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="panel p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-ink-primary">Progress History</h2>
                <p className="text-sm text-ink-tertiary mt-1">Status changes and agent remarks over time.</p>
              </div>
            </div>
            <LeadProgressTimeline progressLog={lead.progressLog} />
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="panel p-6 text-center text-ink-tertiary text-sm py-16 border-dashed border-2">
            Pipelined deals associated with this lead map here.
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <AddCommunicationModal
        isOpen={isCommModalOpen}
        onClose={() => setIsCommModalOpen(false)}
        leadId={lead.id}
        agentName={currentAgentName}
        onCommunicationAdded={() => {
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </div>
  );
};

export default LeadDetails;
