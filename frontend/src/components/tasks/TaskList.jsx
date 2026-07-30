import React from 'react';
import TaskItem from './TaskItem';
import { ClipboardDocumentListIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const TaskList = ({ tasks, onRespondTask, onUpdateProgress }) => {
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
        <ClipboardDocumentListIcon style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.5 }} />
        No tasks assigned.
      </div>
    );
  }
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'declined');
  const completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'declined');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {pendingTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4 }}>
            <ClockIcon style={{ width: 14, height: 14 }} /> 
            Pending Tasks ({pendingTasks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onRespondTask={onRespondTask}
                onUpdateProgress={onUpdateProgress}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: 4 }}>
            <CheckCircleIcon style={{ width: 14, height: 14 }} /> 
            Completed Tasks ({completedTasks.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onRespondTask={onRespondTask}
                onUpdateProgress={onUpdateProgress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
