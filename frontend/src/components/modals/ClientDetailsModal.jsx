import React, { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon, MapPinIcon, PhoneIcon, EnvelopeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import InstallmentPlanSheet from '../InstallmentPlanSheet';

const ClientDetailsModal = ({ isOpen, onClose, client: initialClient, onEdit, onDelete }) => {
  const [client, setClient] = useState(initialClient);

  useEffect(() => {
    setClient(initialClient);
  }, [initialClient]);

  if (!isOpen || !client) return null;

  const schedule = client.installmentSchedule || [];
  let sumDownPayment = 0;
  let sumInstallments = 0;
  let sumPayments = 0;
  let sumSurcharges = 0;
  let sumAdjustments = 0;

  schedule.forEach(row => {
    sumDownPayment += parseFloat(row.downPayment) || 0;
    sumInstallments += parseFloat(row.installment) || 0;
    sumPayments += parseFloat(row.payment) || 0;
    sumSurcharges += parseFloat(row.surcharges) || 0;
    sumAdjustments += parseFloat(row.adjustment) || 0;
  });

  const totalDue = sumDownPayment + sumInstallments + sumSurcharges - sumAdjustments;
  // Calculate remaining balance dynamically from the total property price minus what's actually paid
  const remainingBalance = (parseFloat(String(client.netPrice).replace(/[^0-9.]/g, '')) || 0) - sumPayments;

  const formatNum = (num) => Number(num || 0).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-[99vw] rounded-2xl border border-surface-border flex flex-col h-[98vh] max-h-[98vh]" style={{ background: '#0f1520', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              {client.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">{client.name}</h2>
              <div className="flex items-center gap-3 text-sm text-ink-secondary mt-1">
                {client.phone && <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4"/> {client.phone}</span>}
                {client.email && <span className="flex items-center gap-1"><EnvelopeIcon className="w-4 h-4"/> {client.email}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onEdit(client)}
              className="px-4 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all"
              style={{ background: '#3b82f6', border: '1px solid #2563eb' }}
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={() => onDelete && onDelete(client.id)}
              className="px-4 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all hover:bg-red-500/20"
              style={{ background: '#ef4444', border: '1px solid #dc2626' }}
            >
              <TrashIcon className="w-4 h-4" />
              Delete
            </button>
            <button onClick={onClose} className="p-2 rounded-xl text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-8" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Booking Info & Payment Overview (Merged Table Style) */}
          <div className="bg-surface-base/40 p-6 rounded-2xl border border-surface-border/50 shadow-lg relative overflow-hidden max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <h2 className="text-center text-lg font-black text-white uppercase tracking-widest mb-6 relative z-10">
              {client.type || 'Property Details'}
            </h2>
            
            <div className="relative z-10 rounded-xl border border-surface-border/50 overflow-hidden">
              <table className="w-full text-left">
                <tbody className="divide-y divide-surface-border/30">
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30 w-1/2">Owner Name:</td>
                    <td className="p-4 text-[14px] font-bold text-white text-center w-1/2">{client.name || '-'}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">
                      {client.type?.toLowerCase().includes('shop') ? 'Shop No:' : client.type?.toLowerCase().includes('apartment') || client.type?.toLowerCase().includes('flat') ? 'Flat No:' : 'Unit No:'}
                    </td>
                    <td className="p-4 text-[14px] font-black text-white text-center">{client.unitNo || '-'}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">25% Down Payment:</td>
                    <td className="p-4 text-[14px] font-bold text-white text-center">{formatNum(client.downPayment)}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">20% Possesion Payment:</td>
                    <td className="p-4 text-[14px] font-bold text-white text-center">{formatNum(client.possessionPayment)}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">{client.installmentsCount || '24 Months'} Installment:</td>
                    <td className="p-4 text-[14px] font-bold text-white text-center">{formatNum(sumInstallments)}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">Total Payment:</td>
                    <td className="p-4 text-[14px] font-black text-emerald-400 text-center">{formatNum(client.netPrice)}</td>
                  </tr>
                  <tr className="bg-surface-raised/10 hover:bg-surface-raised/30 transition-colors">
                    <td className="p-4 text-[12px] font-black text-ink-tertiary uppercase tracking-wider border-r border-surface-border/30">Remaining Payment:</td>
                    <td className="p-4 text-[14px] font-black text-red-400 text-center">{formatNum(remainingBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Installment Plan Sheet */}
          <section className="relative z-20">
            <InstallmentPlanSheet client={client} onUpdate={(updated) => setClient(updated)} />
          </section>

          {/* Client Info */}
          <section className="bg-surface-base/30 p-6 rounded-2xl border border-surface-border/40">
            <h3 className="text-xs font-black text-ink-tertiary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink-tertiary"></span> Client Information
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-6">
              <div>
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Father's/Husband's Name</div>
                <div className="text-[14px] font-bold text-white">{client.fatherOrHusbandName || '-'}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">CNIC Number</div>
                <div className="text-[14px] font-bold text-white tracking-widest">{client.cnic || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Present Address</div>
                <div className="text-[14px] font-medium text-ink-primary">{client.presentAddress || '-'}</div>
              </div>
              <div className="col-span-2">
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Permanent Address</div>
                <div className="text-[14px] font-medium text-ink-primary">{client.permanentAddress || '-'}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Residential Tel</div>
                <div className="text-[14px] font-medium text-white">{client.residentialTel || '-'}</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider mb-1">Mobile No</div>
                <div className="text-[14px] font-medium text-white">{client.mobileNo || '-'}</div>
              </div>
            </div>
          </section>

          {/* Nominees */}
          <section>
            <h3 className="text-xs font-black text-ink-tertiary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-ink-tertiary"></span> Nominees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nominee 1 */}
              <div className="bg-[#0f1520] p-5 rounded-xl border border-surface-border/50 shadow-inner">
                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Nominee 1</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Name</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee1Name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Relation</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee1Relation || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">CNIC</span>
                    <span className="text-[14px] font-bold text-white tracking-widest">{client.nominee1Cnic || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Mobile</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee1Mobile || '-'}</span>
                  </div>
                </div>
              </div>
              {/* Nominee 2 */}
              <div className="bg-[#0f1520] p-5 rounded-xl border border-surface-border/50 shadow-inner">
                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Nominee 2</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Name</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee2Name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Relation</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee2Relation || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-surface-border/30 pb-2">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">CNIC</span>
                    <span className="text-[14px] font-bold text-white tracking-widest">{client.nominee2Cnic || '-'}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Mobile</span>
                    <span className="text-[14px] font-bold text-white">{client.nominee2Mobile || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default ClientDetailsModal;
