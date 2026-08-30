import React, { useState } from 'react';
import { StudioFormLink } from '../../types';
import { X, Copy, Check, ExternalLink, MessageCircle, QrCode } from 'lucide-react';

interface ShareFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: StudioFormLink | null;
  onPreview: (formCode: string) => void;
}

export const ShareFormModal: React.FC<ShareFormModalProps> = ({
  isOpen,
  onClose,
  form,
  onPreview,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !form) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://yourapp.com';
  const publicUrl = `${origin}/form/${form.formCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `Hello! Please fill out our wedding photography inquiry questionnaire here: ${publicUrl}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-subtle)] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] flex items-center justify-center mx-auto mb-3 text-[var(--text-accent)] shadow-2xs">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium block">
            Public Client Form
          </span>
          <h3 className="font-serif text-xl text-[var(--text-primary)] font-normal">
            {form.title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Share this login-free link with your prospective couples.
          </p>
        </div>

        {/* URL Box with Copy Button */}
        <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-[var(--text-primary)] truncate mr-2 select-all">
            {publicUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            id="btn-copy-share-link"
            className="px-3 py-1.5 rounded-lg bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] text-xs font-medium flex items-center space-x-1.5 shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] text-xs font-medium transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPreview(form.formCode);
            }}
            className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border border-[var(--border-app)] bg-[var(--bg-surface-subtle)] hover:bg-[var(--bg-app)] text-[var(--text-primary)] text-xs font-medium transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Client Form</span>
          </button>
        </div>

        {/* Mobile QR Code Preview */}
        <div className="p-4 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-app)] text-center">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-medium block mb-2">
            Scan & Open on Mobile (No App Needed)
          </span>
          <div className="inline-block p-3 bg-white rounded-xl shadow-xs">
            {/* SVG QR Code Pattern */}
            <svg
              className="w-32 h-32 text-gray-900 mx-auto"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" />

              {/* Data matrix dots */}
              <rect x="35" y="10" width="5" height="5" />
              <rect x="45" y="15" width="10" height="5" />
              <rect x="40" y="30" width="5" height="10" />
              <rect x="55" y="35" width="10" height="5" />
              <rect x="15" y="45" width="10" height="5" />
              <rect x="35" y="50" width="15" height="5" />
              <rect x="70" y="45" width="5" height="15" />
              <rect x="80" y="60" width="10" height="5" />
              <rect x="45" y="70" width="10" height="10" />
              <rect x="60" y="75" width="5" height="10" />
              <rect x="75" y="80" width="15" height="5" />
            </svg>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] mt-2 font-mono">
            Code: {form.formCode}
          </p>
        </div>
      </div>
    </div>
  );
};
