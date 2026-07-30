import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  UserGroupIcon, MagnifyingGlassIcon, PlusIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, TrashIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import AddClientModal from '../components/modals/AddClientModal';
import ClientDetailsModal from '../components/modals/ClientDetailsModal';
import EditClientModal from '../components/modals/EditClientModal';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      setIsDeleting(true);
      const res = await axios.delete(`/api/clients/${clientToDelete.id}`);
      if (res.data.success) {
        toast.success('Client deleted successfully');
        setClientToDelete(null);
        setIsDetailsModalOpen(false);
        setSelectedClient(null);
        fetchClients();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete client');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchClients = async () => {
    try {
      setLoading(true);
      const r = await axios.get('/api/clients');
      if (r.data.success) {
        setClients(r.data.data);
      }
    } catch (e) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Clients</h1>
          </div>
          <p className="text-sm text-ink-secondary font-medium">
            Manage buyers and their property portfolios
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          style={{ background: '#10b981', border: '1px solid #059669' }}
        >
          <PlusIcon className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border border-surface-border" style={{ background: '#0f1520' }}>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
          <input
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search clients by name or phone…"
            className="input pl-9 pr-4 py-2 text-sm w-64"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-surface-border" style={{ background: '#0b0f16' }}>
          <UserGroupIcon className="w-12 h-12 text-ink-tertiary mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white">No clients found</h3>
          <p className="text-sm text-ink-secondary mt-1">When properties are sold, clients will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(c => {
            const purchased = c.purchasedProperties || [];
            const totalPaid = purchased.reduce((sum, p) => sum + (p.clientPaidAmount || 0), 0);
            const totalValue = purchased.reduce((sum, p) => sum + (p.price || 0), 0);

            return (
              <div 
                key={c.id} 
                onClick={() => {
                  setSelectedClient(c);
                  setIsDetailsModalOpen(true);
                }}
                className="relative overflow-hidden rounded-[24px] p-[1px] transition-all duration-500 cursor-pointer group hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/20"
              >
                {/* Gradient Border Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-surface-border/50 via-surface-border/30 to-surface-border/50 group-hover:from-emerald-500/50 group-hover:via-blue-500/30 group-hover:to-teal-500/50 transition-all duration-500"></div>

                {/* Inner Card Content */}
                <div className="relative h-full bg-[#0a0f18] rounded-[23px] p-6 flex flex-col justify-between overflow-hidden">
                  {/* Glassmorphic glow effect */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>

                  <div className="flex items-start justify-between mb-6 z-10 relative">
                    <div className="flex items-center gap-5">
                      <div className="relative w-14 h-14 rounded-[18px] bg-gradient-to-br from-emerald-400 to-teal-600 p-[1.5px] shadow-lg shadow-emerald-900/20">
                        <div className="w-full h-full bg-[#0a0f18] rounded-[16px] flex items-center justify-center">
                          <span className="text-xl font-black bg-gradient-to-br from-emerald-300 to-teal-500 bg-clip-text text-transparent">
                            {c.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white tracking-tight group-hover:text-emerald-300 transition-colors">{c.name}</h3>
                        <div className="flex flex-col gap-1.5 text-[13px] font-medium text-ink-secondary mt-1.5">
                          {c.phone && <span className="flex items-center gap-2"><PhoneIcon className="w-3.5 h-3.5 text-ink-tertiary"/> {c.phone}</span>}
                          {c.email && <span className="flex items-center gap-2"><EnvelopeIcon className="w-3.5 h-3.5 text-ink-tertiary"/> {c.email}</span>}
                        </div>
                      </div>
                    </div>
                    
                    {/* Delete Action Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setClientToDelete(c);
                      }}
                      className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      title="Delete Client"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Properties List */}
                  <div className="space-y-3 mt-2 flex-1 z-10 relative">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.25em]">Portfolio ({purchased.length})</h4>
                    </div>
                    {purchased.length === 0 ? (
                      <div className="flex items-center justify-center py-8 bg-surface-base/30 rounded-2xl border border-surface-border/50 border-dashed">
                        <span className="text-sm text-ink-tertiary font-medium">No properties acquired yet</span>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                        {purchased.map(p => (
                          <div key={p.id} className="group/prop flex items-center justify-between p-3.5 rounded-2xl bg-surface-raised/40 hover:bg-surface-raised transition-colors border border-surface-border/30">
                            <div>
                              <div className="text-[13px] font-bold text-white group-hover/prop:text-blue-300 transition-colors">{p.title}</div>
                              <div className="text-[11px] font-medium text-ink-secondary mt-1">{p.projectName || p.city} • <span className="uppercase">{p.type}</span></div>
                            </div>
                            <div className="text-right">
                              <div className="text-[13px] font-black text-emerald-400">Rs. {Number(p.clientPaidAmount || 0).toLocaleString()}</div>
                              <div className="text-[11px] font-medium text-ink-tertiary mt-1">Total: Rs. {Number(p.price || 0).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="flex items-end justify-between mt-6 pt-5 border-t border-surface-border/60 z-10 relative">
                    <div>
                      <div className="text-[10px] font-black text-ink-tertiary uppercase tracking-[0.2em] mb-1">Total Investment</div>
                    </div>
                    <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent tracking-tight">
                      <span className="text-sm font-bold text-emerald-500/70 mr-1.5">Rs.</span>{Number(totalPaid).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddClientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientAdded={(newClient) => {
          fetchClients();
        }}
      />

      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onEdit={(client) => {
          setIsDetailsModalOpen(false);
          setSelectedClient(client);
          setIsEditModalOpen(true);
        }}
        onDelete={(clientId) => {
          const client = clients.find(c => c.id === clientId);
          if (client) {
            setClientToDelete(client);
          }
        }}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        initialData={selectedClient}
        onClientUpdated={() => {
          fetchClients();
        }}
      />

      {/* Custom Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md bg-[#0f1520] rounded-2xl border border-surface-border shadow-2xl p-6 relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Delete Client?</h3>
              <p className="text-sm text-ink-secondary mb-6">
                Are you sure you want to delete <span className="text-white font-bold">{clientToDelete.name}</span>? This action will unlink their properties and cannot be undone.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => setClientToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-surface-base border border-surface-border hover:bg-surface-raised transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteClient}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all border border-red-600 shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Client'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Clients;
