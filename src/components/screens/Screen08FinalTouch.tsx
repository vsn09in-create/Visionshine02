import React from 'react';
import { DISCOVERY_SOURCES } from '../../data/constants';
import { Check, Instagram, UserCheck, Globe, MessageSquare, Sparkles } from 'lucide-react';

interface Screen08FinalTouchProps {
  partner1?: string;
  partner2?: string;
  discoverySource: string;
  discoverySourceOther?: string;
  instagramHandle?: string;
  plannerName?: string;
  plannerPhone?: string;
  weddingWebsite?: string;
  additionalInformation?: string;
  onChange: (updates: {
    discoverySource?: string;
    discoverySourceOther?: string;
    instagramHandle?: string;
    plannerName?: string;
    plannerPhone?: string;
    weddingWebsite?: string;
    additionalInformation?: string;
  }) => void;
}

export const Screen08FinalTouch: React.FC<Screen08FinalTouchProps> = ({
  partner1 = '',
  partner2 = '',
  discoverySource,
  discoverySourceOther = '',
  instagramHandle = '',
  plannerName = '',
  plannerPhone = '',
  weddingWebsite = '',
  additionalInformation = '',
  onChange,
}) => {
  const coupleName = partner1.trim() && partner2.trim()
    ? `${partner1.trim()} & ${partner2.trim()}`
    : partner1.trim() || partner2.trim() || '';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 sm:py-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-6 sm:mb-8 text-left sm:text-center">
        {coupleName && (
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-app)] mb-3 shadow-2xs max-w-full">
            <Sparkles className="w-3 h-3 text-[var(--text-accent)] shrink-0" />
            <span className="font-serif italic text-xs sm:text-sm text-[var(--text-primary)] break-words text-left">
              {coupleName}
            </span>
          </div>
        )}
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--text-accent)] mb-2 block font-semibold">
          Step 08 / 09 · Final Details
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          One last look.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] font-light leading-relaxed max-w-lg mx-auto">
          Help us connect with your wedding planner and understand where our creative paths first crossed.
        </p>
      </div>

      {/* Discovery Source */}
      <div className="mb-6 sm:mb-8">
        <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-3">
          How did you first hear about VISIONSHINE? <span className="text-[var(--text-accent)]">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {DISCOVERY_SOURCES.map((src) => {
            const isSelected = discoverySource === src;
            return (
              <button
                key={src}
                type="button"
                id={`btn-discovery-${src.toLowerCase().replace(/[\s/]+/g, '-')}`}
                onClick={() => onChange({ discoverySource: src })}
                className={`p-3 rounded-xl text-left border transition-all text-xs font-sans font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)]'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border-[var(--border-app)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{src}</span>
                  {isSelected && <Check className="w-3 h-3 text-[var(--text-accent)]" />}
                </div>
              </button>
            );
          })}
        </div>

        {discoverySource === 'Other' && (
          <div className="mt-3">
            <input
              type="text"
              value={discoverySourceOther}
              onChange={(e) => onChange({ discoverySourceOther: e.target.value })}
              placeholder="How did you hear about us? (e.g. Wedding magazine, podcast, etc.)"
              className="w-full h-10 px-3.5 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-lg text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        )}
      </div>

      {/* Additional Details Form */}
      <div className="space-y-5 bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-6 sm:p-8 shadow-2xs">
        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-accent)] font-semibold block mb-1">
          Planner & Social Details (Optional)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram Handle */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5">
              Couple / Bride Instagram
            </label>
            <div className="relative">
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => onChange({ instagramHandle: e.target.value })}
                placeholder="@username"
                className="w-full h-11 px-3 pl-9 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              />
              <Instagram className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Wedding Website URL */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5">
              Wedding Website / Registry
            </label>
            <div className="relative">
              <input
                type="text"
                value={weddingWebsite}
                onChange={(e) => onChange({ weddingWebsite: e.target.value })}
                placeholder="e.g. withjoy.com/ourwedding"
                className="w-full h-11 px-3 pl-9 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              />
              <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Planner Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5">
              Wedding Planner / Production Agency
            </label>
            <div className="relative">
              <input
                type="text"
                value={plannerName}
                onChange={(e) => onChange({ plannerName: e.target.value })}
                placeholder="e.g. Devika Narain & Co."
                className="w-full h-11 px-3 pl-9 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              />
              <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Planner Phone */}
          <div>
            <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-1.5">
              Planner Contact Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={plannerPhone}
                onChange={(e) => onChange({ plannerPhone: e.target.value })}
                placeholder="+91 98765 00000"
                className="w-full h-11 px-3 pl-9 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)]"
              />
              <UserCheck className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        {/* Final Anything Else Textarea */}
        <div className="pt-2">
          <div className="flex items-center space-x-2 mb-2">
            <MessageSquare className="w-4 h-4 text-[var(--text-accent)]" />
            <label
              htmlFor="textarea-additional-info"
              className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium"
            >
              Anything else you'd like us to know?
            </label>
          </div>
          <textarea
            id="textarea-additional-info"
            rows={3}
            value={additionalInformation}
            onChange={(e) => onChange({ additionalInformation: e.target.value })}
            placeholder="Any special requests, music genres you love, hotel stay logistics for crew, or questions for our directors..."
            className="w-full p-3.5 bg-[var(--bg-app)] border border-[var(--border-app)] rounded-xl text-xs sm:text-sm font-sans text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:bg-[var(--bg-surface)] resize-y"
          />
        </div>
      </div>
    </div>
  );
};
