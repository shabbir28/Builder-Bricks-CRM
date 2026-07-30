import React, { useState } from 'react';
import { CreditCardIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PaymentPlans = () => {
  const [formData, setFormData] = useState({
    totalPrice: '',
    discount: '',
    netPrice: '',
    downPayment: '',
    possessionPayment: '',
    installmentsCount: '24 Months',
    perMonthInstallment: '',
    month: '',
    otherCharges: 'Nill',
    location: 'Elite One Tower, Plot 30, Block A, Faisal Margalla city, Islamabad',
    paymentDate: '',
    witness1Name: '',
    witness1Relation: '',
    witness1Cnic: '',
    witness1Date: '',
    witness2Name: '',
    witness2Relation: '',
    witness2Cnic: '',
    witness2Date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Mock submission since backend API is not explicitly defined yet
    setTimeout(() => {
      toast.success('Payment Plan submitted successfully!');
      setSubmitting(false);
      setFormData({
        totalPrice: '', discount: '', netPrice: '', downPayment: '', possessionPayment: '', installmentsCount: '24 Months', perMonthInstallment: '', month: '', otherCharges: 'Nill', location: 'Elite One Tower, Plot 30, Block A, Faisal Margalla city, Islamabad', paymentDate: '', witness1Name: '', witness1Relation: '', witness1Cnic: '', witness1Date: '', witness2Name: '', witness2Relation: '', witness2Cnic: '', witness2Date: ''
      });
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto rounded-3xl border border-surface-border bg-surface-base shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-surface-border bg-surface-base/50">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <CreditCardIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">PAYMENT PLAN</h2>
          <p className="text-sm text-ink-secondary mt-0.5">Create a new standalone payment plan</p>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <form id="payment-plan-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Total Price of Unit:</label>
              <input type="text" value={formData.totalPrice} onChange={e => setFormData({...formData, totalPrice: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Discount (if any):</label>
              <input type="text" value={formData.discount} onChange={e => setFormData({...formData, discount: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Net Price of Unit:</label>
              <input type="text" value={formData.netPrice} onChange={e => setFormData({...formData, netPrice: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Down Payment 25% (On Booking):</label>
              <input type="text" value={formData.downPayment} onChange={e => setFormData({...formData, downPayment: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Possession Payment 25%:</label>
              <input type="text" value={formData.possessionPayment} onChange={e => setFormData({...formData, possessionPayment: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Total No. of Monthly Installments:</label>
              <input type="text" value={formData.installmentsCount} onChange={e => setFormData({...formData, installmentsCount: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Per Month Installment:</label>
              <input type="text" value={formData.perMonthInstallment} onChange={e => setFormData({...formData, perMonthInstallment: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Month:</label>
              <input type="text" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Other Charges:</label>
              <input type="text" value={formData.otherCharges} onChange={e => setFormData({...formData, otherCharges: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Location:</label>
              <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-64 text-sm font-bold text-ink-tertiary tracking-wide">Date:</label>
              <input type="date" value={formData.paymentDate} onChange={e => setFormData({...formData, paymentDate: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
            </div>

            <div className="mt-8 pt-6 border-t border-surface-border">
              <p className="text-sm font-bold text-ink-tertiary mb-6">Please ensure following documents are attached with Booking Form:<br/>
              1. Photocopy of CNIC of the Purchaser(s)<br/>
              2. Photocopy of CNIC of the Joint Purchaser(s) (if applicable)<br/>
              3. Copy of Payment Plan.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Witness I */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">On behalf of Builder Bricks Marketing & Developers,<br/>Witness I</h4>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">Name:</label>
                    <input type="text" value={formData.witness1Name} onChange={e => setFormData({...formData, witness1Name: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">S/O / D/O / W/O:</label>
                    <input type="text" value={formData.witness1Relation} onChange={e => setFormData({...formData, witness1Relation: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">CNIC Number:</label>
                    <input type="text" value={formData.witness1Cnic} onChange={e => setFormData({...formData, witness1Cnic: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">Date:</label>
                    <input type="date" value={formData.witness1Date} onChange={e => setFormData({...formData, witness1Date: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>
                {/* Witness II */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Signature and Thumb Impression<br/>of Purchaser(s):<br/>Witness II</h4>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">Name:</label>
                    <input type="text" value={formData.witness2Name} onChange={e => setFormData({...formData, witness2Name: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">S/O / D/O / W/O:</label>
                    <input type="text" value={formData.witness2Relation} onChange={e => setFormData({...formData, witness2Relation: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">CNIC Number:</label>
                    <input type="text" value={formData.witness2Cnic} onChange={e => setFormData({...formData, witness2Cnic: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="w-32 text-sm font-bold text-ink-tertiary">Date:</label>
                    <input type="date" value={formData.witness2Date} onChange={e => setFormData({...formData, witness2Date: e.target.value})} className="flex-1 rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-blue-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-surface-border bg-surface-base/50 flex justify-end">
        <button 
          type="submit"
          form="payment-plan-form"
          disabled={submitting}
          className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg shadow-blue-500/20 w-full md:w-auto"
          style={{ background: '#3b82f6', border: '1px solid #2563eb' }}
        >
          {submitting ? 'Saving...' : 'Submit Payment Plan'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPlans;
