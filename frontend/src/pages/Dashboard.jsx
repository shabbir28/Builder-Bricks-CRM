import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  HomeModernIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, LineChart, Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import AddClientModal from '../components/modals/AddClientModal';
import AddPropertyModal from '../components/modals/AddPropertyModal';

/* ─── Palette ─── */
const C = {
  emerald: '#10b981',
  teal:    '#14b8a6',
  cyan:    '#06b6d4',
  blue:    '#3b82f6',
  indigo:  '#6366f1',
  violet:  '#8b5cf6',
  orange:  '#f97316',
  amber:   '#f59e0b',
  rose:    '#f43f5e',
  slate:   '#64748b',
};

/* ─── Helpers ─── */
const fmt = (num) => {
  if (!num || isNaN(num)) return '0';
  const n = Number(num);
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000)    return `${(n / 100_000).toFixed(1)}L`;
  return n.toLocaleString('en-PK', { maximumFractionDigits: 0 });
};
const fmtFull = (num) =>
  !num || isNaN(num) ? '0' : Number(num).toLocaleString('en-PK', { maximumFractionDigits: 0 });

/* ─── Custom Recharts Tooltip ─── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#141c2b',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      minWidth: 140,
    }}>
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{entry.name}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>
            {entry.name?.toLowerCase().includes('amount') ||
             entry.name?.toLowerCase().includes('revenue') ||
             entry.name?.toLowerCase().includes('collection') ||
             entry.name?.toLowerCase().includes('target')
              ? `Rs. ${fmtFull(entry.value)}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

/* ─── KPI Card (fixed overflow) ─── */
const KpiCard = ({ title, value, prefix, suffix, icon: Icon, color, trend, delay = 0 }) => {
  const isUp = trend && !String(trend).startsWith('-');
  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${delay}ms`,
        background: '#0f1520',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 16px 40px -8px ${color}25`;
        e.currentTarget.style.borderColor = `${color}35`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ width: 20, height: 20, color }} />
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: 11, fontWeight: 800,
            padding: '3px 8px', borderRadius: 20,
            color: isUp ? C.emerald : C.rose,
            background: isUp ? `${C.emerald}15` : `${C.rose}15`,
            border: `1px solid ${isUp ? C.emerald : C.rose}30`,
          }}>
            {isUp ? <ArrowUpIcon style={{ width: 10, height: 10 }} /> : <ArrowDownIcon style={{ width: 10, height: 10 }} />}
            {Math.abs(parseFloat(trend))}%
          </div>
        )}
      </div>

      {/* Label */}
      <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>
        {title}
      </p>

      {/* Value — uses clamp so it never overflows */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, minWidth: 0 }}>
        {prefix && <span className="kpi-prefix">{prefix}</span>}
        <span className="kpi-value">{value}</span>
        {suffix && <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginLeft: 2, flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
};

/* ─── Section Card ─── */
const Card = ({ children, className = '', style = {} }) => (
  <div
    className={`animate-fade-in-up ${className}`}
    style={{
      background: '#0f1520',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

const CardHead = ({ title, subtitle, badge, right }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{title}</h3>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
            background: `${C.emerald}20`, color: C.emerald, border: `1px solid ${C.emerald}30`,
          }}>{badge}</span>
        )}
      </div>
      {subtitle && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{subtitle}</p>}
    </div>
    {right}
  </div>
);

/* ─── Loading Skeleton ─── */
const LoadingSkeleton = () => (
  <div className="animate-fade-in" style={{ padding: '32px', maxWidth: 1600, margin: '0 auto' }}>
    <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
      <div className="skeleton" style={{ height: 36, width: 280, borderRadius: 10 }} />
    </div>
    <div className="dash-grid-5" style={{ marginBottom: 24 }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 130, borderRadius: 20 }} />
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
      <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
      <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
      <div className="skeleton" style={{ height: 280, borderRadius: 20 }} />
    </div>
  </div>
);

/* ═════════════════════════════════════════
   MAIN DASHBOARD
═════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) setStats(res.data.data);
    } catch {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading || !stats) return <LoadingSkeleton />;

  const {
    totalProperties    = 0,
    availableProperties = 0,
    soldProperties     = 0,
    rentedProperties   = 0,
    totalClients       = 0,
    totalExpectedRevenue    = 0,
    totalCollectedPayments  = 0,
    totalRemainingBalance   = 0,
    revenueStats       = [],
    recentLeadProgress = [],
  } = stats;

  const collectionRate = totalExpectedRevenue > 0
    ? ((totalCollectedPayments / totalExpectedRevenue) * 100).toFixed(1)
    : 0;

  /* Donut data */
  const pieData = [
    { name: 'Sold',      value: soldProperties,      color: C.emerald },
    { name: 'Available', value: availableProperties,  color: C.blue },
    { name: 'Rented',    value: rentedProperties,     color: C.amber },
  ].filter(d => d.value > 0);

  /* Bar chart — lead stages (mock-enriched from revenueStats months) */
  const barData = revenueStats.length > 0
    ? revenueStats.map(r => ({ name: r.name, Collections: r.revenue || 0 }))
    : [
        { name: 'Jan', Collections: 0 }, { name: 'Feb', Collections: 0 },
        { name: 'Mar', Collections: 0 }, { name: 'Apr', Collections: 0 },
        { name: 'May', Collections: 0 }, { name: 'Jun', Collections: 0 },
      ];

  /* Revenue vs Target */
  const revTargetData = revenueStats.map((r, i) => ({
    name: r.name,
    Revenue: r.revenue || 0,
    Target: Math.round((r.revenue || 0) * 1.2 + (i * 200000)),
  }));

  /* Today */
  const today = now.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long' });

  /* Activity color map */
  const activityColors = {
    S: C.blue, A: C.emerald, B: C.violet, C: C.orange, D: C.amber, E: C.teal,
  };

  return (
    <div style={{ padding: '28px 0', maxWidth: 1600, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div
        className="animate-fade-in-up"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.emerald, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Dashboard</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Real Estate Command Center
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            Welcome back, <span style={{ color: '#fff', fontWeight: 700 }}>{user?.name}</span>
            <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
            <span>{today}</span>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPropertyModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = `${C.blue}50`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <BuildingOfficeIcon style={{ width: 16, height: 16, color: C.blue }} />
            Add Property
          </button>
          <button
            onClick={() => setIsClientModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '10px 18px', borderRadius: 12,
              background: `linear-gradient(135deg, ${C.emerald} 0%, ${C.teal} 100%)`,
              border: 'none', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              boxShadow: `0 8px 24px ${C.emerald}40`,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${C.emerald}50`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 8px 24px ${C.emerald}40`; }}
          >
            <UserGroupIcon style={{ width: 16, height: 16 }} />
            New Client
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="dash-grid-5" style={{ marginBottom: 24 }}>
        <KpiCard title="Total Properties" value={totalProperties} icon={BuildingOfficeIcon} color={C.indigo} delay={0} />
        <KpiCard title="Properties Sold" value={soldProperties} suffix={`/ ${totalProperties}`} icon={HomeModernIcon} color={C.blue} trend="5.2" delay={50} />
        <KpiCard title="Total Clients" value={totalClients} icon={UserGroupIcon} color={C.violet} delay={100} />
        <KpiCard title="Total Collected" prefix="Rs. " value={fmt(totalCollectedPayments)} icon={BanknotesIcon} color={C.emerald} trend="12.5" delay={150} />
        <KpiCard title="Remaining Balance" prefix="Rs. " value={fmt(totalRemainingBalance)} icon={DocumentTextIcon} color={C.orange} delay={200} />
      </div>

      {/* ── Chart Row 1: Area + Donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }} className="responsive-chart-grid">
        
        {/* Monthly Collections — Area */}
        <Card style={{ animationDelay: '100ms' }}>
          <CardHead
            title="Monthly Collections"
            subtitle="Actual payments received over the last 6 months"
            badge="LIVE"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.emerald }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.emerald }} />
                Collections
              </div>
            }
          />
          <div style={{ padding: '20px 20px 16px', height: 310 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueStats} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C.emerald} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" name="Collections"
                  stroke={C.emerald} strokeWidth={2.5}
                  fill="url(#gArea)" fillOpacity={1}
                  activeDot={{ r: 6, fill: C.emerald, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Property Portfolio — Donut */}
        <Card style={{ animationDelay: '150ms' }}>
          <CardHead title="Property Portfolio" subtitle="Distribution by current status" />
          <div style={{ padding: '12px 20px 20px', height: 310, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="76%">
              <PieChart>
                <RechartsTooltip content={<ChartTooltip />} />
                <Pie data={pieData} innerRadius={65} outerRadius={95}
                  paddingAngle={4} dataKey="value" stroke="none"
                  animationBegin={200} animationDuration={900}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom" height={32}
                  content={({ payload }) => (
                    <ul style={{ display: 'flex', justifyContent: 'center', gap: 16, listStyle: 'none', margin: 0, padding: 0, marginTop: 8 }}>
                      {payload.map((e, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: e.color }} />
                          {e.value}
                        </li>
                      ))}
                    </ul>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div style={{
              position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{totalProperties}</div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>Total</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Chart Row 2: Bar + Line ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="responsive-chart-grid">

        {/* Bar — Monthly Collections breakdown */}
        <Card style={{ animationDelay: '200ms' }}>
          <CardHead title="Collection Bars" subtitle="Monthly collection volume overview" />
          <div style={{ padding: '20px 20px 16px', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={24}>
                <defs>
                  <linearGradient id="gBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.indigo} stopOpacity={1} />
                    <stop offset="100%" stopColor={C.violet} stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Bar dataKey="Collections" fill="url(#gBar)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Line — Revenue vs Target */}
        <Card style={{ animationDelay: '250ms' }}>
          <CardHead
            title="Revenue vs Target"
            subtitle="Actual collections compared to monthly targets"
            right={
              <div style={{ display: 'flex', gap: 12, fontSize: 11, fontWeight: 700 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.cyan }}>
                  <div style={{ width: 16, height: 2, background: C.cyan, borderRadius: 2 }} />Revenue
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.3)' }}>
                  <div style={{ width: 16, height: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 2, borderTop: '2px dashed rgba(255,255,255,0.3)' }} />Target
                </div>
              </div>
            }
          />
          <div style={{ padding: '20px 20px 16px', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revTargetData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={C.cyan} />
                    <stop offset="100%" stopColor={C.blue} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600 }}
                  tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`} />
                <RechartsTooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="Revenue" stroke="url(#gLine)" strokeWidth={2.5}
                  dot={{ r: 4, fill: C.cyan, stroke: '#0f1520', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: C.cyan, stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="Target" stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1.5} strokeDasharray="5 4"
                  dot={false} activeDot={{ r: 5, fill: 'rgba(255,255,255,0.4)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── Bottom Row: Financial + Activity ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

        {/* Financial Highlights */}
        <Card style={{ animationDelay: '300ms' }}>
          <CardHead title="Financial Summary" subtitle="Expected vs Collected" />
          <div style={{ padding: '20px 22px' }}>

            {/* Collection Rate Ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={C.emerald} strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - collectionRate / 100)}`}
                    transform="rotate(-90 40 40)"
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{collectionRate}%</span>
                  <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Rate</span>
                </div>
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Collection Rate</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                  Rs. {fmt(totalCollectedPayments)} of Rs. {fmt(totalExpectedRevenue)}
                </p>
              </div>
            </div>

            {/* Progress bars */}
            {[
              { label: 'Total Expected', value: totalExpectedRevenue, color: C.blue, pct: 100 },
              { label: 'Total Collected', value: totalCollectedPayments, color: C.emerald, pct: totalExpectedRevenue > 0 ? (totalCollectedPayments / totalExpectedRevenue) * 100 : 0 },
              { label: 'Remaining Balance', value: totalRemainingBalance, color: C.orange, pct: totalExpectedRevenue > 0 ? (totalRemainingBalance / totalExpectedRevenue) * 100 : 0 },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: item.color }}>Rs. {fmt(item.value)}</span>
                </div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div className="progress-fill" style={{ width: `${Math.min(item.pct, 100)}%`, background: `linear-gradient(90deg, ${item.color}cc, ${item.color})` }} />
                </div>
              </div>
            ))}

            {/* Property status quick stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
              marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)',
            }}>
              {[
                { label: 'Available', val: availableProperties, color: C.blue },
                { label: 'Sold',      val: soldProperties,      color: C.emerald },
                { label: 'Rented',    val: rentedProperties,    color: C.amber },
              ].map(s => (
                <div key={s.label} style={{
                  textAlign: 'center', padding: '10px 8px', borderRadius: 12,
                  background: `${s.color}10`, border: `1px solid ${s.color}20`,
                }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity Feed */}
        <Card style={{ animationDelay: '350ms' }}>
          <CardHead
            title="Recent System Activity"
            subtitle="Latest updates across the CRM"
            right={
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="live-dot" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: C.emerald, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
              </div>
            }
          />
          <div>
            {recentLeadProgress.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircleIcon style={{ width: 24, height: 24, color: 'rgba(255,255,255,0.2)' }} />
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>All Caught Up</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No recent activity logged in the CRM.</p>
                </div>
              </div>
            ) : (
              <div>
                {recentLeadProgress.slice(0, 6).map((log, i) => {
                  const initial = (log.agentName || 'S').charAt(0).toUpperCase();
                  const avatarColor = activityColors[initial] || C.slate;
                  return (
                    <div
                      key={log.id || i}
                      className="animate-fade-in-up"
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '14px 22px',
                        borderBottom: i < Math.min(recentLeadProgress.length, 6) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        animationDelay: `${350 + i * 60}ms`,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                        background: `${avatarColor}20`, border: `1px solid ${avatarColor}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800, color: avatarColor,
                      }}>
                        {initial}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 3 }}>
                          <span style={{ fontWeight: 800 }}>{log.agentName || 'System'}</span>
                          <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 5px' }}>updated</span>
                          <span style={{ color: C.emerald, fontWeight: 800 }}>{log.leadName || 'Record'}</span>
                        </p>
                        {log.notes && (
                          <p style={{
                            fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                          }}>{log.notes}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', marginTop: 2, flexShrink: 0 }}>
                        <ClockIcon style={{ width: 10, height: 10, display: 'inline', marginRight: 3 }} />
                        {new Date(log.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        {' '}
                        {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Modals */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientAdded={fetchStats}
      />
      <AddPropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onPropertyAdded={fetchStats}
      />
    </div>
  );
};

export default Dashboard;
