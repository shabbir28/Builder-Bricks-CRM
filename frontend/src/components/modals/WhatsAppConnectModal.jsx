import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  XMarkIcon, 
  ArrowPathIcon, 
  CheckCircleIcon, 
  DevicePhoneMobileIcon, 
  KeyIcon, 
  QrCodeIcon, 
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { WhatsAppIcon } from './WhatsAppModal';
import { OFFICIAL_SENDER_NUMBER, openWhatsApp } from '../../utils/whatsapp';

const WhatsAppConnectModal = ({ isOpen, onClose, onConnected, pendingData }) => {
  const [status, setStatus] = useState({ isConnected: false, qrCode: null });
  const [activeTab, setActiveTab] = useState('pairing'); // 'pairing' | 'qr' | 'direct'
  const [pairPhone, setPairPhone] = useState(OFFICIAL_SENDER_NUMBER);
  const [pairingCode, setPairingCode] = useState(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/whatsapp/status');
      if (res.data.success) {
        setStatus({
          isConnected: res.data.isConnected,
          qrCode: res.data.qrCode,
        });
        if (res.data.pairingCode && !pairingCode) {
          setPairingCode(res.data.pairingCode);
        }
        if (res.data.isConnected && onConnected) {
          onConnected();
        }
      }
    } catch (err) {
      console.error('Error fetching WhatsApp status:', err);
    }
  };

  useEffect(() => {
    let interval = null;
    if (isOpen) {
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  // Request 8-digit WhatsApp pairing code
  const handleRequestPairingCode = async (e) => {
    if (e) e.preventDefault();
    if (!pairPhone.trim()) {
      toast.error('Please enter your WhatsApp phone number');
      return;
    }
    try {
      setPairingLoading(true);
      const res = await axios.post('/api/whatsapp/pair-code', { phone: pairPhone });
      if (res.data.success && res.data.pairingCode) {
        setPairingCode(res.data.pairingCode);
        toast.success('Pairing code generated! Enter it on your phone.');
      } else {
        toast.error(res.data.message || 'Could not generate code');
      }
    } catch (err) {
      console.error('Error requesting pairing code:', err);
      toast.error(err.response?.data?.message || 'Failed to generate code. Ensure backend is running.');
    } finally {
      setPairingLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!pairingCode) return;
    const cleanCode = pairingCode.replace(/[^a-zA-Z0-9]/g, '');
    navigator.clipboard.writeText(cleanCode);
    setCopiedCode(true);
    toast.success('Pairing code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyMessage = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    toast.success('Message copied to clipboard!');
    setTimeout(() => setCopiedMsg(false), 2000);
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to disconnect WhatsApp?')) return;
    try {
      setLoggingOut(true);
      await axios.post('/api/whatsapp/logout');
      setStatus({ isConnected: false, qrCode: null });
      setPairingCode(null);
      toast.success('WhatsApp disconnected successfully');
      fetchStatus();
    } catch (err) {
      toast.error('Failed to disconnect');
    } finally {
      setLoggingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-xl rounded-2xl border border-surface-border flex flex-col max-h-[92vh] overflow-hidden" style={{ background: '#0e131b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border bg-[#101622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <WhatsAppIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                WhatsApp Connection & Direct Send
                {status.isConnected && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                  </span>
                )}
              </h3>
              <p className="text-xs text-ink-secondary">Official Helpline / Sender: <span className="text-emerald-400 font-mono font-bold">{OFFICIAL_SENDER_NUMBER}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-tertiary hover:text-white hover:bg-surface-raised transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Fast Action Banner for Pending Receipt (if any) */}
        {pendingData && !status.isConnected && (
          <div className="mx-5 mt-4 p-3.5 bg-gradient-to-r from-emerald-950/60 to-[#0e241b] border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <PaperAirplaneIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Need to send this receipt immediately?</div>
                <div className="text-[11px] text-emerald-300/80">Open in WhatsApp Web/App directly with 1-click (Zero setup needed)</div>
              </div>
            </div>
            <button
              onClick={() => {
                openWhatsApp(pendingData.phone, pendingData.message);
                toast.success('Opened in WhatsApp! Click send in WhatsApp.');
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs whitespace-nowrap flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" /> Send Now
            </button>
          </div>
        )}

        {/* Mode Selector Tabs (only if not already connected) */}
        {!status.isConnected && (
          <div className="px-5 pt-4 pb-1">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#141b27] border border-surface-border rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('pairing')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'pairing'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-ink-secondary hover:text-white hover:bg-surface-raised/40'
                }`}
              >
                <KeyIcon className="w-4 h-4" />
                <span>Pairing Code <span className="text-[10px] opacity-80">(Recommended)</span></span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('direct')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'direct'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-ink-secondary hover:text-white hover:bg-surface-raised/40'
                }`}
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>Direct WhatsApp Web</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`py-2 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'qr'
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'text-ink-secondary hover:text-white hover:bg-surface-raised/40'
                }`}
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>Scan QR Code</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }}>
          {status.isConnected ? (
            /* Connected State */
            <div className="py-8 flex flex-col items-center space-y-4 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <CheckCircleIcon className="w-12 h-12" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">WhatsApp Connected & Active!</h4>
                <p className="text-xs text-ink-secondary max-w-sm mt-1.5 leading-relaxed">
                  Your device (<span className="text-emerald-400 font-mono font-bold">{OFFICIAL_SENDER_NUMBER}</span>) is successfully linked. All installment receipts will send automatically in the background without opening any app!
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                >
                  Done
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-all"
                >
                  {loggingOut ? 'Disconnecting...' : 'Disconnect WhatsApp'}
                </button>
              </div>
            </div>
          ) : activeTab === 'pairing' ? (
            /* Tab 1: 8-Digit Pairing Code (Phone code - No camera needed) */
            <div className="space-y-4">
              <div className="bg-[#121824] border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <KeyIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Link with Phone Number (No QR Scan Needed!)</h4>
                    <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                      Camera scan karne ki zaroorat nahi! Apna phone number likhein, 8-digit code lein aur apne WhatsApp mein type karein.
                    </p>
                  </div>
                </div>

                {/* Phone Input & Generate Button */}
                <form onSubmit={handleRequestPairingCode} className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <DevicePhoneMobileIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                    <input
                      type="text"
                      value={pairPhone}
                      onChange={(e) => setPairPhone(e.target.value)}
                      placeholder="e.g. 03190225136 or 923190225136"
                      className="w-full bg-[#0a0e14] border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-ink-tertiary focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pairingLoading}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 shrink-0"
                  >
                    {pairingLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <KeyIcon className="w-3.5 h-3.5" />
                        Get 8-Digit Code
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Display Generated Pairing Code */}
              {pairingCode ? (
                <div className="p-5 bg-gradient-to-b from-[#141d2c] to-[#0d131d] border-2 border-emerald-500/40 rounded-2xl flex flex-col items-center space-y-3 shadow-xl">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckIcon className="w-4 h-4" /> Your WhatsApp Pairing Code
                  </div>

                  {/* Big Segmented Code */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 my-2 select-all">
                    {pairingCode.split('').map((char, i) => (
                      char === '-' ? (
                        <span key={i} className="text-xl font-bold text-ink-tertiary px-1">-</span>
                      ) : (
                        <div
                          key={i}
                          className="w-8 h-11 sm:w-10 sm:h-13 rounded-xl bg-[#090d14] border border-emerald-500/50 flex items-center justify-center text-lg sm:text-xl font-mono font-black text-emerald-300 shadow-inner"
                        >
                          {char}
                        </div>
                      )
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-4 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copiedCode ? <CheckIcon className="w-3.5 h-3.5" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5" />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>

                  {/* Step-by-step instructions */}
                  <div className="w-full mt-3 p-3.5 bg-[#090d14] border border-surface-border rounded-xl text-left">
                    <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <InformationCircleIcon className="w-4 h-4 text-emerald-400" />
                      Phone mein yeh code enter karne ka tareeqa:
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-ink-secondary pl-1">
                      <li>Apne phone par <span className="text-white font-semibold">WhatsApp</span> open karein.</li>
                      <li><span className="text-white font-semibold">Settings</span> (ya 3 dots) &gt; <span className="text-white font-semibold">Linked Devices</span> &gt; <span className="text-white font-semibold">Link a Device</span> par tap karein.</li>
                      <li>Screen ke neeche <span className="text-emerald-400 font-bold">"Link with phone number instead"</span> (یا فون نمبر کے ذریعے لنک کریں) par click karein.</li>
                      <li>Yeh 8-digit code (<span className="text-emerald-400 font-mono font-bold">{pairingCode}</span>) enter karein!</li>
                    </ol>
                  </div>

                  <div className="text-[11px] text-emerald-400 animate-pulse font-medium">
                    Waiting for code entry on phone... Will connect automatically once typed!
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#121824] border border-surface-border rounded-xl text-xs text-ink-secondary space-y-2">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <InformationCircleIcon className="w-4 h-4 text-emerald-400" />
                    How Pairing Code works:
                  </div>
                  <p className="leading-relaxed">
                    Click <strong>"Get 8-Digit Code"</strong> above. A unique 8-character code will appear. In your phone's WhatsApp, tap "Link with phone number instead" and type that code. No camera scanner is needed!
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'direct' ? (
            /* Tab 2: Direct WhatsApp Web (Zero Setup, 1-Click Send) */
            <div className="space-y-4">
              <div className="bg-[#121824] border border-emerald-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Direct WhatsApp Web / App Sending</h4>
                    <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">
                      Bina kisi server linking ke, direct WhatsApp Web ya WhatsApp Desktop app open kar ke 1-click mein receipt send karein!
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Details Preview */}
              {pendingData ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#121824] p-3 rounded-xl border border-surface-border">
                      <span className="text-[10px] text-ink-tertiary uppercase block">Client Phone:</span>
                      <span className="text-emerald-400 font-bold font-mono">{pendingData.phone || 'Not specified'}</span>
                    </div>
                    <div className="bg-[#121824] p-3 rounded-xl border border-surface-border">
                      <span className="text-[10px] text-ink-tertiary uppercase block">Client Name:</span>
                      <span className="text-white font-bold truncate block">{pendingData.client?.name || 'Valued Client'}</span>
                    </div>
                  </div>

                  <div className="bg-[#092218] border border-emerald-500/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-emerald-400">Receipt Message Preview:</span>
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(pendingData.message)}
                        className="text-[10px] text-emerald-300 hover:text-white flex items-center gap-1 font-bold"
                      >
                        {copiedMsg ? <CheckIcon className="w-3 h-3" /> : <DocumentDuplicateIcon className="w-3 h-3" />}
                        {copiedMsg ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {pendingData.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      openWhatsApp(pendingData.phone, pendingData.message);
                      toast.success('WhatsApp opened! Press send button in WhatsApp.');
                      onClose();
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                    Open in WhatsApp &amp; Send Now
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-[#121824] border border-surface-border rounded-xl text-center space-y-3">
                  <WhatsAppIcon className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-xs text-ink-secondary max-w-xs mx-auto">
                    When you edit an installment or click WhatsApp on any installment row, this tab lets you send the receipt directly via WhatsApp Web without linking the bot.
                  </p>
                  <button
                    type="button"
                    onClick={() => openWhatsApp(OFFICIAL_SENDER_NUMBER, 'Hello from Builders Brick CRM')}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold inline-flex items-center gap-2 transition-all"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    Test Open WhatsApp Web
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Tab 3: HD Crisp QR Code (Fixed & Enhanced) */
            <div className="flex flex-col items-center space-y-4">
              {status.qrCode ? (
                <>
                  <div className="p-3 bg-white rounded-xl shadow-2xl border-4 border-emerald-500/40 inline-block">
                    {/* Square image without rounded corners so finder patterns aren't clipped */}
                    <img 
                      src={status.qrCode} 
                      alt="WhatsApp QR Code" 
                      className="w-64 h-64 block" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                  
                  <div className="space-y-1 text-left bg-[#121824] border border-surface-border p-3.5 rounded-xl text-xs text-ink-secondary w-full">
                    <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                      <DevicePhoneMobileIcon className="w-4 h-4 text-emerald-400" />
                      Agar QR code scan nahi ho raha to yeh tips follow karein:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-ink-tertiary pl-1">
                      <li>Phone camera ko monitor se <span className="text-white font-medium">1 foot (12 inches)</span> peechay rakhein taake focus theek ho.</li>
                      <li>Monitor ki brightness barhain aur room lights check karein.</li>
                      <li>Agar phir bhi na ho, to upar <span className="text-emerald-400 font-bold">"Pairing Code"</span> tab select karein (bina camera ke link ho jata hai).</li>
                    </ul>
                  </div>

                  <div className="text-[11px] text-emerald-400 animate-pulse font-medium">
                    Waiting for scan... QR refreshes automatically.
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
                  <p className="text-xs text-ink-secondary">Generating WhatsApp QR code...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-[#0a0e14] flex items-center justify-between">
          <button
            onClick={fetchStatus}
            className="text-xs font-bold text-ink-secondary hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border hover:border-surface-border/80 transition-all cursor-pointer"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" /> Refresh Status
          </button>
          
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg text-xs font-bold text-white bg-surface-raised hover:bg-surface-raised/80 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default WhatsAppConnectModal;
