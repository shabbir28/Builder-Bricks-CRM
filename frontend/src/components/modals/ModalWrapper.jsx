import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * ModalWrapper
 * ─────────────
 * Reusable dark-SaaS modal shell.
 * Props:
 *   isOpen   – boolean
 *   onClose  – fn
 *   title    – string
 *   subtitle – string (optional)
 *   icon     – JSX (optional heroicon element)
 *   iconBg   – CSS color string for icon badge bg
 *   children – modal body content
 *   maxWidth – tailwind class e.g. "max-w-lg" (default: max-w-lg)
 */
const ModalWrapper = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = 'rgba(92,107,192,0.15)',
  iconColor = '#7986cb',
  children,
  maxWidth = 'max-w-lg',
}) => {
  const overlayRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        animation: 'modalOverlayIn 0.2s ease-out both',
      }}
    >
      <div
        className={`relative w-full ${maxWidth} flex flex-col`}
        style={{
          background: '#111316',
          border: '1px solid #252830',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
          maxHeight: '90vh',
          animation: 'modalSlideIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #1a1c22', flexShrink: 0 }}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                style={{ background: iconBg }}
              >
                <span style={{ color: iconColor, display: 'flex', alignItems: 'center' }}>
                  {icon}
                </span>
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold" style={{ color: '#f0f2f5' }}>{title}</h2>
              {subtitle && (
                <p className="text-xs mt-0.5" style={{ color: '#545769' }}>{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{ marginLeft: 8 }}
            aria-label="Close modal"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto" style={{ flex: 1 }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ModalWrapper;
