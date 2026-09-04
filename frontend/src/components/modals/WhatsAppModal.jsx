import React, { useState, useEffect } from 'react';
import { XMarkIcon, DocumentDuplicateIcon, CheckIcon, PhoneIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  OFFICIAL_SENDER_NUMBER, 
  formatWhatsAppNumber, 
  createWhatsAppUrl,
  openWhatsApp 
} from '../../utils/whatsapp';

export const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const WhatsAppModal = ({ isOpen, onClose, client, initialMessage = '', phone: initialPhone = '' }) => {
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaultPhone = initialPhone || client?.mobileNo || client?.phone || client?.residentialTel || OFFICIAL_SENDER_NUMBER;
      setRecipientPhone(defaultPhone);
      setMessage(initialMessage);
      setCopied(false);
    }
  }, [isOpen, initialPhone, client, initialMessage]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success('Receipt message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!recipientPhone.trim()) {
      toast.error('Please enter recipient phone number');
      return;
    }
    // Auto-save phone to client profile if it was missing or updated
    if (client?.id && recipientPhone.trim() !== (client?.mobileNo || client?.phone)) {
      try {
        await axios.put(`/api/clients/${client.id}`, { mobileNo: recipientPhone.trim() });
      } catch (err) {
        console.warn('Could not auto-save client phone', err);
      }
    }
    openWhatsApp(recipientPhone, message);
    toast.success('WhatsApp opened! Click Send in WhatsApp to deliver.');
    onClose();
  };

  const formattedFormatted = formatWhatsAppNumber(recipientPhone);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg rounded-2xl border border-surface-border flex flex-col max-h-[90vh]" style={{ background: '#0e131b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                Elite One WhatsApp Receipt
              </h3>
              <p className="text-xs text-ink-secondary">Automated installment confirmation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Sender & Recipient Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121824] border border-emerald-500/20 rounded-xl p-3">
              <div className="text-[10px] font-black text-emerald-400/80 uppercase tracking-wider mb-1 flex items-center gap-1">
                <WhatsAppIcon className="w-3.5 h-3.5" /> Sender Number
              </div>
              <div className="text-xs font-black text-emerald-400 tracking-wide">
                {OFFICIAL_SENDER_NUMBER}
              </div>
              <div className="text-[10px] text-ink-tertiary mt-0.5">Elite One Management</div>
            </div>

            <div className="bg-[#121824] border border-surface-border/60 rounded-xl p-3">
              <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-wider mb-1">
                Client Name
              </div>
              <div className="text-xs font-bold text-white truncate">
                {client?.name || 'Valued Client'}
              </div>
              <div className="text-[10px] text-ink-secondary mt-0.5">
                Unit: {client?.unitNo || '-'}
              </div>
            </div>
          </div>

          {/* Recipient Phone Input */}
          <div>
            <label className="block text-xs font-bold text-ink-secondary mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                Recipient WhatsApp Number
                {recipientPhone && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/25">
                    Auto-fetched
                  </span>
                )}
              </span>
              {formattedFormatted && (
                <span className="text-[10px] text-emerald-400 font-mono">Format: +{formattedFormatted}</span>
              )}
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
              <input 
                type="text"
                placeholder="e.g. 03001234567 or 923001234567"
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                className={`w-full bg-[#121824] border ${!recipientPhone.trim() ? 'border-amber-500/50' : 'border-surface-border'} rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white placeholder-ink-tertiary focus:outline-none focus:border-emerald-500/60 transition-all`}
              />
            </div>
            {!recipientPhone.trim() && (
              <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                ⚠️ Phone number missing in client profile. Please enter WhatsApp number above.
              </p>
            )}
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink-secondary">Message Preview</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <CheckIcon className="w-3.5 h-3.5" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
            
            {/* WhatsApp Chat Style Bubble */}
            <div className="rounded-2xl p-4 border border-emerald-500/20 relative" style={{ background: '#092218' }}>
              <div className="text-[12px] text-emerald-100 whitespace-pre-wrap font-sans leading-relaxed">
                {message}
              </div>
              <div className="text-[10px] text-emerald-400/60 text-right mt-2 font-mono flex items-center justify-end gap-1">
                <span>Direct WhatsApp Format</span>
                <span className="text-emerald-400 font-bold">✓✓</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border/80 bg-[#0a0e14] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-ink-secondary hover:text-white bg-surface-raised hover:bg-surface-raised/80 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-2 rounded-xl text-xs font-bold text-ink-secondary hover:text-white border border-surface-border hover:border-surface-border/80 transition-colors flex items-center gap-1.5"
            >
              <DocumentDuplicateIcon className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              type="button"
              onClick={handleSend}
              className="px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg transition-all flex items-center gap-2"
              style={{
                background: '#10b981',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
              }}
            >
              <WhatsAppIcon className="w-4 h-4" />
              Send on WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppModal;
