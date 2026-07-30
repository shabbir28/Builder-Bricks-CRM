import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      {/* Click-outside overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal panel */}
      <div
        className="relative w-full max-w-2xl mx-auto z-10 flex flex-col"
        style={{
          background: '#111316',
          border: '1px solid #252830',
          borderRadius: 20,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)',
          maxHeight: '90vh',
          animation: 'modalDarkIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid #1a1c22' }}
        >
          <h3
            className="text-sm font-bold uppercase tracking-widest"
            style={{ color: '#f0f2f5', letterSpacing: '0.12em' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1e2025',
              color: '#545769',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#f0f2f5';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = '#545769';
            }}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="overflow-y-auto flex-1 px-7 py-6"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e2025 transparent' }}
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalDarkIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default Modal;
