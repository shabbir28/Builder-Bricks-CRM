import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  MapPinIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  PencilSquareIcon,
  PhotoIcon,
  Squares2X2Icon,
  XMarkIcon,
  BuildingOffice2Icon,
  HomeIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  ListBulletIcon,
  CurrencyDollarIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useNotifications, NOTIFICATION_TYPES } from '../context/NotificationContext';
import PropertyMap from '../components/map/PropertyMap';
import ImportExcelModal from '../components/modals/ImportExcelModal';
import SellPropertyModal from '../components/modals/SellPropertyModal';
import AddClientModal from '../components/modals/AddClientModal';

/* ─── Status config ──────────────────────────────────── */
const STATUS = {
  available:      { label: 'Available',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)'  },
  sold:           { label: 'Sold',          color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
  rented:         { label: 'Rented',        color: '#818cf8', bg: 'rgba(129,140,248,0.12)', border: 'rgba(129,140,248,0.25)' },
  'under-contract':{ label: 'Under Contract',color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)'  },
};

const TYPE_ICON = {
  apartment: BuildingOffice2Icon,
  house:     HomeIcon,
  villa:     SparklesIcon,
  land:      MapPinIcon,
  office:    BuildingOffice2Icon,
  loft:      HomeModernIcon,
};

const dummyProperties = [
  { id: 1, title: '5 Marla House',  price: '2 Crore', location: 'DHA Islamabad', lat: 33.6844, lng: 73.0479, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994' },
  { id: 2, title: '10 Marla House', price: '4 Crore', location: 'Bahria Town',   lat: 33.5651, lng: 73.0169, image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c' },
];

/* ─── Tiny inline modal ──────────────────────────────── */
const ModalShell = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-surface-border shadow-2xl overflow-hidden"
        style={{ background: '#0e1015' }}
      >
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-surface-border"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div>
            <h2 className="text-sm font-bold text-ink-primary">{title}</h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[82vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ─── Field + input shared ───────────────────────────── */
const F = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-widest">{label}</label>
    {children}
  </div>
);
const inp = 'w-full rounded-lg border border-surface-border bg-surface-raised text-ink-primary text-sm px-3 py-2 focus:outline-none focus:border-accent placeholder-ink-tertiary';

/* ═══════════════════════════════════════════
   PROPERTIES PAGE
═══════════════════════════════════════════ */
const Properties = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [addClientInitialUnit, setAddClientInitialUnit] = useState('');
  const [propertyToSell, setPropertyToSell] = useState(null);
  const [editingProp, setEditingProp] = useState(null);
  const [clients, setClients]         = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFloor, setFilterFloor]   = useState('all');
  const [viewMode, setViewMode]       = useState('list');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews]   = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', type: 'apartment', status: 'available',
    price: '',
    address: { street: '', city: '', state: '', zipCode: '' },
    features: { bedrooms: '', bathrooms: '', area: '' },
    clientId: '',
  });

  useEffect(() => { if (user) { fetchProperties(); fetchClients(); } }, [user]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const r = await axios.get('/api/properties?limit=1000');
      if (r.data.success) {
        // Sort: Apartments first (ordered by Excel sequence), then Shops
        const sorted = r.data.data.sort((a, b) => {
          if (a.type === 'apartment' && b.type !== 'apartment') return -1;
          if (a.type !== 'apartment' && b.type === 'apartment') return 1;
          return a.id - b.id; // Maintain Excel sequence internally
        });
        setProperties(sorted);
      }
    } catch { toast.error('Failed to load properties'); }
    finally { setLoading(false); }
  };

  const fetchClients = async () => {
    try {
      const r = await axios.get('/api/clients');
      if (r.data.success) setClients(r.data.data);
    } catch {}
  };

  const openModal = (prop = null) => {
    setEditingProp(prop);
    setSelectedImages([]); setImagePreviews([]);
    setForm(prop ? {
      title: prop.title, description: prop.description, type: prop.type,
      status: prop.status, price: prop.price,
      address: { street: prop.street || '', city: prop.city || '', state: prop.state || '', zipCode: prop.zipCode || '' },
      features: { bedrooms: prop.bedrooms || '', bathrooms: prop.bathrooms || '', area: prop.area || '' },
      clientId: prop.clientId || '',
    } : {
      title: '', description: '', type: 'apartment', status: 'available', price: '',
      address: { street: '', city: '', state: '', zipCode: '' },
      features: { bedrooms: '', bathrooms: '', area: '' }, clientId: '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this property?')) return;
    try {
      const r = await axios.delete(`/api/properties/${id}`);
      if (r.data.success) { toast.success('Property removed'); fetchProperties(); }
    } catch { toast.error('Failed to remove'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          Object.entries(v).forEach(([sk, sv]) => data.append(`${k}[${sk}]`, sv || ''));
        } else {
          data.append(k, v);
        }
      });
      selectedImages.forEach(img => data.append('images', img));
      const cfg = { headers: { 'Content-Type': 'multipart/form-data' } };
      const resp = editingProp
        ? await axios.put(`/api/properties/${editingProp.id}`, data, cfg)
        : await axios.post('/api/properties', data, cfg);
      if (resp.data.success) {
        toast.success(editingProp ? 'Property updated!' : 'Property added!', {
          style: { background: '#111316', border: '1px solid #1e2025', color: '#f0f2f5' },
          iconTheme: { primary: '#34d399', secondary: '#111316' },
        });
        if (!editingProp) addNotification(NOTIFICATION_TYPES.PROPERTY_ADDED, 'Property Listed', `"${form.title}" added to portfolio.`);
        setIsModalOpen(false);
        fetchProperties();
      }
    } catch (err) { 
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save'); 
    }
  };

  /* Filtering */
  const filtered = properties.filter(p => {
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.city || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    const matchFloor  = filterFloor === 'all' || p.floor === filterFloor;
    return matchSearch && matchStatus && matchFloor;
  });

  const uniqueFloors = [...new Set(properties.map(p => p.floor).filter(Boolean))];

  /* Stats */
  const totalValue    = properties.reduce((s, p) => s + (Number(p.price) || 0), 0);
  const availableCount = properties.filter(p => p.status === 'available').length;

  /* Helpers */
  const setAddr = (k) => (e) => setForm(p => ({ ...p, address: { ...p.address, [k]: e.target.value } }));
  const setFeat = (k) => (e) => setForm(p => ({ ...p, features: { ...p.features, [k]: e.target.value } }));

  const downloadPropertiesCSV = () => {
    if (filtered.length === 0) {
      toast.error('No properties to download');
      return;
    }
    
    const headers = [
      'Sr# / Unit', 'Floor', 'Type', 'Area (Sq.Ft)', 'Rate/Sq.Ft', 
      'Total Price', '25% Downpayment', 'Remaining', '24 Monthly Inst.', 
      '20% Possession', 'Status'
    ];

    const rows = filtered.map(p => {
      const type = p.type === 'commercial' ? 'Shop' : p.bedrooms ? `${p.bedrooms} Bed Apt` : p.type;
      return [
        p.unitNumber || p.id || '',
        p.floor || '-',
        type || '-',
        p.area || '-',
        p.ratePerSqFt || '-',
        p.price || '-',
        p.downPaymentAmount || '-',
        p.remainingAmount || '-',
        p.monthlyInstallment || '-',
        p.possessionAmount || '-',
        p.status || '-'
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `properties_${filterStatus}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
        <div className="w-5 h-5 rounded-full border-2 border-surface-border border-t-accent animate-spin" />
        <span className="text-xs text-ink-tertiary uppercase tracking-widest font-semibold">Loading properties…</span>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-6 pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full bg-[#5c6bc0]" />
            <span className="text-[#7986cb] text-[10px] font-black uppercase tracking-[0.4em]">Property Portfolio</span>
          </div>
          <h1 className="text-3xl font-black text-ink-primary tracking-tight">Properties</h1>
          <p className="text-sm text-ink-secondary mt-0.5">
            {properties.length} listings · Rs. {(totalValue / 1e6).toFixed(1)}M total value
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search title or city…"
              className="input pl-9 pr-4 py-2 text-sm w-52"
            />
          </div>

          {/* Floor Dropdown */}
          <div className="relative">
            <select
              value={filterFloor}
              onChange={e => setFilterFloor(e.target.value)}
              className="input px-3 py-2 text-sm max-w-[200px]"
            >
              <option value="all">All Floors & Shops</option>
              {uniqueFloors.map(f => (
                <option key={f} value={f} style={{ background: '#0e1015' }}>{f}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl border border-surface-border overflow-hidden" style={{ background: '#0d0f12' }}>
            {[{ id: 'list', Icon: ListBulletIcon, label: 'List' }, { id: 'grid', Icon: Squares2X2Icon, label: 'Grid' }, { id: 'map', Icon: MapPinIcon, label: 'Map' }].map(v => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: viewMode === v.id ? 'rgba(92,107,192,0.2)' : 'transparent',
                  color: viewMode === v.id ? '#9fa8da' : '#545769',
                  borderRight: (v.id === 'list' || v.id === 'grid') ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
              >
                <v.Icon className="w-4 h-4" /> {v.label}
              </button>
            ))}
          </div>

          {/* Import Excel */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn flex items-center gap-2"
            style={{ background: 'rgba(16,185,129,0.18)', borderColor: 'rgba(16,185,129,0.45)', color: '#34d399', fontWeight: 700 }}
          >
            <ArrowUpTrayIcon className="w-4 h-4" /> Import Excel
          </button>

          {/* Download CSV */}
          <button
            onClick={downloadPropertiesCSV}
            className="btn flex items-center gap-2"
            style={{ background: 'rgba(236,72,153,0.18)', borderColor: 'rgba(236,72,153,0.45)', color: '#f472b6', fontWeight: 700 }}
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Download
          </button>

          {/* Add Client */}
          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="btn flex items-center gap-2"
            style={{ background: 'rgba(59,130,246,0.18)', borderColor: 'rgba(59,130,246,0.45)', color: '#60a5fa', fontWeight: 700 }}
          >
            <UserPlusIcon className="w-4 h-4" /> Add Client
          </button>

          {/* Add Property */}
          <button
            onClick={() => openModal()}
            className="btn flex items-center gap-2"
            style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700 }}
          >
            <PlusIcon className="w-4 h-4" /> Add Property
          </button>
        </div>
      </div>

      {/* ── Stat Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'all',       label: 'Total Listings', value: properties.length, accent: '#7986cb' },
          { id: 'available', label: 'Available',      value: availableCount,    accent: '#10b981' },
          { id: 'sold',      label: 'Sold',           value: properties.filter(p=>p.status==='sold').length,   accent: '#f87171' },
          { id: null,        label: 'Portfolio Value',value: `Rs. ${(totalValue/1e6).toFixed(1)}M`, accent: '#fbbf24' },
        ].map((s, i) => {
          const isInteractive = s.id !== null;
          const isActive = filterStatus === s.id;
          return (
            <div
              key={i}
              onClick={() => isInteractive && setFilterStatus(s.id)}
              className={`rounded-xl px-4 py-3 border text-left transition-all ${isInteractive ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''}`}
              style={{ 
                background: isActive ? `rgba(${s.accent === '#7986cb' ? '121,134,203' : s.accent === '#10b981' ? '16,185,129' : s.accent === '#f87171' ? '248,113,113' : '251,191,36'},0.2)` : `rgba(${s.accent === '#7986cb' ? '121,134,203' : s.accent === '#10b981' ? '16,185,129' : s.accent === '#f87171' ? '248,113,113' : '251,191,36'},0.06)`, 
                borderColor: isActive ? s.accent : `rgba(${s.accent === '#7986cb' ? '121,134,203' : s.accent === '#10b981' ? '16,185,129' : s.accent === '#f87171' ? '248,113,113' : '251,191,36'},0.18)` 
              }}
            >
              <div className="text-[10px] font-semibold text-ink-tertiary uppercase tracking-wider">{s.label}</div>
              <div className="text-xl font-black text-ink-primary mt-0.5 tracking-tight" style={{ color: s.accent }}>{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* ── Status Filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'available', 'sold', 'rented', 'under-contract']).map(st => {
          const cfg = STATUS[st] || { label: 'All', color: '#8b8fa8', bg: 'rgba(139,143,168,0.08)', border: 'rgba(139,143,168,0.2)' };
          const active = filterStatus === st;
          return (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
              style={{
                background: active ? cfg.bg : 'transparent',
                color: active ? cfg.color : '#545769',
                border: `1px solid ${active ? cfg.border : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {st === 'all' ? `All (${properties.length})` : `${cfg.label} (${properties.filter(p=>p.status===st).length})`}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {viewMode === 'map' ? (
        <div className="rounded-2xl overflow-hidden border border-surface-border">
          <PropertyMap properties={dummyProperties} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="h-16 w-16 rounded-2xl border border-surface-border flex items-center justify-center">
            <HomeModernIcon className="h-8 w-8 text-ink-tertiary opacity-40" />
          </div>
          <p className="text-sm text-ink-tertiary">No properties found</p>
          <button onClick={() => openModal()} className="btn flex items-center gap-2" style={{ color: '#7986cb', background: 'rgba(92,107,192,0.1)', borderColor: 'rgba(92,107,192,0.25)' }}>
            <PlusIcon className="w-4 h-4" /> Add your first property
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="rounded-2xl border border-surface-border bg-surface-base overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead className="bg-surface-raised border-b border-surface-border">
                <tr>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Sr# / Unit</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Floor</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Type</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Area (Sq.Ft)</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Rate/Sq.Ft</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Total Price</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">25% Downpayment</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Remaining</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">24 Monthly Inst.</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">20% Possession</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-4 text-[11px] font-bold text-ink-tertiary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-ink-primary">
                      {p.unitNumber || p.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-secondary">
                      {p.floor || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-secondary capitalize">
                      {p.type === 'commercial' ? 'Shop' : p.bedrooms ? `${p.bedrooms} Bed Apt` : p.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-secondary">
                      {p.area || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-ink-secondary">
                      {p.ratePerSqFt ? `Rs. ${Number(p.ratePerSqFt).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-ink-primary">
                      {p.price ? `Rs. ${Number(p.price).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                      {p.downPaymentAmount ? `Rs. ${Number(p.downPaymentAmount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-amber-400">
                      {p.remainingAmount ? `Rs. ${Number(p.remainingAmount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-400">
                      {p.monthlyInstallment ? `Rs. ${Number(p.monthlyInstallment).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-ink-primary">
                      {p.possessionAmount ? `Rs. ${Number(p.possessionAmount).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const st = STATUS[p.status] || STATUS.available;
                        return (
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm whitespace-nowrap inline-flex items-center"
                            style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                          >
                            <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{ background: st.color }} />
                            {st.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openModal(p)} className="p-1.5 rounded-lg text-ink-tertiary hover:text-ink-primary hover:bg-surface-raised transition-colors">
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        {p.status === 'available' && (
                          <button 
                            onClick={() => {
                              setAddClientInitialUnit(p.unitNumber || p.title);
                              setIsAddClientModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                            title="Sell Property (Add Client)"
                          >
                            <CurrencyDollarIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => {
            const st   = STATUS[p.status] || STATUS.available;
            const TIcon = TYPE_ICON[p.type] || HomeModernIcon;
            return (
              <div
                key={p.id}
                className="group rounded-2xl border overflow-hidden flex flex-col"
                style={{ background: '#111316', borderColor: 'rgba(255,255,255,0.07)', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(92,107,192,0.35)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Image Section */}
                <div className="relative h-52 overflow-hidden bg-surface-raised flex-shrink-0">
                  <img
                    src={p.images?.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
                      style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full mr-1" style={{ background: st.color }} />
                      {st.label}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm capitalize"
                      style={{ background: 'rgba(0,0,0,0.5)', color: '#adb5bf', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {p.type}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal(p)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
                      style={{ background: 'rgba(14,16,21,0.85)', border: '1px solid rgba(92,107,192,0.3)', color: '#9fa8da' }}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    {p.status === 'available' && (
                      <button
                        onClick={() => {
                          setAddClientInitialUnit(p.unitNumber || p.title);
                          setIsAddClientModalOpen(true);
                        }}
                        className="h-8 w-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
                        style={{ background: 'rgba(14,16,21,0.85)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                        title="Sell Property (Add Client)"
                      >
                        <CurrencyDollarIcon className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center backdrop-blur-sm transition-all"
                      style={{ background: 'rgba(14,16,21,0.85)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Price tag at bottom */}
                  <div className="absolute bottom-3 left-3">
                    <div
                      className="px-3 py-1.5 rounded-xl backdrop-blur-sm font-black text-sm"
                      style={{ background: 'rgba(92,107,192,0.85)', color: '#fff', border: '1px solid rgba(121,134,203,0.4)' }}
                    >
                      Rs. {Number(p.price).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Title + location */}
                  <div>
                    <h3 className="text-sm font-bold text-ink-primary leading-snug group-hover:text-[#7986cb] transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPinIcon className="h-3.5 w-3.5 text-ink-tertiary flex-shrink-0" />
                      <span className="text-xs text-ink-tertiary truncate">{p.street || ''}, {p.city || ''}</span>
                    </div>
                  </div>

                  {/* Feature pills */}
                  <div className="flex items-center gap-2">
                    {[
                      { label: `${p.bedrooms ?? 0} Bed` },
                      { label: `${p.bathrooms ?? 0} Bath` },
                      { label: `${Number(p.area || 0).toLocaleString()} sqft` },
                    ].map((feat, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-ink-secondary"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                      >
                        {feat.label}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-divide mt-auto">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-6 w-6 rounded-lg flex items-center justify-center text-[9px] font-bold"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}
                      >
                        {p.client?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs text-ink-tertiary">
                        {p.client ? `Sold to: ${p.client.name}` : 'Unassigned'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
                      <EyeIcon className="h-3.5 w-3.5" />
                      {p.views ?? 0}
                    </div>
                  </div>

                  {/* Payment Plan Info (Elite One) */}
                  {p.downPaymentAmount && (
                    <div className="mt-3 pt-3 border-t border-surface-border">
                      <div className="text-[10px] uppercase tracking-wider text-ink-tertiary font-bold mb-2">Payment Plan</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Downpayment</span>
                          <span className="font-semibold text-ink-primary">Rs. {(p.downPaymentAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Monthly ({p.installmentMonths}m)</span>
                          <span className="font-semibold text-emerald-400">Rs. {(p.monthlyInstallment/1e5).toFixed(2)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Possession</span>
                          <span className="font-semibold text-ink-primary">Rs. {(p.possessionAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                        <div className="bg-surface-base p-2 rounded-lg border border-surface-border/50">
                          <span className="text-ink-tertiary block mb-0.5">Remaining</span>
                          <span className="font-semibold text-amber-400">Rs. {(p.remainingAmount/1e5).toFixed(1)} Lac</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>

    {/* ── Add / Edit Modal ── */}
    <ModalShell
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={editingProp ? 'Edit Property' : 'Add Property'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-4">
          <F label="Property Type *">
            <select className={inp} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} required>
              {['apartment','house','villa','commercial','land'].map(t => <option key={t} value={t} style={{ background: '#0e1015' }} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </F>
          <F label="Status">
            <select className={inp} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="available" style={{ background: '#0e1015' }}>Available</option>
              <option value="sold"      style={{ background: '#0e1015' }}>Sold</option>
              <option value="rented"    style={{ background: '#0e1015' }}>Rented</option>
              <option value="under-contract" style={{ background: '#0e1015' }}>Under Contract</option>
            </select>
          </F>
        </div>

        {/* Title */}
        <F label="Property Title *">
          <input className={inp} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. 4-Bed House — F-7 Markaz" required />
        </F>

        {/* Description */}
        <F label="Description">
          <textarea
            className={inp}
            style={{ minHeight: 80, resize: 'vertical' }}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Property overview…"
          />
        </F>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-4">
          <F label="Price (PKR) *">
            <input className={inp} type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0" required />
          </F>
          <F label="Sold To">
            <select className={inp} value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
              <option value="">Select client…</option>
              {clients.map(c => <option key={c._id || c.id} value={c._id || c.id} style={{ background: '#0e1015' }}>Sold to: {c.name}</option>)}
            </select>
          </F>
        </div>

        {/* Row 3 (Address) */}
        <div className="grid grid-cols-2 gap-4">
          <F label="Street Address"><input className={inp} value={form.address.street} onChange={setAddr('street')} placeholder="123 Main St" /></F>
          <F label="City"><input className={inp} value={form.address.city} onChange={setAddr('city')} placeholder="Islamabad" /></F>
        </div>

        {/* Row 4 (Features) */}
        <div className="grid grid-cols-3 gap-4">
          <F label="Beds"><input className={inp} type="number" value={form.features.bedrooms} onChange={setFeat('bedrooms')} placeholder="0" /></F>
          <F label="Baths"><input className={inp} type="number" value={form.features.bathrooms} onChange={setFeat('bathrooms')} placeholder="0" /></F>
          <F label="Area (sqft)"><input className={inp} type="number" value={form.features.area} onChange={setFeat('area')} placeholder="0" /></F>
        </div>

        {/* Images */}
        <F label="Property Images">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-surface-border rounded-xl cursor-pointer hover:border-accent hover:bg-accent/5 transition-all">
            <PhotoIcon className="h-8 w-8 text-ink-tertiary mb-2" />
            <span className="text-sm text-ink-primary font-bold">Click to upload images</span>
            <span className="text-xs text-ink-tertiary mt-1">JPEG, PNG up to 5MB</span>
            <input type="file" className="hidden" accept="image/*" multiple onChange={e => {
              const files = Array.from(e.target.files);
              setSelectedImages(files);
              setImagePreviews(files.map(f => URL.createObjectURL(f)));
            }} />
          </label>
          {imagePreviews.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {imagePreviews.map((src, i) => <img key={i} src={src} alt="" className="h-16 w-16 object-cover rounded-lg border border-surface-border" />)}
            </div>
          )}
        </F>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
          <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ background: 'rgba(255,255,255,0.04)', borderColor: '#1e2025', color: '#8b8fa8' }}>
            Cancel
          </button>
          <button type="submit" className="btn" style={{ background: 'rgba(92,107,192,0.18)', borderColor: 'rgba(92,107,192,0.45)', color: '#9fa8da', fontWeight: 700, minWidth: 120 }}>
            {editingProp ? 'Save Changes' : 'Add Property'}
          </button>
        </div>
      </form>
    </ModalShell>

    {/* Import Modal */}
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          setIsImportModalOpen(false);
          fetchProperties();
        }}
      />
      
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => {
          setIsAddClientModalOpen(false);
          setAddClientInitialUnit('');
        }}
        initialUnitNo={addClientInitialUnit}
        onClientAdded={() => { fetchProperties(); fetchClients(); }}
      />
    </>
  );
};

export default Properties;
