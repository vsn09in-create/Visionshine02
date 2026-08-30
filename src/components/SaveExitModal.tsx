import React, { useState } from 'react';
import { BookmarkCheck, Copy, Check, ExternalLink, X, Shield } from 'lucide-react';
import { STUDIO_CONFIG } from '../data/constants';

interface SaveExitModalProps {
  phone: string;
  partner1: string;
  partner2: string;
  onClose: () => void;
}

export const SaveExitModal: React.FC<SaveExitModalProps> = ({
  phone,
  partner1,
  partner2,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const resumeUrl = window.location.href;

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const couple = partner1 && partner2 ? `${partner1} & ${partner2}` : 'your wedding questionnaire';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F9F7F2] border border-[#E0D9CE] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-fadeIn text-center relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#888888] hover:text-[#1A1A1A] rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 rounded-full bg-[#F2EFE9] border border-[#E0D9CE] flex items-center justify-center mx-auto mb-4 text-[#8E7D6B]">
          <BookmarkCheck className="w-7 h-7" />
        </div>

        <span className="text-[10px] uppercase tracking-[0.4em] text-[#C4B7A6] font-semibold block mb-1">
          Draft Saved Locally
        </span>
        <h3 className="font-serif text-2xl font-light text-[#1A1A1A] mb-2 italic">
          Your progress is safe.
        </h3>
        <p className="text-xs text-[#666666] font-light leading-relaxed mb-6">
          We have saved all answers for <span className="text-[#1A1A1A] font-medium">{couple}</span> on this device. You can safely close your browser and return to this page anytime.
        </p>

        {/* Link box */}
        <div className="p-3 bg-white/80 border border-[#E0D9CE] rounded-xl flex items-center justify-between gap-2 text-xs font-mono text-[#666666] mb-6">
          <span className="truncate">{resumeUrl}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-[#F9F7F2] hover:bg-[#F2EFE9] text-[#1A1A1A] shrink-0 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#5A7D58]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 bg-[#1A1A1A] text-[#F9F7F2] text-xs uppercase tracking-[0.2em] font-medium rounded-xl hover:bg-[#333333] transition-colors cursor-pointer"
        >
          Continue Editing
        </button>
      </div>
    </div>
  );
};
