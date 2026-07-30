import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  UserIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AddLeadModal from '../components/modals/AddLeadModal';
import EditLeadModal from '../components/modals/EditLeadModal';
import { useAuth } from '../hooks/useAuth';
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext';

/* ─── Status config ──────────────────────────────── */
const STATUS_CFG = {
  new:         { label: 'New',         color: '#60a5fa', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)' },
  contacted:   { label: 'Contacted',   color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.2)'  },
  visit:       { label: 'Visit',       color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)'  },
  negotiation: { label: 'Negotiation', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  closed:      { label: 'Closed',      color: '#14b8a6', bg: 'rgba(20,184,166,0.08)',  border: 'rgba(20,184,166,0.2)'  },
  lost:        { label: 'Lost',        color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)' },
};
const ALL_STATUSES = Object.keys(STATUS_CFG);

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.new;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, boxShadow: `inset 0 0 8px ${c.bg}` }}
    >
      <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
      {c.label}
    </span>
  );
};

const AssignBadge = ({ status }) => {
  if (status === 'pending') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] animate-pulse"
      style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)', boxShadow: 'inset 0 0 8px rgba(251,191,36,0.08)' }}>
      ⏳ Pending
    </span>
  );
  if (status === 'accepted') return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.08em]"
      style={{ background: 'rgba(20,184,166,0.08)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.2)', boxShadow: 'inset 0 0 8px rgba(20,184,166,0.08)' }}>
      ✓ Active
    </span>
  );
  return null;
};

/* ─── Inline Modal Shell ──────────────────────────── */
const ModalShell = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-surface-border shadow-2xl overflow-hidden" style={{ background: '#0e1015' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
          <button onClick={onClose} className="btn-icon"><XMarkIcon className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════
   LEADS PAGE
═══════════════════════════════════════════ */
const Leads = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';

  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [agents, setAgents]   = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');

  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen]     = useState(false);
  const [selectedLead, setSelectedLead]       = useState(null);

  const [updateData, setUpdateData] = useState({ status: '', notes: '' });
  const [assignData, setAssignData] = useState({ agentId: '' });

  useEffect(() => { if (user) { fetchLeads(); if (isAdmin) fetchAgents(); } }, [user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const r = await axios.get('/api/leads');
      if (r.data.success) setLeads(r.data.data);
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  };

  const fetchAgents = async () => {
    try {
      const r = await axios.get('/api/users');
      if (r.data.success) setAgents(r.data.data.filter(u => u.role === 'agent' || u.role === 'admin'));
    } catch {}
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.put(`/api/leads/${selectedLead.id}`, { assignedAgent: assignData.agentId });
      if (r.data.success) {
        toast.success('Agent assigned!', { style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' } });
        const agentName = agents.find(a => a.id === assignData.agentId)?.name || 'Agent';
        addNotification(NOTIFICATION_TYPES.FOLLOWUP_REMINDER, 'Lead Assigned', `"${selectedLead.name}" assigned to ${agentName}.`);
        setIsAssignModalOpen(false); fetchLeads();
      }
    } catch { toast.error('Assignment failed'); }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const r = await axios.put(`/api/leads/${selectedLead.id}`, updateData);
      if (r.data.success) {
        toast.success('Lead updated!', { style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' } });
        setIsUpdateModalOpen(false); fetchLeads();
      }
    } catch { toast.error('Update failed'); }
  };

  const handleRespond = async (leadId, responseType) => {
    try {
      const r = await axios.put(`/api/leads/${leadId}/respond`, { response: responseType });
      if (r.data.success) {
        toast.success(responseType === 'accepted' ? 'Lead accepted!' : 'Lead rejected', {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' }
        });
        fetchLeads();
      }
    } catch { toast.error('Action failed'); }
  };

  /* Filtering */
  const filtered = leads.filter(l => {
    const matchSearch = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        l.phone?.includes(searchQuery);
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* Stats */
  const newLeads    = leads.filter(l => l.status === 'new').length;
  const closedLeads = leads.filter(l => l.status === 'closed').length;
  const pendingAssg = leads.filter(l => l.assignmentStatus === 'pending').length;

  const sourceLabel = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '—';

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-accent animate-spin" />
        <span className="text-xs text-ink-tertiary uppercase tracking-widest font-semibold">Loading leads…</span>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full bg-[#5c6bc0]" />
            <span className="text-[#7986cb] text-[10px] font-black uppercase tracking-[0.4em]">
              {isAgent ? 'Assigned Leads' : 'Lead Management'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-ink-primary tracking-tight">
            {isAgent ? 'My Leads' : 'Leads'}
          </h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            {leads.length} total · {newLeads} new · {closedLeads} closed
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search leads…"
              className="input pl-9 pr-4 py-2 text-sm w-52"
            />
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn flex items-center gap-2"
              style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700 }}
            >
              <PlusIcon className="w-4 h-4" /> Create Lead
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads',   value: leads.length,    accent: '#7986cb' },
          { label: 'New',           value: newLeads,        accent: '#3b82f6' },
          { label: 'Closed',        value: closedLeads,     accent: '#10b981' },
          { label: 'Pending Assign',value: pendingAssg,     accent: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl px-4 py-3 border"
            style={{
              background: `rgba(${['121,134,203','59,130,246','16,185,129','245,158,11'][i]},0.06)`,
              borderColor: `rgba(${['121,134,203','59,130,246','16,185,129','245,158,11'][i]},0.18)`,
            }}>
            <div className="text-[10px] font-semibold text-ink-tertiary uppercase tracking-wider">{s.label}</div>
            <div className="text-xl font-black mt-0.5 tracking-tight" style={{ color: s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Status Filter Chips ── */}
      <div className="flex items-center gap-3 flex-wrap pt-2">
        <button
          onClick={() => setFilterStatus('all')}
          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
          style={{
            background: filterStatus === 'all' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
            color: filterStatus === 'all' ? '#fff' : 'rgba(255,255,255,0.4)',
            border: `1px solid ${filterStatus === 'all' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)'}`,
          }}
        >
          All ({leads.length})
        </button>
        {ALL_STATUSES.map(st => {
          const c = STATUS_CFG[st];
          const active = filterStatus === st;
          return (
            <button key={st} onClick={() => setFilterStatus(st)}
              className="px-4 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 hover:bg-opacity-20"
              style={{
                background: active ? c.bg : 'rgba(255,255,255,0.02)',
                color: active ? c.color : 'rgba(255,255,255,0.4)',
                border: `1px solid ${active ? c.color : 'rgba(255,255,255,0.04)'}`,
                boxShadow: active ? `inset 0 0 10px ${c.bg}, 0 0 10px ${c.bg}` : 'none'
              }}>
              {c.label} ({leads.filter(l => l.status === st).length})
            </button>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div style={{
        background: 'rgba(18, 18, 20, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        marginTop: 16
      }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {['Lead', 'Contact', 'Status', 'Source', ...(isAdmin ? ['Assigned To'] : []), 'Date', 'Actions'].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-white/40 ${h==='Actions'?'text-right':''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <UserIcon className="h-12 w-12 text-white/10" />
                      <span className="text-sm font-semibold tracking-wider text-white/20 uppercase">No leads found</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(lead => (
                <tr key={lead.id} className="group cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => navigate(`/leads/${lead.id}`)}>
                  
                  {/* Lead name + notes */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-black shadow-lg shadow-black/20"
                        style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {lead.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">
                          {lead.name}
                        </div>
                        {lead.notes && (
                          <div className="text-xs text-white/40 mt-1 italic line-clamp-1 max-w-[200px]">{lead.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {lead.email && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                          <EnvelopeIcon className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                          <span className="truncate max-w-[150px]">{lead.email}</span>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-[11px] font-medium text-white/60">
                          <PhoneIcon className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2 items-start">
                      <StatusBadge status={lead.status || 'new'} />
                      <AssignBadge status={lead.assignmentStatus} />
                    </div>
                  </td>

                  {/* Source */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="h-4 w-4 text-white/30" />
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">{sourceLabel(lead.source)}</span>
                    </div>
                  </td>

                  {/* Assigned agent */}
                  {isAdmin && (
                    <td className="px-6 py-4">
                      {lead.agent ? (
                        <div className="flex items-center gap-3">
                          <div
                            className="h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            {lead.agent.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold tracking-wide text-white/70">{lead.agent.name?.split(' ')[0]}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold tracking-widest uppercase text-white/20">Unassigned</span>
                      )}
                    </td>
                  )}

                  {/* Date */}
                  <td className="px-6 py-4 text-xs font-semibold text-white/40 tracking-wide whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => { setSelectedLead(lead); setAssignData({ agentId: lead.assignedAgent || '' }); setIsAssignModalOpen(true); }}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title={lead.assignedAgent ? 'Reassign' : 'Assign agent'}
                            style={{ color: '#fff' }}
                          >
                            <UserPlusIcon className="h-4 w-4 text-cyan-400" />
                          </button>
                          <button
                            onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            title="Edit lead"
                          >
                            <PencilSquareIcon className="h-4 w-4 text-white/70" />
                          </button>
                        </>
                      ) : lead.assignmentStatus === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleRespond(lead.id, 'accepted')}
                            title="Accept"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-105"
                            style={{ background: 'rgba(20,184,166,0.15)', color: '#14b8a6', border: '1px solid rgba(20,184,166,0.3)', boxShadow: '0 0 10px rgba(20,184,166,0.1)' }}
                          >
                            <CheckCircleIcon className="h-3.5 w-3.5" /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(lead.id, 'rejected')}
                            title="Reject"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-105"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' }}
                          >
                            <XMarkIcon className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setSelectedLead(lead); setUpdateData({ status: lead.status || 'new', notes: lead.notes || '' }); setIsUpdateModalOpen(true); }}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title="Update status"
                        >
                          <PencilSquareIcon className="h-4 w-4 text-white/70" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* ── Update Status Modal (Agents) ── */}
    <ModalShell isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)} title="Update Lead Status">
      <form onSubmit={handleUpdateSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-2">Status</label>
          <div className="grid grid-cols-3 gap-2">
            {ALL_STATUSES.map(s => {
              const c = STATUS_CFG[s];
              const active = updateData.status === s;
              return (
                <button key={s} type="button" onClick={() => setUpdateData(p => ({ ...p, status: s }))}
                  className="py-2 rounded-xl text-[11px] font-bold capitalize transition-all border"
                  style={{
                    background: active ? c.bg : 'rgba(255,255,255,0.03)',
                    color: active ? c.color : '#545769',
                    borderColor: active ? c.border : 'rgba(255,255,255,0.06)',
                  }}>
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-1">Notes</label>
          <textarea
            className="w-full rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-accent placeholder-ink-tertiary"
            style={{ minHeight: 100, resize: 'vertical' }}
            value={updateData.notes}
            onChange={e => setUpdateData(p => ({ ...p, notes: e.target.value }))}
            placeholder="Add notes about this lead…"
          />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
          <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1e2025', color: '#8b8fa8' }}>Cancel</button>
          <button type="submit" className="btn" style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700, minWidth: 100 }}>Save</button>
        </div>
      </form>
    </ModalShell>

    {/* ── Assign Agent Modal (Admin) ── */}
    <ModalShell isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Agent">
      <form onSubmit={handleAssignSubmit} className="space-y-4">
        {selectedLead && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-border" style={{ background: 'rgba(92,107,192,0.06)' }}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'rgba(92,107,192,0.15)', color: '#9fa8da' }}>
              {selectedLead.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-ink-primary">{selectedLead.name}</div>
              <div className="text-xs text-ink-tertiary">{selectedLead.email}</div>
            </div>
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-ink-tertiary uppercase tracking-widest mb-2">Select Agent</label>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {agents.map(agent => {
              const active = assignData.agentId === agent.id;
              return (
                <button key={agent.id} type="button" onClick={() => setAssignData({ agentId: agent.id })}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                  style={{
                    background: active ? 'rgba(92,107,192,0.15)' : 'rgba(255,255,255,0.02)',
                    borderColor: active ? 'rgba(92,107,192,0.4)' : 'rgba(255,255,255,0.06)',
                  }}>
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: active ? 'rgba(92,107,192,0.25)' : 'rgba(255,255,255,0.06)', color: active ? '#9fa8da' : '#545769' }}>
                    {agent.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: active ? '#9fa8da' : '#adb5bf' }}>{agent.name}</div>
                    <div className="text-[10px] text-ink-tertiary capitalize">{agent.role}</div>
                  </div>
                  {active && <CheckCircleIcon className="h-4 w-4 ml-auto flex-shrink-0" style={{ color: '#7986cb' }} />}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-surface-border">
          <button type="button" onClick={() => setIsAssignModalOpen(false)} className="btn" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1e2025', color: '#8b8fa8' }}>Cancel</button>
          <button type="submit" className="btn" style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700, minWidth: 100 }}>
            <UserPlusIcon className="w-3.5 h-3.5" /> Assign
          </button>
        </div>
      </form>
    </ModalShell>

    {/* ── Add Lead Modal ── */}
    <AddLeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onLeadAdded={fetchLeads} />

    {/* ── Edit Lead Modal ── */}
    <EditLeadModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onLeadUpdated={fetchLeads} lead={selectedLead} />
    </>
  );
};

export default Leads;
