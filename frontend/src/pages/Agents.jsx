import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  UserGroupIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckBadgeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

/* ─── Small modal wrapper ────────────────────────────────── */
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-surface-border shadow-2xl"
        style={{ background: '#111316' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
          <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
          <button onClick={onClose} className="btn-icon">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};

/* ─── Input / Select shared style ───────────────────────── */
const inputCls =
  'w-full rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 mt-1 focus:outline-none focus:border-accent placeholder-ink-tertiary';

/* ─── Confirm Delete Dialog ─────────────────────────────── */
const ConfirmDelete = ({ agent, onConfirm, onCancel, loading }) => (
  <div className="space-y-4">
    <p className="text-sm text-ink-secondary">
      Are you sure you want to remove{' '}
      <span className="font-bold text-ink-primary">{agent?.name}</span>? This
      cannot be undone.
    </p>
    <div className="flex gap-2 justify-end">
      <button
        onClick={onCancel}
        className="btn"
        style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: '#1e2025',
          color: '#8b8fa8',
        }}
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="btn"
        style={{
          background: 'rgba(239,68,68,0.12)',
          borderColor: 'rgba(239,68,68,0.3)',
          color: '#f87171',
        }}
      >
        {loading ? 'Removing…' : 'Remove Agent'}
      </button>
    </div>
  </div>
);

/* ─── Add / Edit Agent Form ─────────────────────────────── */
const AgentForm = ({ initial, onSave, onCancel, loading, currentUser }) => {
  const isEdit = !!initial;
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    password: '',
    role: initial?.role || 'executive',
  });
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!isEdit && !form.password.trim()) e.password = 'Password is required';
    if (!isEdit && form.password && form.password.length < 6)
      e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role };
    if (!isEdit && form.password) payload.password = form.password;
    if (isEdit && form.password) payload.password = form.password;
    onSave(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">Name *</label>
        <input className={inputCls} placeholder="e.g. Sarah Khan" value={form.name} onChange={set('name')} />
        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">Email *</label>
        <input className={inputCls} type="email" placeholder="agent@example.com" value={form.email} onChange={set('email')} />
        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">Phone</label>
        <input className={inputCls} placeholder="e.g. 0300-1234567" value={form.phone} onChange={set('phone')} />
      </div>
      <div>
        <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">Role *</label>
        <select 
          className={inputCls} 
          value={form.role} 
          onChange={set('role')}
          disabled={currentUser?.role !== 'super_admin'}
        >
          {currentUser?.role === 'super_admin' && (
            <>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
            </>
          )}
          <option value="executive">Executive</option>
        </select>
        {currentUser?.role !== 'super_admin' && (
          <p className="text-xs text-ink-tertiary mt-1">Admins can only create Executives.</p>
        )}
      </div>
      <div>
        <label className="text-xs font-semibold text-ink-tertiary uppercase tracking-wider">
          {isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
        </label>
        <input className={inputCls} type="password" placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          onClick={onCancel}
          className="btn"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1e2025', color: '#8b8fa8' }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn"
          style={{ background: 'rgba(92,107,192,0.15)', borderColor: 'rgba(92,107,192,0.4)', color: '#9fa8da' }}
        >
          {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Agent'}
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════
   AGENTS PAGE
════════════════════════════════════════════ */
const Agents = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [agents, setAgents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showAdd,    setShowAdd]    = useState(false);
  const [editAgent,  setEditAgent]  = useState(null); // agent object
  const [deleteAgent, setDeleteAgent] = useState(null); // agent object
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (user) fetchAgents();
  }, [user]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/users/agents-stats');
      if (res.data.success) setAgents(res.data.data);
    } catch {
      toast.error('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  /* ── Add ── */
  const handleAdd = async (payload) => {
    setSaving(true);
    try {
      const res = await axios.post('/api/users', payload);
      if (res.data.success) {
        toast.success(`Agent "${payload.name}" added!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        setShowAdd(false);
        fetchAgents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add agent');
    } finally {
      setSaving(false);
    }
  };

  /* ── Edit ── */
  const handleEdit = async (payload) => {
    setSaving(true);
    try {
      // Remove empty password from payload on edit 
      if (!payload.password) delete payload.password;
      const res = await axios.put(`/api/users/${editAgent.id}`, payload);
      if (res.data.success) {
        toast.success(`Agent "${payload.name}" updated!`, {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        setEditAgent(null);
        fetchAgents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await axios.delete(`/api/users/${deleteAgent.id}`);
      toast.success(`Agent "${deleteAgent.name}" removed.`, {
        style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
        iconTheme: { primary: '#f87171', secondary: '#111316' },
      });
      setDeleteAgent(null);
      fetchAgents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove agent');
    } finally {
      setSaving(false);
    }
  };

  const filteredAgents = agents.filter(
    (a) =>
      a.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-accent animate-spin" />
        <span className="text-xs text-ink-tertiary font-medium tracking-wider uppercase">
          Loading agents…
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ── Header ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1 bg-[#5c6bc0] rounded-full" />
            <span className="text-[#5c6bc0] font-black uppercase text-[10px] tracking-[0.4em]">
              Resource Management
            </span>
          </div>
          <h1 className="text-4xl font-black text-ink-primary tracking-tighter leading-none">
            Operational Agents
          </h1>
          <p className="text-ink-secondary font-medium text-base">
            Managing {agents.length} Field Consultant{agents.length !== 1 ? 's' : ''}.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative w-64 group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agents…"
              className="input pl-9 pr-4 py-2 text-sm w-full"
            />
          </div>
          {/* Add Agent button — admin only */}
          {isAdmin && (
            <button
              onClick={() => setShowAdd(true)}
              className="btn flex items-center gap-2"
              style={{
                background: 'rgba(92,107,192,0.15)',
                borderColor: 'rgba(92,107,192,0.4)',
                color: '#9fa8da',
                fontWeight: 600,
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Add Agent
            </button>
          )}
        </div>
      </div>

      {/* ── Agent Cards Grid ── */}
      {filteredAgents.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="p-8 rounded-2xl border border-surface-border bg-surface-raised">
            <UserGroupIcon className="h-16 w-16 text-ink-tertiary opacity-30" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">
            {searchQuery ? 'No agents match your search' : 'No agents found'}
          </p>
          {isAdmin && !searchQuery && (
            <button
              onClick={() => setShowAdd(true)}
              className="btn flex items-center gap-2 mt-2"
              style={{
                background: 'rgba(92,107,192,0.12)',
                borderColor: 'rgba(92,107,192,0.3)',
                color: '#9fa8da',
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Add your first agent
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="group overflow-hidden rounded-2xl border border-surface-border flex flex-col"
              style={{ background: '#111316', transition: 'border-color 0.2s', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(92,107,192,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
            >
              {/* ── Hero Banner ── */}
              <div
                className="relative h-28 flex-shrink-0 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(92,107,192,0.25) 0%, rgba(139,92,246,0.15) 50%, rgba(16,185,129,0.1) 100%)`,
                }}
              >
                {/* faint pattern */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
                  backgroundSize: '16px 16px',
                }} />
                {/* Decorative icon */}
                <IdentificationIcon className="absolute -right-4 -bottom-4 h-28 w-28 text-white opacity-[0.06]" />

                {/* Admin action buttons top-right */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <button
                      onClick={() => setEditAgent(agent)}
                      title="Edit agent"
                      className="h-7 w-7 rounded-lg flex items-center justify-center border transition-all"
                      style={{
                        background: 'rgba(16,18,22,0.7)',
                        borderColor: 'rgba(92,107,192,0.3)',
                        color: '#9fa8da',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteAgent(agent)}
                      title="Remove agent"
                      className="h-7 w-7 rounded-lg flex items-center justify-center border transition-all"
                      style={{
                        background: 'rgba(16,18,22,0.7)',
                        borderColor: 'rgba(239,68,68,0.25)',
                        color: '#f87171',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Avatar — straddling hero / body */}
                <div className="absolute -bottom-8 left-5">
                  <div
                    className="h-16 w-16 rounded-2xl overflow-hidden border-[3px] shadow-xl"
                    style={{ borderColor: '#111316', boxShadow: '0 0 0 2px rgba(92,107,192,0.5)' }}
                  >
                    <img
                      src={
                        agent.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name)}&background=1a1d2e&color=7986cb&bold=true&size=128`
                      }
                      alt={agent.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {/* Online dot */}
                  <div
                    className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 bg-emerald-400 animate-pulse"
                    style={{ borderColor: '#111316' }}
                  />
                </div>
              </div>

              {/* ── Identity block ── */}
              <div className="pt-10 px-5 pb-4 border-b border-surface-divide">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-ink-primary leading-tight tracking-tight">{agent.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: 'rgba(92,107,192,0.12)', color: '#9fa8da', border: '1px solid rgba(92,107,192,0.25)' }}
                      >
                        <CheckBadgeIcon className="w-3 h-3" />
                        {agent.role === 'super_admin' ? 'Super Admin' : agent.role === 'admin' ? 'Admin' : 'Executive'}
                      </span>
                    </div>
                  </div>
                  {/* Stat pills */}
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="text-center px-3 py-1.5 rounded-xl border border-surface-divide" style={{ background: 'rgba(92,107,192,0.06)' }}>
                      <div className="text-base font-black text-ink-primary">{agent.assignedLeadsCount}</div>
                      <div className="text-[9px] text-ink-tertiary font-semibold uppercase tracking-wider">Leads</div>
                    </div>
                    <div className="text-center px-3 py-1.5 rounded-xl border border-surface-divide" style={{ background: 'rgba(16,185,129,0.06)' }}>
                      <div className="text-base font-black text-emerald-400">{agent.closedDealsCount}</div>
                      <div className="text-[9px] text-ink-tertiary font-semibold uppercase tracking-wider">Deals</div>
                    </div>
                  </div>
                </div>

                {/* Contact row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                    <EnvelopeIcon className="h-3.5 w-3.5 text-[#7986cb] flex-shrink-0" />
                    <span className="truncate max-w-[160px]">{agent.email}</span>
                  </div>
                  {agent.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                      <PhoneIcon className="h-3.5 w-3.5 text-[#7986cb] flex-shrink-0" />
                      {agent.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Recent Leads ── */}
              <div className="px-5 py-4 flex-1">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">Recent Leads</span>
                  <span className="text-[10px] text-ink-tertiary">Last 5</span>
                </div>
                <div className="space-y-1.5">
                  {agent.assignedLeads && agent.assignedLeads.length > 0 ? (
                    agent.assignedLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="h-5 w-5 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-black"
                            style={{ background: 'rgba(92,107,192,0.15)', color: '#9fa8da' }}
                          >
                            {lead.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-ink-secondary truncate">{lead.name}</span>
                        </div>
                        <span className="chip chip-blue text-[9px] flex-shrink-0 ml-2">{lead.status}</span>
                      </div>
                    ))
                  ) : (
                    <div className="py-5 text-center rounded-xl border border-dashed border-surface-divide opacity-40">
                      <UserIcon className="h-5 w-5 text-ink-tertiary mx-auto mb-1" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-ink-tertiary">
                        No Active Assignments
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Agent Modal ── */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Agent/User">
        <AgentForm 
          onSave={handleAdd} 
          onCancel={() => setShowAdd(false)} 
          loading={saving} 
          currentUser={user}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editAgent} onClose={() => setEditAgent(null)} title="Edit Agent/User">
        <AgentForm 
          initial={editAgent} 
          onSave={handleEdit} 
          onCancel={() => setEditAgent(null)} 
          loading={saving} 
          currentUser={user}
        />
      </Modal>

      {/* ── Confirm Delete Modal ── */}
      <Modal isOpen={!!deleteAgent} onClose={() => setDeleteAgent(null)} title="Remove Agent">
        <ConfirmDelete
          agent={deleteAgent}
          onConfirm={handleDelete}
          onCancel={() => setDeleteAgent(null)}
          loading={saving}
        />
      </Modal>
    </div>
  );
};

export default Agents;
