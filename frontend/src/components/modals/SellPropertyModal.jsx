import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { XMarkIcon, CurrencyDollarIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SellPropertyModal = ({ isOpen, onClose, property, onSold, onOpenAddClient }) => {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  
  // Existing Client Selection
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Payment Form
  const [paidAmount, setPaidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      setSelectedClientId('');
      setPaidAmount('');
    }
  }, [isOpen]);

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      const res = await axios.get('/api/clients');
      if (res.data.success) {
        setClients(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSell = async () => {
    if (!paidAmount || isNaN(paidAmount)) {
      toast.error('Please enter a valid paid amount');
      return;
    }

    try {
      setSubmitting(true);
      const clientId = selectedClientId;

      if (!clientId) {
        toast.error('Please select a client');
        setSubmitting(false);
        return;
      }

      // Record Sale
      const res = await axios.post(`/api/clients/${clientId}/sell`, {
        propertyId: property.id,
        paidAmount: Number(paidAmount)
      });

      if (res.data.success) {
        toast.success(`Property successfully sold!`);
        onSold();
        onClose();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to complete sale');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-3xl border border-surface-border flex flex-col max-h-[90vh]" style={{ background: '#0f1520', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Sell Property</h2>
            <p className="text-sm text-ink-secondary mt-1">Assign {property.title} to a client</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Property Summary */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Selling</div>
            <div className="font-bold text-white text-lg">{property.title}</div>
            <div className="text-sm text-ink-secondary mt-1">Total Price: <span className="font-bold text-white">Rs. {Number(property.price).toLocaleString()}</span></div>
          </div>

          {/* Client Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">Select Client</label>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  onOpenAddClient(property.unitNumber || property.title);
                }} 
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <UserPlusIcon className="w-3 h-3"/> Add New Client (Full Form)
              </button>
            </div>

            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-raised text-white text-sm px-4 py-3 focus:outline-none focus:border-emerald-500/50 appearance-none"
            >
              <option value="">-- Select a Client --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
            {loadingClients && <div className="text-xs text-ink-tertiary mt-1 text-right">Loading clients...</div>}
          </div>

          {/* Payment */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Initial Paid Amount (Rs.)</label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
              <input
                type="number"
                placeholder="0"
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="input pl-10 pr-4 py-3 text-sm w-full font-bold text-emerald-400"
              />
            </div>
            {paidAmount && !isNaN(paidAmount) && (
              <div className="text-xs text-ink-secondary mt-1">
                Remaining Balance: Rs. {(Number(property.price) - Number(paidAmount)).toLocaleString()}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-border bg-surface-base/50 flex justify-end gap-3 rounded-b-3xl">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button 
            onClick={handleSell} 
            disabled={submitting}
            className="btn-primary"
            style={{ background: '#10b981', borderColor: '#059669' }}
          >
            {submitting ? 'Processing...' : 'Confirm Sale'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default SellPropertyModal;
