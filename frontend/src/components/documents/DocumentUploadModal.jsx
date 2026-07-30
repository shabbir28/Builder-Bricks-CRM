import React, { useState } from 'react';
import Modal from '../Modal';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DOC_TYPES = ['Agreement', 'CNIC', 'Receipt', 'Contract', 'NDA', 'Other'];
const STATUSES = ['Pending', 'Verified', 'Missing'];

const DocumentUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Agreement');
  const [status, setStatus] = useState('Pending');
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || (!file && !type)) {
      toast.error('Name & File required');
      return;
    }

    // Simulate upload with an Object URL preview
    const fileUrl = file ? URL.createObjectURL(file) : '';

    onUpload({ name, type, status, fileUrl, fileName: file?.name });
    
    toast.success('Document uploaded');
    
    // reset
    setName('');
    setType('Agreement');
    setStatus('Pending');
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Verification Document">
       <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-3">
             <label className="label-text">Document Title</label>
             <input 
               type="text"
               value={name}
               onChange={e => setName(e.target.value)}
               className="input-field"
               placeholder="e.g. Sales Deed, Buyer CNIC"
               required
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-3">
                <label className="label-text">Document Class</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
             </div>
             <div className="space-y-3">
                <label className="label-text">Verification Status</label>
                <select 
                  value={status} 
                  onChange={e => setStatus(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>

          <div className="space-y-3">
             <label className="label-text">Target File Storage</label>
             <div className="flex items-center justify-center w-full relative">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-builders-border hover:border-builders-blue rounded-2xl cursor-pointer bg-builders-surface hover:bg-builders-surface/80 transition-all">
                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <DocumentArrowUpIcon className="w-8 h-8 mb-3 text-builders-text-muted" />
                      <p className="text-[10px] uppercase font-black tracking-widest text-builders-text-secondary">
                         {file ? file.name : 'Click to bind file into memory'}
                      </p>
                   </div>
                   <input type="file" className="hidden" onChange={e => setFile(e.target.files[0])} required />
                </label>
             </div>
          </div>

          <div className="pt-6 flex justify-end gap-4 border-t border-builders-border">
             <button type="button" onClick={onClose} className="px-8 py-3 bg-builders-surface text-builders-text-secondary rounded-xl font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">
                Abort
             </button>
             <button type="submit" className="btn-primary px-8 py-3 text-[10px] tracking-widest">
                Initiate Upload
             </button>
          </div>
       </form>
    </Modal>
  );
};

export default DocumentUploadModal;
