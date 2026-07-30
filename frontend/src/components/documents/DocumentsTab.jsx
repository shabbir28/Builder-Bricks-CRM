import React, { useState, useEffect } from 'react';
import { 
  PlusIcon,
  FolderOpenIcon 
} from '@heroicons/react/24/outline';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentCard from './DocumentCard';
import toast from 'react-hot-toast';

const DocumentsTab = ({ dealId }) => {
  const [documents, setDocuments] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Initialize from local storage or empty for this deal
  useEffect(() => {
    const storedDocs = JSON.parse(localStorage.getItem(`deal_docs_${dealId}`)) || [];
    setDocuments(storedDocs);
  }, [dealId]);

  const saveDocuments = (newDocs) => {
    setDocuments(newDocs);
    localStorage.setItem(`deal_docs_${dealId}`, JSON.stringify(newDocs));
  };

  const handleUpload = (newDoc) => {
    const docWithId = {
      ...newDoc,
      id: `doc_${Date.now()}`,
      dealId,
      uploadedAt: new Date().toISOString()
    };
    saveDocuments([docWithId, ...documents]);
  };

  const handleDelete = (docId) => {
    if (window.confirm("Delete this document?")) {
      const filtered = documents.filter(d => d.id !== docId);
      saveDocuments(filtered);
      toast.success('Document deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Header Action */}
      <div className="flex justify-between items-end">
         <div>
            <h3 className="text-lg font-black text-white tracking-tight">Deal Documents</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-builders-text-secondary mt-1">Manage files and agreements</p>
         </div>
         <button 
           onClick={() => setIsUploadOpen(true)}
           className="btn-primary"
         >
            <PlusIcon className="h-4 w-4" />
            <span className="uppercase text-[10px] tracking-[0.2em] font-black">Upload Document</span>
         </button>
      </div>

      {/* Document Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {documents.map(doc => (
            <DocumentCard key={doc.id} document={doc} onDelete={() => handleDelete(doc.id)} />
          ))}
        </div>
      ) : (
        <div className="card py-32 flex flex-col items-center justify-center text-center">
           <div className="p-8 rounded-full bg-builders-surface border border-builders-border mb-6">
              <FolderOpenIcon className="h-16 w-16 text-builders-text-muted opacity-40" />
           </div>
           <p className="font-black uppercase text-[10px] tracking-[0.4em] text-builders-text-muted">No Documents Uploaded</p>
           <p className="text-sm font-bold text-builders-text-secondary mt-2">Initialize the first protocol file.</p>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default DocumentsTab;
