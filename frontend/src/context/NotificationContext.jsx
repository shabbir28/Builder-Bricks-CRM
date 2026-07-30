import React, { createContext, useContext, useState, useCallback } from 'react';

/* ─── Notification Types & their config ─────────────────── */
export const NOTIFICATION_TYPES = {
  LEAD_ADDED:         'LEAD_ADDED',
  PROPERTY_ADDED:     'PROPERTY_ADDED',
  DEAL_CREATED:       'DEAL_CREATED',
  VISIT_SCHEDULED:    'VISIT_SCHEDULED',
  FOLLOWUP_REMINDER:  'FOLLOWUP_REMINDER',
  DEAL_CLOSING_SOON:  'DEAL_CLOSING_SOON',
};

const TYPE_CONFIG = {
  LEAD_ADDED:        { color: '#7986cb', bg: 'rgba(92,107,192,0.12)',  border: 'rgba(92,107,192,0.25)',  emoji: '👤' },
  PROPERTY_ADDED:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', emoji: '🏢' },
  DEAL_CREATED:      { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', emoji: '💼' },
  VISIT_SCHEDULED:   { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.25)', emoji: '📅' },
  FOLLOWUP_REMINDER: { color: '#a78bfa', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', emoji: '🔔' },
  DEAL_CLOSING_SOON: { color: '#f87171', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)',  emoji: '🚨' },
};

/* ─── Helper ─────────────────────────────────────────────── */
let _idCounter = 0;
export function createNotification(type, title, message) {
  _idCounter += 1;
  return {
    id: `notif_${Date.now()}_${_idCounter}`,
    type,
    title,
    message,
    timestamp: new Date(),
    read: false,
    config: TYPE_CONFIG[type] ?? TYPE_CONFIG.LEAD_ADDED,
  };
}

/* ─── Context ────────────────────────────────────────────── */
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /** Push a new notification */
  const addNotification = useCallback((type, title, message) => {
    const notif = createNotification(type, title, message);
    setNotifications(prev => [notif, ...prev]);
  }, []);

  /** Mark a single notification as read */
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  /** Mark all notifications as read */
  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  /** Remove a single notification */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /** Clear all notifications */
  const clearAll = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
