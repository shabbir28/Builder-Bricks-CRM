import React from 'react';
import { MapPinIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const VisitItem = ({ visit, onStatusChange }) => {
  const isCompleted = visit.status === 'completed';
  const isCancelled = visit.status === 'cancelled';
  
  const visitDate = new Date(visit.visitDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px',
      borderRadius: '10px', 
      background: isCompleted ? 'rgba(20,184,166,0.05)' : isCancelled ? 'rgba(244,63,94,0.05)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isCompleted ? 'rgba(20,184,166,0.2)' : isCancelled ? 'rgba(244,63,94,0.2)' : 'rgba(255,255,255,0.04)'}`,
      transition: 'all 0.2s',
      opacity: (isCompleted || isCancelled) ? 0.6 : 1
    }}
    onMouseEnter={e => !(isCompleted || isCancelled) && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
    onMouseLeave={e => !(isCompleted || isCancelled) && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
    >
      <div style={{ 
        width: 34, height: 34, borderRadius: '8px', 
        background: 'rgba(56,189,248,0.1)', 
        color: '#38bdf8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <MapPinIcon style={{ width: 16, height: 16 }} />
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontSize: 13, fontWeight: 700, color: (isCompleted || isCancelled) ? '#9ca3af' : '#fff',
          textDecoration: (isCompleted || isCancelled) ? 'line-through' : 'none',
          marginBottom: 2
        }}>
          {visit.lead?.name || 'Unknown Client'}
        </div>
        
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, textDecoration: (isCompleted || isCancelled) ? 'line-through' : 'none' }}>
          Property: {visit.property?.title || 'Unknown Property'}
        </div>
        
        <div style={{ fontSize: 11, fontWeight: 600, color: (isCompleted || isCancelled) ? '#6b7280' : '#a0aec0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <CalendarIcon style={{ width: 10, height: 10 }} />
          {visitDate} at {visit.visitTime}
        </div>
      </div>
      
      {visit.status === 'scheduled' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button 
            onClick={() => onStatusChange(visit.id, 'completed')}
            style={{
              width: 24, height: 24, borderRadius: '6px',
              background: 'rgba(20,184,166,0.1)', color: '#14b8a6', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            title="Mark Completed"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,184,166,0.1)' }}
          >
            <CheckCircleIcon style={{ width: 14, height: 14 }} />
          </button>
          
          <button 
            onClick={() => onStatusChange(visit.id, 'cancelled')}
            style={{
              width: 24, height: 24, borderRadius: '6px',
              background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            title="Cancel Visit"
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)' }}
          >
            <XCircleIcon style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}
    </div>
  );
};

export default VisitItem;
