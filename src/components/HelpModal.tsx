import React from 'react';
import { HelpCircle, Phone, MessageCircle, Mail, Clock, MapPin, X, Sparkles } from 'lucide-react';
import { STUDIO_CONFIG } from '../data/constants';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const whatsappUrl = `https://wa.me/${STUDIO_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hello ${STUDIO_CONFIG.name}, I have a question regarding our client onboarding questionnaire.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-fadeIn relative text-[var(--text-primary)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--text-accent)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-accent)] font-semibold">
            Studio Concierge
          </span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-light text-[var(--text-primary)] mb-2 italic">
          Need assistance or guidance?
        </h3>
        <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed mb-6">
          Our team is here to help you through every step of planning your photography and cinema coverage.
        </p>

        {/* Quick Contact Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 p-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl hover:border-[var(--text-primary)] transition-all text-xs font-sans shadow-2xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#EDF7ED] flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-[var(--text-primary)] block">WhatsApp Concierge</span>
              <span className="text-[var(--text-muted)] text-[11px]">Instant live chat</span>
            </div>
          </a>

          <a
            href={`tel:${STUDIO_CONFIG.phone}`}
            className="flex items-center space-x-2.5 p-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-2xl hover:border-[var(--text-primary)] transition-all text-xs font-sans shadow-2xs cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--bg-surface-subtle)] flex items-center justify-center text-[var(--text-accent)] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-medium text-[var(--text-primary)] block">Studio Phone</span>
              <span className="text-[var(--text-muted)] text-[11px]">{STUDIO_CONFIG.phone}</span>
            </div>
          </a>
        </div>

        {/* FAQ Quick Accordion / Notes */}
        <div className="space-y-3 pt-3 border-t border-[var(--border-app)] text-xs font-sans">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-accent)] font-semibold block">
            Frequently Asked Questions
          </span>

          <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl space-y-1">
            <span className="font-medium text-[var(--text-primary)] block">
              What if our venues or function timings aren't finalized yet?
            </span>
            <p className="text-[var(--text-secondary)] text-[11px] font-light">
              No problem! You can enter tentative details or "TBD". We will refine every timeline during our production call closer to your wedding.
            </p>
          </div>

          <div className="p-3 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl space-y-1">
            <span className="font-medium text-[var(--text-primary)] block">
              Can we modify our submitted answers later?
            </span>
            <p className="text-[var(--text-secondary)] text-[11px] font-light">
              Yes. You can contact your dedicated studio coordinator or resubmit through this portal anytime.
            </p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="mt-6 flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-4 border-t border-[var(--border-app)]">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--text-accent)]" />
            <span>{STUDIO_CONFIG.workingHours}</span>
          </div>
          <span>{STUDIO_CONFIG.email}</span>
        </div>
      </div>
    </div>
  );
};
