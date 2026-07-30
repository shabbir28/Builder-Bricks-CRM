import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div style={{ position: 'relative' }}>
      <button
        className="btn-icon notif-bell-btn"
        onClick={() => setOpen(v => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <BellIcon className="w-4 h-4" />

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="notif-badge">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
