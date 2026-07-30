import React, { useState } from 'react';
import axios from 'axios';
import { PencilSquareIcon, CheckIcon, XMarkIcon, DocumentArrowDownIcon, ClockIcon, PaperAirplaneIcon, ArrowUpTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

const formatNum = (num) => {
  if (num === null || num === undefined || isNaN(num) || num === 0 || num === '0') return '-';
  return Number(num).toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const InstallmentPlanSheet = ({ client, onUpdate }) => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(false);
  const { canDirectEditInstallments, isExecutive } = useAuth();

  const canDirectEdit = canDirectEditInstallments();
  const executive = isExecutive();

  const schedule = client.installmentSchedule || [];

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditForm({
      surcharges: row.surcharges || '',
      adjustment: row.adjustment || '',
      transactionRef: row.transactionRef || '',
      paidDate: row.paidDate ? new Date(row.paidDate).toISOString().split('T')[0] : '',
      payment: row.payment || ''
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (installmentId) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/clients/${client.id}/installments/${installmentId}`, {
        surcharges: editForm.surcharges || 0,
        adjustment: editForm.adjustment || 0,
        transactionRef: editForm.transactionRef,
        paidDate: editForm.paidDate,
        payment: editForm.payment || 0
      });

      if (res.data.success) {
        if (res.data.requestPending) {
          // Executive — request submitted
          toast.success('✅ Request submitted! Admin will review your changes.', { duration: 5000 });
          setEditingId(null);
        } else {
          // Admin/Super Admin — direct update
          toast.success('Installment updated successfully');
          setEditingId(null);
          if (onUpdate) onUpdate(res.data.data);
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update installment');
    } finally {
      setLoading(false);
    }
  };

  let currentBalance = 0;
  
  let sumDownPayment = 0;
  let sumInstallments = 0;
  let sumPayments = 0;
  let sumSurcharges = 0;
  let sumAdjustments = 0;

  // Initialize remaining property balance
  let propertyBalance = parseFloat(String(client.netPrice || client.totalPrice || '0').replace(/[^0-9.]/g, '')) || 0;

  const handleUploadReceipt = async (installmentId, file) => {
    if (!file) return;
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('receipt', file);
      
      const res = await axios.post(`/api/clients/${client.id}/installments/${installmentId}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Receipt uploaded successfully!');
        if (onUpdate) {
          // Instead of fetching full client, we can simulate by updating just this row in the UI if needed,
          // but calling onUpdate without args might trigger a refetch if implemented that way.
          onUpdate(); 
        }
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to upload receipt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0f18] rounded-[24px] border border-surface-border/60 shadow-2xl overflow-hidden relative">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      
      {/* Header Area */}
      <div className="px-8 py-6 border-b border-surface-border/50 flex items-center justify-between bg-surface-base/50 relative z-10">
        <div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            <DocumentArrowDownIcon className="w-5 h-5 text-emerald-400" />
            Installment Ledger
          </h3>
          <p className="text-xs font-medium text-ink-secondary mt-1">
            {canDirectEdit
              ? 'Manage and track client payments, surcharges, and adjustments.'
              : 'View installment schedule. Submit change requests for admin approval.'}
          </p>
        </div>

        {/* Executive notice banner */}
        {executive && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#fb923c' }}
          >
            <ClockIcon className="w-4 h-4" />
            Changes require admin approval
          </div>
        )}
      </div>

      <div className="overflow-x-auto relative z-10" style={{ scrollbarWidth: 'thin' }}>
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-surface-raised/30 border-b border-surface-border/40">
              <th className="py-3 px-3 text-[10px] font-black text-ink-tertiary uppercase tracking-wider whitespace-nowrap">Month</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap">Down Payment</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap">Installment</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap text-red-400/70">Surcharges</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap text-blue-400/70">Adjustment</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap text-emerald-400/70">Payment</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-center whitespace-nowrap">Paid Date</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-center whitespace-nowrap">Transaction Ref</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap text-white">Due Amount</th>
              <th className="py-3 px-2 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-right whitespace-nowrap">Balance</th>
              <th className="py-3 px-3 text-[10px] font-black text-ink-tertiary uppercase tracking-wider text-center whitespace-nowrap bg-[#0a0f18]/90 backdrop-blur-sm border-l border-surface-border/50">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/30">
            {schedule.map((row) => {
              const isEditing = editingId === row.id;

              const downPayment = parseFloat(row.downPayment) || 0;
              const installment = parseFloat(row.installment) || 0;
              const possessionPayment = parseFloat(row.possessionPayment) || 0;
              const surcharges = isEditing ? parseFloat(editForm.surcharges) || 0 : parseFloat(row.surcharges) || 0;
              const adjustment = isEditing ? parseFloat(editForm.adjustment) || 0 : parseFloat(row.adjustment) || 0;
              const payment = isEditing ? parseFloat(editForm.payment) || 0 : parseFloat(row.payment) || 0;

              const dueAmount = downPayment + installment + possessionPayment + surcharges - adjustment;
              currentBalance = currentBalance + dueAmount - payment;
              propertyBalance = propertyBalance - payment;

              sumDownPayment += downPayment;
              sumInstallments += installment;
              sumPayments += payment;
              sumSurcharges += parseFloat(row.surcharges) || 0;
              sumAdjustments += parseFloat(row.adjustment) || 0;

              const rowBg = isEditing
                ? executive ? 'bg-orange-500/5' : 'bg-emerald-500/5'
                : 'hover:bg-surface-raised/40 transition-colors';

              const editColor = executive ? 'orange' : 'emerald';

              return (
                <tr key={row.id} className={`${rowBg} group`}>
                  <td className="py-2.5 px-3 text-[12px] font-bold text-white whitespace-nowrap border-r border-surface-border/20">
                    {row.isPossession ? <span className="text-emerald-400">Possession</span> : row.monthDate ? format(new Date(row.monthDate), 'MMM yyyy') : '-'}
                  </td>
                  <td className="py-2.5 px-2 text-right text-[12px] font-medium text-ink-secondary">{formatNum(downPayment)}</td>
                  <td className="py-2.5 px-2 text-right text-[12px] font-medium text-ink-secondary">{formatNum(row.isPossession ? possessionPayment : installment)}</td>
                  
                  {isEditing ? (
                    <>
                      <td className="py-1.5 px-1"><input type="number" placeholder="0" className="w-full bg-[#0f1520]/80 border border-orange-500/30 rounded-lg px-2 py-1 text-right text-[12px] font-bold text-white focus:outline-none focus:border-orange-500 transition-all" value={editForm.surcharges} onChange={e => setEditForm({...editForm, surcharges: e.target.value})} /></td>
                      <td className="py-1.5 px-1"><input type="number" placeholder="0" className="w-full bg-[#0f1520]/80 border border-orange-500/30 rounded-lg px-2 py-1 text-right text-[12px] font-bold text-white focus:outline-none focus:border-orange-500 transition-all" value={editForm.adjustment} onChange={e => setEditForm({...editForm, adjustment: e.target.value})} /></td>
                      <td className="py-1.5 px-1"><input type="number" placeholder="0" className="w-full bg-[#0f1520]/80 border border-orange-500/30 rounded-lg px-2 py-1 text-right text-[12px] font-bold text-white focus:outline-none focus:border-orange-500 transition-all" value={editForm.payment} onChange={e => setEditForm({...editForm, payment: e.target.value})} /></td>
                      <td className="py-1.5 px-1"><input type="date" className="w-full bg-[#0f1520]/80 border border-orange-500/30 rounded-lg px-2 py-1 text-center text-[12px] font-bold text-white focus:outline-none focus:border-orange-500 transition-all" value={editForm.paidDate} onChange={e => setEditForm({...editForm, paidDate: e.target.value})} /></td>
                      <td className="py-1.5 px-1"><input type="text" placeholder="Ref #" className="w-full bg-[#0f1520]/80 border border-orange-500/30 rounded-lg px-2 py-1 text-center text-[12px] font-bold text-white focus:outline-none focus:border-orange-500 transition-all" value={editForm.transactionRef} onChange={e => setEditForm({...editForm, transactionRef: e.target.value})} /></td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-2 text-right text-[12px] font-bold text-red-400/80">{formatNum(row.surcharges)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] font-bold text-blue-400/80">{formatNum(row.adjustment)}</td>
                      <td className="py-2.5 px-2 text-right text-[12px] font-black text-emerald-400 bg-emerald-500/[0.04] border-l border-r border-emerald-500/10">{formatNum(row.payment)}</td>
                      <td className="py-2.5 px-2 text-center text-[11px] font-medium text-ink-secondary">{row.paidDate ? format(new Date(row.paidDate), 'dd-MMM-yy') : '-'}</td>
                      <td className="py-2.5 px-2 text-center text-[11px] font-medium text-ink-secondary">{row.transactionRef || '-'}</td>
                    </>
                  )}

                  <td className={`py-2.5 px-2 text-right text-[12px] font-black ${currentBalance < 0 ? 'text-emerald-400' : currentBalance > 0 ? 'text-orange-400' : 'text-white border-l border-surface-border/20 bg-surface-base/30'}`}>
                    {formatNum(Math.abs(currentBalance))}
                    {currentBalance < 0 && <span className="text-[9px] ml-0.5 text-emerald-500/70">(Adv)</span>}
                  </td>
                  
                  <td className="py-2.5 px-2 text-right text-[12px] font-black text-white/90">
                    {formatNum(propertyBalance)}
                  </td>

                  <td className="py-2.5 px-3 text-center bg-[#0a0f18]/90 group-hover:bg-[#131b28]/90 backdrop-blur-sm border-l border-surface-border/50 transition-colors">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSave(row.id)}
                          disabled={loading}
                          className="flex items-center gap-1.5 px-3 h-8 rounded-xl font-bold text-white shadow-lg transition-all text-[12px]"
                          style={{
                            background: executive ? '#f97316' : '#10b981',
                            boxShadow: executive ? '0 4px 12px rgba(249,115,22,0.3)' : '0 4px 12px rgba(16,185,129,0.3)',
                          }}
                        >
                          {executive ? (
                            <><PaperAirplaneIcon className="w-3.5 h-3.5" /> Send</>
                          ) : (
                            <><CheckIcon className="w-4 h-4" /> Save</>
                          )}
                        </button>
                        <button onClick={handleCancel} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-raised hover:bg-red-500/20 text-ink-secondary hover:text-red-400 transition-all">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 justify-center">
                        <button
                          onClick={() => handleEdit(row)}
                          className="flex items-center gap-1.5 px-2 h-7 rounded-lg text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          style={{
                            background: executive ? 'rgba(249,115,22,0.12)' : 'rgba(255,255,255,0.07)',
                            border: executive ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.12)',
                            color: executive ? '#fb923c' : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          <PencilSquareIcon className="w-3.5 h-3.5" />
                          {executive ? 'Req' : 'Edit'}
                        </button>

                        {row.receiptUrl ? (
                          <a
                            href={row.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2 h-7 rounded-lg text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#34d399' }}
                            title="View Receipt"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <label className="flex items-center gap-1.5 px-2 h-7 rounded-lg text-[10px] font-bold transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                 style={{ background: 'rgba(92,107,192,0.15)', border: '1px solid rgba(92,107,192,0.3)', color: '#9fa8da' }}>
                            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                            Upload
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*,.pdf"
                              onChange={(e) => handleUploadReceipt(row.id, e.target.files[0])}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {schedule.length === 0 && (
              <tr>
                <td colSpan="11" className="py-16 text-center">
                  <div className="inline-flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-surface-raised/50 flex items-center justify-center mb-4">
                      <DocumentArrowDownIcon className="w-8 h-8 text-ink-tertiary" />
                    </div>
                    <h3 className="text-white font-bold mb-1">No Installment Plan Found</h3>
                    <p className="text-sm text-ink-secondary">This client does not have a generated payment schedule.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
          {schedule.length > 0 && (
            <tfoot className="bg-[#0f1520] relative z-10">
              <tr>
                <td colSpan="11" className="p-0 border-t-2 border-surface-border/80">
                  <div className="flex flex-wrap items-center justify-between p-6 gap-6">
                    
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-1">Total Due</div>
                        <div className="text-xl font-black text-white">
                          <span className="text-sm text-ink-tertiary mr-1">Rs.</span>{formatNum(sumDownPayment + sumInstallments + sumSurcharges - sumAdjustments)}
                        </div>
                      </div>
                      <div className="w-px h-8 bg-surface-border"></div>
                      <div>
                        <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-1">Total Paid</div>
                        <div className="text-xl font-black text-emerald-400">
                          <span className="text-sm text-emerald-500/50 mr-1">Rs.</span>{formatNum(sumPayments)}
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-base border border-surface-border rounded-2xl px-6 py-4 flex items-center gap-6 shadow-xl">
                      <div>
                        <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-1 text-right">Remaining Balance</div>
                        <div className="text-3xl font-black tracking-tight text-white">
                          <span className="text-base font-bold opacity-50 mr-1.5">Rs.</span>{formatNum(propertyBalance)}
                        </div>
                      </div>
                    </div>

                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default InstallmentPlanSheet;
