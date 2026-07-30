import React, { useState, useEffect } from 'react';
import {
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  ShieldCheckIcon,
  BellIcon,
  KeyIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

/* ─── tiny reusable toggle ─── */
const Toggle = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    style={{
      position: 'relative',
      display: 'inline-flex',
      width: 44,
      height: 24,
      borderRadius: 99,
      border: 'none',
      cursor: 'pointer',
      transition: 'background 0.25s',
      background: enabled
        ? 'linear-gradient(135deg,#06d6a0,#38bdf8)'
        : 'rgba(255,255,255,0.08)',
      boxShadow: enabled ? '0 0 14px rgba(6,214,160,0.35)' : 'none',
      flexShrink: 0,
    }}
    aria-checked={enabled}
    role="switch"
  >
    <span
      style={{
        position: 'absolute',
        top: 3,
        left: enabled ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      }}
    />
  </button>
);

/* ─── stat card ─── */
const Stat = ({ icon: Icon, label, value, color }) => (
  <div
    style={{
      background: 'var(--s3)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      transition: 'border-color 0.2s, transform 0.2s',
    }}
    className="profile-stat-card"
  >
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: color.bg,
        border: `1px solid ${color.border}`,
        flexShrink: 0,
      }}
    >
      <Icon style={{ width: 20, height: 20, color: color.icon }} />
    </div>
    <div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#e8ecf3', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: '#4f5669', marginTop: 3, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  </div>
);

const TABS = ['Personal Info', 'Security & Settings', 'Activity'];

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, deals: true, leads: false });
  const [twoFa, setTwoFa] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, email: user.email, phone: user.phone || '' });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 900));
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  const handleCancel = () => {
    reset({ name: user.name, email: user.email, phone: user.phone || '' });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
      </div>
    );
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'SA';
  const memberDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }} className="animate-in">

      {/* ── HERO BANNER ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          marginBottom: 24,
          background: 'var(--s2)',
          border: '1px solid var(--border)',
        }}
      >
        {/* gradient backdrop */}
        <div
          style={{
            height: 140,
            background: 'linear-gradient(135deg, rgba(6,214,160,0.18) 0%, rgba(56,189,248,0.14) 50%, rgba(192,132,252,0.1) 100%)',
            position: 'relative',
          }}
        >
          {/* mesh dots pattern */}
          <div
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
              backgroundSize: '28px 28px',
            }}
          />
          {/* glow orbs */}
          <div style={{
            position: 'absolute', top: -40, left: '20%',
            width: 200, height: 200,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,214,160,0.2) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute', top: -60, right: '15%',
            width: 240, height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }} />
        </div>

        {/* profile info row */}
        <div style={{ padding: '0 28px 24px', display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          {/* avatar ring */}
          <div
            style={{
              marginTop: -48,
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 24,
                background: 'linear-gradient(135deg,#06d6a0,#38bdf8,#c084fc)',
                padding: 3,
                boxShadow: '0 0 0 4px var(--s2), 0 8px 32px rgba(6,214,160,0.3)',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 21,
                  background: 'linear-gradient(135deg,#0f1a14,#0c1520)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 800,
                  color: '#06d6a0',
                  letterSpacing: '-0.02em',
                }}
              >
                {initials}
              </div>
            </div>
            {/* camera badge */}
            <div
              style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 28, height: 28, borderRadius: 9,
                background: 'var(--s1)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Change avatar"
            >
              <CameraIcon style={{ width: 13, height: 13, color: '#8d95a8' }} />
            </div>
          </div>

          {/* name block */}
          <div style={{ flex: 1, paddingTop: 16, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#e8ecf3', margin: 0, letterSpacing: '-0.02em' }}>
                {user.name}
              </h1>
              <span className="chip chip-teal" style={{ fontSize: 9 }}>
                <span className="chip-dot" /> {user.role}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#4f5669', display: 'flex', alignItems: 'center', gap: 5 }}>
                <EnvelopeIcon style={{ width: 12, height: 12 }} />
                {user.email}
              </span>
              {user.phone && (
                <span style={{ fontSize: 12, color: '#4f5669', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <PhoneIcon style={{ width: 12, height: 12 }} />
                  {user.phone}
                </span>
              )}
              <span style={{ fontSize: 12, color: '#4f5669', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CalendarDaysIcon style={{ width: 12, height: 12 }} />
                Since {memberDate}
              </span>
            </div>
          </div>

          {/* edit btn */}
          {!isEditing ? (
            <button
              onClick={() => { setActiveTab(0); setIsEditing(true); }}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              <PencilSquareIcon style={{ width: 14, height: 14 }} />
              Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCancel} className="btn-secondary" disabled={loading}>
                <XMarkIcon style={{ width: 14, height: 14 }} />
                Cancel
              </button>
              <button onClick={handleSubmit(onSubmit)} className="btn-primary" disabled={loading}>
                <CheckIcon style={{ width: 14, height: 14 }} />
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
        <Stat
          icon={ChartBarIcon}
          label="Total Deals"
          value={user.totalDeals ?? 14}
          color={{ bg: 'rgba(6,214,160,0.1)', border: 'rgba(6,214,160,0.2)', icon: '#06d6a0' }}
        />
        <Stat
          icon={CurrencyDollarIcon}
          label="Total Revenue"
          value={`$${((user.totalRevenue ?? 284000) / 1000).toFixed(0)}k`}
          color={{ bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', icon: '#38bdf8' }}
        />
        <Stat
          icon={StarIcon}
          label="Commission Rate"
          value={`${user.commission ?? 2.5}%`}
          color={{ bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: '#fbbf24' }}
        />
        <Stat
          icon={ShieldCheckIcon}
          label="Account Status"
          value="Active"
          color={{ bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)', icon: '#4ade80' }}
        />
      </div>

      {/* ── TAB BAR ── */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          background: 'var(--s2)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 5,
          marginBottom: 20,
        }}
      >
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1,
              padding: '8px 14px',
              borderRadius: 10,
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeTab === i
                ? 'linear-gradient(135deg,rgba(6,214,160,0.18),rgba(56,189,248,0.12))'
                : 'transparent',
              color: activeTab === i ? '#06d6a0' : '#4f5669',
              boxShadow: activeTab === i ? 'inset 0 0 0 1px rgba(6,214,160,0.25)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ════ TAB 0 – Personal Info ════ */}
      {activeTab === 0 && (
        <div
          style={{
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: 28,
          }}
          className="animate-in"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {/* Full Name */}
            <FieldBlock
              label="Full Name"
              icon={<UserCircleIcon style={{ width: 14, height: 14 }} />}
              error={errors.name?.message}
            >
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                disabled={!isEditing}
                className="input-field"
                style={!isEditing ? disabledStyle : {}}
              />
            </FieldBlock>

            {/* Email */}
            <FieldBlock
              label="Email Address"
              icon={<EnvelopeIcon style={{ width: 14, height: 14 }} />}
              error={errors.email?.message}
            >
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' },
                })}
                type="email"
                disabled={!isEditing}
                className="input-field"
                style={!isEditing ? disabledStyle : {}}
              />
            </FieldBlock>

            {/* Phone */}
            <FieldBlock label="Phone Number" icon={<PhoneIcon style={{ width: 14, height: 14 }} />}>
              <input
                {...register('phone')}
                type="tel"
                disabled={!isEditing}
                placeholder="0300-1234567"
                className="input-field"
                style={!isEditing ? disabledStyle : {}}
              />
            </FieldBlock>

            {/* Role (readonly) */}
            <FieldBlock label="Role" icon={<ShieldCheckIcon style={{ width: 14, height: 14 }} />}>
              <input
                type="text"
                value={user.role}
                disabled
                className="input-field"
                style={disabledStyle}
              />
            </FieldBlock>
          </div>

          {!isEditing && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border2)' }}>
              <p style={{ fontSize: 11, color: '#2e3445', textAlign: 'center' }}>
                Click <strong style={{ color: '#8d95a8' }}>Edit Profile</strong> in the banner above to update your information
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════ TAB 1 – Security & Settings ════ */}
      {activeTab === 1 && (
        <div
          style={{
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            overflow: 'hidden',
          }}
          className="animate-in"
        >
          {/* Notifications section */}
          <SectionHeading label="Notifications" />
          <SettingRow
            icon={<BellIcon style={{ width: 16, height: 16, color: '#38bdf8' }} />}
            iconBg="rgba(56,189,248,0.1)"
            iconBorder="rgba(56,189,248,0.2)"
            title="Email Notifications"
            desc="Get email updates about your leads and activities"
          >
            <Toggle enabled={notifications.email} onChange={v => setNotifications(p => ({ ...p, email: v }))} />
          </SettingRow>
          <SettingRow
            icon={<ChartBarIcon style={{ width: 16, height: 16, color: '#06d6a0' }} />}
            iconBg="rgba(6,214,160,0.1)"
            iconBorder="rgba(6,214,160,0.2)"
            title="Deal Alerts"
            desc="Notify me when a deal status changes"
          >
            <Toggle enabled={notifications.deals} onChange={v => setNotifications(p => ({ ...p, deals: v }))} />
          </SettingRow>
          <SettingRow
            icon={<UserCircleIcon style={{ width: 16, height: 16, color: '#c084fc' }} />}
            iconBg="rgba(192,132,252,0.1)"
            iconBorder="rgba(192,132,252,0.2)"
            title="Lead Notifications"
            desc="Get notified when new leads are assigned"
          >
            <Toggle enabled={notifications.leads} onChange={v => setNotifications(p => ({ ...p, leads: v }))} />
          </SettingRow>

          {/* Security section */}
          <SectionHeading label="Security" />
          <SettingRow
            icon={<ShieldCheckIcon style={{ width: 16, height: 16, color: '#4ade80' }} />}
            iconBg="rgba(74,222,128,0.1)"
            iconBorder="rgba(74,222,128,0.2)"
            title="Two-Factor Authentication"
            desc="Add an extra layer of security to your account"
            last={false}
          >
            <Toggle enabled={twoFa} onChange={setTwoFa} />
          </SettingRow>
          <SettingRow
            icon={<KeyIcon style={{ width: 16, height: 16, color: '#fbbf24' }} />}
            iconBg="rgba(251,191,36,0.1)"
            iconBorder="rgba(251,191,36,0.2)"
            title="Change Password"
            desc="Update your password regularly for best security"
            last
          >
            <button
              className="btn-secondary"
              style={{ fontSize: 11 }}
              onClick={() => toast.success('Password reset email sent!')}
            >
              <KeyIcon style={{ width: 12, height: 12 }} />
              Reset
            </button>
          </SettingRow>
        </div>
      )}

      {/* ════ TAB 2 – Activity ════ */}
      {activeTab === 2 && (
        <div
          style={{
            background: 'var(--s2)',
            border: '1px solid var(--border)',
            borderRadius: 18,
            padding: 28,
          }}
          className="animate-in"
        >
          <div style={{ display: 'grid', gap: 12 }}>
            {MOCK_ACTIVITY.map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  background: 'var(--s3)',
                  borderRadius: 12,
                  border: '1px solid var(--border2)',
                  transition: 'border-color 0.2s',
                }}
                className="activity-row"
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: a.color.bg,
                    border: `1px solid ${a.color.border}`,
                    flexShrink: 0,
                  }}
                >
                  <a.icon style={{ width: 16, height: 16, color: a.color.icon }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#e8ecf3' }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: '#4f5669', marginTop: 2 }}>{a.subtitle}</div>
                </div>
                <div style={{ fontSize: 10, color: '#2e3445', fontWeight: 500, whiteSpace: 'nowrap' }}>{a.time}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#2e3445' }}>
            Showing last 5 activities
          </p>
        </div>
      )}

      {/* inline style block */}
      <style>{`
        .profile-stat-card:hover {
          border-color: rgba(255,255,255,0.12) !important;
          transform: translateY(-2px);
        }
        .activity-row:hover {
          border-color: rgba(255,255,255,0.1) !important;
        }
      `}</style>
    </div>
  );
};

/* ─── helpers ─── */
const disabledStyle = {
  opacity: 0.5,
  cursor: 'not-allowed',
  background: 'rgba(255,255,255,0.02)',
};

const FieldBlock = ({ label, icon, children, error }) => (
  <div>
    <label className="label-text" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {icon}{label}
    </label>
    {children}
    {error && <p style={{ marginTop: 4, fontSize: 11, color: '#fb7185' }}>{error}</p>}
  </div>
);

const SectionHeading = ({ label }) => (
  <div
    style={{
      padding: '14px 24px 10px',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#2e3445',
      borderBottom: '1px solid var(--border2)',
    }}
  >
    {label}
  </div>
);

const SettingRow = ({ icon, iconBg, iconBorder, title, desc, children, last }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 24px',
      borderBottom: last ? 'none' : '1px solid var(--border2)',
      transition: 'background 0.15s',
    }}
    className="setting-row"
  >
    <div
      style={{
        width: 38,
        height: 38,
        borderRadius: 11,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: iconBg,
        border: `1px solid ${iconBorder}`,
        flexShrink: 0,
      }}
    >
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8ecf3' }}>{title}</div>
      <div style={{ fontSize: 11, color: '#4f5669', marginTop: 2 }}>{desc}</div>
    </div>
    {children}
  </div>
);

const MOCK_ACTIVITY = [
  {
    icon: ChartBarIcon,
    title: 'Deal Closed — Gulberg Residence',
    subtitle: 'PKR 1.2 Cr — marked as Won',
    time: '2 hrs ago',
    color: { bg: 'rgba(6,214,160,0.1)', border: 'rgba(6,214,160,0.2)', icon: '#06d6a0' },
  },
  {
    icon: UserCircleIcon,
    title: 'New Lead Assigned — Ahmed Raza',
    subtitle: 'Source: Facebook Ad · Priority: High',
    time: 'Yesterday',
    color: { bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.2)', icon: '#38bdf8' },
  },
  {
    icon: CalendarDaysIcon,
    title: 'Property Visit Scheduled',
    subtitle: 'DHA Phase 6, Plot 42 · 3:00 PM',
    time: '2 days ago',
    color: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', icon: '#fbbf24' },
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Commission Credited',
    subtitle: 'PKR 48,000 from Deal #1092',
    time: '4 days ago',
    color: { bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.2)', icon: '#4ade80' },
  },
  {
    icon: EnvelopeIcon,
    title: 'Profile Details Updated',
    subtitle: 'Phone number and email changed',
    time: '1 week ago',
    color: { bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', icon: '#c084fc' },
  },
];

export default Profile;
