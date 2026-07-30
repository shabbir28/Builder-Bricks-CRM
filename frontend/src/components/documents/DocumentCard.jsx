import React from 'react';
import { DocumentTextIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

const DocumentCard = ({ document, onDelete }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'Pending':  return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'Missing':  return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      default:         return 'bg-builders-surface border-builders-border text-white';
    }
  };

  const handleView = () => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else {
      alert("No valid file attached.");
    }
  };

  return (
    <div className="p-5 bg-builders-card/40 border border-builders-border rounded-2xl hover:border-builders-blue/30 transition-all group shadow-inner">
       <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-builders-surface rounded-xl border border-builders-border text-builders-blue">
             <DocumentTextIcon className="h-6 w-6" />
          </div>
          <span className={`px-2.5 py-1 text-[8px] font-black uppercase tracking-widest rounded-lg border ${getStatusStyle(document.status)}`}>
             {document.status}
          </span>
       </div>
       
       <h4 className="text-sm font-black text-white mb-1 truncate">{document.name}</h4>
       <div className="flex items-center gap-2 text-[10px] font-bold text-builders-text-secondary uppercase tracking-widest">
          <span>{document.type}</span>
          <span>•</span>
          <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
       </div>

       <div className="mt-6 flex items-center justify-between border-t border-builders-border pt-4">
          <button 
             onClick={handleView}
             className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-builders-blue hover:text-white transition-colors"
          >
             <EyeIcon className="h-4 w-4" /> Preview
          </button>
          <button 
             onClick={onDelete}
             className="text-builders-text-muted hover:text-rose-400 transition-colors p-1"
          >
             <TrashIcon className="h-4 w-4" />
          </button>
       </div>
    </div>
  );
};

export default DocumentCard;
