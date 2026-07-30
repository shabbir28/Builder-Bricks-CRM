import React from 'react';
import { ClipboardDocumentListIcon, XMarkIcon, CalendarIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import ModalWrapper from '../modals/ModalWrapper';

const getStatusColor = (s) => {
  switch(s) {
    case 'completed': return '#10b981';
    case 'delayed': return '#f59e0b';
    case 'declined': return '#f43f5e';
    case 'pending':
    default: return '#8b5cf6';
  }
};

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  if (!task) return null;

  const statusColor = getStatusColor(task.status);
  const due = new Date(task.dueDate);
  const dateStr = due.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      subtitle={task.assignmentStatus === 'assigned' ? 'Assigned Task' : 'General Task'}
      icon={<ClipboardDocumentListIcon className="w-4 h-4" />}
      iconBg="rgba(139,92,246,0.15)"
      iconColor="#8b5cf6"
      maxWidth="max-w-md"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
        
        {/* Title & Status */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>{task.title}</h3>
            <span style={{ 
              fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
              padding: '4px 10px', borderRadius: '100px', background: `${statusColor}15`, color: statusColor,
              border: `1px solid ${statusColor}30`, flexShrink: 0
            }}>
              {task.status}
            </span>
          </div>
          {task.description && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '8px', lineHeight: 1.5 }}>
              {task.description}
            </p>
          )}
        </div>

        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <CalendarIcon style={{ width: 14, height: 14 }} /> Due Date
            </div>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700 }}>{dateStr}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{timeStr}</div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <ClipboardDocumentListIcon style={{ width: 14, height: 14 }} /> Task Type
            </div>
            <div style={{ fontSize: '13px', color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>{task.type}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <UserIcon style={{ width: 14, height: 14 }} /> Assigned To
            </div>
            <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 700 }}>
              {task.agentId?.name || 'Self'}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <PhoneIcon style={{ width: 14, height: 14 }} /> Related Lead
            </div>
            <div style={{ fontSize: '13px', color: task.leadId?.name ? '#fff' : 'rgba(255,255,255,0.3)', fontWeight: 700 }}>
              {task.leadId?.name || 'None'}
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        {task.remarks && (
          <div style={{ 
            background: `${statusColor}0a`, padding: '16px', borderRadius: '12px', 
            border: `1px solid ${statusColor}20`,
            marginTop: '4px'
          }}>
            <div style={{ fontSize: '11px', color: statusColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Agent Remarks
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic', lineHeight: 1.5 }}>
              "{task.remarks}"
            </div>
          </div>
        )}

      </div>

      {/* Button instead of ModalFooter since it's view only */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={onClose}
          style={{
            padding: '10px 20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
            color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          Close
        </button>
      </div>

    </ModalWrapper>
  );
};

export default TaskDetailsModal;
