import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ClockIcon, CheckCircleIcon, XCircleIcon,
  UserIcon, CalendarIcon, DocumentTextIcon,
  FunnelIcon, ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const StatusBadge = ({ status }) => {
  const cfg = {
    pending:  { label: 'Pending',  bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.35)', color: '#fb923c', Icon: ClockIcon },
    approved: { label: 'Approved', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  color: '#34d399', Icon: CheckCircleIcon },
    rejected: { label: 'Rejected', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171', Icon: XCircleIcon },
  }[status] || {};
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.Icon && <cfg.Icon className="w-3.5 h-3.5" />}
      {cfg.label}
    </div>
  );
};

const FieldDiff = ({ label, original, proposed }) => {
  const changed = String(original ?? '') !== String(proposed ?? '');
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.15em]">{label}</span>
      <div className="flex items-center gap-2 flex-wrap">
        {changed ? (
          <>
            <span className="text-[12px] font-medium text-ink-tertiary line-through">{original || '—'}</span>
            <span className="text-[12px]">→</span>
            <span className="text-[13px] font-black text-white bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-lg">{proposed || '—'}</span>
          </>
        ) : (
          <span className="text-[13px] font-medium text-ink-secondary">{proposed || '—'}</span>
        )}
      </div>
    </div>
  );
};

const InstallmentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewNote, setReviewNote] = useState({});
  const [processing, setProcessing] = useState(null);
  const { isAdmin } = useAuth();

  // Guard: only admin/super_admin
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/installment-requests${filter !== 'all' ? `?status=${filter}` : ''}`);
      if (res.data.success) setRequests(res.data.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      setProcessing(id + '_approve');
      await axios.put(`/api/installment-requests/${id}/approve`, { reviewNote: reviewNote[id] || '' });
      toast.success('✅ Request approved! Installment updated.');
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    if (!reviewNote[id]?.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    try {
      setProcessing(id + '_reject');
      await axios.put(`/api/installment-requests/${id}/reject`, { reviewNote: reviewNote[id] });
      toast.success('Request rejected');
      fetchRequests();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  const filterOptions = [
    { value: 'pending',  label: 'Pending',  color: '#f97316' },
    { value: 'approved', label: 'Approved', color: '#10b981' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444' },
    { value: 'all',      label: 'All',      color: '#9ca3af' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Installment Requests</h1>
          </div>
          <p className="text-sm text-ink-secondary font-medium">
            Review and approve installment change requests from executives
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl border border-surface-border" style={{ background: '#0f1520', width: 'fit-content' }}>
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className="px-4 py-2 rounded-xl font-bold text-sm transition-all"
            style={{
              background: filter === opt.value ? `${opt.color}20` : 'transparent',
              border: filter === opt.value ? `1px solid ${opt.color}40` : '1px solid transparent',
              color: filter === opt.value ? opt.color : 'rgba(255,255,255,0.35)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-surface-border" style={{ background: '#0b0f16' }}>
          <ClockIcon className="w-12 h-12 text-ink-tertiary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white">No {filter !== 'all' ? filter : ''} requests</h3>
          <p className="text-sm text-ink-secondary mt-1">
            {filter === 'pending' ? 'All caught up! No pending requests.' : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const orig = req.originalValues || {};
            const chng = req.changes || {};
            const isApprovePending = processing === req.id + '_approve';
            const isRejectPending = processing === req.id + '_reject';

            return (
              <div
                key={req.id}
                className="rounded-[20px] border border-surface-border overflow-hidden"
                style={{ background: '#0f1520' }}
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-surface-border/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <span className="text-sm font-black text-orange-400">
                        {req.requester?.name?.charAt(0) || 'E'}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{req.requester?.name || 'Executive'}</div>
                      <div className="text-xs text-ink-secondary mt-0.5">{req.requester?.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={req.status} />
                    <div className="text-xs text-ink-tertiary font-medium">
                      {req.createdAt ? format(new Date(req.createdAt), 'dd MMM yyyy, hh:mm a') : ''}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Client + Installment Info */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-surface-border/40" style={{ background: '#0a0f18' }}>
                      <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-3">Client</div>
                      <div className="text-base font-black text-white">{req.client?.name || '-'}</div>
                      <div className="text-xs text-ink-secondary mt-1">
                        Unit: {req.client?.unitNo || '-'} • Ref: {req.client?.bookingReferenceNo || '-'}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-surface-border/40" style={{ background: '#0a0f18' }}>
                      <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-3">Installment #{req.installmentId}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <FieldDiff label="Surcharges" original={orig.surcharges} proposed={chng.surcharges} />
                        <FieldDiff label="Adjustment" original={orig.adjustment} proposed={chng.adjustment} />
                        <FieldDiff label="Payment" original={orig.payment} proposed={chng.payment} />
                        <FieldDiff label="Paid Date" original={orig.paidDate} proposed={chng.paidDate} />
                        <FieldDiff label="Trans. Ref" original={orig.transactionRef} proposed={chng.transactionRef} />
                      </div>
                    </div>
                  </div>

                  {/* Right: Review Section */}
                  <div className="flex flex-col justify-between gap-4">
                    {req.status === 'pending' ? (
                      <>
                        <div>
                          <label className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-2 block">
                            Review Note <span className="text-red-400/60 normal-case tracking-normal font-medium">(required for rejection)</span>
                          </label>
                          <textarea
                            value={reviewNote[req.id] || ''}
                            onChange={e => setReviewNote(prev => ({ ...prev, [req.id]: e.target.value }))}
                            placeholder="Add a note for the executive (optional for approval, required for rejection)..."
                            rows={4}
                            className="w-full rounded-xl border border-surface-border bg-surface-base text-ink-primary text-sm px-4 py-3 focus:outline-none focus:border-orange-500/50 resize-none"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={isApprovePending || isRejectPending}
                            className="flex-1 py-3 rounded-xl font-black text-sm text-white transition-all flex items-center justify-center gap-2"
                            style={{ background: '#10b981', border: '1px solid #059669', opacity: isApprovePending ? 0.7 : 1 }}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            {isApprovePending ? 'Approving...' : 'Approve & Apply'}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={isApprovePending || isRejectPending}
                            className="flex-1 py-3 rounded-xl font-black text-sm text-white transition-all flex items-center justify-center gap-2"
                            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171', opacity: isRejectPending ? 0.7 : 1 }}
                          >
                            <XCircleIcon className="w-4 h-4" />
                            {isRejectPending ? 'Rejecting...' : 'Reject'}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 rounded-xl border border-surface-border/40 flex-1" style={{ background: '#0a0f18' }}>
                        <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-3">Review Decision</div>
                        <div className="flex items-center gap-2 mb-2">
                          <StatusBadge status={req.status} />
                          <span className="text-xs text-ink-secondary">by {req.reviewer?.name || 'Admin'}</span>
                        </div>
                        {req.reviewedAt && (
                          <div className="text-xs text-ink-tertiary mb-3">
                            {format(new Date(req.reviewedAt), 'dd MMM yyyy, hh:mm a')}
                          </div>
                        )}
                        {req.reviewNote && (
                          <div className="text-sm text-ink-secondary italic bg-surface-base border border-surface-border rounded-xl px-3 py-2">
                            "{req.reviewNote}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InstallmentRequests;
