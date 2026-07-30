import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from './NotificationContext';

const FollowUpContext = createContext(null);

export const FollowUpProvider = ({ children }) => {
  const [followUps, setFollowUps] = useState([]);
  const { addNotification } = useNotifications();

  // Create a new follow up automatically 24 hours from now
  const createFollowUp = useCallback((lead) => {
    const followUpDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const newFollowUp = {
      id: `fu_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      leadId: lead.id || lead.id, // Support MongoDB _id or local id
      leadName: lead.name,
      followUpDate: followUpDate.toISOString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setFollowUps(prev => [...prev, newFollowUp]);
  }, []);

  // Complete a follow up
  const completeFollowUp = useCallback((id) => {
    setFollowUps(prev => prev.map(fu => fu.id === id ? { ...fu, status: 'completed' } : fu));
  }, []);

  // Get follow ups that are pending or due today
  const getTodayFollowUps = useCallback(() => {
    const today = new Date();
    return followUps.filter(fu => {
      if (fu.status === 'completed') return false;
      const fuDate = new Date(fu.followUpDate);
      return fuDate.toDateString() === today.toDateString() || fuDate <= today;
    });
  }, [followUps]);

  // Auto Check System - Every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setFollowUps(prev => {
        let hasChanges = false;
        const updated = prev.map(fu => {
          if (fu.status === 'pending') {
            const fuDate = new Date(fu.followUpDate);
            if (fuDate <= now) {
              hasChanges = true;
              addNotification(
                NOTIFICATION_TYPES.FOLLOWUP_REMINDER,
                'Follow-up Due',
                `Follow-up reminder for Lead: ${fu.leadName}`
              );
              return { ...fu, status: 'due' };
            }
          }
          return fu;
        });
        return hasChanges ? updated : prev;
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [addNotification]);

  return (
    <FollowUpContext.Provider value={{ followUps, createFollowUp, completeFollowUp, getTodayFollowUps }}>
      {children}
    </FollowUpContext.Provider>
  );
};

export const useFollowUp = () => {
  const context = useContext(FollowUpContext);
  if (!context) {
    throw new Error('useFollowUp must be used within a FollowUpProvider');
  }
  return context;
};
