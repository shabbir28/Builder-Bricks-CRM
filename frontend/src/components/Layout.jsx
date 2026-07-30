import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  HomeIcon, UserGroupIcon, BuildingOfficeIcon,
  CurrencyDollarIcon, ClipboardDocumentListIcon,
  ChartBarIcon, UserCircleIcon,
  MagnifyingGlassIcon, Bars3Icon, XMarkIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  CreditCardIcon,
  ClockIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './notifications/NotificationBell';
import axios from 'axios';

/* ── Role badge config ── */
const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
  admin:       { label: 'Admin',       color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: '#3b82f6' },
  executive:   { label: 'Executive',   color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
};

/* ── Nav Config ── */
const NAV_ADMIN = [
  {
    section: 'OVERVIEW',
    items: [
      { label: 'Dashboard',    to: '/dashboard',    Icon: HomeIcon,                  color: '#3b82f6' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Leads',        to: '/leads',         Icon: UserGroupIcon,              color: '#8b5cf6' },
      { label: 'Properties',   to: '/properties',    Icon: BuildingOfficeIcon,         color: '#10b981' },
      { label: 'Clients',      to: '/clients',       Icon: UserGroupIcon,              color: '#34d399' },
      { label: 'Deals',        to: '/deals',         Icon: CurrencyDollarIcon,         color: '#f59e0b' },
      { label: 'Payment Plans',to: '/payment-plans', Icon: CreditCardIcon,             color: '#3b82f6' },
      { label: 'Receipts',     to: '/receipts',      Icon: ClipboardDocumentListIcon,  color: '#34d399' },
      { label: 'Agents',       to: '/agents',        Icon: PresentationChartLineIcon,  color: '#ec4899' },
    ],
  },
  {
    section: 'APPROVALS',
    items: [
      { label: 'Installment Requests', to: '/installment-requests', Icon: ClockIcon, color: '#f97316', badge: true },
    ],
  },
  {
    section: 'REPORTS',
    items: [
      { label: 'Activities',   to: '/activities',    Icon: ClipboardDocumentListIcon,  color: '#06b6d4' },
    ],
  },
];

const NAV_EXECUTIVE = [
  {
    section: 'MAIN',
    items: [
      { label: 'Dashboard',    to: '/dashboard',    Icon: HomeIcon,                   color: '#3b82f6' },
      { label: 'Leads',        to: '/leads',         Icon: UserGroupIcon,               color: '#8b5cf6' },
      { label: 'Clients',      to: '/clients',       Icon: UserGroupIcon,               color: '#34d399' },
      { label: 'Properties',   to: '/properties',    Icon: BuildingOfficeIcon,          color: '#10b981' },
      { label: 'Deals',        to: '/deals',         Icon: CurrencyDollarIcon,          color: '#f59e0b' },
      { label: 'Receipts',     to: '/receipts',      Icon: ClipboardDocumentListIcon,   color: '#34d399' },
    ],
  },
  {
    section: 'MY ACTIVITY',
    items: [
      { label: 'Performance',  to: '/performance',   Icon: ChartBarIcon,                color: '#10b981' },
      { label: 'Profile',      to: '/profile',       Icon: UserCircleIcon,              color: '#f59e0b' },
    ],
  },
];

const initials = (name = '') =>
  name.split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase() || 'U';

/* ════════════════════════════════════
   SIDEBAR
════════════════════════════════════ */
const Sidebar = ({ open, onClose, user, isAdminLevel, location, onLogout, pendingCount }) => {
  const groups = isAdminLevel ? NAV_ADMIN : NAV_EXECUTIVE;
  const ini = initials(user?.name);
  const roleCfg = ROLE_CONFIG[user?.role] || { label: user?.role, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', dot: '#9ca3af' };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        style={{
          position: 'fixed', left: 0, top: 0,
          height: '100vh', width: 264,
          background: 'linear-gradient(180deg, #080d16 0%, #09101a 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', flexDirection: 'column',
          zIndex: 50,
          transform: open ? 'translateX(0)' : undefined,
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
        className={`${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* ── Logo ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 72, flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}>
          <Link to="/dashboard" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo.png"
              alt="Builders Brick"
              style={{ height: 42, width: 'auto', objectFit: 'contain', maxWidth: 190 }}
            />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <XMarkIcon style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 12px', scrollbarWidth: 'none' }}>
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom: 20 }}>
              {/* Section header */}
              <div style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase',
                padding: '0 10px', marginBottom: 6,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>{g.section}</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.04)' }} />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {g.items.map(item => {
                  const active = location.pathname === item.to;
                  const hasBadge = item.badge && pendingCount > 0;
                  return (
                    <Link key={item.to} to={item.to} onClick={onClose} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          display: 'flex', alignItems: 'center', gap: 11,
                          padding: '9px 10px', borderRadius: 12,
                          background: active ? `${item.color}15` : 'transparent',
                          border: `1px solid ${active ? item.color + '28' : 'transparent'}`,
                          position: 'relative', overflow: 'hidden',
                          transition: 'all 0.18s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                          }
                        }}
                      >
                        {/* Active left bar */}
                        {active && (
                          <div style={{
                            position: 'absolute', left: 0, top: '20%', bottom: '20%',
                            width: 3, borderRadius: '0 3px 3px 0',
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}80`,
                          }} />
                        )}

                        {/* Icon */}
                        <div style={{
                          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                          background: active ? `${item.color}22` : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${active ? item.color + '35' : 'rgba(255,255,255,0.07)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.18s ease',
                        }}>
                          <item.Icon style={{ width: 16, height: 16, color: active ? item.color : 'rgba(255,255,255,0.35)' }} />
                        </div>

                        {/* Label */}
                        <span style={{
                          fontSize: 13, fontWeight: active ? 700 : 500,
                          color: active ? '#fff' : 'rgba(255,255,255,0.42)',
                          flex: 1, transition: 'color 0.18s',
                        }}>
                          {item.label}
                        </span>

                        {/* Badge */}
                        {hasBadge && (
                          <div style={{
                            minWidth: 20, height: 20, borderRadius: 20,
                            background: '#f97316',
                            boxShadow: '0 0 12px rgba(249,115,22,0.5)',
                            fontSize: 10, fontWeight: 800, color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 5px',
                          }}>
                            {pendingCount > 99 ? '99+' : pendingCount}
                          </div>
                        )}

                        {/* Active dot */}
                        {active && !hasBadge && (
                          <div style={{
                            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}`,
                          }} />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* ── User Card ── */}
        <div style={{ padding: '12px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Avatar */}
            <div style={{
              width: 38, height: 38, borderRadius: 11, flexShrink: 0,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em',
            }}>
              {ini}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.3 }} className="truncate">
                {user?.name || 'User'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: roleCfg.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: roleCfg.color }}>{roleCfg.label}</span>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: 'rgba(248,113,133,0.08)', border: '1px solid rgba(248,113,133,0.18)',
                color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,133,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(248,113,133,0.08)'; }}
            >
              <ArrowRightOnRectangleIcon style={{ width: 15, height: 15 }} />
            </button>
          </div>

          {/* Version tag */}
          <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.1em' }}>
            BUILDERS BRICK CRM v1.0
          </div>
        </div>
      </aside>
    </>
  );
};

/* ════════════════════════════════════
   TOPBAR
════════════════════════════════════ */
const Topbar = ({ onMenuClick, user, isAdminLevel, currentPath }) => {
  const ini = initials(user?.name);
  const roleCfg = ROLE_CONFIG[user?.role] || { label: user?.role, color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', dot: '#9ca3af' };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const pageTitles = {
    '/dashboard': 'Dashboard',
    '/leads': 'Leads',
    '/properties': 'Properties',
    '/deals': 'Deals',
    '/clients': 'Clients',
    '/agents': 'Agents',
    '/activities': 'Activities',
    '/installment-requests': 'Installment Requests',
    '/payment-plans': 'Payment Plans',
    '/profile': 'Profile',
    '/performance': 'Performance',
    '/receipts': 'Receipts',
  };
  const pageTitle = pageTitles[currentPath] || 'Dashboard';
  const today = time.toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 24px', height: 72, flexShrink: 0,
        background: 'rgba(8,12,20,0.96)',
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky', top: 0, zIndex: 40,
      }}
    >
      {/* Mobile menu button */}
      <button
        className="lg:hidden"
        onClick={onMenuClick}
        style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}
      >
        <Bars3Icon style={{ width: 18, height: 18 }} />
      </button>

      {/* Page title */}
      <div className="hidden md:block">
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          {pageTitle}
        </h1>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{today}</p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="relative hidden sm:flex items-center" style={{ width: 260 }}>
        <MagnifyingGlassIcon
          style={{ position: 'absolute', left: 12, width: 15, height: 15, color: 'rgba(255,255,255,0.22)', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Search anything…"
          style={{
            width: '100%', height: 38,
            paddingLeft: 36, paddingRight: 36,
            borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(255,255,255,0.04)',
            color: '#fff', fontSize: 12, fontFamily: 'inherit',
            outline: 'none', transition: 'all 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
          onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
        />
        <kbd style={{
          position: 'absolute', right: 10,
          fontSize: 9, padding: '2px 5px', borderRadius: 5,
          background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.09)', fontFamily: 'inherit',
        }}>⌘K</kbd>
      </div>

      {/* Notifications */}
      <NotificationBell />

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />

      {/* Profile */}
      <Link
        to="/profile"
        style={{ textDecoration: 'none' }}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 12px', borderRadius: 11,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.2s', cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
          }}>
            {ini}
          </div>
          <div className="hidden md:block">
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {user?.name?.split(' ')[0] || 'User'}
            </div>
            <div style={{ fontSize: 10, color: roleCfg.color, fontWeight: 600 }}>
              {roleCfg.label}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

/* ════════════════════════════════════
   LAYOUT WRAPPER
════════════════════════════════════ */
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminLevel = isAdmin();

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (!isAdminLevel) return;
    const fetchPendingCount = async () => {
      try {
        const res = await axios.get('/api/installment-requests/pending-count');
        if (res.data.success) setPendingCount(res.data.count);
      } catch {
        // Silently ignore
      }
    };
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 60000);
    return () => clearInterval(interval);
  }, [isAdminLevel]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c12',
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        isAdminLevel={isAdminLevel}
        location={location}
        onLogout={handleLogout}
        pendingCount={pendingCount}
      />

      {/* Main area */}
      <div style={{ marginLeft: 264, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="lg:ml-[264px] ml-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
          isAdminLevel={isAdminLevel}
          currentPath={location.pathname}
        />
        <main style={{ flex: 1, overflowY: 'auto', background: '#080c12' }}>
          <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 24px 48px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
