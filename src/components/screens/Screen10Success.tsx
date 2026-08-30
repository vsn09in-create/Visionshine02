import React, { useEffect, useState } from 'react';
import { ClientSubmission } from '../../types';
import { STUDIO_CONFIG } from '../../data/constants';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';

interface Screen10SuccessProps {
  data: ClientSubmission;
  studioName?: string;
  studioPhone?: string;
  studioWhatsapp?: string;
  onStartNew: () => void;
}

export const Screen10Success: React.FC<Screen10SuccessProps> = ({
  data,
  studioName,
  studioPhone,
  studioWhatsapp,
  onStartNew,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Subtle luxury champagne & gold celebratory confetti
    const duration = 2.0 * 1000;
    const end = Date.now() + duration;
    const colors = ['#C2A278', '#9E7D52', '#E2D7CC', '#FAF7F2', '#E8DCCB'];

    (function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.submissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const coupleName =
    data.partner1.trim() && data.partner2.trim()
      ? `${data.partner1.trim()} & ${data.partner2.trim()}`
      : data.partner1.trim() || data.partner2.trim() || 'You Two';

  const resolvedStudioName = studioName || STUDIO_CONFIG.name;
  const rawPhone = studioWhatsapp || studioPhone || STUDIO_CONFIG.whatsapp;
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const whatsappMessage = encodeURIComponent(
    `Hello ${resolvedStudioName}, we just submitted our wedding details on the client connect portal!\n\nCouple: ${coupleName}\nSubmission ID: ${data.submissionId}\nDestination: ${data.city}\n\nLooking forward to speaking with the team.`
  );

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-12 sm:py-20 text-center relative z-10 animate-fadeIn">
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] flex items-center justify-center mx-auto mb-6 shadow-2xs">
        <Sparkles className="w-6 h-6 text-[var(--text-accent)]" />
      </div>

      {/* Main Thank You Title (Page 6 in screenshot) */}
      <span className="text-[10px] uppercase tracking-[0.35em] text-[var(--text-accent)] font-semibold font-sans block mb-2">
        Details Transmitted to Studio
      </span>
      <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
        Thank you, {coupleName}.
      </h1>

      <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light leading-relaxed max-w-sm mx-auto mb-8">
        We've received your wedding details. Our team at {resolvedStudioName} will review your timeline and reach out shortly on WhatsApp / Phone.
      </p>

      {/* Submission Reference Card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-3xl p-6 shadow-2xs mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium">
            Booking Reference ID
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="text-xs text-[var(--text-accent)] hover:text-[var(--text-primary)] inline-flex items-center space-x-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#5A7D58]" />
                <span className="text-[#5A7D58]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-[var(--text-primary)] bg-[var(--bg-app)] py-3 px-4 rounded-2xl border border-[var(--border-app-subtle)] select-all">
          {data.submissionId}
        </div>

        <div className="text-xs text-[var(--text-muted)] font-serif italic pt-1">
          {data.functions.length} functions documented · Destination {data.city || 'to be finalized'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a
          href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-wider font-medium hover:opacity-90 inline-flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat on WhatsApp</span>
        </a>

        <button
          type="button"
          onClick={onStartNew}
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] inline-flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Submission</span>
        </button>
      </div>
    </div>
  );
};
