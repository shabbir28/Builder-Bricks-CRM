import React, { useState, useRef } from 'react';
import axios from 'axios';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ImportClientModal = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      toast.error('Please select an Excel file');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('/api/clients/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (res.data.success) {
        setPreviewData(res.data.data);
        setStats(res.data.stats);
        toast.success('Preview loaded');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to preview file');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData) return;
    
    setLoading(true);
    try {
      const res = await axios.post('/api/clients/import/confirm', { clients: previewData }, {
        withCredentials: true
      });
      if (res.data.success) {
        toast.success(`Successfully imported ${res.data.importedCount} clients!`);
        if (res.data.errorCount > 0) {
          toast.error(`${res.data.errorCount} clients failed to import.`);
        }
        if (onImportSuccess) onImportSuccess();
        handleClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to import clients');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData(null);
    setStats(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-4xl rounded-2xl border border-surface-border shadow-2xl flex flex-col max-h-[90vh]" style={{ background: '#0e1015' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <h2 className="text-sm font-bold text-ink-primary uppercase tracking-wider">Import Clients & Installments</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/5 text-ink-tertiary transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {!previewData ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-surface-border rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all hover:border-accent hover:bg-accent/5 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ArrowUpTrayIcon className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary mb-1">
                {file ? file.name : 'Click or drag Excel file to upload'}
              </h3>
              <p className="text-sm text-ink-tertiary mt-2">
                Ensure the file has columns like: Name, Unit No, Total Payment, Down Payment, Possession, Installment.
              </p>
              {file && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePreview(); }}
                  disabled={loading}
                  className="mt-6 px-6 py-2.5 rounded-lg bg-accent text-white font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Preview Import'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-surface-border bg-surface-raised">
                  <div className="text-xs text-ink-tertiary uppercase tracking-wider font-bold mb-1">Valid Rows</div>
                  <div className="text-2xl font-black text-emerald-400">{stats.validRows}</div>
                </div>
                <div className="p-4 rounded-xl border border-surface-border bg-surface-raised">
                  <div className="text-xs text-ink-tertiary uppercase tracking-wider font-bold mb-1">Total Found</div>
                  <div className="text-2xl font-black text-amber-400">{stats.validRows}</div>
                </div>
                <div className="p-4 rounded-xl border border-surface-border bg-surface-raised">
                  <div className="text-xs text-ink-tertiary uppercase tracking-wider font-bold mb-1">Invalid Rows</div>
                  <div className="text-2xl font-black text-rose-400">{stats.invalidRows}</div>
                </div>
                <div className="p-4 rounded-xl border border-surface-border bg-surface-raised">
                  <div className="text-xs text-ink-tertiary uppercase tracking-wider font-bold mb-1">Skipped</div>
                  <div className="text-2xl font-black text-ink-secondary">{stats.skippedRows}</div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-surface-border rounded-xl overflow-hidden">
                <div className="max-h-[40vh] overflow-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 bg-surface-base border-b border-surface-border z-10">
                      <tr>
                        <th className="p-3 text-xs font-bold text-ink-tertiary uppercase tracking-wider">Client Name</th>
                        <th className="p-3 text-xs font-bold text-ink-tertiary uppercase tracking-wider">Unit No</th>
                        <th className="p-3 text-xs font-bold text-ink-tertiary uppercase tracking-wider">Total Payment</th>
                        <th className="p-3 text-xs font-bold text-ink-tertiary uppercase tracking-wider">Down Payment</th>
                        <th className="p-3 text-xs font-bold text-ink-tertiary uppercase tracking-wider">Monthly Inst.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border bg-surface-raised">
                      {previewData.slice(0, 100).map((c, i) => (
                        <tr key={i}>
                          <td className="p-3 text-sm text-ink-primary font-medium">{c.name}</td>
                          <td className="p-3 text-sm text-ink-secondary">{c.unitNo}</td>
                          <td className="p-3 text-sm text-emerald-400 font-bold">{c.totalPayment?.toLocaleString()}</td>
                          <td className="p-3 text-sm text-ink-secondary">{c.downPayment?.toLocaleString()}</td>
                          <td className="p-3 text-sm text-ink-secondary">{c.monthlyInstallment?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewData.length > 100 && (
                  <div className="p-3 text-center text-xs text-ink-tertiary bg-surface-raised border-t border-surface-border">
                    Showing first 100 valid clients...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {previewData && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-border bg-surface-raised rounded-b-2xl">
            <button onClick={() => setPreviewData(null)} className="px-4 py-2 text-sm font-bold text-ink-secondary hover:text-ink-primary transition-colors">
              Back
            </button>
            <button 
              onClick={handleConfirm}
              disabled={loading || stats.validRows === 0}
              className="px-6 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold text-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Importing...' : `Confirm Import (${stats.validRows})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportClientModal;
