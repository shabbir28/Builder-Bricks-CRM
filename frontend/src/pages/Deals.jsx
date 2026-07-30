import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DealDetails from '../components/deals/DealDetails';
import { useAuth } from '../hooks/useAuth';
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext';

/* ─── Stage Config ───────────────────────────────────── */
const STAGES = [
  { id: 'lead',        label: 'Prospecting',   color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
  { id: 'qualified',   label: 'Qualified',     color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)'  },
  { id: 'proposal',    label: 'Proposal',      color: '#a855f7', bg: 'rgba(168,85,247,0.08)',  border: 'rgba(168,85,247,0.2)'  },
  { id: 'negotiation', label: 'Negotiation',   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  { id: 'closing',     label: 'Closing',       color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.2)'   },
  { id: 'won',         label: 'Won',           color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)'  },
];
const STAGE_MAP = Object.fromEntries(STAGES.map(s => [s.id, s]));

/* ─── Tiny Modal ─────────────────────────────────────── */
const ModalShell = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-border shadow-2xl overflow-hidden" style={{ background: '#111316' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
          <button onClick={onClose} className="btn-icon"><XMarkIcon className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ─── Stage Badge ────────────────────────────────────── */
const StageBadge = ({ stageId }) => {
  const s = STAGE_MAP[stageId] || { label: stageId, color: '#8b8fa8', bg: 'rgba(139,143,168,0.08)', border: 'rgba(139,143,168,0.2)' };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
};

/* ─── Input shared style ─────────────────────────────── */
const inputCls = 'w-full rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 mt-1 focus:outline-none focus:border-accent placeholder-ink-tertiary';
const labelCls = 'block text-xs font-semibold text-ink-tertiary uppercase tracking-wider';

/* ════════════════════════════════════════════
   DEALS PAGE
════════════════════════════════════════════ */
const Deals = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [deals, setDeals]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]     = useState('pipeline');
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [editingDeal, setEditingDeal]   = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [leads, setLeads]           = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents]         = useState([]);

  const [formData, setFormData] = useState({
    title: '', lead: '', property: '', agent: '',
    status: 'negotiation', dealValue: '',
    commissionRate: '2.5', expectedClosingDate: '',
    pipelineStage: 'negotiation',
  });

  useEffect(() => { if (user) { fetchDeals(); fetchSelectionData(); } }, [user]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/deals');
      if (res.data.success) setDeals(res.data.data);
    } catch { toast.error('Failed to load deals'); }
    finally { setLoading(false); }
  };

  const fetchSelectionData = async () => {
    try {
      const [lr, pr, ar] = await Promise.all([
        axios.get('/api/leads'), axios.get('/api/properties'), axios.get('/api/users'),
      ]);
      if (lr.data.success) setLeads(lr.data.data);
      if (pr.data.success) setProperties(pr.data.data);
      if (ar.data.success) setAgents(ar.data.data);
    } catch {}
  };

  const openModal = (deal = null) => {
    setEditingDeal(deal);
    setFormData(deal ? {
      title: deal.title, lead: deal.lead?.id || '',
      property: deal.property?.id || '', agent: deal.agent?.id || '',
      status: deal.status, dealValue: deal.dealValue,
      commissionRate: deal.commissionRate,
      expectedClosingDate: deal.expectedClosingDate ? new Date(deal.expectedClosingDate).toISOString().split('T')[0] : '',
      pipelineStage: deal.pipelineStage,
    } : {
      title: '', lead: '', property: '', agent: '',
      status: 'negotiation', dealValue: '', commissionRate: '2.5',
      expectedClosingDate: '', pipelineStage: 'negotiation',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = editingDeal
        ? await axios.put(`/api/deals/${editingDeal.id}`, formData)
        : await axios.post('/api/deals', formData);
      if (resp.data.success) {
        toast.success(editingDeal ? 'Deal updated!' : 'Deal created!', {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        if (!editingDeal) {
          addNotification(NOTIFICATION_TYPES.DEAL_CREATED, 'Deal Created', `New deal "${formData.title}" added to pipeline.`);
        }
        if (formData.pipelineStage === 'closing') {
          addNotification(NOTIFICATION_TYPES.DEAL_CLOSING_SOON, 'Deal Closing Soon', `"${formData.title}" is entering closing stage.`);
        }
        setIsModalOpen(false);
        fetchDeals();
      }
    } catch { toast.error('Failed to save deal'); }
  };

  /* Derived stats */
  const totalValue   = deals.reduce((s, d) => s + (d.dealValue || 0), 0);
  const totalComm    = deals.reduce((s, d) => s + (d.commissionAmount || 0), 0);
  const wonDeals     = deals.filter(d => d.pipelineStage === 'won').length;
  const settleRatio  = deals.length ? Math.round((wonDeals / deals.length) * 100) : 0;

  const filtered = deals.filter(d =>
    d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.lead?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const set = f => e => setFormData(p => ({ ...p, [f]: e.target.value }));

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-accent animate-spin" />
        <span className="text-xs text-ink-tertiary uppercase tracking-widest font-semibold">Loading deals…</span>
      </div>
    );
  }

  return (
    <>
    {/* Deal Details Overlay */}
    {selectedDeal && <DealDetails deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}

    <div className="space-y-6 pb-16">

      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full bg-[#5c6bc0]" />
            <span className="text-[#7986cb] text-[10px] font-black uppercase tracking-[0.4em]">Operations Hub</span>
          </div>
          <h1 className="text-3xl font-black text-ink-primary tracking-tight">Deal Pipeline</h1>
          <p className="text-sm text-ink-secondary mt-0.5">{deals.length} deals · Rs. {(totalValue / 1e6).toFixed(1)}M total value</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search deals…"
              className="input pl-9 pr-4 py-2 text-sm w-52"
            />
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-surface-border overflow-hidden" style={{ background: '#0d0f12' }}>
            {[
              { id: 'pipeline', icon: ViewColumnsIcon, label: 'Board' },
              { id: 'list',     icon: ListBulletIcon,  label: 'List'  },
            ].map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: view === v.id ? 'rgba(92,107,192,0.2)' : 'transparent',
                  color: view === v.id ? '#9fa8da' : '#545769',
                  borderRight: v.id === 'pipeline' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <v.icon className="w-4 h-4" /> {v.label}
              </button>
            ))}
          </div>

          {/* New Deal */}
          <button
            onClick={() => openModal()}
            className="btn flex items-center gap-2"
            style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700 }}
          >
            <PlusIcon className="w-4 h-4" /> New Deal
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Pipeline Value',
            value: `Rs. ${(totalValue / 1e6).toFixed(1)}M`,
            icon: CurrencyDollarIcon,
            accent: '#5c6bc0',
            bg: 'rgba(92,107,192,0.08)',
            border: 'rgba(92,107,192,0.2)',
            sub: `${deals.length} active deals`,
          },
          {
            label: 'Projected Revenue',
            value: `Rs. ${(totalComm / 1e6).toFixed(2)}M`,
            icon: ArrowTrendingUpIcon,
            accent: '#10b981',
            bg: 'rgba(16,185,129,0.08)',
            border: 'rgba(16,185,129,0.2)',
            sub: 'Estimated commission',
          },
          {
            label: 'Settlement Ratio',
            value: `${settleRatio}%`,
            icon: CheckBadgeIcon,
            accent: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)',
            border: 'rgba(245,158,11,0.2)',
            sub: `${wonDeals} of ${deals.length} won`,
          },
        ].map((k, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 border flex items-center gap-4"
            style={{ background: k.bg, borderColor: k.border }}
          >
            <div
              className="h-11 w-11 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: `rgba(${k.accent === '#5c6bc0' ? '92,107,192' : k.accent === '#10b981' ? '16,185,129' : '245,158,11'},0.15)`, border: `1px solid ${k.border}` }}
            >
              <k.icon className="h-5 w-5" style={{ color: k.accent }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">{k.label}</p>
              <p className="text-xl font-black text-ink-primary mt-0.5 tracking-tight">{k.value}</p>
              <p className="text-[10px] text-ink-tertiary mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Pipeline / List ── */}
      {view === 'list' ? (
        /* LIST VIEW */
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Client</th>
                  <th>Value</th>
                  <th>Commission</th>
                  <th>Closing Date</th>
                  <th>Stage</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-tertiary text-sm">
                      No deals found
                    </td>
                  </tr>
                ) : filtered.map(deal => (
                  <tr
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="cursor-pointer group"
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: 'rgba(92,107,192,0.12)', border: '1px solid rgba(92,107,192,0.2)' }}
                        >
                          <BuildingOffice2Icon className="h-4 w-4" style={{ color: '#7986cb' }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-ink-primary group-hover:text-[#7986cb] transition-colors">{deal.title}</div>
                          {deal.property?.title && (
                            <div className="text-xs text-ink-tertiary mt-0.5">{deal.property.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-surface-raised border border-surface-divide overflow-hidden flex items-center justify-center text-[9px] font-bold text-ink-tertiary">
                          {deal.lead?.name?.[0] || '?'}
                        </div>
                        <span className="text-sm text-ink-secondary">{deal.lead?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="font-semibold text-ink-primary">Rs. {deal.dealValue?.toLocaleString()}</td>
                    <td className="text-emerald-400 font-semibold">Rs. {deal.commissionAmount?.toLocaleString() || '—'}</td>
                    <td className="text-ink-secondary text-xs">
                      {deal.expectedClosingDate
                        ? new Date(deal.expectedClosingDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td><StageBadge stageId={deal.pipelineStage} /></td>
                    <td className="text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openModal(deal)}
                        className="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin' }}>
          {STAGES.map(stage => {
            const stageDeals = filtered.filter(d => d.pipelineStage === stage.id);
            const stageValue = stageDeals.reduce((s, d) => s + (d.dealValue || 0), 0);

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-64 flex flex-col rounded-xl border overflow-hidden"
                style={{ background: '#0d0f12', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                {/* Column header */}
                <div
                  className="px-3 py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.05)', borderTop: `2px solid ${stage.color}` }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: stage.color }}>{stage.label}</span>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.border}` }}
                    >
                      {stageDeals.length}
                    </span>
                  </div>
                  <div className="text-[10px] text-ink-tertiary font-medium">
                    Rs. {(stageValue / 1e6).toFixed(1)}M
                  </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2.5 p-2.5 flex-1 min-h-[200px]">
                  {stageDeals.map(deal => (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDeal(deal)}
                      className="group rounded-xl border p-3 cursor-pointer transition-all"
                      style={{
                        background: '#111316',
                        borderColor: 'rgba(255,255,255,0.06)',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = stage.border;
                        e.currentTarget.style.boxShadow = `0 0 0 1px ${stage.border}`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Title row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div
                          className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                          style={{ background: stage.bg, border: `1px solid ${stage.border}` }}
                        >
                          <BuildingOffice2Icon className="h-3.5 w-3.5" style={{ color: stage.color }} />
                        </div>
                        <ChevronRightIcon className="h-3.5 w-3.5 text-ink-tertiary flex-shrink-0 mt-0.5 group-hover:text-ink-secondary transition-colors" />
                      </div>

                      <div className="text-sm font-semibold text-ink-primary leading-snug mb-3 line-clamp-2">
                        {deal.title}
                      </div>

                      {/* Client */}
                      {deal.lead?.name && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-surface-divide">
                          <div className="h-5 w-5 rounded-full bg-surface-raised border border-surface-divide flex items-center justify-center text-[9px] font-bold text-ink-tertiary flex-shrink-0">
                            {deal.lead.name[0].toUpperCase()}
                          </div>
                          <span className="text-xs text-ink-secondary truncate">{deal.lead.name}</span>
                        </div>
                      )}

                      {/* Value + date */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-ink-primary">
                          Rs. {(deal.dealValue / 1e6).toFixed(1)}M
                        </span>
                        {deal.expectedClosingDate && (
                          <div className="flex items-center gap-1 text-[10px] text-ink-tertiary">
                            <CalendarDaysIcon className="h-3 w-3" />
                            {new Date(deal.expectedClosingDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-30">
                      <BoltIcon className="h-5 w-5 text-ink-tertiary mb-1.5" />
                      <span className="text-[10px] text-ink-tertiary font-semibold uppercase tracking-wider">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* ── Create / Edit Modal ── */}
    <ModalShell
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={editingDeal ? 'Edit Deal' : 'New Deal'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Deal Title *</label>
          <input className={inputCls} value={formData.title} onChange={set('title')} placeholder="e.g. DHA Phase 6 — 10 Marla" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pipeline Stage *</label>
            <select className={inputCls} value={formData.pipelineStage} onChange={set('pipelineStage')} required>
              {STAGES.map(s => <option key={s.id} value={s.id} style={{ background: '#111316' }}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Deal Value (PKR) *</label>
            <input className={inputCls} type="number" value={formData.dealValue} onChange={set('dealValue')} placeholder="e.g. 5000000" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Client (Lead) *</label>
            <select className={inputCls} value={formData.lead} onChange={set('lead')} required>
              <option value="">Select client…</option>
              {leads.map(l => <option key={l.id} value={l.id} style={{ background: '#111316' }}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Property</label>
            <select className={inputCls} value={formData.property} onChange={set('property')}>
              <option value="">Select property…</option>
              {properties.map(p => <option key={p.id} value={p.id} style={{ background: '#111316' }}>{p.title}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Commission Rate (%)</label>
            <input className={inputCls} type="number" step="0.1" value={formData.commissionRate} onChange={set('commissionRate')} />
          </div>
          <div>
            <label className={labelCls}>Expected Closing Date</label>
            <input className={inputCls} type="date" value={formData.expectedClosingDate} onChange={set('expectedClosingDate')} style={{ colorScheme: 'dark' }} />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-surface-border">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="btn"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1e2025', color: '#8b8fa8' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn"
            style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700, minWidth: 100 }}
          >
            {editingDeal ? 'Save Changes' : 'Create Deal'}
          </button>
        </div>
      </form>
    </ModalShell>
    </>
  );
};

export default Deals;
