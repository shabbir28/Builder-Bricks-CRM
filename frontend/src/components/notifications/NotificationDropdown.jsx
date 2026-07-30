import React, { useEffect, useRef } from 'react';
import { CheckIcon, TrashIcon, BellSlashIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onClose }) => {
  const { notifications, unreadCount, markAllRead, clearAll } = useNotifications();
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref} className="notif-dropdown">
      {/* Header */}
      <div className="notif-dropdown-header">
        <div>
          <p className="notif-dropdown-title">Notifications</p>
          {unreadCount > 0 && (
            <span className="notif-dropdown-badge">{unreadCount} unread</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {unreadCount > 0 && (
            <button className="notif-action-btn" onClick={markAllRead} title="Mark all read">
              <CheckIcon style={{ width: 13, height: 13 }} />
              <span>All read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button className="notif-action-btn notif-action-danger" onClick={clearAll} title="Clear all">
              <TrashIcon style={{ width: 13, height: 13 }} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <BellSlashIcon style={{ width: 32, height: 32, opacity: 0.3, marginBottom: 10 }} />
            <p>You're all caught up</p>
            <p style={{ fontSize: 11, marginTop: 4, opacity: 0.5 }}>
              Notifications appear as you perform actions
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="notif-dropdown-footer">
          <span>{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
