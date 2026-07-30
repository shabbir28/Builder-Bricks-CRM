import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon,
  UserGroupIcon,
  HomeModernIcon,
  DocumentTextIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';

const TYPE_CONFIG = {
  call: { icon: PhoneIcon, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  message: { icon: ChatBubbleBottomCenterTextIcon, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  meeting: { icon: UserGroupIcon, color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  property_shared: { icon: HomeModernIcon, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  note: { icon: DocumentTextIcon, color: '#64748b', bg: 'rgba(100,116,139,0.15)' }
};

const CommunicationTimeline = ({ leadId, refreshTrigger }) => {
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!leadId) return;
    const fetchComms = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/communications/${leadId}`);
        if (res.data.success) {
          setCommunications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load communications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComms();
  }, [leadId, refreshTrigger]);

  if (loading) {
    return <div className="p-8 text-center text-ink-tertiary text-sm animate-pulse">Loading timeline...</div>;
  }

  if (communications.length === 0) {
    return (
      <div className="p-10 text-center border border-dashed border-surface-border rounded-2xl bg-surface-base">
        <DocumentTextIcon className="w-8 h-8 mx-auto text-ink-tertiary mb-3 opacity-50" />
        <p className="text-sm font-semibold text-ink-secondary">No recorded interactions yet</p>
        <p className="text-xs text-ink-tertiary mt-1">Log a call, meeting, or note to start the timeline.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-surface-border ml-6 space-y-8 py-4">
      {communications.map((comm) => {
        const conf = TYPE_CONFIG[comm.type] || TYPE_CONFIG.note;
        const Icon = conf.icon;
        
        return (
          <div key={comm.id} className="relative pl-8">
            {/* Timeline dot */}
            <div 
              className="absolute -left-4 top-1 w-8 h-8 rounded-full flex items-center justify-center border border-surface-base ring-4 ring-surface-bg z-10"
              style={{ background: conf.bg, color: conf.color }}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content card */}
            <div className="bg-surface-raised border border-surface-border rounded-2xl p-4 shadow-sm group hover:border-surface-border/80 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink-primary capitalize">
                    {comm.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-medium text-ink-tertiary bg-surface-base px-2 py-0.5 rounded-full border border-surface-border">
                    {comm.agentName}
                  </span>
                </div>
                <time className="text-[11px] font-semibold text-ink-quarter">
                  {new Date(comm.createdAt).toLocaleString('en-US', { 
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                  })}
                </time>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed whitespace-pre-wrap">
                {comm.description}
              </p>
              
              {comm.attachedFile && comm.attachedFile.url && (
                <div className="mt-4 pt-3 border-t border-surface-border">
                  <a
                    href={`http://localhost:5000${comm.attachedFile.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold
                      bg-surface-base text-ink-secondary hover:text-indigo-400 hover:bg-indigo-500/10 
                      border border-surface-border hover:border-indigo-500/30 transition-all group-hover:border-surface-border"
                  >
                    <PaperClipIcon className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{comm.attachedFile.originalName || 'View Attachment'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CommunicationTimeline;
