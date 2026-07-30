import React from 'react';

const PipelineStage = ({ stage, count, maxCount, color }) => {
  const percentage = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  
  return (
    <div style={{
      flex: 1, minWidth: 120, padding: '16px',
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid rgba(255,255,255,0.04)`,
      borderRadius: '12px', position: 'relative', overflow: 'hidden',
      transition: 'all 0.2s'
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = `${color}40`; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stage}</span>
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{percentage}%</div>
      </div>
      
      <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 16 }}>
        {count}
      </div>
      
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ 
          width: `${percentage}%`, height: '100%', borderRadius: 99, 
          background: `linear-gradient(90deg, ${color}dd 0%, ${color} 100%)`, 
          boxShadow: `0 0 10px ${color}50`
        }} />
      </div>
    </div>
  );
};

export default PipelineStage;
