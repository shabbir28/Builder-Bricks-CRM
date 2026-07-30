import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { DocumentTextIcon, MagnifyingGlassIcon, ArrowLeftIcon, UserIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/receipts');
      if (res.data.success) {
        setReceipts(res.data.data);
      }
    } catch (e) {
      toast.error('Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  // Group receipts by client
  const groupedClients = receipts.reduce((acc, receipt) => {
    const clientId = receipt.client?.id || 'unknown';
    if (!acc[clientId]) {
      acc[clientId] = {
        client: receipt.client || { id: 'unknown', name: 'Unknown Client', bookingReferenceNo: 'N/A' },
        receipts: [],
      };
    }
    acc[clientId].receipts.push(receipt);
    return acc;
  }, {});

  const clientsList = Object.values(groupedClients);

  // Filter clients based on search
  const filteredClients = clientsList.filter(group => 
    group.client.name?.toLowerCase().includes(search.toLowerCase()) ||
    group.client.bookingReferenceNo?.toLowerCase().includes(search.toLowerCase())
  );

  // When a specific client is selected, show their receipts
  const activeClientGroup = selectedClientId ? groupedClients[selectedClientId] : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-emerald-400 animate-spin" />
        <span className="text-xs text-ink-tertiary font-medium tracking-wider uppercase">Loading receipts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1 bg-emerald-400 rounded-full" />
            <span className="text-emerald-400 font-black uppercase text-[10px] tracking-[0.4em]">Finance Module</span>
          </div>
          
          {selectedClientId ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedClientId(null)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-base/50 hover:bg-surface-raised border border-surface-border text-white transition-all"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-4xl font-black text-ink-primary tracking-tighter leading-none">
                  {activeClientGroup?.client.name || 'Unknown Client'}
                </h1>
                <p className="text-ink-secondary font-medium text-base mt-2">
                  Showing {activeClientGroup?.receipts.length} receipt{activeClientGroup?.receipts.length !== 1 ? 's' : ''} for this client.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-4xl font-black text-ink-primary tracking-tighter leading-none">Receipts Directory</h1>
              <p className="text-ink-secondary font-medium text-base">Select a client to view their uploaded installment receipts.</p>
            </>
          )}
        </div>

        {!selectedClientId && (
          <div className="flex items-center gap-3">
            <div className="relative w-64 group">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clients..."
                className="w-full bg-[#0f1520]/80 border border-surface-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-ink-tertiary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {selectedClientId && activeClientGroup ? (
        /* Detailed Client Receipts View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {activeClientGroup.receipts.map(receipt => (
            <div key={receipt.id} className="group overflow-hidden rounded-2xl border border-surface-border bg-[#111316] flex flex-col transition-all hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(52,211,153,0.1)]">
              
              <div className="p-5 border-b border-surface-divide flex items-center justify-between bg-surface-base/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <DocumentTextIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-tertiary font-bold tracking-wider uppercase mb-0.5">Installment</div>
                    <div className="text-lg font-black text-white leading-none">#{receipt.installmentId}</div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-tertiary font-medium">Uploaded By</span>
                  <span className="font-bold text-ink-secondary">{receipt.uploader?.name || 'System'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink-tertiary font-medium">Upload Date</span>
                  <span className="font-bold text-ink-secondary">{format(new Date(receipt.createdAt), 'dd MMM yyyy, h:mm a')}</span>
                </div>
              </div>

              <div className="p-4 border-t border-surface-divide bg-surface-base/10">
                <a 
                  href={receipt.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all text-sm border border-emerald-500/20"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  View Receipt
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clients List View */
        <>
          {filteredClients.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="p-8 rounded-2xl border border-surface-border bg-surface-raised">
                <UserIcon className="h-16 w-16 text-ink-tertiary opacity-30" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">No clients with receipts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredClients.map(group => (
                <div 
                  key={group.client.id} 
                  onClick={() => setSelectedClientId(group.client.id)}
                  className="group cursor-pointer p-5 rounded-2xl border border-surface-border bg-[#111316] flex flex-col transition-all hover:border-emerald-500/40 hover:shadow-[0_8px_30px_rgba(52,211,153,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full transition-all group-hover:bg-emerald-500/10" />
                  
                  <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-surface-base border border-surface-border flex items-center justify-center flex-shrink-0 text-white font-black text-lg shadow-inner group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
                      {group.client.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1">{group.client.name}</h3>
                      <div className="text-xs text-ink-secondary mt-1 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-surface-raised text-ink-primary font-bold">
                          {group.client.bookingReferenceNo || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-surface-divide flex items-center justify-between relative z-10">
                    <div className="text-xs font-medium text-ink-tertiary">Uploaded Receipts</div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-sm">
                      {group.receipts.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Receipts;
