import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';

/* Relative time helper */
function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const NotificationItem = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotifications();
  const { id, type, title, message, timestamp, read, config } = notification;

  const handleClick = () => {
    if (!read) markAsRead(id);
  };

  return (
    <div
      onClick={handleClick}
      className="notif-item"
      style={{ '--notif-color': config.color, '--notif-bg': config.bg, '--notif-border': config.border }}
    >
      {/* Unread indicator */}
      {!read && <span className="notif-unread-dot" />}

      {/* Emoji icon badge */}
      <div className="notif-icon">
        <span style={{ fontSize: 18 }}>{config.emoji}</span>
      </div>

      {/* Content */}
      <div className="notif-content">
        <p className="notif-title">{title}</p>
        <p className="notif-message">{message}</p>
        <span className="notif-time">{timeAgo(timestamp)}</span>
      </div>

      {/* Dismiss button */}
      <button
        className="notif-dismiss"
        onClick={e => { e.stopPropagation(); removeNotification(id); }}
        aria-label="Dismiss"
      >
        <XMarkIcon style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
};

export default NotificationItem;
