import React from 'react';
import { ClientSubmission } from '../../types';
import { STUDIO_CONFIG, PHOTOGRAPHY_SERVICES } from '../../data/constants';
import {
  Heart,
  Phone,
  MapPin,
  Users,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Edit2,
  Sparkles,
  Send,
  Loader2,
} from 'lucide-react';

interface Screen09ReviewProps {
  submission: ClientSubmission;
  onEditStep: (stepNumber: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError?: string | null;
  onUpdateServices?: (services: string[]) => void;
}

export const Screen09Review: React.FC<Screen09ReviewProps> = ({
  submission,
  onEditStep,
  onSubmit,
  isSubmitting,
  submitError,
  onUpdateServices,
}) => {
  const coupleName =
    submission.partner1.trim() && submission.partner2.trim()
      ? `${submission.partner1.trim()} & ${submission.partner2.trim()}`
      : submission.partner1.trim() || submission.partner2.trim() || 'The Couple';

  const toggleService = (serviceId: string) => {
    if (!onUpdateServices) return;
    const current = submission.photographyServices || [];
    if (current.includes(serviceId)) {
      if (current.length > 1) {
        onUpdateServices(current.filter((s) => s !== serviceId));
      }
    } else {
      onUpdateServices([...current, serviceId]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 sm:py-14 relative z-10 animate-fadeIn">
      {/* Editorial Header */}
      <div className="mb-8 sm:mb-12 text-center">
        <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-[var(--text-accent)] mb-2.5 block font-semibold">
          Step 5 of 6 · Final Review
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-[var(--text-primary)] tracking-tight mb-3 italic">
          One last look, {coupleName}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-light tracking-wide max-w-md mx-auto">
          Tap a section to make any changes before sending it to the studio.
        </p>
      </div>

      {/* Review Sections Stack */}
      <div className="space-y-4 mb-8">
        {/* 1. Couple & Contact Card */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-[var(--text-accent)]">
              <Heart className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                The Couple & Contact
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <h3 className="font-serif text-xl font-medium italic text-[var(--text-primary)]">
                {coupleName}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                {submission.countryCode} {submission.phone || 'No phone provided'}
                {submission.email && ` • ${submission.email}`}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Wedding Traditions */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-[var(--text-accent)]">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Wedding Traditions
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {submission.weddingTypes.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-app)] text-xs font-serif"
              >
                {t}
              </span>
            ))}
            {submission.weddingTypeOther && (
              <span className="px-3 py-1 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-primary)] border border-[var(--border-app)] text-xs font-serif italic">
                {submission.weddingTypeOther}
              </span>
            )}
          </div>
        </div>

        {/* 3. Location & Scale */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-[var(--text-accent)]">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Where & Guests
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-[var(--text-secondary)]">
            <div>
              <span className="font-serif text-base italic text-[var(--text-primary)] font-medium">
                {submission.city || 'Destination City'}
              </span>
              {submission.mainVenue && (
                <span className="text-[var(--text-muted)]"> — {submission.mainVenue}</span>
              )}
            </div>
            <div className="flex items-center space-x-1.5 font-mono text-[var(--text-accent)]">
              <Users className="w-3.5 h-3.5" />
              <span>{submission.guestCount || '300-500 Guests'}</span>
            </div>
          </div>
        </div>

        {/* 4. Functions Timeline */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[var(--text-accent)]">
              <Calendar className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                The Big Days ({submission.functions.length} Events)
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] inline-flex items-center space-x-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-2">
            {submission.functions.map((fn) => (
              <div
                key={fn.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-app)] border border-[var(--border-app-subtle)] text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-serif italic font-medium text-[var(--text-primary)]">
                    {fn.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    ({fn.timeSlot})
                  </span>
                </div>
                <span className="font-mono text-[var(--text-accent)] text-[11px]">
                  {fn.date || 'Date pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Photography Preferences */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-app)] rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[var(--text-accent)]">
              <Camera className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-wider font-semibold">
                Desired Studio Coverage
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-serif italic">
              Tap to toggle
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PHOTOGRAPHY_SERVICES.slice(0, 6).map((srv) => {
              const isSelected = submission.photographyServices?.includes(srv.id);
              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => toggleService(srv.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] border-[var(--accent-pill-bg)]'
                      : 'bg-[var(--bg-app)] text-[var(--text-secondary)] border-[var(--border-app)] hover:border-[var(--text-primary)]'
                  }`}
                >
                  {srv.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message if Google Sheets transmission failed */}
      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-[#FDEDED] dark:bg-[#2C1814] border border-[#F5C2C7] dark:border-[#5C2B29] text-left text-xs text-[#842029] dark:text-[#F8D7DA]">
          <p className="font-semibold mb-1">Transmission Notice:</p>
          <p className="font-light leading-relaxed">{submitError}</p>
        </div>
      )}

      {/* Big Submit Button (Matching Bottom CTA) */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto min-w-[280px] px-8 py-4 bg-[var(--accent-pill-bg)] text-[var(--accent-pill-text)] hover:opacity-90 active:scale-98 rounded-full text-xs uppercase tracking-[0.25em] font-medium shadow-md transition-all inline-flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transmitting Details...</span>
            </>
          ) : (
            <>
              <span>Send to {STUDIO_CONFIG.name}</span>
              <Send className="w-3.5 h-3.5 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
