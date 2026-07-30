import React from 'react';
import PipelineStage from './PipelineStage';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const STAGE_COLORS = {
  'New': '#22d3ee',         // cyan
  'Contacted': '#6366f1',   // indigo
  'Visit': '#8b5cf6',       // purple
  'Negotiation': '#f59e0b', // gold
  'Closed': '#34d399',      // green
  'Lost': '#f87171',        // red
};

const LeadPipeline = ({ data }) => {
  if (!data || data.length === 0) return null;

  // We use the "New" leads count as the 100% baseline for conversion
  const maxCount = data[0]?.value || 1;

  return (
    <div style={{ padding: '24px', background: 'rgba(18, 18, 20, 0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 4px 24px -4px rgba(0,0,0,0.4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>Lead Conversion Pipeline</h2>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>Track your active leads through the sales funnel stages</p>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChartBarIcon style={{ width: 20, height: 20 }} />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {data.map((item) => (
          <PipelineStage 
            key={item.name} 
            stage={item.name} 
            count={item.value} 
            maxCount={maxCount}
            color={STAGE_COLORS[item.name] || '#9ca3af'} 
          />
        ))}
      </div>
    </div>
  );
};

export default LeadPipeline;
