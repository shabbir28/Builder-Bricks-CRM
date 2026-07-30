import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const STATUS_CFG = {
  new:         { color: '#60a5fa' },
  contacted:   { color: '#34d399' },
  visit:       { color: '#a78bfa' },
  negotiation: { color: '#fbbf24' },
  closed:      { color: '#14b8a6' },
  lost:        { color: '#f43f5e' },
};

const LeadProgressTimeline = ({ progressLog = [] }) => {
  if (!progressLog || progressLog.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-surface-border rounded-2xl bg-surface-raised/30">
        <div className="h-12 w-12 rounded-full bg-surface-raised flex items-center justify-center mb-4">
          <CheckCircleIcon className="w-6 h-6 text-ink-tertiary opacity-50" />
        </div>
        <h3 className="text-sm font-bold text-ink-primary mb-1">No Progress Logged</h3>
        <p className="text-xs text-ink-tertiary text-center max-w-sm">
          Status updates and notes recorded by agents will appear here chronologically.
        </p>
      </div>
    );
  }

  // Sort descending
  const sortedLogs = [...progressLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="relative pl-6 space-y-8 before:absolute before:inset-0 before:ml-[1.45rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-border before:to-transparent">
      {sortedLogs.map((log, index) => {
        const date = new Date(log.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        
        const c = STATUS_CFG[log.status] || STATUS_CFG.new;

        return (
          <div key={log.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#0e1015] bg-[#0e1015] absolute left-0 md:left-1/2 -translate-x-1/2 z-10" style={{ boxShadow: `0 0 0 1px ${c.color}40` }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
            </div>
            
            {/* Card Content */}
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] panel p-5 transition-transform hover:-translate-y-1 hover:shadow-xl relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ background: `${c.color}20`, color: c.color }}>
                  {log.status}
                </span>
                <span className="text-xs font-semibold text-ink-tertiary">
                  {dateStr} <span className="text-ink-quarter">at</span> {timeStr}
                </span>
              </div>
              
              <p className="text-sm font-medium text-ink-secondary mb-3 leading-relaxed">
                {log.notes || 'Status updated.'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadProgressTimeline;
